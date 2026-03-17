import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";
import { ServexService } from "./servex.service";
import { WebSocketService } from "./websocket.service";
import emailService from "./email.service";
import { config } from "../config";

export interface Demo {
  id: string;
  email: string;
  email_normalized?: string;
  user_id?: string;
  ip_address: string;
  cliente_nombre: string;
  servex_username?: string;
  servex_password?: string;
  estado: "pendiente" | "generado" | "enviado" | "expirado" | "cancelado";
  created_at: string;
  expires_at: string;
  enviado_at?: string;
}

export interface VerificacionBloqueo {
  bloqueado: boolean;
  motivo?: string;
  tiempo_restante?: number;
  email_bloqueado?: boolean;
  ip_bloqueada?: boolean;
  limite_alcanzado?: boolean;
  demos_usadas?: number;
  demos_maximas?: number;
}

export class DemoService {
  private db: Database.Database;

  constructor(dbInstance: Database.Database, private servex: ServexService, private wsService: WebSocketService) {
    this.db = dbInstance;
    this.inicializarTabla();
  }

  /**
   * Inicializa la tabla de demos si no existe
   */
  private inicializarTabla(): void {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS demos (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL,
        email_normalized TEXT NOT NULL,
        user_id TEXT,
        ip_address TEXT NOT NULL,
        cliente_nombre TEXT NOT NULL,
        servex_username TEXT,
        servex_password TEXT,
        estado TEXT DEFAULT 'pendiente',
        created_at TEXT DEFAULT (datetime('now')),
        enviado_at TEXT,
        expires_at TEXT GENERATED ALWAYS AS (datetime(created_at, '+48 hours')) STORED
      )
    `);

    // Agregar columna user_id si no existe (migración)
    try {
      this.db.exec(`ALTER TABLE demos ADD COLUMN user_id TEXT`);
      console.log('[DemoService] Columna user_id agregada a demos');
    } catch (e) {
      // Columna ya existe, ignorar
    }

    // Agregar columna email_normalized si no existe (migración)
    try {
      this.db.exec(`ALTER TABLE demos ADD COLUMN email_normalized TEXT`);
      console.log('[DemoService] Columna email_normalized agregada a demos');
    } catch (e) {
      // Columna ya existe, ignorar
    }

    // Crear índices
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_demos_email ON demos(email);
      CREATE INDEX IF NOT EXISTS idx_demos_email_normalized ON demos(email_normalized);
      CREATE INDEX IF NOT EXISTS idx_demos_ip ON demos(ip_address);
      CREATE INDEX IF NOT EXISTS idx_demos_estado ON demos(estado);
      CREATE INDEX IF NOT EXISTS idx_demos_expires ON demos(expires_at);
      CREATE INDEX IF NOT EXISTS idx_demos_user_id ON demos(user_id);
    `);

