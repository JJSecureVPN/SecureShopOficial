import EventEmitter from 'events';
import WebSocket from 'ws';
import axios from 'axios';

export interface ServerStats {
  serverName: string;
  location: string;
  status: 'online' | 'offline';
  connectedUsers: number;
  lastUpdate: Date;
  serverId?: number; // ID único del servidor desde Servex
  // Datos de rendimiento en tiempo real
  cpuUsage?: number; // Porcentaje 0-100
  memoryUsage?: number; // Porcentaje 0-100
  cpuCores?: number;
  totalMemoryGb?: number;
  totalUsuarios?: number; // Total de usuarios en el servidor
  netRecvMbps?: number;
  netSentMbps?: number;
}

export class WebSocketService extends EventEmitter {
  private servexToken: string;
  private ws: WebSocket | null = null;
  private stats: Map<string, ServerStats> = new Map();
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatTimeout: NodeJS.Timeout | null = null;
  private connectionAttempts: number = 0;
  private maxRetries: number = 5;
  private readonly debugLogging: boolean;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 segundos
  private lastMessageTime: number = Date.now();

  // Mapeo de IDs de servidor a nombres que deseas mostrar
  // Este mapeo sobreescribe los nombres que Servex devuelve
  private NOMBRES_PERSONALIZADOS: Map<number, string> = new Map([
    [515, 'PREMIUM 1 BR'],
    [550, 'PREMIUM 1 USA'],
    [528, 'PREMIUM 1 AR'],
    [557, 'GRATUITO 1'],
  ]);

  constructor() {
    super();
    this.servexToken = process.env.SERVEX_API_KEY || '';
    this.debugLogging = (process.env.NODE_ENV || 'development') !== 'production';
  }

  /**
   * Inicia el heartbeat para detectar desconexiones silenciosas
   * Si no recibie mensajes en HEARTBEAT_INTERVAL, reconecta automáticamente
   */
  private iniciarHeartbeat(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
    }

