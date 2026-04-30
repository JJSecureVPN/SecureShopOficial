import express, { Request, Response } from 'express';
import { NoticiasService } from '../services/noticias.service';

export const noticiasRouter = express.Router();

// ============================================
// RUTAS ESPECÍFICAS (van PRIMERO - antes que genéricas)
// ============================================

/**
 * GET /api/noticias/categorias/todas
 * Obtiene todas las categorías activas
 */
noticiasRouter.get(
  '/categorias/todas',
  async (_req: Request, res: Response) => {
    try {
      const result = await NoticiasService.obtenerCategorias();

      if (result.error) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
      });
    } catch (error) {
      console.error('Error en GET /categorias/todas:', error);
      return res.status(500).json({
        success: false,
        error: 'Error obteniendo categorías',
      });
    }
  }
);

/**
 * POST /api/noticias/categorias
 * Crea una nueva categoría (solo admin)
 */
noticiasRouter.post(
  '/categorias',
  async (req: Request, res: Response) => {
    try {
      const { nombre, slug, descripcion, color, icono } = req.body;

      if (!nombre || !slug) {
        return res.status(400).json({
          success: false,
          error: 'Faltan campos requeridos: nombre, slug',
        });
      }

      const result = await NoticiasService.crearCategoria({
        nombre,
        slug: slug.toLowerCase(),
        descripcion,
        color: color || '#3B82F6',
        icono: icono || 'Bell',
        activo: true,
      });

      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.status(201).json({
        success: true,
        data: result.data,
        mensaje: 'Categoría creada exitosamente',
      });
    } catch (error) {
      console.error('Error en POST /categorias:', error);
      return res.status(500).json({
        success: false,
        error: 'Error creando categoría',
      });
    }
  }
);

// ============================================
// RUTAS ADMINISTRATIVAS (requieren autenticación)
// ============================================

/**
 * GET /api/noticias/admin
 * Obtiene todas las noticias (solo admin)
 */
noticiasRouter.get(
  '/admin',
  async (req: Request, res: Response) => {
    try {
      const { estado, page = '1', limit = '20' } = req.query;
      const pageNum = Math.max(1, parseInt(page as string) || 1);
      const limitNum = Math.min(100, parseInt(limit as string) || 20);

      const result = await NoticiasService.obtenerTodasNoticias(
        estado as string | undefined,
        pageNum,
        limitNum
      );

      if (result.error) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
        count: result.count,
      });
    } catch (error) {
      console.error('Error en GET /admin:', error);
      return res.status(500).json({
        success: false,
        error: 'Error obteniendo noticias',
      });
    }
  }
);
/**
 * POST /api/noticias/admin
 * Crea una nueva noticia (solo admin)
 */
noticiasRouter.post('/admin', async (req: Request, res: Response) => {
  try {
    const {
      titulo,
      descripcion,
      contenido_completo,
      categoria_id,
      imagen_url,
      imagen_alt,
      estado,
      visible_para,
      fecha_publicacion,
      fecha_expiracion,
      prioridad,
      destacada,
    } = req.body;

    if (!titulo || !descripcion || !categoria_id) {
      return res.status(400).json({
        success: false,
        error: 'Faltan campos requeridos: titulo, descripcion, categoria_id',
      });
    }

    const result = await NoticiasService.crearNoticia({
      titulo,
      descripcion,
      contenido_completo,
      categoria_id,
      imagen_url,
      imagen_alt,
      estado: estado || 'borrador',
      visible_para: visible_para || 'todos',
      fecha_publicacion,
      fecha_expiracion,
      prioridad: prioridad || 0,
      destacada: destacada || false,
      mostrar_desde: new Date().toISOString(),
    });

    if (result.error) {
      return res.status(400).json({
        success: false,
        error: result.error,
      });
    }

    return res.status(201).json({
      success: true,
      data: result.data,
      mensaje: 'Noticia creada exitosamente',
    });
  } catch (error) {
    console.error('Error en POST /admin:', error);
    return res.status(500).json({
      success: false,
      error: 'Error creando noticia',
    });
  }
});

/**
 * PUT /api/noticias/admin/:id
 * Actualiza una noticia (solo admin)
 */
noticiasRouter.put(
  '/admin/:id',
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updates = req.body;

      const result = await NoticiasService.actualizarNoticia(id, updates);

      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
        mensaje: 'Noticia actualizada exitosamente',
      });
    } catch (error) {
      console.error('Error en PUT /admin/:id:', error);
      return res.status(500).json({
        success: false,
        error: 'Error actualizando noticia',
      });
    }
  }
);

/**
 * DELETE /api/noticias/admin/:id
 * Elimina una noticia (solo admin)
 */
noticiasRouter.delete(
  '/admin/:id',
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;

      const result = await NoticiasService.eliminarNoticia(id);

      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.json({
        success: true,
        mensaje: 'Noticia eliminada exitosamente',
      });
    } catch (error) {
      console.error('Error en DELETE /admin/:id:', error);
      return res.status(500).json({
        success: false,
        error: 'Error eliminando noticia',
      });
    }
  }
);

