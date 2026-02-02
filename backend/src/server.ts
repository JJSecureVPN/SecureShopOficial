import express from "express";
import http from "http";
import net from "net";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { DatabaseService } from "./services/database.service";
import { ServexService } from "./services/servex.service";
import { MercadoPagoService } from "./services/mercadopago.service";
import { TiendaService } from "./services/tienda.service";
import { TiendaRevendedoresService } from "./services/tienda-revendedores.service";
import { RenovacionService } from "./services/renovacion.service";
import { WebSocketService } from "./services/websocket.service";
import { PagosPendientesService } from "./services/pagos-pendientes.service";
import { crearRutasTienda } from "./routes/tienda.routes";
import { crearRutasRevendedores } from "./routes/tienda-revendedores.routes";
import { crearRutasRenovacion } from "./routes/renovacion.routes";
import { crearRutasDonaciones } from "./routes/donaciones.routes";
import { crearRutasStats } from "./routes/stats.routes";
import { crearRutasClientes } from "./routes/clientes.routes";
import configRoutes from "./routes/config.routes";
import cuponesSupabaseRoutes from "./routes/cupones-supabase.routes";
import referidosRoutes from "./routes/referidos.routes";
import noticiasRouter from "./routes/noticias.routes";
import crearRutasHelpCenter from "./routes/help-center.routes";
import supportRoutes from "./routes/support.routes";
// import promoRoutes from "./routes/promo.routes"; // DESACTIVADO por conflicto
import { ServexPollingService } from "./services/servex-polling.service";
import { RealtimeService } from "./services/realtime.service";
import { crearRutasRealtime } from "./routes/realtime.routes";
import { crearRutasSponsors } from "./routes/sponsors.routes";
import { crearRutasActiveSessions } from "./routes/active-sessions.routes";
import { DonacionesService } from "./services/donaciones.service";
import { SponsorsService } from "./services/sponsors.service";
import {
  crearRutasPlanesVPN,
  crearRutasPlanesRevendedores,
  crearRutasPromociones,
} from "./routes/planes-supabase.routes";
import { SupabaseService } from "./services/supabase.service";
import {
  corsMiddleware,
  loggerMiddleware,
  errorHandler,
  validarJSON,
} from "./middleware";

class Server {
  private app: express.Application;
  private httpServer: http.Server | null = null;
  private sockets: Set<net.Socket> = new Set();
  private isShuttingDown = false;
  private db!: DatabaseService;
  private supabaseService!: SupabaseService;
  private tiendaService!: TiendaService;
  private tiendaRevendedoresService!: TiendaRevendedoresService;
  private renovacionService!: RenovacionService;
  private donacionesService!: DonacionesService;
  private sponsorsService!: SponsorsService;
  private wsService!: WebSocketService;
  private servexService!: ServexService;
  private servexPollingService!: ServexPollingService;
  private realtimeService!: RealtimeService;
  private pagosPendientesService!: PagosPendientesService;
  private lastServexSnapshotLog = 0;

