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

  private readonly debugLogging: boolean;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 segundos
  private lastMessageTime: number = Date.now();

  // IDs permitidos (Allowlist) - Solo estos servidores se mostrarán en la web


  // Mapeo de IDs de servidor a nombres que deseas mostrar
  private NOMBRES_PERSONALIZADOS: Map<number, string> = new Map([
    [515, 'PREMIUM 1 BR'],
    [528, 'PREMIUM 1 AR'],
    [1004, 'PREMIUM 1 USA'],
  ]);

  private statsCleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.servexToken = process.env.SERVEX_API_KEY || '';
    this.debugLogging = (process.env.NODE_ENV || 'development') !== 'production';
    this.inicializarServidoresPredeterminados();
    this.iniciarLimpiezaAutomatica();
  }

  /**
   * Inicializa los servidores predeterminados en la caché para evitar demoras
   * al cargar la web por primera vez o después de reiniciar el servidor backend.
   */
  private inicializarServidoresPredeterminados(): void {
    const ahora = new Date();
    this.NOMBRES_PERSONALIZADOS.forEach((nombre, serverId) => {
      const serverKey = `server-${serverId}`;
      
      // Determinar ubicación por nombre
      const nombreLower = nombre.toLowerCase();
      let location = 'Desconocido';
      if (nombreLower.includes('ar') || nombreLower.includes('argentina') || /\bar\b|arg/.test(nombreLower)) {
        location = 'Argentina';
      } else if (nombreLower.includes('br') || nombreLower.includes('brasil')) {
        location = 'Brasil';
      } else if (nombreLower.includes('usa') || nombreLower.includes('us')) {
        location = 'USA';
      }

      // Solo inicializar si no existe en la caché aún
      if (!this.stats.has(serverKey)) {
        this.stats.set(serverKey, {
          serverId: serverId,
          serverName: nombre,
          location: location,
          status: 'online', // Asumir online por defecto
          connectedUsers: 0,
          lastUpdate: ahora,
          cpuUsage: 0,
          memoryUsage: 0,
        });
      }
    });
  }

  /**
   * Limpia periódicamente servidores que no han enviado actualizaciones
   * (Servidores fantasma o IDs antiguos). Protege los servidores principales.
   */
  private iniciarLimpiezaAutomatica(): void {
    if (this.statsCleanupInterval) {
      clearInterval(this.statsCleanupInterval);
    }

    this.statsCleanupInterval = setInterval(() => {
      const ahora = Date.now();
      const UMBRAL_INACTIVIDAD = 5 * 60 * 1000; // 5 minutos
      let huboCambios = false;

      for (const [key, stat] of this.stats.entries()) {
        // Si el servidor es parte de nuestros servidores principales, NO lo eliminamos
        if (stat.serverId && this.NOMBRES_PERSONALIZADOS.has(stat.serverId)) {
          // Si pasa demasiado tiempo sin reportarse (ej: 15 minutos), lo marcamos como offline
          // pero lo mantenemos visible para el usuario en la web
          const antiguedad = ahora - stat.lastUpdate.getTime();
          if (antiguedad > UMBRAL_INACTIVIDAD * 3 && stat.status === 'online') {
            console.log(`[WebSocket] ⚠️ Servidor principal sin responder por 15min: ${stat.serverName}. Manteniendo pero marcando offline.`);
            stat.status = 'offline';
            huboCambios = true;
          }
          continue;
        }

        const antiguedad = ahora - stat.lastUpdate.getTime();
        if (antiguedad > UMBRAL_INACTIVIDAD) {
          console.log(`[WebSocket] 🧹 Limpiando servidor inactivo: ${stat.serverName} (ID: ${stat.serverId})`);
          this.stats.delete(key);
          huboCambios = true;
        }
      }

      if (huboCambios) {
        this.emit('server-stats', this.obtenerEstadisticas());
      }
    }, 60000); // Revisar cada minuto
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
        this.manejarReconexion();
      });

    } catch (error: any) {
      console.error('[WebSocket] Error al conectar:', error.message);
      console.error('[WebSocket] No se puede conectar a JJSecure Panel. Los datos en tiempo real no están disponibles.');
      this.manejarReconexion();
    }
  }

  private manejarReconexion(): void {
    const maxDelay = 30000; // Capado a 30 segundos
    const delay = Math.min(Math.pow(2, this.connectionAttempts) * 1000, maxDelay);
    
    this.connectionAttempts++;
    console.log(`[WebSocket] Reintentando en ${delay}ms (intento ${this.connectionAttempts})`);
    
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
    }
    
    this.reconnectTimeout = setTimeout(() => {
      this.conectar();
    }, delay);
  }

  /**
   * Procesa mensajes del WebSocket
   */
  private procesarMensaje(message: any): void {
    try {
      // const serverId = message.id || message.serverId;
      
      // FILTRO: Ignorar servidores que no están en la lista blanca
      // if (!this.ALLOWED_SERVER_IDS.has(serverId)) {
      //   if (this.debugLogging) {
      //     console.log(`[WebSocket] 🛡️ Ignorando servidor no autorizado (ID: ${serverId}, Name: ${message.name})`);
      //   }
      //   return;
      // }

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
      } else if (
        nombreLower.includes('usa') ||
        nombreLower.includes('us') ||
        nombreLower.includes('estados unidos') ||
        nombreLower.includes('premium 1 usa')
      ) {
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
    
    // Limpiar cache y volver a inicializar los predeterminados
    this.stats.clear();
    this.inicializarServidoresPredeterminados();
    console.log('[WebSocket] Cache limpiado e inicializado. Reconectando...');
    
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

    if (this.statsCleanupInterval) {
      clearInterval(this.statsCleanupInterval);
      this.statsCleanupInterval = null;
    }

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    console.log('[WebSocket] Desconectado manualmente');
  }
}