/**
 * PATCH /api/noticias/admin/:id/estado
 * Cambia el estado de una noticia (solo admin)
 */
noticiasRouter.patch(
  '/admin/:id/estado',
  async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { estado } = req.body;

      if (!['borrador', 'publicada', 'archivada', 'pausada'].includes(estado)) {
        return res.status(400).json({
          success: false,
          error: 'Estado inválido',
        });
      }

      const result = await NoticiasService.cambiarEstado(
        id,
        estado as any
      );

      if (result.error) {
        return res.status(400).json({
          success: false,
          error: result.error,
        });
      }

      return res.json({
        success: true,
        data: result.data,
        mensaje: `Noticia marcada como ${estado}`,
      });
    } catch (error) {
      console.error('Error en PATCH /admin/:id/estado:', error);
      return res.status(500).json({
        success: false,
        error: 'Error cambiando estado',
      });
    }
  }
);

// ============================================
// RUTAS PÚBLICAS (van al FINAL - después de rutas específicas)
// ============================================

/**
 * GET /api/noticias/vpn
 * Obtiene noticias publicadas destinadas a la app VPN (visible_para = 'vpn')
 */
noticiasRouter.get('/vpn', async (req: Request, res: Response) => {
  try {
    const { categoria, page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, parseInt(limit as string) || 10);

    const result = await NoticiasService.obtenerNoticiasVPN(
      categoria as string | undefined,
      pageNum,
      limitNum
    );

    if (result.error) {
      return res.status(500).json({ success: false, error: result.error });
    }

    return res.json({ success: true, data: result.data, count: result.count });
  } catch (error) {
    console.error('Error en GET /vpn:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo noticias VPN' });
  }
});

/**
 * GET /api/noticias
 * Obtiene noticias publicadas (filtradas y paginadas)
 */
noticiasRouter.get('/', async (req: Request, res: Response) => {
  try {
    const { categoria, page = '1', limit = '10' } = req.query;
    const pageNum = Math.max(1, parseInt(page as string) || 1);
    const limitNum = Math.min(50, parseInt(limit as string) || 10);

    const result = await NoticiasService.obtenerNoticiasPublicas(
      categoria as string | undefined,
      pageNum,
      limitNum
    );

    if (result.error) {
      return res.status(500).json({
        success: false,
        error: result.error,
      });
    }

    return res.json({
      success: true,
      data: result.data,
      count: result.count,
    });
  } catch (error) {
    console.error('Error en GET /:', error);
    return res.status(500).json({
      success: false,
      error: 'Error obteniendo noticias',
    });
  }
});

/**
 * GET /api/noticias/:id/comentarios
 * Lista comentarios de una noticia pública
 */
noticiasRouter.get('/:id/comentarios', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { limit = '50' } = req.query;
    const limitNum = Math.min(100, Math.max(1, parseInt(limit as string) || 50));

    const result = await NoticiasService.obtenerComentariosPublicos(id, limitNum);

    if (result.error) {
      const status = result.error.toLowerCase().includes('deshabilitados') ? 403 : 500;
      return res.status(status).json({ success: false, error: result.error });
    }

    return res.json({ success: true, data: result.data || [] });
  } catch (error) {
    console.error('Error en GET /:id/comentarios:', error);
    return res.status(500).json({ success: false, error: 'Error obteniendo comentarios' });
  }
});

/**
 * POST /api/noticias/:id/comentarios
 * Crea un comentario para una noticia pública
 */
noticiasRouter.post('/:id/comentarios', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { nombre, email, contenido, user_id } = req.body || {};

    const result = await NoticiasService.crearComentarioPublico(id, {
      nombre,
      email,
      contenido,
      user_id,
    });

    if (result.error) {
      const lower = result.error.toLowerCase();
      const status = lower.includes('faltan campos') || lower.includes('demasiado') ? 400 : lower.includes('deshabilitados') ? 403 : 500;
      return res.status(status).json({ success: false, error: result.error });
    }

    return res.status(201).json({ success: true, data: result.data });
  } catch (error) {
    console.error('Error en POST /:id/comentarios:', error);
    return res.status(500).json({ success: false, error: 'Error creando comentario' });
  }
});

/**
 * GET /api/noticias/:id
 * Obtiene una noticia específica
 * IMPORTANTE: Esta ruta debe ir al FINAL para no capturar /admin ni /categorias
 */
noticiasRouter.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const result = await NoticiasService.obtenerNoticia(id);

    if (result.error || !result.data) {
      return res.status(404).json({
        success: false,
        error: 'Noticia no encontrada',
      });
    }

    await NoticiasService.incrementarVistas(id);

    return res.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Error en GET /:id:', error);
    return res.status(500).json({
      success: false,
      error: 'Error obteniendo noticia',
    });
  }
});

export default noticiasRouter;