  constructor() {
    this.app = express();
    this.initializeServices();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  private initializeServices(): void {
    console.log("[Server] Inicializando servicios...");

    // Inicializar servicio de Supabase (temprano, antes de que se necesite)
    this.supabaseService = new SupabaseService();
    if (this.supabaseService.isEnabled()) {
      console.log("[Server] ✅ Servicio Supabase inicializado");
    } else {
      console.warn("[Server] ⚠️ Servicio Supabase deshabilitado");
    }

    // Inicializar base de datos
    this.db = new DatabaseService(config.database.path);
    console.log("[Server] ✅ Base de datos inicializada");

  this.sponsorsService = new SponsorsService(this.db);
  console.log("[Server] ✅ Servicio de sponsors inicializado");

    // Cupones ahora se gestionan desde Supabase - no se cargan desde JSON
    console.log("[Server] ℹ️  Cupones: sistema migrado a Supabase");

    // Inicializar servicio de Servex
    const servex = new ServexService(config.servex);
    this.servexService = servex;
    console.log("[Server] ✅ Servicio Servex inicializado");

    this.realtimeService = new RealtimeService();

    this.servexPollingService = new ServexPollingService(servex, {
      intervalMs: config.servex.pollIntervalMs,
      maxBackoffMs: config.servex.pollMaxBackoffMs,
      clientsLimit: config.servex.pollClientsLimit,
    });

    this.servexPollingService.on("snapshot", (snapshot) => {
      const now = Date.now();
      if (now - this.lastServexSnapshotLog > 60_000) {
        console.log(
          `[Server] ♻️ Snapshot Servex actualizado (${snapshot.clients.length} clientes)`
        );
        this.lastServexSnapshotLog = now;
      }
      this.realtimeService.updateClients(snapshot);
    });

    this.servexPollingService.on("error", (error) => {
      console.error("[Server] ❌ Error en ServexPollingService:", error);
    });

    this.servexPollingService.on("backoff", (info: any) => {
      if (info && typeof info.delay === "number") {
        console.warn(
          `[Server] ⚠️ Servex rate limit (x${info.consecutive429 ?? "?"}). Reintentando en ${info.delay}ms`
        );
      }
    });

    this.servexPollingService.start();
    console.log("[Server] ✅ Polling de Servex iniciado");

    // Inicializar servicio de MercadoPago
    const mercadopago = new MercadoPagoService(config.mercadopago);
    console.log("[Server] ✅ Servicio MercadoPago inicializado");

  // Inicializar servicio de donaciones
  this.donacionesService = new DonacionesService(this.db, mercadopago);
  console.log("[Server] ✅ Servicio de donaciones inicializado");

    // Inicializar WebSocket para estadísticas en tiempo real (ANTES de tienda)
    this.wsService = new WebSocketService();
    this.wsService.conectar().catch((error) => {
      console.error("[Server] Error conectando WebSocket:", error);
    });
    console.log("[Server] ✅ Servicio de WebSocket inicializado");

    this.wsService.on("server-stats", (stats) => {
      this.realtimeService.updateServerStats(stats);
    });

    // Inicializar servicio de tienda (DESPUÉS de wsService)
    this.tiendaService = new TiendaService(this.db, servex, mercadopago, this.wsService);
    console.log("[Server] ✅ Servicio de tienda inicializado");

    // Inicializar servicio de tienda para revendedores
    this.tiendaRevendedoresService = new TiendaRevendedoresService(
      this.db,
      servex,
      mercadopago
    );
    console.log("[Server] ✅ Servicio de revendedores inicializado");

    // Inicializar servicio de renovaciones
    this.renovacionService = new RenovacionService(this.db, servex, mercadopago);
    console.log("[Server] ✅ Servicio de renovaciones inicializado");
      this.renovacionService.iniciarAutoRevisionesPendientes(config.renovaciones);

    // Inicializar servicio de verificación automática de pagos pendientes
    // Este servicio actúa como RESPALDO cuando webhooks o redirecciones fallan
    this.pagosPendientesService = new PagosPendientesService(
      this.db,
      mercadopago,
      this.tiendaService,
      this.tiendaRevendedoresService
    );
    this.pagosPendientesService.start();
    console.log("[Server] ✅ Servicio de pagos pendientes inicializado (respaldo automático)");
  }

  private setupMiddleware(): void {
    // Trust proxy (para trabajar detrás de Nginx)
    this.app.set("trust proxy", 1);

    // Seguridad
    this.app.use(helmet());

    // Rate limiting con configuración correcta para proxy
    const limiter = rateLimit({
      windowMs: config.rateLimit.windowMs,
      max: config.rateLimit.max,
      standardHeaders: true,
      legacyHeaders: false,
      message: {
        success: false,
        error: "Demasiadas solicitudes, por favor intente más tarde",
      },
      keyGenerator: (req) => {
        // Obtener IP real del cliente detrás del proxy
        return req.ip || req.connection.remoteAddress || "unknown";
      },
      skip: (req) => {
        if (req.path === "/health" || req.path === "/api/health") {
          return true;
        }

          // Endpoints de lectura que se consultan con alta frecuencia desde el frontend
          const readHeavyPrefixes = [
            "/api/realtime",
            "/api/config",
            "/api/cupones",
            "/api/clients",
            "/api/stats",
          ];

        if (req.method === "GET" && readHeavyPrefixes.some((prefix) => req.path.startsWith(prefix))) {
          return true;
        }

        return false;
      },
    });
    this.app.use(limiter);

    // CORS
    this.app.use(corsMiddleware);

    // Logging
    this.app.use(loggerMiddleware);

    // Body parsing
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));

