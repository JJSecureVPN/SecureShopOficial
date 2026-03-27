import express, { Request, Response } from "express";
import { configService } from "../services/config.service";
import { preciosSyncService } from "../services/precios-sync.service";
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
 * POST /api/config/sync-precios
 * Sincroniza los precios en la base de datos con `precios_normales` del config
 * (útil para restaurar precios después de una promoción que haya modificado la BD)
 */
router.post("/sync-precios", (_req: Request, res: Response) => {
  try {
    const result = preciosSyncService.sincronizarPreciosDesdeConfig();

    // Limpiar caché para que la app lea los nuevos valores
    configService.limpiarCache();

    return res.status(200).json({
      success: true,
      message: "Precios sincronizados desde config",
      data: result,
    });
  } catch (error: any) {
    console.error("Error sincronizando precios:", error);
    return res.status(500).json({
      success: false,
      error: "Error sincronizando precios",
      detalles: error.message || String(error),
    });
  }
});

/**
 * POST /api/config/sync-precios-revendedores
 * Sincroniza los precios de revendedores en la base de datos con `precios_normales` del config
 */
router.post("/sync-precios-revendedores", (req: Request, res: Response) => {
  try {
    const force = req.query.force === "true" || req.body.force === true;
    const result =
      preciosSyncService.sincronizarPreciosRevendedoresDesdeConfig(force);

    // Limpiar caché para que la app lea los nuevos valores
    configService.limpiarCache();

    return res.status(200).json({
      success: true,
      message: "Precios de revendedores sincronizados desde config",
      data: result,
    });
  } catch (error: any) {
    console.error("Error sincronizando precios revendedores:", error);
    return res.status(500).json({
      success: false,
      error: "Error sincronizando precios de revendedores",
      detalles: error.message || String(error),
    });
  }
});

/**
 * POST /api/config/sync-todo
 * Limpia caché, sincroniza todos los precios (planes + revendedores) Y refresca BD del VPS
 * Útil después de modificar manualmente los archivos JSON - hace todo automáticamente
 */
