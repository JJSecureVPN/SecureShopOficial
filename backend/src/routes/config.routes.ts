import express, { Request, Response } from "express";
import { planesSupabaseService } from "../services/planes-supabase.service";

const router = express.Router();

/**
 * POST /api/config/activar-promo
 * Activa la promoción por una duración configurable (AHORA USA SUPABASE)
 * Body: { duracion_horas: number, tipo?: "planes" | "revendedores", descuento_porcentaje?: number, solo_nuevos?: boolean, solo_renovaciones?: boolean }
 */
router.post("/activar-promo", async (req: Request, res: Response) => {
  try {
    const {
      duracion_horas,
      tipo = "planes",
      descuento_porcentaje = 20,
      solo_nuevos = false,
      solo_renovaciones = false,
    } = req.body;

    if (!duracion_horas || duracion_horas <= 0) {
      return res.status(400).json({
        error: "duracion_horas debe ser un número mayor a 0",
      });
    }

    if (!["planes", "revendedores"].includes(tipo)) {
      return res.status(400).json({
        error: 'tipo debe ser "planes" o "revendedores"',
      });
    }

    if (descuento_porcentaje < 1 || descuento_porcentaje > 100) {
      return res.status(400).json({
        error: "descuento_porcentaje debe estar entre 1 y 100",
      });
    }

    if (typeof solo_nuevos !== "boolean") {
      return res.status(400).json({
        error: "solo_nuevos debe ser un booleano",
      });
    }

    if (typeof solo_renovaciones !== "boolean") {
      return res.status(400).json({
        error: "solo_renovaciones debe ser un booleano",
      });
    }

    // Validar que no se activen ambos flags al mismo tiempo
    if (solo_nuevos && solo_renovaciones) {
      return res.status(400).json({
        error: "No se puede activar solo_nuevos y solo_renovaciones al mismo tiempo",
      });
    }

    // Usar Supabase para activar promociones
    if (tipo === "planes") {
      console.log(`[CONFIG-ROUTE] 🚀 Activando promo VPN en Supabase: ${descuento_porcentaje}% por ${duracion_horas}h`);
      await planesSupabaseService.activarPromocionVPN(
        duracion_horas,
        descuento_porcentaje,
        undefined // texto opcional
      );
      console.log("[CONFIG-ROUTE] ✅ Promo VPN activada en Supabase");
    }

    if (tipo === "revendedores") {
      console.log(`[CONFIG-ROUTE] 🚀 Activando promo Revendedores en Supabase: ${descuento_porcentaje}% por ${duracion_horas}h`);
      await planesSupabaseService.activarPromocionRevendedor(
        duracion_horas,
        descuento_porcentaje,
        undefined, // texto opcional
        solo_nuevos,
        solo_renovaciones
      );
      console.log("[CONFIG-ROUTE] ✅ Promo Revendedores activada en Supabase");
    }

    return res.status(200).json({
      success: true,
      mensaje: `Promoción de ${tipo} activada con ${descuento_porcentaje}% de descuento por ${duracion_horas} hora(s)`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error activando promo:", error);
    return res.status(500).json({
      error: "Error al activar la promoción",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/config/desactivar-promo
 * Desactiva la promoción inmediatamente (AHORA USA SUPABASE)
 * Body: { tipo?: "planes" | "revendedores" }
 */
router.post("/desactivar-promo", async (req: Request, res: Response) => {
  try {
    const { tipo = "planes" } = req.body;

    if (!["planes", "revendedores"].includes(tipo)) {
      return res.status(400).json({
        error: 'tipo debe ser "planes" o "revendedores"',
      });
    }

    // Usar Supabase para desactivar promociones
    if (tipo === "planes") {
      console.log("[CONFIG-ROUTE] 🛑 Desactivando promo VPN en Supabase");
      await planesSupabaseService.desactivarPromocionVPN();
      console.log("[CONFIG-ROUTE] ✅ Promo VPN desactivada en Supabase");
    }

    if (tipo === "revendedores") {
      console.log("[CONFIG-ROUTE] 🛑 Desactivando promo Revendedores en Supabase");
      await planesSupabaseService.desactivarPromocionRevendedor();
      console.log("[CONFIG-ROUTE] ✅ Promo Revendedores desactivada en Supabase");
    }

    return res.status(200).json({
      success: true,
      mensaje: `Promoción de ${tipo} desactivada`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error desactivando promo:", error);
    return res.status(500).json({
      error: "Error al desactivar la promoción",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});


/**
 * GET /api/config/promo-status
 * Obtiene el estado actual de la promoción VPN (AHORA USA SUPABASE)
 */
router.get("/promo-status", async (req: Request, res: Response) => {
  try {
    // Logging temporal para detectar Origin real desde WebView/Capacitor
    console.log("[PROMO-STATUS][CORS-DEBUG] origin:", req.headers.origin, "referer:", req.headers.referer);

    const config = await planesSupabaseService.obtenerPromocionesConfig();

    // Verificar expiración automáticamente
    if (config?.vpn_activa && config?.vpn_activada_en && config?.vpn_duracion_horas) {
      const activadaEn = new Date(config.vpn_activada_en);
      const venceEn = new Date(activadaEn.getTime() + config.vpn_duracion_horas * 60 * 60 * 1000);
      const ahora = new Date();
      
      if (ahora >= venceEn) {
        // Auto-desactivar
        console.log("[CONFIG-ROUTE] ⏰ Promo VPN expirada, desactivando...");
        await planesSupabaseService.desactivarPromocionVPN();
        
        return res.status(200).json({
          promo_config: {
            activa: false,
            activada_en: null,
            duracion_horas: config.vpn_duracion_horas || 12,
            auto_desactivar: true,
            descuento_porcentaje: config.vpn_descuento_porcentaje || 20,
            solo_nuevos: false,
            solo_renovaciones: false,
          },
        });
      }
    }

    return res.status(200).json({
      promo_config: {
        activa: config?.vpn_activa || false,
        activada_en: config?.vpn_activada_en || null,
        duracion_horas: config?.vpn_duracion_horas || 12,
        auto_desactivar: true,
        descuento_porcentaje: config?.vpn_descuento_porcentaje || 20,
        solo_nuevos: false,
        solo_renovaciones: false,
        vpn_2x1_activa: config?.vpn_2x1_activa || false,
        vpn_2x1_activada_en: config?.vpn_2x1_activada_en || null,
        vpn_2x1_duracion_horas: config?.vpn_2x1_duracion_horas || 24,
      },
    });
  } catch (error) {
    console.error("Error obteniendo status promo:", error);
    return res.status(500).json({
      error: "Error al obtener estado de la promoción",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/config/test
 * Ruta de prueba
 */
router.get("/test", (_req: Request, res: Response) => {
  return res.status(200).json({
    message: "Test route working",
    timestamp: new Date().toISOString(),
  });
});

/**
 * GET /api/config/promo-status-revendedores
 * Obtiene el estado actual de la promoción para revendedores (AHORA USA SUPABASE)
 */
router.get("/promo-status-revendedores", async (_req: Request, res: Response) => {
  try {
    const config = await planesSupabaseService.obtenerPromocionesConfig();

    // Verificar expiración automáticamente
    if (config?.revendedor_activa && config?.revendedor_activada_en && config?.revendedor_duracion_horas) {
      const activadaEn = new Date(config.revendedor_activada_en);
      const venceEn = new Date(activadaEn.getTime() + config.revendedor_duracion_horas * 60 * 60 * 1000);
      const ahora = new Date();
      
      if (ahora >= venceEn) {
        // Auto-desactivar
        console.log("[CONFIG-ROUTE] ⏰ Promo Revendedores expirada, desactivando...");
        await planesSupabaseService.desactivarPromocionRevendedor();
        
        return res.status(200).json({
          promo_config: {
            activa: false,
            activada_en: null,
            duracion_horas: config.revendedor_duracion_horas || 12,
            auto_desactivar: true,
            descuento_porcentaje: config.revendedor_descuento_porcentaje || 20,
            solo_nuevos: config.revendedor_solo_nuevos || false,
            solo_renovaciones: config.revendedor_solo_renovaciones || false,
          },
        });
      }
    }

    return res.status(200).json({
      promo_config: {
        activa: config?.revendedor_activa || false,
        activada_en: config?.revendedor_activada_en || null,
        duracion_horas: config?.revendedor_duracion_horas || 12,
        auto_desactivar: true,
        descuento_porcentaje: config?.revendedor_descuento_porcentaje || 20,
        solo_nuevos: config?.revendedor_solo_nuevos || false,
        solo_renovaciones: config?.revendedor_solo_renovaciones || false,
      },
    });
  } catch (error) {
    console.error("Error obteniendo status promo revendedores:", error);
    return res.status(500).json({
      error: "Error al obtener estado de la promoción para revendedores",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/config/mercadopago
 * Obtiene la configuración pública de MercadoPago (solo publicKey)
 */
router.get("/mercadopago", (_req: Request, res: Response) => {
  try {
    const { config: appConfig } = require("../config");

    // Asegurar que el publicKey esté limpio de espacios
    const publicKey = appConfig.mercadopago.publicKey.trim();
    
    return res.status(200).json({
      success: true,
      publicKey: publicKey,
    });
  } catch (error) {
    console.error("Error obteniendo config MercadoPago:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener configuración de MercadoPago",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/config/2x1-status
 * Retorna el estado simplificado de la oferta 2x1 para integraciones externas
 */
router.get("/2x1-status", async (_req: Request, res: Response) => {
  try {
    const config = await planesSupabaseService.obtenerPromocionesConfig();
    return res.status(200).json({
      active: config?.vpn_2x1_activa || false,
    });
  } catch (error) {
    return res.status(500).json({ active: false });
  }
});

/**
 * POST /api/config/activar-2x1
 * Activa la oferta 2x1 para planes VPN
 */
router.post("/activar-2x1", async (req: Request, res: Response) => {
  try {
    const { duracion_horas, auto_desactivar } = req.body;
    await planesSupabaseService.activar2x1VPN(
      duracion_horas ? parseInt(duracion_horas) : 24,
      auto_desactivar !== undefined ? auto_desactivar === true : true
    );
    return res.status(200).json({
      success: true,
      mensaje: "Oferta 2x1 para planes VPN activada",
    });
  } catch (error) {
    console.error("Error activando 2x1:", error);
    return res.status(500).json({
      error: "Error al activar la oferta 2x1",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/config/desactivar-2x1
 * Desactiva la oferta 2x1 para planes VPN
 */
router.post("/desactivar-2x1", async (_req: Request, res: Response) => {
  try {
    await planesSupabaseService.desactivar2x1VPN();
    return res.status(200).json({
      success: true,
      mensaje: "Oferta 2x1 para planes VPN desactivada",
    });
  } catch (error) {
    console.error("Error desactivando 2x1:", error);
    return res.status(500).json({
      error: "Error al desactivar la oferta 2x1",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
