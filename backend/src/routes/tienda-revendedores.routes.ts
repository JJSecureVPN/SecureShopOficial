import { Router, Request, Response } from "express";
import { TiendaRevendedoresService } from "../services/tienda-revendedores.service";
import { RenovacionService } from "../services/renovacion.service";
import { CrearPagoRevendedorInput } from "../types";

export function crearRutasRevendedores(
  tiendaRevendedores: TiendaRevendedoresService,
  renovacionService?: RenovacionService
): Router {
  const router = Router();
  console.log(
    "[crearRutasRevendedores] 🎯 Registrando rutas de revendedores..."
  );

  const sanitizeReference = (value: unknown): string | null => {
    if (!value) return null;
    if (Array.isArray(value)) {
      return sanitizeReference(value[0]);
    }
    if (typeof value === "string") {
      const trimmed = value.trim();
      if (!trimmed) return null;
      const firstSegment = trimmed.includes(",")
        ? trimmed.split(",")[0]?.trim()
        : trimmed;
      return firstSegment || null;
    }
    return null;
  };

  // NOTA: Ruta /api/planes-revendedores movida a planes-supabase.routes.ts
  // Ahora usa Supabase como fuente de datos principal

  /**
   * POST /api/comprar-revendedor
   * Crea una nueva compra de plan de revendedor
   */
  router.post(
    "/comprar-revendedor",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const input: CrearPagoRevendedorInput = req.body;

        // Validar datos de entrada
        if (
          !input.planRevendedorId ||
          !input.clienteEmail ||
          !input.clienteNombre
        ) {
          res.status(400).json({
            success: false,
            error:
              "Faltan datos requeridos: planRevendedorId, clienteEmail, clienteNombre",
          });
          return;
        }

        const resultado = await tiendaRevendedores.procesarCompra(input);

        res.json({
          success: true,
          data: resultado,
        });
      } catch (error: any) {
        console.error("[API] Error procesando compra de revendedor:", error);
        res.status(500).json({
          success: false,
          error: error.message || "Error al procesar la compra",
        });
      }
    }
  );


  /**
   * GET /api/pago-revendedor/success
   * Página de éxito para compra de revendedor
   */
  router.get("/pago-revendedor/success", async (req: Request, res: Response) => {
    const paymentId = sanitizeReference(req.query.payment_id);
    const externalReference = sanitizeReference(req.query.external_reference);

    if (!externalReference) {
      console.error(
        "[Success Revendedor] ❌ external_reference ausente o inválido",
        req.query.external_reference
      );
      res.redirect(
        `${
          process.env.CORS_ORIGIN || "http://localhost:3000"
        }/error?code=INVALID_REFERENCE&tipo=revendedor&operacion=compra`
      );
      return;
    }

    // 🔍 VERIFICACIÓN SINCRÓNICA: No confiar solo en webhooks
    try {
      console.log(
        `[Success Revendedor] 🔍 Verificando pago ${externalReference} contra MercadoPago...`
      );
      const timestamp = new Date().toISOString();

      const pagoMP = await tiendaRevendedores
        .getMercadoPagoService()
        .verificarPagoPorReferencia(externalReference);

      if (pagoMP && pagoMP.status === "approved") {
        console.log(
          `[${timestamp}] ✅ Pago de revendedor aprobado en MercadoPago, procesando...`
        );

        try {
          await tiendaRevendedores.verificarYProcesarPago(externalReference);
          console.log(
            `[${timestamp}] ✅ Pago de revendedor procesado exitosamente ANTES de redirigir`
          );
        } catch (procError: any) {
          console.error(
            `[${timestamp}] ⚠️ Error procesando pago de revendedor:`,
            procError.message
          );
          // Continuar de todos modos, el webhook puede reintentarlo
        }
      }
    } catch (error: any) {
      console.error(
        `[Success Revendedor] ❌ Error verificando en MercadoPago:`,
        error.message
      );
    }

    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/success?status=approved&payment_id=${paymentId ?? ""}&pago_id=${externalReference}&tipo=revendedor&operacion=compra`
    );
  });

  /**
   * GET /api/pago-revendedor/failure
   * Página de fallo para compra de revendedor
   */
  router.get("/pago-revendedor/failure", (req: Request, res: Response) => {
    const externalReference = sanitizeReference(req.query.external_reference);
    const reason = typeof req.query.reason === "string" ? req.query.reason : undefined;
    const reasonParam = reason ? `&message=${encodeURIComponent(reason)}` : "";

    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/error?code=PAYMENT_REJECTED&pago_id=${externalReference ?? ""}&tipo=revendedor&operacion=compra${reasonParam}`
    );
  });

  /**
   * GET /api/pago-revendedor/pending
   * Página de pago pendiente para revendedor
   */
  router.get("/pago-revendedor/pending", (req: Request, res: Response) => {
    const externalReference = sanitizeReference(req.query.external_reference);
    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/error?code=PAYMENT_PENDING&pago_id=${externalReference ?? ""}&tipo=revendedor&operacion=compra`
    );
  });

  /**
   * GET /api/pago-revendedor/error
   * Ruta genérica para errores de pago de revendedor
   */
  router.get("/pago-revendedor/error", (req: Request, res: Response) => {
    const externalReference = sanitizeReference(req.query.external_reference);
    const message = typeof req.query.message === "string" ? req.query.message : undefined;
    const messageParam = message ? `&message=${encodeURIComponent(message)}` : "";

    res.redirect(
      `${
        process.env.CORS_ORIGIN || "http://localhost:3000"
      }/error?code=PAYMENT_ERROR&pago_id=${externalReference ?? ""}&tipo=revendedor&operacion=compra${messageParam}`
    );
  });

  /**
   * GET /api/pago-revendedor/:id
   * Obtiene información de un pago de revendedor y verifica su estado
   */
  router.get(
    "/pago-revendedor/:id",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const pagoId = sanitizeReference(req.params.id);
        if (!pagoId) {
          console.error(
            "[API] Pago ID inválido en /pago-revendedor/:id:",
            req.params.id
          );
          res.status(400).json({
            success: false,
            error: "Identificador de pago inválido",
          });
          return;
        }

        console.log(`[API] GET /pago-revendedor/${pagoId} - Iniciando...`);

        const pago = await tiendaRevendedores.verificarYProcesarPago(pagoId);
        console.log(`[API] Pago obtenido:`, JSON.stringify(pago, null, 2));

        if (!pago) {
          console.log(`[API] Pago no encontrado: ${pagoId}`);
          res.status(404).json({
            success: false,
            error: "Pago no encontrado",
          });
          return;
        }

        const pagoCompatible: any = {
          id: pago.id,
          plan_id: pago.plan_revendedor_id,
          monto: pago.monto,
          estado: pago.estado,
          metodo_pago: pago.metodo_pago,
          cliente_email: pago.cliente_email,
          cliente_nombre: pago.cliente_nombre,
          mp_payment_id: pago.mp_payment_id,
          mp_preference_id: pago.mp_preference_id,
          servex_cuenta_id: pago.servex_revendedor_id,
          servex_username: pago.servex_username,
          servex_password: pago.servex_password,
          servex_expiracion: pago.servex_expiracion,
          fecha_creacion: pago.fecha_creacion,
          fecha_actualizacion: pago.fecha_actualizacion,
        };

        if (pago.servex_account_type === "credit") {
          pagoCompatible.servex_creditos = pago.servex_max_users;
          pagoCompatible.servex_categoria = "Créditos";
        } else {
          pagoCompatible.servex_connection_limit = pago.servex_max_users;
          pagoCompatible.servex_categoria = "Usuarios simultáneos";
        }

        res.json({
          success: true,
          data: pagoCompatible,
        });
      } catch (error: any) {
        console.error("[API] Error obteniendo pago de revendedor:", error);
        console.error("[API] Stack trace:", error.stack);
        res.status(500).json({
          success: false,
          error: error.message || "Error al obtener el pago",
        });
      }
    }
  );

  /**
   * POST /api/webhook-revendedor
   * Webhook de MercadoPago para notificaciones de pago de revendedores
   * MEJORADO: También intenta procesar como renovación si no encuentra un pago
   */
  router.post("/webhook-revendedor", async (req: Request, res: Response) => {
    try {
      console.log(
        "[Webhook Revendedor] Recibido:",
        JSON.stringify(req.body, null, 2)
      );

      // Procesar webhook de forma asíncrona en ambos servicios
      // (Primero TiendaRevendedores que trata de encontrar un pago,
      //  luego RenovacionService por si es una renovación de revendedor)
      Promise.all([
        tiendaRevendedores.procesarWebhook(req.body).catch((error) => {
          console.error("[Webhook Revendedor] Error en TiendaRevendedores:", error);
        }),
        renovacionService
          ? renovacionService.procesarWebhook(req.body).catch((error) => {
              console.error("[Webhook Revendedor] Error en RenovacionService:", error);
            })
          : Promise.resolve()
      ]);

      // Responder inmediatamente a MercadoPago
      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error("[Webhook Revendedor] Error:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error procesando webhook",
      });
    }
  });

  /**
   * GET /api/admin/pago-revendedor/:pagoId/status
   * Endpoint administrativo para verificar estado de un pago
   */
  router.get(
    "/admin/pago-revendedor/:pagoId/status",
    async (req: Request, res: Response) => {
      try {
        const pagoId = req.params.pagoId;
        console.log(`[Admin] Verificando pago: ${pagoId}`);

        const pago = tiendaRevendedores.obtenerPago(pagoId);
        if (!pago) {
          return res.status(404).json({
            success: false,
            error: "Pago no encontrado",
            pagoId,
          });
        }

        return res.json({
          success: true,
          pago: {
            id: pago.id,
            plan_id: pago.plan_revendedor_id,
            monto: pago.monto,
            estado: pago.estado,
            cliente_email: pago.cliente_email,
            cliente_nombre: pago.cliente_nombre,
            fecha_creacion: pago.fecha_creacion,
            mp_payment_id: pago.mp_payment_id,
            servex_revendedor_id: pago.servex_revendedor_id,
          },
        });
      } catch (error: any) {
        console.error("[Admin] Error:", error);
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );

  /**
   * POST /api/admin/pago-revendedor/:pagoId/procesar
   * Endpoint administrativo para procesar un pago pendiente manualmente
   */
  router.post(
    "/admin/pago-revendedor/:pagoId/procesar",
    async (req: Request, res: Response) => {
      try {
        const pagoId = req.params.pagoId;
        console.log(`[Admin] Procesando pago: ${pagoId}`);

        const pagoActualizado = await tiendaRevendedores.verificarYProcesarPago(
          pagoId
        );
        if (!pagoActualizado) {
          return res.status(404).json({
            success: false,
            error: "Pago no encontrado",
            pagoId,
          });
        }

        return res.json({
          success: true,
          message: `Pago procesado. Estado actual: ${pagoActualizado.estado}`,
          pago: {
            id: pagoActualizado.id,
            estado: pagoActualizado.estado,
            servex_revendedor_id: pagoActualizado.servex_revendedor_id,
          },
        });
      } catch (error: any) {
        console.error("[Admin] Error:", error);
        return res.status(500).json({
          success: false,
          error: error.message,
        });
      }
    }
  );

  return router;
}