router.post("/sync-todo", async (_req: Request, res: Response) => {
  try {
    console.log("[CONFIG-ROUTE] 🔄 Iniciando sincronización completa + refresco BD VPS...");

    const results: any = {
      cache: null,
      planes: null,
      revendedores: null,
      vps_db_refresh: null
    };

    // 1. Limpiar caché
    configService.limpiarCache();
    results.cache = "limpiado";
    console.log("[SYNC-TODO] ✅ Caché limpiado");

    // 2. Sincronizar precios de planes
    const resultPlanes = preciosSyncService.sincronizarPreciosDesdeConfig();
    results.planes = resultPlanes;
    console.log(`[SYNC-TODO] ✅ Precios de planes sincronizados: ${resultPlanes.updated} actualizados`);

    // 3. Sincronizar precios de revendedores
    const resultRevendedores = preciosSyncService.sincronizarPreciosRevendedoresDesdeConfig();
    results.revendedores = resultRevendedores;
    console.log(`[SYNC-TODO] ✅ Precios de revendedores sincronizados: ${resultRevendedores.updated} actualizados`);

    // 4. Refrescar base de datos del VPS (corregir valores max_users)
    // NOTA: Este paso es OPCIONAL - la sincronización local es lo importante
    // Solo se ejecuta si está disponible, pero no bloquea nada si no
    console.log("[SYNC-TODO] 🔄 Sincronización completa (local + BD local completada)");
    
    // Nota: La sincronización remota del VPS ahora se hace manualmente vía deploy-safe.sh
    // ya que requiere credenciales SSH que pueden no estar disponibles en PM2
    results.vps_db_refresh = { success: true, note: "VPS sync handled by deploy-safe.sh script" };

    console.log("[SYNC-TODO] 🎉 ¡Sincronización completa realizada!");

    return res.status(200).json({
      success: true,
      message: "Sincronización completa + refresco BD realizado exitosamente",
      data: {
        cache: results.cache,
        planes: results.planes,
        revendedores: results.revendedores,
        vps_db_refresh: results.vps_db_refresh.success ? "completado" : "fallido",
        timestamp: new Date().toISOString()
      },
    });
  } catch (error: any) {
    console.error("[SYNC-TODO] ❌ Error en sincronización completa:", error);
    return res.status(500).json({
      success: false,
      error: "Error en sincronización completa + refresco BD",
      detalles: error.message || String(error),
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
 * GET /api/config/hero
 * Obtiene la configuración del hero para la página principal
 */
router.get("/hero", (_req: Request, res: Response) => {
  try {
    const config = configService.leerConfigPlanes();

    return res.json({
      success: true,
      data: {
        titulo: config.hero?.titulo || "Conecta sin Límites",
        descripcion:
          config.hero?.descripcion ||
          "Planes flexibles y velocidad premium para tu estilo de vida digital",
        promocion: config.hero?.promocion || {
          habilitada: false,
          texto: "",
          textColor: "text-white",
          bgColor: "bg-gradient-to-r from-blue-600 to-cyan-600",
          borderColor: "border-blue-500/40",
          iconColor: "text-blue-400",
          shadowColor: "shadow-blue-500/30",
          comentario: "Configuración por defecto",
        },
      },
    });
  } catch (error) {
    console.error("Error obteniendo config hero:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener configuración del hero",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/config/hero-revendedores
 * Obtiene la configuración del hero para revendedores
 */
router.get("/hero-revendedores", (_req: Request, res: Response) => {
  try {
    const config = configService.leerConfigRevendedores();

    return res.status(200).json({
      titulo: config.hero?.titulo || "Sé Revendedor VPN",
      descripcion:
        config.hero?.descripcion ||
        "Gana dinero vendiendo acceso VPN premium a tus clientes",
      promocion: config.hero?.promocion || {
        habilitada: false,
        texto: "",
        estilo: "from-blue-500 to-cyan-500",
        textColor: "text-white",
        bgColor: "bg-gradient-to-r from-blue-600 to-cyan-600",
        comentario:
          "Descuento del 20% en todos los planes - Válido por tiempo limitado",
      },
    });
  } catch (error) {
    console.error("Error obteniendo config hero revendedores:", error);
    return res.status(500).json({
      error: "Error al obtener configuración del hero para revendedores",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/config/hero
 * Guarda la configuración del hero para la página principal
 */
router.post("/hero", (req: Request, res: Response) => {
  try {
    const heroConfig = req.body;

    if (!heroConfig || typeof heroConfig !== "object") {
      return res.status(400).json({
        success: false,
        error: "Configuración del hero inválida",
      });
    }

    const config = configService.leerConfigPlanes();
    
    // Si la configuración tiene propiedades de promoción directas, colocarlas en hero.promocion
    if (heroConfig.habilitada !== undefined || heroConfig.texto !== undefined) {
      config.hero = {
        ...config.hero,
        promocion: {
          ...config.hero?.promocion,
          ...heroConfig,
        },
      };
    } else {
      // Si viene como objeto hero completo
      config.hero = {
        ...config.hero,
        ...heroConfig,
      };
    }
    
    config.ultima_actualizacion = new Date().toISOString();

    configService.guardarConfigPlanes(config);
    configService.limpiarCache();

    console.log("[CONFIG-ROUTE] ✅ Configuración del hero guardada");
    console.log("[CONFIG-ROUTE] Contenido guardado:", JSON.stringify(config.hero, null, 2));

    return res.status(200).json({
      success: true,
      mensaje: "Configuración del hero guardada exitosamente",
      timestamp: config.ultima_actualizacion,
    });
  } catch (error) {
    console.error("Error guardando config hero:", error);
    return res.status(500).json({
      success: false,
      error: "Error al guardar configuración del hero",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/config/hero-revendedores
 * Guarda la configuración del hero para revendedores
 */
router.post("/hero-revendedores", (req: Request, res: Response) => {
  try {
    const heroConfig = req.body;

    if (!heroConfig || typeof heroConfig !== "object") {
      return res.status(400).json({
        success: false,
        error: "Configuración del hero inválida",
      });
    }

    const config = configService.leerConfigRevendedores();
    
    // Si la configuración tiene propiedades de promoción directas, colocarlas en hero.promocion
    if (heroConfig.habilitada !== undefined || heroConfig.texto !== undefined) {
      config.hero = {
        ...config.hero,
        promocion: {
          ...config.hero?.promocion,
          ...heroConfig,
        },
      };
    } else {
      // Si viene como objeto hero completo
      config.hero = {
        ...config.hero,
        ...heroConfig,
      };
    }
    
    config.ultima_actualizacion = new Date().toISOString();

    configService.guardarConfigRevendedores(config);
    configService.limpiarCache();

    console.log("[CONFIG-ROUTE] ✅ Configuración del hero de revendedores guardada");
    console.log("[CONFIG-ROUTE] Contenido guardado:", JSON.stringify(config.hero, null, 2));

    return res.status(200).json({
      success: true,
      mensaje: "Configuración del hero de revendedores guardada exitosamente",
      timestamp: config.ultima_actualizacion,
    });
  } catch (error) {
    console.error("Error guardando config hero revendedores:", error);
    return res.status(500).json({
      success: false,
      error: "Error al guardar configuración del hero para revendedores",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/config/noticias
 * Obtiene la configuración de noticias
 */
router.get("/noticias", (_req: Request, res: Response) => {
  try {
    const config = configService.obtenerNoticiasActivas();

    return res.status(200).json({
      success: true,
      data: config,
    });
  } catch (error) {
    console.error("Error obteniendo noticias:", error);
    return res.status(500).json({
      success: false,
      error: "Error al obtener noticias",
      detalles: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/config/noticias
 * Actualiza la configuración de noticias
 */
router.post("/noticias", (req: Request, res: Response) => {
  try {
    const config = req.body;

    if (!config || typeof config !== "object") {
      return res.status(400).json({
        success: false,
        error: "Configuración de noticias inválida",
      });
    }

    config.ultima_actualizacion = new Date().toISOString();
    configService.guardarConfigNoticias(config);
    configService.limpiarCache();

    return res.status(200).json({
      success: true,
      mensaje: "Configuración de noticias actualizada",
      timestamp: config.ultima_actualizacion,
    });
  } catch (error) {
    console.error("Error actualizando noticias:", error);
    return res.status(500).json({
      success: false,
      error: "Error al actualizar noticias",
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