    // Validación de JSON
    this.app.use(validarJSON);
  }

  private setupRoutes(): void {
    // Health check
    this.app.get("/health", (_req, res) => {
      if (this.isShuttingDown) {
        res.status(503).json({
          success: false,
          status: "SHUTTING_DOWN",
          timestamp: new Date().toISOString(),
          environment: config.nodeEnv,
        });
        return;
      }

      res.json({
        success: true,
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
      });
    });

    // Alias para health bajo /api (útil para monitoreo cuando Nginx proxya sólo /api)
    this.app.get("/api/health", (_req, res) => {
      if (this.isShuttingDown) {
        res.status(503).json({
          success: false,
          status: "SHUTTING_DOWN",
          timestamp: new Date().toISOString(),
          environment: config.nodeEnv,
        });
        return;
      }

      res.json({
        success: true,
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: config.nodeEnv,
      });
    });

    // Middleware simple para evitar aceptar trabajo nuevo durante shutdown
    this.app.use((req, res, next) => {
      if (!this.isShuttingDown) {
        return next();
      }

      res.setHeader("Connection", "close");
      res.status(503).json({
        success: false,
        error: "Servidor reiniciándose, reintente en unos segundos",
        path: req.originalUrl,
      });
    });

    // Webhook unificado para MercadoPago (antes de las rutas específicas)
    this.app.post("/api/webhook", async (req, res) => {
      try {
        console.log(
          "[Webhook Unificado] Recibido:",
          JSON.stringify(req.body, null, 2)
        );

        // Procesar en todos los servicios de forma asíncrona
        Promise.all([
          this.tiendaService.procesarWebhook(req.body).catch((error) => {
            console.error("[Webhook Cliente] Error:", error);
          }),
          this.tiendaRevendedoresService
            .procesarWebhook(req.body)
            .catch((error) => {
              console.error("[Webhook Revendedor] Error:", error);
            }),
          this.renovacionService.procesarWebhook(req.body).catch((error) => {
            console.error("[Webhook Renovación] Error:", error);
          }),
          this.donacionesService.procesarWebhook(req.body).catch((error) => {
            console.error("[Webhook Donaciones] Error:", error);
          }),
        ]);

        // Responder inmediatamente a MercadoPago
        res.status(200).json({ success: true });
      } catch (error: any) {
        console.error("[Webhook] Error:", error);
        // Aún así responder 200 para evitar reintentos de MercadoPago
        res.status(200).json({ success: false });
      }
    });

    // Rutas de la API - Clientes
    this.app.use("/api", crearRutasTienda(this.tiendaService, this.wsService));

    // Rutas de la API - Donaciones
    this.app.use("/api", crearRutasDonaciones(this.donacionesService));

    // Rutas de la API - Revendedores
    this.app.use(
      "/api",
      crearRutasRevendedores(this.tiendaRevendedoresService)
    );

    // Rutas de la API - Renovaciones
    this.app.use(
      "/api/renovacion",
      crearRutasRenovacion(this.renovacionService)
    );

    // Rutas de la API - Estadísticas
    this.app.use(
      "/api/stats",
      crearRutasStats(this.wsService, this.servexService, this.realtimeService)
    );

    // Rutas de la API - Sesiones Activas (Usuarios en vivo)
    this.app.use(
      "/api/sessions",
      crearRutasActiveSessions(this.supabaseService)
    );

    // Rutas de la API - Clientes
    this.app.use(
      "/api",
      crearRutasClientes(this.servexService, this.servexPollingService)
    );

    // Rutas de la API - Realtime (SSE)
    this.app.use("/api/realtime", crearRutasRealtime(this.realtimeService));

    // Rutas de la API - Config (Promociones, etc)
    this.app.use("/api/config", configRoutes);

    // Rutas de la API - Soporte (webhooks)
    this.app.use("/api/support", supportRoutes);

    // Rutas de la API - Cupones (Supabase)
    this.app.use("/api/cupones", cuponesSupabaseRoutes);

    // Rutas de la API - Referidos y Saldo
    this.app.use("/api/referidos", referidosRoutes);

    // Rutas de la API - Noticias
    this.app.use("/api/noticias", noticiasRouter);

    // Rutas de Centro de Ayuda / Tutoriales
    this.app.use("/api/help-center", crearRutasHelpCenter(this.supabaseService));

    this.app.use(
      "/api/sponsors",
      crearRutasSponsors(this.sponsorsService),
    );

    // Rutas de la API - Planes (Supabase)
    console.log("[Server] ✅ Usando planes desde Supabase");
    this.app.use("/api/planes", crearRutasPlanesVPN());
    this.app.use("/api/planes-revendedores", crearRutasPlanesRevendedores());
    this.app.use("/api/promociones", crearRutasPromociones());

    // Rutas de la API - Visitantes - removidas (funcionalidad de conteo eliminada)

    // Rutas de la API - Promo (para revendedores) - DESACTIVADO por conflicto
    // this.app.use("/api/config", promoRoutes);

    // 404 handler
    this.app.use("*", (req, res) => {
      res.status(404).json({
        success: false,
        error: "Ruta no encontrada",
        path: req.originalUrl,
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  public start(): void {
    if (this.httpServer) {
      return;
    }

    this.httpServer = http.createServer(this.app);

    this.httpServer.on("connection", (socket) => {
      this.sockets.add(socket);
      socket.on("close", () => this.sockets.delete(socket));
    });

    this.registerShutdownHandlers();

    this.httpServer.listen(config.port, () => {
      console.log("");
      console.log("═══════════════════════════════════════════════════════");
      console.log("🛡️  SecureShop VPN - Backend API");
      console.log("═══════════════════════════════════════════════════════");
      console.log(`🚀 Servidor ejecutándose en puerto ${config.port}`);
      console.log(`🌍 Entorno: ${config.nodeEnv}`);
      console.log(`📊 Health check: http://localhost:${config.port}/health`);
      console.log(`🔌 API Base: http://localhost:${config.port}/api`);
      console.log("═══════════════════════════════════════════════════════");
      console.log("");

      // Señal de "ready" para PM2 (wait_ready)
      const maybeSend = (process as any).send;
      const maybeConnected = (process as any).connected;
      if (typeof maybeSend === "function" && maybeConnected === true) {
        try {
          // IMPORTANTE: en Node 22, llamar process.send sin bind puede romper (this undefined).
          maybeSend.call(process, "ready");
        } catch (error) {
          console.warn("[Server] ⚠️ No se pudo enviar señal 'ready' a PM2:", error);
        }
      }
    });

    // Manejo de errores no capturados
    process.on("unhandledRejection", (reason, promise) => {
      console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
    });

    process.on("uncaughtException", (error) => {
      console.error("❌ Uncaught Exception:", error);
      // Intentar shutdown elegante; si no, salir
      this.shutdown("uncaughtException");
    });
  }

  private registerShutdownHandlers(): void {
    // PM2 puede mandar un mensaje de shutdown (shutdown_with_message)
    process.on("message", (message) => {
      if (message === "shutdown") {
        this.shutdown("pm2-message");
      }
    });

    process.on("SIGTERM", () => this.shutdown("SIGTERM"));
    process.on("SIGINT", () => this.shutdown("SIGINT"));
  }

  private shutdown(reason: string): void {
    if (this.isShuttingDown) {
      return;
    }

    this.isShuttingDown = true;
    console.log(`[Server] 🛑 Shutdown solicitado (${reason}). Drenando conexiones...`);

    // Detener trabajos en background / timers
    try {
      this.servexPollingService?.stop?.();
    } catch {}

    try {
      this.pagosPendientesService?.stop?.();
    } catch {}

    try {
      this.wsService?.desconectar?.();
    } catch {}

    // Dejar de aceptar nuevas conexiones y esperar las actuales
    const server = this.httpServer;
    if (server) {
      server.close(() => {
        console.log("[Server] ✅ HTTP server cerrado");
        try {
          this.db?.close?.();
        } catch {}
        process.exit(0);
      });
    }

    // Forzar cierre luego de un timeout para evitar quedar colgado
    const forceTimeoutMs = 25_000;
    setTimeout(() => {
      console.warn(`[Server] ⚠️ Forzando cierre tras ${forceTimeoutMs}ms`);
      for (const socket of this.sockets) {
        try {
          socket.destroy();
        } catch {}
      }
      try {
        this.db?.close?.();
      } catch {}
      process.exit(1);
    }, forceTimeoutMs).unref?.();
  }

  public getApp(): express.Application {
    return this.app;
  }
}

export default Server;
