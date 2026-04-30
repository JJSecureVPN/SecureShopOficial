import { Router, Request, Response } from "express";
import { TiendaService } from "../services/tienda.service";
import { WebSocketService } from "../services/websocket.service";
import { configService } from "../services/config.service";
import { supabaseService } from "../services/supabase.service";
import { ApiResponse, CrearPagoInput } from "../types";

export function crearRutasTienda(tiendaService: TiendaService, wsService: WebSocketService): Router {
  const router = Router();
  console.log("[crearRutasTienda] 🚀 INICIALIZANDO RUTAS DE TIENDA...");

  const sanitizeReference = (value: unknown): string | null => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return sanitizeReference(value[0]);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const firstSegment = trimmed.includes(",") ? trimmed.split(",")[0]?.trim() : trimmed;
      return firstSegment || null;
    }
    return null;
  };

  const sanitizeTipo = (value: unknown): string => {
    if (Array.isArray(value)) {
      return sanitizeTipo(value[0]);
    }
    return typeof value === "string" && value.trim() ? value.trim() : "cliente";
  };

  // NOTA: Ruta /api/planes movida a planes-supabase.routes.ts
  // Ahora usa Supabase como fuente de datos principal

  /**
   * POST /api/comprar
   * Inicia el proceso de compra
   */
  router.post("/comprar", async (req: Request, res: Response) => {
    try {
      const { planId, clienteEmail, clienteNombre, codigoCupon, codigoReferido, saldoUsado } =
        req.body as CrearPagoInput;

      // Validaciones
      if (!planId || !clienteEmail || !clienteNombre) {
        res.status(400).json({
          success: false,
          error: "Faltan datos requeridos: planId, clienteEmail, clienteNombre",
        } as ApiResponse);
        return;
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clienteEmail)) {
        res.status(400).json({
          success: false,
          error: "Email inválido",
        } as ApiResponse);
        return;
      }

      // Procesar compra (incluyendo código de referido y saldo)
      const resultado = await tiendaService.procesarCompra({
        planId,
        clienteEmail,
        clienteNombre,
        codigoCupon,
        codigoReferido,
        saldoUsado,
      });

      const response: ApiResponse = {
        success: true,
        data: resultado,
        message: "Pago creado exitosamente",
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error procesando compra:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error procesando compra",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/webhook
   * Webhook de MercadoPago para notificaciones de pago
   */
  router.post("/webhook", async (req: Request, res: Response) => {
    try {
      console.log("[Webhook] Recibido:", JSON.stringify(req.body, null, 2));

      // Procesar webhook de forma asíncrona
      tiendaService.procesarWebhook(req.body).catch((error) => {
        console.error("[Webhook] Error procesando:", error);
      });

      // Responder inmediatamente a MercadoPago
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("[Webhook] Error:", error);
      // Aún así responder 200 para evitar reintentos de MercadoPago
      res.status(200).json({ success: false });
    }
  });

  /**
   * GET /api/pago/success
   * Página de éxito después del pago
   * 🔴 CRÍTICO: Verifica sincronicamente en MercadoPago antes de redirigir
   */
  router.get("/pago/success", async (req: Request, res: Response) => {
    const { payment_id, external_reference, tipo } = req.query;
    const externalReference = sanitizeReference(external_reference);
    const tipoNormalizado = sanitizeTipo(tipo);

    if (!externalReference) {
      console.error("[Success] ❌ external_reference ausente o inválido", external_reference);
      res.redirect(
        `${process.env.CORS_ORIGIN || "http://localhost:3000"}/error?code=INVALID_REFERENCE&operacion=compra`
      );
      return;
    }

    // 🔍 VERIFICACIÓN SINCRÓNICA: No confiar solo en webhooks
    if (externalReference) {
      try {
        console.log(
          `[Success] 🔍 Verificando pago ${externalReference} contra MercadoPago...`
        );
        const timestamp = new Date().toISOString();

        // Consultar MercadoPago directamente
        const pagoMP = await tiendaService
          .getMercadoPagoService()
          .verificarPagoPorReferencia(externalReference);

        if (pagoMP && pagoMP.status === "approved") {
          console.log(
            `[${timestamp}] ✅ Pago aprobado en MercadoPago, procesando...`
          );

          // Procesar inmediatamente
          try {
            await tiendaService.verificarYProcesarPago(
              externalReference
            );
            console.log(
              `[${timestamp}] ✅ Pago procesado exitosamente ANTES de redirigir`
            );
          } catch (procError: any) {
            console.error(
              `[${timestamp}] ⚠️ Error procesando pago:`,
              procError.message
            );
            // Continuar de todos modos, el webhook puede reintentarlo
          }
        } else if (pagoMP) {
          console.log(
            `[Success] ⚠️ Pago en estado: ${pagoMP.status} (esperando webhook)`
          );
        } else {
          console.log(
            `[Success] ⚠️ Pago no encontrado en MercadoPago, esperando webhook`
          );
        }
      } catch (error: any) {
        console.error(
          `[Success] ❌ Error verificando en MercadoPago:`,
          error.message
        );
        // No fallar, continuar redirigiendo
      }
    }

    // Agregar headers anti-caché para asegurar datos frescos
    res.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0"
    );
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    // Redirigir al frontend con los parámetros
    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/success?status=approved&payment_id=${Array.isArray(payment_id) ? payment_id[0] : payment_id}&pago_id=${externalReference}&tipo=${
        tipoNormalizado
      }`
    );
  });

  /**
   * GET /api/pago/failure
   * Página de fallo después del pago
   */
  router.get("/pago/failure", async (req: Request, res: Response) => {
    const { external_reference, tipo, reason } = req.query;
    const externalReference = sanitizeReference(external_reference);
    const tipoNormalizado = sanitizeTipo(tipo);
    const frontendBase = process.env.CORS_ORIGIN || "http://localhost:3000";

    if (externalReference) {
      try {
        console.log(
          `[Failure] 🔍 Verificando pago ${externalReference} contra MercadoPago...`
        );
        const pagoMP = await tiendaService
          .getMercadoPagoService()
          .verificarPagoPorReferencia(externalReference);

        if (pagoMP && pagoMP.status === "approved") {
          const timestamp = new Date().toISOString();
          console.log(
            `[${timestamp}] ✅ Pago aprobado detectado desde ruta failure, procesando...`
          );

          try {
            await tiendaService.verificarYProcesarPago(
              externalReference
            );
            console.log(
              `[${timestamp}] ✅ Pago procesado exitosamente desde ruta failure`
            );
          } catch (procError: any) {
            console.error(
              `[${timestamp}] ⚠️ Error procesando pago en ruta failure:`,
              procError.message
            );
          }

          res.redirect(
            `${frontendBase}/success?status=approved&payment_id=${pagoMP.id}&pago_id=${externalReference}&tipo=${
              tipoNormalizado
            }`
          );
          return;
        }
      } catch (error: any) {
        console.error(
          `[Failure] ❌ Error verificando pago en MercadoPago:`,
          error.message
        );
      }
    }

    res.redirect(
      `${frontendBase}/error?code=PAYMENT_REJECTED&pago_id=${externalReference || ""}&tipo=${
        tipoNormalizado
      }&operacion=compra${reason ? `&message=${encodeURIComponent(reason as string)}` : ""}`
    );
  });

  /**
   * GET /api/pago/pending
   * Página de pago pendiente
   */
  router.get("/pago/pending", async (req: Request, res: Response) => {
    const { external_reference, tipo } = req.query;
    const externalReference = sanitizeReference(external_reference);
    const tipoNormalizado = sanitizeTipo(tipo);
    const frontendBase = process.env.CORS_ORIGIN || "http://localhost:3000";

    if (externalReference) {
      try {
        console.log(
          `[Pending] 🔍 Verificando pago ${externalReference} contra MercadoPago...`
        );
        const pagoMP = await tiendaService
          .getMercadoPagoService()
          .verificarPagoPorReferencia(externalReference);

        if (pagoMP && pagoMP.status === "approved") {
          const timestamp = new Date().toISOString();
          console.log(
            `[${timestamp}] ✅ Pago aprobado detectado desde ruta pending, procesando...`
          );

          try {
            await tiendaService.verificarYProcesarPago(
              externalReference
            );
            console.log(
              `[${timestamp}] ✅ Pago procesado exitosamente desde ruta pending`
            );
          } catch (procError: any) {
            console.error(
              `[${timestamp}] ⚠️ Error procesando pago en ruta pending:`,
              procError.message
            );
          }

          res.redirect(
            `${frontendBase}/success?status=approved&payment_id=${pagoMP.id}&pago_id=${externalReference}&tipo=${
              tipoNormalizado
            }`
          );
          return;
        }

        if (pagoMP && pagoMP.status === "rejected") {
          console.log(
            `[Pending] ⚠️ MercadoPago indica rechazo para ${externalReference}`
          );
          res.redirect(
            `${frontendBase}/error?code=PAYMENT_REJECTED&pago_id=${externalReference}&tipo=${
              tipoNormalizado
            }&operacion=compra`
          );
          return;
        }
      } catch (error: any) {
        console.error(
          `[Pending] ❌ Error verificando pago en MercadoPago:`,
          error.message
        );
      }
    }

    res.redirect(
      `${frontendBase}/error?code=PAYMENT_PENDING&pago_id=${externalReference || ""}&tipo=${
        tipoNormalizado
      }&operacion=compra`
    );
  });

  /**
   * GET /api/pago/:id
   * Obtiene información de un pago y verifica su estado
   */
  router.get("/pago/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const pagoId = sanitizeReference(id);

      if (!pagoId) {
        res.status(400).json({
          success: false,
          error: "ID de pago inválido",
        } as ApiResponse);
        return;
      }

      // Verificar y procesar el pago
      const pago = await tiendaService.verificarYProcesarPago(pagoId);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: "Pago no encontrado",
        } as ApiResponse);
        return;
      }

      const response: ApiResponse = {
        success: true,
        data: pago,
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error obteniendo pago:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo pago",
      } as ApiResponse);
    }
  });

  /**
   * 🔴 CRÍTICO - POST /api/pago/:id/verificar-ahora
   * Fuerza la verificación inmediata contra MercadoPago
   * Usado como fallback si el webhook tarda mucho
   */
  router.post(
    "/pago/:id/verificar-ahora",
    async (req: Request, res: Response) => {
      try {
        const { id } = req.params;
        const timestamp = new Date().toISOString();
        const pagoId = sanitizeReference(id);

        if (!pagoId) {
          console.log(
            `[${timestamp}] ⚠️ ID de pago inválido recibido en verificación forzada:`,
            id
          );
          res.status(400).json({
            success: false,
            error: "ID de pago inválido",
          } as ApiResponse);
          return;
        }

        console.log(
          `[${timestamp}] 🚨 VERIFICACIÓN FORZADA SOLICITADA para pago: ${pagoId}`
        );

        // Consultar MercadoPago directamente
        const pagoMP = await tiendaService
          .getMercadoPagoService()
          .verificarPagoPorReferencia(pagoId);

        if (!pagoMP) {
          console.log(`[${timestamp}] ⚠️ Pago no encontrado en MercadoPago`);
          res.status(404).json({
            success: false,
            error: "Pago no encontrado en MercadoPago",
          } as ApiResponse);
          return;
        }

        console.log(
          `[${timestamp}] 📊 Estado en MercadoPago: ${pagoMP.status}`
        );

        // Si está aprobado, procesar
        if (pagoMP.status === "approved") {
          console.log(`[${timestamp}] ✅ Pago aprobado! Procesando...`);
          try {
            await tiendaService.verificarYProcesarPago(pagoId);
            console.log(`[${timestamp}] ✅ Pago procesado exitosamente`);
          } catch (procError: any) {
            console.error(
              `[${timestamp}] ⚠️ Error procesando pago aprobado:`,
              procError.message
            );
            // Continuar de todos modos
          }
        }

        // Obtener información actualizada
        const pago = tiendaService.obtenerPago(pagoId);

        res.json({
          success: true,
          data: pago,
          meta: {
            mercadoPagoStatus: pagoMP.status,
          },
        } as ApiResponse);
      } catch (error: any) {
        console.error("[Rutas] Error en verificación forzada:", error);
        res.status(500).json({
          success: false,
          error: error.message || "Error verificando pago",
        } as ApiResponse);
      }
    }
  );

  /**
   * GET /api/pago/error
   * Ruta genérica para errores de pago (si MercadoPago falla antes de redirigir)
   */
  router.get("/pago/error", (req: Request, res: Response) => {
    const { external_reference, tipo, message } = req.query;
    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/error?code=PAYMENT_ERROR&pago_id=${external_reference}&tipo=${
        tipo || "cliente"
      }&operacion=compra${message ? `&message=${encodeURIComponent(message as string)}` : ""}`
    );
  });

  /**
   * GET /api/config/info
   * Obtiene información sobre la configuración de planes
   */
  router.get("/config/info", (_req: Request, res: Response) => {
    try {
      const info = configService.obtenerInfoConfig();

      const response: ApiResponse = {
        success: true,
        data: info,
        message: "Información de configuración",
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error obteniendo info de config:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo configuración",
      } as ApiResponse);
    }
  });

  /**
   * GET /api/config/hero
   * Obtiene la configuración del hero (promociones, título, etc)
   */
  router.get("/config/hero", (_req: Request, res: Response) => {
    try {
      const heroConfig = configService.obtenerConfigHero();

      const response: ApiResponse = {
        success: true,
        data: heroConfig,
        message: "Configuración del hero",
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error obteniendo config del hero:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo configuración",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/config/reload
   * Recarga la configuración desde el archivo (limpia caché)
   */
  router.post("/config/reload", (_req: Request, res: Response) => {
    try {
      configService.limpiarCache();

      const response: ApiResponse = {
        success: true,
        message: "Configuración recargada exitosamente",
        data: configService.obtenerInfoConfig(),
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error recargando config:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error recargando configuración",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/config/crear-default
   * Crea un archivo de configuración por defecto
   */
  router.post("/config/crear-default", (_req: Request, res: Response) => {
    try {
      configService.crearConfigPorDefecto();

      const response: ApiResponse = {
        success: true,
        message: "Archivo de configuración por defecto creado",
        data: configService.obtenerInfoConfig(),
      };

      res.json(response);
    } catch (error: any) {
      console.error("[Rutas] Error creando config default:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error creando configuración",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/demo
   * Solicita una demostración gratuita (2 horas)
   * REQUIERE: Usuario logueado
   * LÍMITE: Máximo 2 demos por cuenta
   */
  router.post("/demo", async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, nombre, user_id } = req.body;
      const ipAddress = req.ip || req.connection.remoteAddress || "unknown";

      // Validar que el usuario esté logueado
      if (!user_id) {
        res.status(401).json({
          success: false,
          error: "Debes iniciar sesión para solicitar una demo",
          requiere_login: true
        } as ApiResponse);
        return;
      }

      if (!email || !nombre) {
        res.status(400).json({
          success: false,
          error: "Email y nombre son requeridos",
        } as ApiResponse);
        return;
      }

      // Obtener el servicio de demos
      const demoService = tiendaService.getDemoService();

      // Verificar límite de demos por usuario (máximo 2)
      const limiteUsuario = demoService.verificarLimiteUsuario(user_id);
      if (limiteUsuario.bloqueado) {
        res.status(429).json({
          success: false,
          error: limiteUsuario.motivo || "Has alcanzado el límite de demos",
          limite_alcanzado: true,
          demos_usadas: limiteUsuario.demos_usadas,
          demos_maximas: limiteUsuario.demos_maximas
        } as ApiResponse);
        return;
      }

      // Verificar si está bloqueado por email/IP
      const bloqueo = await demoService.verificarBloqueo(email, ipAddress);
      if (bloqueo.bloqueado) {
        res.status(429).json({
          success: false,
          error: bloqueo.motivo || "Bloqueado temporalmente",
          bloqueado: true,
          tiempo_restante: bloqueo.tiempo_restante,
        } as ApiResponse);
        return;
      }

      // Crear la demo con user_id
      await demoService.crearDemo(email, nombre, ipAddress, user_id);

      console.log(`[API] ✅ Demo creada exitosamente para ${email} (userId: ${user_id})`);

      // NO devolvemos las credenciales en la respuesta por seguridad
      // Las credenciales solo se envían por email para verificar que el email es real
      const response: ApiResponse = {
        success: true,
        message: "Las credenciales han sido enviadas a tu email",
        data: {
          horas_validas: 2,
          email_enviado: true,
          demos_restantes: (limiteUsuario.demos_maximas || 2) - (limiteUsuario.demos_usadas || 0) - 1
        },
      };

      res.json(response);
    } catch (error: any) {
      console.error("[API] Error creando demo:", error.message);
      res.status(500).json({
        success: false,
        error: error.message || "Error creando demostración",
      } as ApiResponse);
    }
  });

  /**
   * GET /api/demo/disponibles/:user_id
   * Consulta cuántas demos tiene disponibles un usuario
   */
  router.get("/demo/disponibles/:user_id", async (req: Request, res: Response) => {
    try {
      const { user_id } = req.params;
      
      if (!user_id) {
        res.status(400).json({
          success: false,
          error: "user_id es requerido"
        } as ApiResponse);
        return;
      }

      const demoService = tiendaService.getDemoService();
      const demosInfo = demoService.obtenerDemosUsadas(user_id);

      res.json({
        success: true,
        data: {
          demos_usadas: demosInfo.usadas,
          demos_maximas: demosInfo.maximas,
          demos_disponibles: demosInfo.maximas - demosInfo.usadas,
          puede_solicitar: demosInfo.usadas < demosInfo.maximas
        }
      } as ApiResponse);
    } catch (error: any) {
      console.error("[API] Error consultando demos disponibles:", error.message);
      res.status(500).json({
        success: false,
        error: error.message || "Error consultando demos"
      } as ApiResponse);
    }
  });

  /**
   * GET /api/demo/recientes
   * Obtiene las demos recientemente creadas (solo admin)
   */
  router.get("/demo/recientes", async (_req: Request, res: Response) => {
    try {
      const demoService = tiendaService.getDemoService();
      const demos = demoService.obtenerDemosRecientes(5);

      const response: ApiResponse = {
        success: true,
        data: demos,
      };

      res.json(response);
    } catch (error: any) {
      console.error("[API] Error obteniendo demos recientes:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo demostraciones",
      } as ApiResponse);
    }
  });

  /**
   * GET /api/pago/obtener-credenciales/:pagoId
   * Obtiene las credenciales de una compra realizada
   * ✅ NUEVO: Permite al cliente recuperar credenciales si el email no llegó
   */
  router.get(
    "/pago/obtener-credenciales/:pagoId",
    async (req: Request, res: Response) => {
      try {
        const { pagoId } = req.params;
        const { clienteEmail } = req.query;

        if (!pagoId) {
          res.status(400).json({
            success: false,
            error: "Falta el ID del pago",
          } as ApiResponse);
          return;
        }

        const pago = tiendaService.obtenerPago(pagoId);

        if (!pago) {
          res.status(404).json({
            success: false,
            error: "Pago no encontrado",
          } as ApiResponse);
          return;
        }

        // Validación de seguridad: verificar que el email coincida (si se proporciona)
        if (clienteEmail && pago.cliente_email !== clienteEmail) {
          res.status(403).json({
            success: false,
            error: "Email no coincide con el registro",
          } as ApiResponse);
          return;
        }

        // Si el pago no está aprobado, no mostrar credenciales
        if (pago.estado !== "aprobado") {
          res.status(400).json({
            success: false,
            error: `Pago en estado: ${pago.estado}. Solo pagos aprobados tienen credenciales.`,
          } as ApiResponse);
          return;
        }

        // Si no hay cuenta creada aún, esperar
        if (!pago.servex_username) {
          res.status(202).json({
            success: false,
            error:
              "Las credenciales aún se están procesando. Intente en unos segundos.",
          } as ApiResponse);
          return;
        }

        // Devolver credenciales
        res.json({
          success: true,
          data: {
            username: pago.servex_username,
            password: pago.servex_password,
            categoria: pago.servex_categoria,
            expiracion: pago.servex_expiracion,
            conexiones: pago.servex_connection_limit,
            servidores: wsService.obtenerEstadisticas().map((s: any) => `${s.serverName} (${s.location})`),
          },
        } as ApiResponse);
      } catch (error: any) {
        console.error("[API] Error obteniendo credenciales:", error);
        res.status(500).json({
          success: false,
          error: error.message || "Error obteniendo credenciales",
        } as ApiResponse);
      }
    }
  );

  /**
   * GET /api/admin/buscar-pagos
   * Buscar pagos por email (para admin)
   */
  router.get("/admin/buscar-pagos", async (req: Request, res: Response) => {
    try {
      const email = req.query.email as string;

      if (!email) {
        res.status(400).json({
          success: false,
          error: "Falta el parámetro email",
        } as ApiResponse);
        return;
      }

      const pagos = tiendaService.buscarPagosPorEmail(email);
      console.log(`[Admin] Búsqueda de pagos para "${email}": ${pagos.length} resultados`);

      res.json({
        success: true,
        data: pagos,
      } as ApiResponse);
    } catch (error: any) {
      console.error("[Admin] Error buscando pagos:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error buscando pagos",
      } as ApiResponse);
    }
  });

  /**
   * GET /api/admin/pagos-pendientes
   * Obtener últimos pagos pendientes
   */
  router.get("/admin/pagos-pendientes", async (req: Request, res: Response) => {
    try {
      const limite = parseInt(req.query.limite as string) || 20;
      const pagos = tiendaService.obtenerPagosPendientes(limite);
      
      console.log(`[Admin] Pagos pendientes: ${pagos.length} resultados`);

      res.json({
        success: true,
        data: pagos,
      } as ApiResponse);
    } catch (error: any) {
      console.error("[Admin] Error obteniendo pagos pendientes:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo pagos pendientes",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/admin/aprobar-pago
   * Aprobar un pago manualmente (crear cuenta VPN y enviar email)
   */
  router.post("/admin/aprobar-pago", async (req: Request, res: Response) => {
    try {
      const { pagoId, motivo } = req.body;

      if (!pagoId) {
        res.status(400).json({
          success: false,
          error: "Falta el ID del pago",
        } as ApiResponse);
        return;
      }

      console.log(`[Admin] Aprobando pago manualmente: ${pagoId}`);
      
      const pagoAprobado = await tiendaService.aprobarPagoManualmente(
        pagoId, 
        motivo || 'Aprobación manual desde admin'
      );

      res.json({
        success: true,
        message: `Pago aprobado exitosamente. Usuario: ${pagoAprobado.servex_username}`,
        data: pagoAprobado,
      } as ApiResponse);
    } catch (error: any) {
      console.error("[Admin] Error aprobando pago:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error aprobando pago",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/admin/reenviar-email
   * Reenvía el email de credenciales a un cliente (útil cuando falla el envío original)
   */
  router.post("/admin/reenviar-email", async (req: Request, res: Response) => {
    try {
      const { pagoId } = req.body;

      if (!pagoId) {
        res.status(400).json({
          success: false,
          error: "Falta el ID del pago",
        } as ApiResponse);
        return;
      }

      const pago = tiendaService.obtenerPago(pagoId);

      if (!pago) {
        res.status(404).json({
          success: false,
          error: "Pago no encontrado",
        } as ApiResponse);
        return;
      }

      if (pago.estado !== "aprobado") {
        res.status(400).json({
          success: false,
          error: `Pago en estado: ${pago.estado}. Solo pagos aprobados pueden reenviar email.`,
        } as ApiResponse);
        return;
      }

      if (!pago.servex_username || !pago.servex_password) {
        res.status(400).json({
          success: false,
          error: "El pago no tiene credenciales asociadas",
        } as ApiResponse);
        return;
      }

      // Obtener información del plan (no necesaria para el email pero útil para el log)
      // const plan = tiendaService.obtenerPlanPorId(pago.plan_id);

      // Reenviar email
      const emailService = (await import("../services/email.service")).default;
      
      await emailService.enviarCredencialesCliente(pago.cliente_email, {
        username: pago.servex_username,
        password: pago.servex_password,
        categoria: pago.servex_categoria || "Clientes",
        expiracion: pago.servex_expiracion || "30 días",
        servidores: wsService.obtenerEstadisticas().map((s: any) => `${s.serverName} (${s.location})`),
      });

      console.log(`[Admin] ✅ Email reenviado a ${pago.cliente_email} para pago ${pagoId}`);

      res.json({
        success: true,
        message: `Email reenviado exitosamente a ${pago.cliente_email}`,
        data: {
          email: pago.cliente_email,
          username: pago.servex_username,
        },
      } as ApiResponse);
    } catch (error: any) {
      console.error("[Admin] Error reenviando email:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error reenviando email",
      } as ApiResponse);
    }
  });

  /**
   * POST /api/compras/vincular
   * Vincula compras realizadas como invitado (sin cuenta) al usuario que acaba de iniciar sesión.
   * Se llama desde el frontend justo después del login o registro.
   * Body: { user_id: string, email: string }
   */
  router.post("/compras/vincular", async (req: Request, res: Response): Promise<void> => {
    try {
      const { user_id, email } = req.body;

      if (!user_id || !email) {
        res.status(400).json({
          success: false,
          error: "user_id y email son requeridos",
        } as ApiResponse);
        return;
      }

      const linked = await supabaseService.linkPurchasesByEmail(user_id, email);

      res.json({
        success: true,
        message: linked > 0
          ? `${linked} compra(s) vinculadas a tu cuenta`
          : "Sin compras pendientes por vincular",
        data: { vinculadas: linked },
      } as ApiResponse);
    } catch (error: any) {
      console.error("[API] Error vinculando compras:", error.message);
      res.status(500).json({
        success: false,
        error: error.message || "Error vinculando compras",
      } as ApiResponse);
    }
  });

  return router;
}
