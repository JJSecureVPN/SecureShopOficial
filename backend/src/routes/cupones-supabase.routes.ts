import { Router, Request, Response } from "express";
import { cuponesSupabaseService } from "../services/cupones-supabase.service";
import { z } from "zod";

const router = Router();

// ============================================
// VALIDACIÓN DE CUPONES
// ============================================

/**
 * POST /api/cupones/validar
 * Valida un cupón para aplicarlo a una compra
 */
router.post("/validar", async (req: Request, res: Response) => {
  try {
    console.log("[Cupones] Validando cupón:", req.body);
    const schema = z.object({
      codigo: z.string().trim().min(1, "Código de cupón requerido"),
      planId: z.union([z.number(), z.string()]).optional(),
      precioPlan: z.union([z.number(), z.string()]).optional(),
      clienteEmail: z
        .union([z.string().trim().email(), z.literal("")])
        .optional(),
    });

    const parsed = schema.parse(req.body);

    const codigo = parsed.codigo.trim();
    const planId =
      parsed.planId !== undefined && parsed.planId !== ""
        ? Number(parsed.planId)
        : undefined;
    const precioPlan =
      parsed.precioPlan !== undefined && parsed.precioPlan !== ""
        ? Number(parsed.precioPlan)
        : undefined;
    const clienteEmail =
      parsed.clienteEmail && parsed.clienteEmail.trim().length > 0
        ? parsed.clienteEmail.trim()
        : undefined;

    if (planId !== undefined && Number.isNaN(planId)) {
      return res.status(400).json({ success: false, error: "planId inválido" });
    }

    if (precioPlan !== undefined && Number.isNaN(precioPlan)) {
      return res.status(400).json({ success: false, error: "precioPlan inválido" });
    }

    console.log("[Cupones] Parámetros validados:", {
      codigo,
      planId,
      precioPlan,
      clienteEmail,
    });

    const resultado = await cuponesSupabaseService.validarCupon(
      codigo,
      planId,
      clienteEmail
    );
    console.log("[Cupones] Resultado validación:", resultado);

    if (!resultado.valido) {
      return res.status(400).json({
        success: false,
        error: resultado.mensaje_error,
      });
    }

    // Calcular descuento si tenemos el precio del plan
    let descuento = 0;
    if (precioPlan && resultado.cupon) {
      descuento = cuponesSupabaseService.calcularDescuento(
        resultado.cupon,
        precioPlan
      );
    }

    return res.json({
      success: true,
      data: {
        cupon: resultado.cupon,
        tipo_descuento: resultado.tipo_descuento,
        descuento: descuento,
        precio_final: precioPlan ? precioPlan - descuento : undefined,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("[Cupones] Datos inválidos:", error.flatten().fieldErrors);
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
      });
    }

    console.error("Error validando cupón:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * POST /api/cupones/aplicar/:cuponId
 * Aplica un cupón (incrementa contador de usos)
 * Solo para uso interno después de una compra exitosa
 */
router.post("/aplicar/:cuponId", async (req: Request, res: Response) => {
  try {
    const cuponId = parseInt(req.params.cuponId);

    if (isNaN(cuponId)) {
      return res.status(400).json({
        success: false,
        error: "ID de cupón inválido",
      });
    }

    const { clienteEmail, pagoId, montoDescuento, precioOriginal, precioFinal } =
      req.body;

    await cuponesSupabaseService.aplicarCupon(
      cuponId,
      clienteEmail || "unknown@email.com",
      pagoId || null,
      montoDescuento || 0,
      precioOriginal || 0,
      precioFinal || 0
    );

    return res.json({
      success: true,
      message: "Cupón aplicado exitosamente",
    });
  } catch (error) {
    console.error("Error aplicando cupón:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

// ============================================
// GESTIÓN DE CUPONES (ADMIN)
// ============================================

/**
 * GET /api/cupones
 * Lista todos los cupones (para admin)
 */
router.get("/", async (_req: Request, res: Response) => {
  try {
    const cupones = await cuponesSupabaseService.listarCupones();

    return res.json({
      success: true,
      data: cupones,
    });
  } catch (error) {
    console.error("Error listando cupones:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * GET /api/cupones/listar
 * Lista todos los cupones activos (público - para mostrar en header)
 */
router.get("/listar", async (_req: Request, res: Response) => {
  try {
    const cupones = await cuponesSupabaseService.listarCuponesActivos();

    return res.json({
      success: true,
      data: cupones,
    });
  } catch (error) {
    console.error("Error listando cupones:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * GET /api/cupones/stats/resumen
 * Obtiene estadísticas de uso de cupones
 */
router.get("/stats/resumen", async (_req: Request, res: Response) => {
  try {
    const stats = await cuponesSupabaseService.obtenerEstadisticas();

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    console.error("Error obteniendo estadísticas:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * GET /api/cupones/:id
 * Obtiene un cupón por ID
 */
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID de cupón inválido",
      });
    }

    const cupon = await cuponesSupabaseService.obtenerCuponPorId(id);

    if (!cupon) {
      return res.status(404).json({
        success: false,
        error: "Cupón no encontrado",
      });
    }

    return res.json({
      success: true,
      data: cupon,
    });
  } catch (error) {
    console.error("Error obteniendo cupón:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * GET /api/cupones/:id/historial
 * Obtiene historial de uso de un cupón
 */
router.get("/:id/historial", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID de cupón inválido",
      });
    }

    const historial = await cuponesSupabaseService.obtenerHistorialUso(id);

    return res.json({
      success: true,
      data: historial,
    });
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * GET /api/cupones/:id/abuso
 * Detecta posible abuso de un cupón
 */
router.get("/:id/abuso", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID de cupón inválido",
      });
    }

    const cupon = await cuponesSupabaseService.obtenerCuponPorId(id);
    if (!cupon) {
      return res.status(404).json({
        success: false,
        error: "Cupón no encontrado",
      });
    }

    const abusadores = await cuponesSupabaseService.detectarAbusoCupon(id);

    return res.json({
      success: true,
      data: {
        cupon_codigo: cupon.codigo,
        total_usuarios_abusando: abusadores.length,
        abusadores: abusadores.map((a) => ({
          email: a.cliente_email,
          usos: a.usos,
          estado: a.usos > 1 ? "⚠️ ABUSO DETECTADO" : "OK",
        })),
      },
    });
  } catch (error) {
    console.error("Error detectando abuso:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * POST /api/cupones
 * Crea un nuevo cupón
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      codigo: z.string().min(1, "Código requerido").max(50, "Código demasiado largo"),
      tipo: z.enum(["porcentaje", "monto_fijo"], {
        errorMap: () => ({ message: 'Tipo debe ser "porcentaje" o "monto_fijo"' }),
      }),
      valor: z.number().positive("Valor debe ser positivo"),
      limite_uso: z.number().int().positive().optional(),
      fecha_expiracion: z.string().datetime().optional(),
      oculto: z.boolean().optional(),
      planes_aplicables: z.array(z.number()).optional(),
      activo: z.boolean().optional(),
    });

    const data = schema.parse(req.body);

    const cuponData = {
      ...data,
      fecha_expiracion: data.fecha_expiracion
        ? new Date(data.fecha_expiracion)
        : undefined,
    };

    const cupon = await cuponesSupabaseService.crearCupon(cuponData);

    return res.status(201).json({
      success: true,
      data: cupon,
      message: "Cupón creado exitosamente",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        details: error.errors,
      });
    }

    const message = error instanceof Error ? error.message : "Error desconocido";
    console.error("Error creando cupón:", error);
    return res.status(500).json({
      success: false,
      error: message.includes("ya existe") ? message : "Error interno del servidor",
    });
  }
});

/**
 * PUT /api/cupones/:id
 * Actualiza un cupón
 */
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID de cupón inválido",
      });
    }

    const schema = z.object({
      codigo: z.string().min(1).max(50).optional(),
      tipo: z.enum(["porcentaje", "monto_fijo"]).optional(),
      valor: z.number().positive().optional(),
      limite_uso: z.number().int().positive().optional(),
      fecha_expiracion: z.string().datetime().optional(),
      oculto: z.boolean().optional(),
      activo: z.boolean().optional(),
      planes_aplicables: z.array(z.number()).optional(),
    });

    const updates = schema.parse(req.body);

    const updateData = {
      ...updates,
      fecha_expiracion: updates.fecha_expiracion
        ? new Date(updates.fecha_expiracion)
        : undefined,
    };

    const cupon = await cuponesSupabaseService.actualizarCupon(id, updateData);

    if (!cupon) {
      return res.status(404).json({
        success: false,
        error: "Cupón no encontrado",
      });
    }

    return res.json({
      success: true,
      data: cupon,
      message: "Cupón actualizado exitosamente",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        error: "Datos inválidos",
        details: error.errors,
      });
    }

    console.error("Error actualizando cupón:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * DELETE /api/cupones/:id
 * Desactiva un cupón
 */
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID de cupón inválido",
      });
    }

    await cuponesSupabaseService.desactivarCupon(id);

    return res.json({
      success: true,
      message: "Cupón desactivado exitosamente",
    });
  } catch (error) {
    console.error("Error desactivando cupón:", error);
    return res.status(500).json({
      success: false,
      error: "Error interno del servidor",
    });
  }
});

/**
 * DELETE /api/cupones/:id/eliminar
 * Elimina permanentemente un cupón
 */
router.delete("/:id/eliminar", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);

    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        error: "ID de cupón inválido",
      });
    }

    await cuponesSupabaseService.eliminarCupon(id);

    return res.status(200).json({
      success: true,
      message: "Cupón eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error eliminando cupón:", error);
    return res.status(500).json({
      success: false,
      error: "Error al eliminar el cupón",
    });
  }
});

export default router;
