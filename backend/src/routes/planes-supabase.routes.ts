import express, { Request, Response } from "express";
import {
  planesSupabaseService,
  PlanVPN,
  PlanRevendedor,
} from "../services/planes-supabase.service";

// ============================================
// RUTAS PARA PLANES VPN (SUPABASE)
// ============================================

export function crearRutasPlanesVPN() {
  const router = express.Router();

  /**
   * GET /api/planes
   * Obtiene todos los planes VPN activos con precios efectivos
   */
  router.get("/", async (_req: Request, res: Response) => {
    try {
      if (!planesSupabaseService.isEnabled()) {
        return res.status(503).json({
          success: false,
          error: "Servicio de planes no disponible",
        });
      }

      const planes = await planesSupabaseService.obtenerPlanesVPNConPrecios();
      return res.status(200).json({
        success: true,
        data: planes,
        source: "supabase",
      });
    } catch (error) {
      console.error("[PLANES-ROUTES] Error al obtener planes:", error);
      return res.status(500).json({
        success: false,
        error: "Error al obtener planes",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/planes/:id
   * Obtiene un plan VPN específico
   */
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "ID debe ser un número válido",
        });
      }

      const plan = await planesSupabaseService.obtenerPlanVPN(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: "Plan no encontrado",
        });
      }

      const { precio, esPromo } =
        await planesSupabaseService.obtenerPrecioEfectivoVPN(id);

      return res.status(200).json({
        success: true,
        data: {
          ...plan,
          precio_efectivo: precio,
          en_promocion: esPromo,
        },
      });
    } catch (error) {
      console.error("[PLANES-ROUTES] Error al obtener plan:", error);
      return res.status(500).json({
        success: false,
        error: "Error al obtener plan",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * PUT /api/planes/actualizar
   * Actualiza el precio de un plan VPN
   * Body: { id: number, precio: number, precio_promo?: number }
   */
  router.put("/actualizar", async (req: Request, res: Response) => {
    try {
      const { id, precio, precio_promo } = req.body;

      if (typeof id !== "number" || id <= 0) {
        return res.status(400).json({
          success: false,
          error: "ID debe ser un número mayor a 0",
        });
      }

      if (typeof precio !== "number" || precio <= 0) {
        return res.status(400).json({
          success: false,
          error: "Precio debe ser un número mayor a 0",
        });
      }

      const updates: Partial<PlanVPN> = { precio };
      if (precio_promo !== undefined) {
        updates.precio_promo = precio_promo;
      }

      const planActualizado =
        await planesSupabaseService.actualizarPlanVPN(id, updates);

      return res.status(200).json({
        success: true,
        message: "Plan actualizado exitosamente",
        data: planActualizado,
      });
    } catch (error) {
      console.error("[PLANES-ROUTES] Error al actualizar plan:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      const status = message.includes("no encontrado") ? 404 : 500;

      return res.status(status).json({
        success: false,
        error: "Error al actualizar plan",
        detalles: message,
      });
    }
  });

  /**
   * POST /api/planes
   * Crea un nuevo plan VPN
   */
  router.post("/", async (req: Request, res: Response) => {
    try {
      const { id, nombre, descripcion, precio, dispositivos, dias, activo, orden } =
        req.body;

      if (!id || !nombre || !precio || !dispositivos || !dias) {
        return res.status(400).json({
          success: false,
          error: "Campos requeridos: id, nombre, precio, dispositivos, dias",
        });
      }

      const nuevoPlan = await planesSupabaseService.crearPlanVPN({
        id,
        nombre,
        descripcion: descripcion || null,
        precio,
        precio_promo: null,
        dispositivos,
        dias,
        activo: activo !== false,
        orden: orden || 0,
      });

      return res.status(201).json({
        success: true,
        message: "Plan creado exitosamente",
        data: nuevoPlan,
      });
    } catch (error) {
      console.error("[PLANES-ROUTES] Error al crear plan:", error);
      return res.status(500).json({
        success: false,
        error: "Error al crear plan",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}

// ============================================
// RUTAS PARA PLANES DE REVENDEDORES (SUPABASE)
// ============================================

export function crearRutasPlanesRevendedores() {
  const router = express.Router();

  /**
   * GET /api/planes-revendedores
   * Obtiene todos los planes de revendedor activos con precios efectivos
   */
  router.get("/", async (_req: Request, res: Response) => {
    try {
      if (!planesSupabaseService.isEnabled()) {
        return res.status(503).json({
          success: false,
          error: "Servicio de planes no disponible",
        });
      }

      const planes =
        await planesSupabaseService.obtenerPlanesRevendedorConPrecios();

      return res.status(200).json({
        success: true,
        data: planes,
        source: "supabase",
      });
    } catch (error) {
      console.error("[PLANES-REV-ROUTES] Error al obtener planes:", error);
      return res.status(500).json({
        success: false,
        error: "Error al obtener planes de revendedor",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * GET /api/planes-revendedores/:id
   * Obtiene un plan de revendedor específico
   */
  router.get("/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({
          success: false,
          error: "ID debe ser un número válido",
        });
      }

      const plan = await planesSupabaseService.obtenerPlanRevendedor(id);
      if (!plan) {
        return res.status(404).json({
          success: false,
          error: "Plan no encontrado",
        });
      }

      const { precio, esPromo } =
        await planesSupabaseService.obtenerPrecioEfectivoRevendedor(id);

      return res.status(200).json({
        success: true,
        data: {
          ...plan,
          precio_efectivo: precio,
          en_promocion: esPromo,
        },
      });
    } catch (error) {
      console.error("[PLANES-REV-ROUTES] Error al obtener plan:", error);
      return res.status(500).json({
        success: false,
        error: "Error al obtener plan de revendedor",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * PUT /api/planes-revendedores/actualizar
   * Actualiza el precio de un plan de revendedor
   * Body: { id: number, precio: number, precio_promo?: number }
   */
  router.put("/actualizar", async (req: Request, res: Response) => {
    try {
      const { id, precio, precio_promo } = req.body;

      if (typeof id !== "number" || id <= 0) {
        return res.status(400).json({
          success: false,
          error: "ID debe ser un número mayor a 0",
        });
      }

      if (typeof precio !== "number" || precio <= 0) {
        return res.status(400).json({
          success: false,
          error: "Precio debe ser un número mayor a 0",
        });
      }

      const updates: Partial<PlanRevendedor> = { precio };
      if (precio_promo !== undefined) {
        updates.precio_promo = precio_promo;
      }

      const planActualizado =
        await planesSupabaseService.actualizarPlanRevendedor(id, updates);

      return res.status(200).json({
        success: true,
        message: "Plan de revendedor actualizado exitosamente",
        data: planActualizado,
      });
    } catch (error) {
      console.error("[PLANES-REV-ROUTES] Error al actualizar plan:", error);
      const message = error instanceof Error ? error.message : "Unknown error";
      const status = message.includes("no encontrado") ? 404 : 500;

      return res.status(status).json({
        success: false,
        error: "Error al actualizar plan de revendedor",
        detalles: message,
      });
    }
  });

  /**
   * POST /api/planes-revendedores
   * Crea un nuevo plan de revendedor
   */
  router.post("/", async (req: Request, res: Response) => {
    try {
      const {
        id,
        nombre,
        descripcion,
        precio,
        max_users,
        account_type,
        dias,
        activo,
        orden,
      } = req.body;

      if (!id || !nombre || !precio || !max_users || !account_type) {
        return res.status(400).json({
          success: false,
          error:
            "Campos requeridos: id, nombre, precio, max_users, account_type",
        });
      }

      if (!["credit", "validity"].includes(account_type)) {
        return res.status(400).json({
          success: false,
          error: "account_type debe ser 'credit' o 'validity'",
        });
      }

      const nuevoPlan = await planesSupabaseService.crearPlanRevendedor({
        id,
        nombre,
        descripcion: descripcion || null,
        precio,
        precio_promo: null,
        max_users,
        account_type,
        dias: account_type === "validity" ? dias || 30 : null,
        activo: activo !== false,
        orden: orden || 0,
      });

      return res.status(201).json({
        success: true,
        message: "Plan de revendedor creado exitosamente",
        data: nuevoPlan,
      });
    } catch (error) {
      console.error("[PLANES-REV-ROUTES] Error al crear plan:", error);
      return res.status(500).json({
        success: false,
        error: "Error al crear plan de revendedor",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}

// ============================================
// RUTAS PARA PROMOCIONES (SUPABASE)
// ============================================

export function crearRutasPromociones() {
  const router = express.Router();

  /**
   * GET /api/promociones/config
   * Obtiene la configuración actual de promociones
   */
  router.get("/config", async (_req: Request, res: Response) => {
    try {
      const config = await planesSupabaseService.obtenerPromocionesConfig();
      return res.status(200).json({
        success: true,
        data: config,
      });
    } catch (error) {
      console.error("[PROMO-ROUTES] Error al obtener config:", error);
      return res.status(500).json({
        success: false,
        error: "Error al obtener configuración de promociones",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/promociones/vpn/activar
   * Activa la promoción de planes VPN
   * Body: { duracion_horas?: number, descuento_porcentaje?: number, texto?: string }
   */
  router.post("/vpn/activar", async (req: Request, res: Response) => {
    try {
      const { duracion_horas, descuento_porcentaje, texto } = req.body;

      const config = await planesSupabaseService.activarPromocionVPN(
        duracion_horas || 24,
        descuento_porcentaje || 30,
        texto
      );

      return res.status(200).json({
        success: true,
        message: "Promoción VPN activada",
        data: config,
      });
    } catch (error) {
      console.error("[PROMO-ROUTES] Error al activar promo VPN:", error);
      return res.status(500).json({
        success: false,
        error: "Error al activar promoción VPN",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/promociones/vpn/desactivar
   * Desactiva la promoción de planes VPN
   */
  router.post("/vpn/desactivar", async (_req: Request, res: Response) => {
    try {
      const config = await planesSupabaseService.desactivarPromocionVPN();
      return res.status(200).json({
        success: true,
        message: "Promoción VPN desactivada",
        data: config,
      });
    } catch (error) {
      console.error("[PROMO-ROUTES] Error al desactivar promo VPN:", error);
      return res.status(500).json({
        success: false,
        error: "Error al desactivar promoción VPN",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/promociones/revendedores/activar
   * Activa la promoción de planes de revendedores
   * Body: { duracion_horas?, descuento_porcentaje?, texto?, solo_nuevos?, solo_renovaciones? }
   */
  router.post("/revendedores/activar", async (req: Request, res: Response) => {
    try {
      const {
        duracion_horas,
        descuento_porcentaje,
        texto,
        solo_nuevos,
        solo_renovaciones,
      } = req.body;

      const config = await planesSupabaseService.activarPromocionRevendedor(
        duracion_horas || 24,
        descuento_porcentaje || 20,
        texto,
        solo_nuevos || false,
        solo_renovaciones || false
      );

      return res.status(200).json({
        success: true,
        message: "Promoción revendedores activada",
        data: config,
      });
    } catch (error) {
      console.error("[PROMO-ROUTES] Error al activar promo revendedores:", error);
      return res.status(500).json({
        success: false,
        error: "Error al activar promoción revendedores",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  /**
   * POST /api/promociones/revendedores/desactivar
   * Desactiva la promoción de planes de revendedores
   */
  router.post("/revendedores/desactivar", async (_req: Request, res: Response) => {
    try {
      const config = await planesSupabaseService.desactivarPromocionRevendedor();
      return res.status(200).json({
        success: true,
        message: "Promoción revendedores desactivada",
        data: config,
      });
    } catch (error) {
      console.error("[PROMO-ROUTES] Error al desactivar promo revendedores:", error);
      return res.status(500).json({
        success: false,
        error: "Error al desactivar promoción revendedores",
        detalles: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  return router;
}