    // Migrar datos existentes para llenar email_normalized si está vacío
    try {
      const rows = this.db
        .prepare(
          `SELECT id, email FROM demos WHERE email_normalized IS NULL OR email_normalized = ''`
        )
        .all() as { id: string; email: string }[];

      const updateStmt = this.db.prepare(
        `UPDATE demos SET email_normalized = ? WHERE id = ?`
      );

      for (const row of rows) {
        updateStmt.run(this.normalizarEmail(row.email), row.id);
      }
    } catch (e: any) {
      console.warn('[DemoService] No se pudo migrar email_normalized:', e.message || e);
    }
  }

  /**
   * Normaliza un email (especialmente Gmail) para evitar aliasing (+, puntos)
   */
  private normalizarEmail(email: string): string {
    const normalized = email.trim().toLowerCase();
    const parts = normalized.split("@");
    if (parts.length !== 2) return normalized;

    const [local, domain] = parts;
    if (domain === "gmail.com" || domain === "googlemail.com") {
      const withoutPlus = local.split("+")[0];
      const withoutDots = withoutPlus.replace(/\./g, "");
      return `${withoutDots}@gmail.com`;
    }

    return normalized;
  }

  private getDemoLogFilePath(): string {
    const logsDir = path.join(__dirname, "../../logs");
    try {
      fs.mkdirSync(logsDir, { recursive: true });
    } catch (e) {
      // Ignorar errores de carpeta ya existente u otros
    }

    return path.join(logsDir, "demo-requests.log");
  }

  private async registrarIntentoDemo(options: {
    email: string;
    emailNormalized: string;
    ipAddress: string;
    userId?: string;
    allowed: boolean;
    reason?: string;
  }): Promise<void> {
    const line = `${new Date().toISOString()} | ip=${options.ipAddress} | email=${options.email} | normalized=${options.emailNormalized} | userId=${options.userId || "N/A"} | allowed=${options.allowed} | reason=${options.reason || ""}\n`;
    try {
      await fs.promises.appendFile(this.getDemoLogFilePath(), line);
    } catch (err) {
      console.error("[DemoService] Error escribiendo log de demos:", err);
    }
  }

  /**
   * Verifica si un email o IP está bloqueado
   */
  async verificarBloqueo(
    email: string,
    ipAddress: string
  ): Promise<VerificacionBloqueo> {
    try {
      const emailNormalized = this.normalizarEmail(email);

      // 1) Bloqueo temporal: demos activas (no expiradas)
      const demoEmailActiva = this.db
        .prepare(
          `SELECT * FROM demos 
         WHERE email_normalized = ? 
         AND estado IN ('pendiente', 'generado', 'enviado')
         AND expires_at > datetime('now')
         LIMIT 1`
        )
        .get(emailNormalized) as any;

      if (demoEmailActiva) {
        const expiresAt = new Date(demoEmailActiva.expires_at);
        const tiempoRestante = Math.ceil(
          (expiresAt.getTime() - Date.now()) / 1000
        );
        const result: VerificacionBloqueo = {
          bloqueado: true,
          motivo: `Email bloqueado. Podrás solicitar otra demo en ${Math.ceil(
            tiempoRestante / 3600
          )} horas.`,
          tiempo_restante: tiempoRestante,
          email_bloqueado: true,
          ip_bloqueada: false,
        };
        await this.registrarIntentoDemo({
          email,
          emailNormalized,
          ipAddress,
          allowed: false,
          reason: result.motivo,
        });
        return result;
      }

      const demoIPActiva = this.db
        .prepare(
          `SELECT * FROM demos 
         WHERE ip_address = ? 
         AND estado IN ('pendiente', 'generado', 'enviado')
         AND expires_at > datetime('now')
         LIMIT 1`
        )
        .get(ipAddress) as any;

      if (demoIPActiva) {
        const expiresAt = new Date(demoIPActiva.expires_at);
        const tiempoRestante = Math.ceil(
          (expiresAt.getTime() - Date.now()) / 1000
        );
        const result: VerificacionBloqueo = {
          bloqueado: true,
          motivo: `IP bloqueada. Podrás solicitar otra demo en ${Math.ceil(
            tiempoRestante / 3600
          )} horas.`,
          tiempo_restante: tiempoRestante,
          email_bloqueado: false,
          ip_bloqueada: true,
        };
        await this.registrarIntentoDemo({
          email,
          emailNormalized,
          ipAddress,
          allowed: false,
          reason: result.motivo,
        });
        return result;
      }

      // 2) Conteo histórico (ventana configurable) para evitar demos ilimitadas
      const windowClause =
        config.demo.windowHours > 0
          ? `AND created_at >= datetime('now', '-${config.demo.windowHours} hours')`
          : "";

      const emailCount = this.db
        .prepare(
          `SELECT COUNT(*) as total FROM demos WHERE email_normalized = ? ${windowClause}`
        )
        .get(emailNormalized) as { total: number };

      if (emailCount.total >= config.demo.maxPerEmail) {
        const result: VerificacionBloqueo = {
          bloqueado: true,
          motivo: `Has alcanzado el límite de ${config.demo.maxPerEmail} demos para este email.`,
          limite_alcanzado: true,
          demos_usadas: emailCount.total,
          demos_maximas: config.demo.maxPerEmail,
          email_bloqueado: true,
          ip_bloqueada: false,
        };
        await this.registrarIntentoDemo({
          email,
          emailNormalized,
          ipAddress,
          allowed: false,
          reason: result.motivo,
        });
        return result;
      }

      const ipCount = this.db
        .prepare(
          `SELECT COUNT(*) as total FROM demos WHERE ip_address = ? ${windowClause}`
        )
        .get(ipAddress) as { total: number };

      if (ipCount.total >= config.demo.maxPerIp) {
        const result: VerificacionBloqueo = {
          bloqueado: true,
          motivo: `Has alcanzado el límite de ${config.demo.maxPerIp} demos para esta IP.`,
          limite_alcanzado: true,
          demos_usadas: ipCount.total,
          demos_maximas: config.demo.maxPerIp,
          email_bloqueado: false,
          ip_bloqueada: true,
        };
        await this.registrarIntentoDemo({
          email,
          emailNormalized,
          ipAddress,
          allowed: false,
          reason: result.motivo,
        });
        return result;
      }

      await this.registrarIntentoDemo({
        email,
        emailNormalized,
        ipAddress,
        allowed: true,
      });
      return { bloqueado: false };
    } catch (error: any) {
      console.error("[DemoService] Error verificando bloqueo:", error.message);
      throw error;
    }
  }

  /**
   * Verifica el límite de demos por usuario (máximo configurado de por vida por cuenta)
   */
  verificarLimiteUsuario(userId: string): VerificacionBloqueo {
    const LIMITE_DEMOS = config.demo.maxPerEmail;
    
    const result = this.db.prepare(`
      SELECT COUNT(*) as total FROM demos 
      WHERE user_id = ? 
      AND estado IN ('pendiente', 'generado', 'enviado', 'expirado')
    `).get(userId) as { total: number };
    
    const demosUsadas = result?.total || 0;
    
    if (demosUsadas >= LIMITE_DEMOS) {
      return {
        bloqueado: true,
        motivo: `Has alcanzado el límite máximo de ${LIMITE_DEMOS} demos por cuenta.`,
        limite_alcanzado: true,
        demos_usadas: demosUsadas,
        demos_maximas: LIMITE_DEMOS
      };
    }
    
    return {
      bloqueado: false,
      demos_usadas: demosUsadas,
      demos_maximas: LIMITE_DEMOS
    };
  }

  /**
   * Obtiene el número de demos usadas por un usuario
   */
  obtenerDemosUsadas(userId: string): { usadas: number; maximas: number } {
    const LIMITE_DEMOS = config.demo.maxPerEmail;
    
    const result = this.db.prepare(`
      SELECT COUNT(*) as total FROM demos 
      WHERE user_id = ? 
      AND estado IN ('pendiente', 'generado', 'enviado', 'expirado')
    `).get(userId) as { total: number };
    
    return {
      usadas: result?.total || 0,
      maximas: LIMITE_DEMOS
    };
  }

  /**
   * Crea una nueva demo (requiere user_id)
   */
  async crearDemo(
    email: string,
    nombre: string,
    ipAddress: string,
    userId?: string
  ): Promise<Demo> {
    try {
      const demoId = uuidv4();

      console.log(
        `[${new Date().toISOString()}] 🎬 Creando DEMO para: ${email} (userId: ${userId || 'N/A'}) desde IP: ${ipAddress}`
      );

      // 1. Verificar bloqueos
      const bloqueo = await this.verificarBloqueo(email, ipAddress);
      if (bloqueo.bloqueado) {
        throw new Error(bloqueo.motivo || "Bloqueado temporalmente");
      }

      // 2. Obtener categoría activa
      const categorias = await this.servex.obtenerCategoriasActivas();
      if (categorias.length === 0) {
        throw new Error("No hay categorías activas disponibles");
      }
      const categoria = categorias[0];

      // 3. Generar credenciales
      const { username, password } = this.servex.generarCredenciales(nombre);

      // 4. Crear cliente en Servex (tipo test, 120 minutos = 2 horas)
      const clienteServex = await this.servex.crearCliente({
        username,
        password,
        category_id: categoria.id,
        connection_limit: 2,
        duration: 120, // 2 horas en minutos
        type: "test",
        observation: `DEMO: ${nombre} - Email: ${email} - IP: ${ipAddress}`,
      });

      console.log(
        `[${new Date().toISOString()}] ✅ Cliente Servex creado: ${
          clienteServex.username
        }`
      );

      const emailNormalized = this.normalizarEmail(email);

      // 5. Guardar en BD (incluyendo user_id y email_normalized)
      const stmt = this.db.prepare(
        `INSERT INTO demos (id, email, email_normalized, user_id, ip_address, cliente_nombre, servex_username, servex_password, estado)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      );

      stmt.run(
        demoId,
        email,
        emailNormalized,
        userId || null,
        ipAddress,
        nombre,
        clienteServex.username,
        clienteServex.password,
        "generado"
      );

      console.log(
        `[${new Date().toISOString()}] ✅ Demo guardada en BD: ${demoId}`
      );

      // 6. Enviar email
      try {
        await this.enviarEmailDemo(
          email,
          nombre,
          clienteServex.username,
          clienteServex.password
        );
        console.log(
          `[${new Date().toISOString()}] ✅ Email de demo enviado a: ${email}`
        );

        // Actualizar estado
        this.db
          .prepare(
            `UPDATE demos SET estado = 'enviado', enviado_at = datetime('now') WHERE id = ?`
          )
          .run(demoId);
      } catch (emailError: any) {
        console.error(
          `[${new Date().toISOString()}] ⚠️ Error enviando email:`,
          emailError.message
        );
      }

      const demo: Demo = {
        id: demoId,
        email,
        email_normalized: emailNormalized,
        ip_address: ipAddress,
        cliente_nombre: nombre,
        servex_username: clienteServex.username,
        servex_password: clienteServex.password,
        estado: "enviado",
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      };

      return demo;
    } catch (error: any) {
      console.error("[DemoService] Error creando demo:", error.message);
      throw error;
    }
  }

  /**
   * Envía email con credenciales de demo
   */
  private async enviarEmailDemo(
    email: string,
    nombre: string,
    username: string,
    password: string
  ): Promise<void> {
    try {
      await emailService.enviarCredencialesDemo(email, {
        nombre,
        username,
        password,
        horas_validas: 2,
        servidores: this.wsService.obtenerEstadisticas().map((s: any) => `${s.serverName} (${s.location})`),
      });
    } catch (error: any) {
      throw new Error(`Error enviando email de demo: ${error.message}`);
    }
  }

  /**
   * Obtiene información de una demo
   */
  obtenerDemo(demoId: string): Demo | null {
    try {
      const result = this.db
        .prepare(`SELECT * FROM demos WHERE id = ?`)
        .get(demoId) as any;
      return result || null;
    } catch (error: any) {
      console.error("[DemoService] Error obteniendo demo:", error.message);
      return null;
    }
  }

  /**
   * Lista demos recientes
   */
  obtenerDemosRecientes(limite: number = 10): Demo[] {
    try {
      const result = this.db
        .prepare(
          `SELECT id, email, cliente_nombre, estado, created_at 
           FROM demos 
           WHERE estado = 'enviado'
           ORDER BY created_at DESC 
           LIMIT ?`
        )
        .all(limite) as any[];

      return result;
    } catch (error: any) {
      console.error(
        "[DemoService] Error obteniendo demos recientes:",
        error.message
      );
      return [];
    }
  }

  /**
   * Limpia demostraciones expiradas
   */
  limpiarDemosExpiradas(): number {
    try {
      const result = this.db
        .prepare(
          `UPDATE demos 
         SET estado = 'expirado' 
         WHERE estado IN ('pendiente', 'generado', 'enviado')
         AND expires_at < datetime('now')`
        )
        .run();

      console.log(
        `[Demos] Limpiadas ${result.changes} demostraciones expiradas`
      );
      return result.changes;
    } catch (error: any) {
      console.error(
        "[DemoService] Error limpiando demostraciones expiradas:",
        error.message
      );
      return 0;
    }
  }
}