    this.heartbeatTimeout = setInterval(() => {
      const ahora = Date.now();
      const tiempoSinMensajes = ahora - this.lastMessageTime;

      if (tiempoSinMensajes > this.HEARTBEAT_INTERVAL * 1.5) {
        console.warn(
          `[WebSocket] 🔴 Sin mensajes por ${Math.round(tiempoSinMensajes / 1000)}s. Reconectando...`
        );
        this.forzarReconexion();
      }
    }, this.HEARTBEAT_INTERVAL);
  }

  /**
   * Detiene el heartbeat
   */
  private detenerHeartbeat(): void {
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Obtiene token temporal para WebSocket
   */
  private async obtenerTokenSSE(): Promise<string> {
    try {
      const response = await axios.get('https://servex.ws/api/auth/sse-token', {
        headers: {
          'Authorization': `Bearer ${this.servexToken}`,
        },
      });
      console.log('[WebSocket] Token SSE obtenido exitosamente');
      return response.data.token;
    } catch (error: any) {
      console.error('[WebSocket] Error obteniendo token SSE:', error.message);
      throw error;
    }
  }

  /**
   * Conecta al WebSocket de JJSecure Panel para obtener estado de servidores en tiempo real
   */
  async conectar(): Promise<void> {
    try {
      const token = await this.obtenerTokenSSE();
      const wsUrl = `wss://front.servex.ws/ws/server-status?token=${token}`;

      console.log('[WebSocket] Conectando a JJSecure Panel (server-status)...');
      this.ws = new WebSocket(wsUrl);
      this.connectionAttempts = 0;

      this.ws.on('open', () => {
        console.log('[WebSocket] 🟢 Conectado a Servex. Iniciando heartbeat...');
        this.lastMessageTime = Date.now();
        this.iniciarHeartbeat();
      });

      this.ws.on('message', (data: WebSocket.Data) => {
        try {
          this.lastMessageTime = Date.now(); // Actualizar timestamp de último mensaje
          const message = JSON.parse(data.toString());
          this.procesarMensaje(message);
        } catch (error) {
          if (this.debugLogging) {
            console.warn('[WebSocket] Error parseando mensaje:', error);
          }
        }
      });

      this.ws.on('error', (error) => {
        console.error('[WebSocket] Error:', error.message);
      });

      this.ws.on('close', () => {
        console.log('[WebSocket] Desconectado. Intentando reconectar...');
        this.detenerHeartbeat();
        this.ws = null;
        
        // Reconectar con backoff exponencial
        if (this.connectionAttempts < this.maxRetries) {
          const delay = Math.pow(2, this.connectionAttempts) * 1000; // 1s, 2s, 4s, 8s, 16s
          this.connectionAttempts++;
          console.log(`[WebSocket] Reintentando en ${delay}ms (intento ${this.connectionAttempts}/${this.maxRetries})`);
          
          this.reconnectTimeout = setTimeout(() => {
            this.conectar();
          }, delay);
        } else {
          console.error('[WebSocket] Máximo de reintentos alcanzado. Servidores no disponibles.');
        }
      });

    } catch (error: any) {
      console.error('[WebSocket] Error al conectar:', error.message);
      console.error('[WebSocket] No se puede conectar a JJSecure Panel. Los datos en tiempo real no están disponibles.');
    }
  }

  /**
   * Procesa mensajes del WebSocket
   */
  private procesarMensaje(message: any): void {
    try {
      if (this.debugLogging) {
        console.log('[WebSocket] Mensaje recibido:', JSON.stringify({
          id: message.id,
          name: message.name,
          online_users_count: message.online_users_count,
          status: message.online
        }));
      }
      if (message.name && message.online_users_count !== undefined) {
        this.actualizarEstadisticasServidores([message]);
      }
    } catch (error) {
      if (this.debugLogging) {
        console.error('[WebSocket] Error procesando mensaje:', error);
      }
    }
  }

  /**
   * Actualiza estadísticas de servidores con datos reales
   * Usa nombres personalizados si existen, sino usa los de Servex
   */
  private actualizarEstadisticasServidores(servidores: any[]): void {
    servidores.forEach((servidor: any) => {
      const serverId = servidor.id || servidor.serverId;
      const usuariosOnline = servidor.online_users_count || servidor.users || 0;
      const online = servidor.online !== false && servidor.status !== 'offline';
      
      // Usar nombre personalizado si existe, sino usar el de Servex
      let nombre = this.NOMBRES_PERSONALIZADOS.get(serverId) || 
                   servidor.name || 
                   servidor.hostname || 
                   servidor.server_name || 
                   'Unknown';
      
      const nombreLower = nombre.toLowerCase();
      
      // Detectar ubicación por nombre
      let location: string;
      if (nombreLower.includes('ar') || nombreLower.includes('argentina') || /\bar\b|arg/.test(nombreLower)) {
        location = 'Argentina';
      } else if (nombreLower.includes('br') || nombreLower.includes('brasil') || nombreLower.includes('premium 1 br')) {
        location = 'Brasil';
      } else if (nombreLower.includes('usa') || nombreLower.includes('us') || nombreLower.includes('premium 1 usa')) {
        location = 'USA';
      } else if (nombreLower.includes('mx') || nombreLower.includes('mexico')) {
        location = 'México';
      } else if (nombreLower.includes('cl') || nombreLower.includes('chile')) {
        location = 'Chile';
      } else if (nombreLower.includes('eu') || nombreLower.includes('europe')) {
        location = 'Europa';
      } else if (nombreLower.includes('gratuito')) {
        location = 'Global';
      } else {
        location = 'Desconocido';
      }
      
      // Usar serverId como clave única (no el nombre, que puede cambiar)
      const serverKey = `server-${serverId || nombre}`;
      
      // Actualizar estadísticas con datos reales de JJSecure Panel
      this.stats.set(serverKey, {
        serverId: serverId,
        serverName: nombre,
        location: location,
        status: online ? 'online' : 'offline',
        connectedUsers: usuariosOnline,
        lastUpdate: new Date(),
        // Datos de rendimiento
        cpuUsage: servidor.cpu_usage || 0,
        memoryUsage: servidor.memory_usage || 0,
        cpuCores: servidor.cpu_cores,
        totalMemoryGb: servidor.total_memory_gb,
        totalUsuarios: servidor.total_usuarios,
        netRecvMbps: servidor.net_recv_mbps,
        netSentMbps: servidor.net_sent_mbps,
      });
    });

    this.emit('server-stats', this.obtenerEstadisticas());
  }

  /**
   * Fuerza reconexión del WebSocket (limpia cache y reconecta)
   */
  async forzarReconexion(): Promise<void> {
    console.log('[WebSocket] Forzando reconexión y limpieza de cache...');
    
    // Detener heartbeat
    this.detenerHeartbeat();
    
    // Cerrar conexión existente
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    // Limpiar timeout de reconexión pendiente
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    
    // Limpiar cache
    this.stats.clear();
    console.log('[WebSocket] Cache limpiado. Reconectando...');
    
    // Reconectar
    this.connectionAttempts = 0;
    await this.conectar();
  }

  /**
   * Obtiene las estadísticas actuales de los servidores
   */
  obtenerEstadisticas(): ServerStats[] {
    return Array.from(this.stats.values());
  }

  /**
   * Desconecta el WebSocket
   */
  desconectar(): void {
    // Detener heartbeat
    this.detenerHeartbeat();
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log('[WebSocket] Desconectado manualmente');
  }
}
