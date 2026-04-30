import { createClient } from '@supabase/supabase-js';

let supabase: any = null;

function getSupabaseClient() {
  if (!supabase) {
    const url = process.env.SUPABASE_URL;
    const key =
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY ||
      process.env.SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      throw new Error(
        'Supabase no está configurado: falta SUPABASE_URL y/o una key (SUPABASE_SERVICE_KEY / SUPABASE_SERVICE_ROLE_KEY / SUPABASE_KEY / SUPABASE_ANON_KEY)'
      );
    }
    
    supabase = createClient(url, key);
  }
  return supabase;
}

// Simple in-memory cache para acelerar endpoints públicos de noticias
const NOTICIAS_CACHE_TTL_MS = 20_000; // 20s
const noticiasCache = new Map<string, { expiresAt: number; data: any[]; count?: number }>();

type NoticiasInsert = any;
type NoticiasUpdate = any;

type NoticiaCategoriesRow = any;
type NoticiaCategoriesInsert = any;

// ============================================
// INTERFAZ DE RESPUESTA
// ============================================

export interface NoticiasResponse {
  data?: any[] | any | null;
  error?: string;
  count?: number;
}

export interface CrearNoticiaComentarioInput {
  nombre: string;
  email?: string;
  contenido: string;
  user_id?: string;
}

// ============================================
// SERVICIO DE NOTICIAS
// ============================================

export class NoticiasService {
  /**
   * Obtiene todas las noticias publicadas (para usuarios públicos)
   */
  static async obtenerNoticiasPublicas(
    categoria?: string,
    page = 1,
    limit = 10
  ): Promise<NoticiasResponse> {
    try {
      const cacheKey = `public:${categoria ?? 'all'}:p${page}:l${limit}`;
      const cached = noticiasCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        // Cache hit
        return { data: cached.data, count: cached.count };
      }

      const start = Date.now();

      // Usar la vista `noticias_activas` (más ligera que JOINs desde `noticias`)
      let query: any = getSupabaseClient().from('noticias_activas').select('*');

      if (categoria) {
        // la vista expone `categoria_slug`
        query = query.eq('categoria_slug', categoria);
      }

      query = query
        .order('destacada', { ascending: false })
        .order('prioridad', { ascending: false })
        .order('fecha_publicacion', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error } = await query; // evitamos `count: 'exact'` para reducir latencia
      const took = Date.now() - start;
      console.log(`[NoticiasService] obtenerNoticiasPublicas - query took ${took}ms (categoria=${categoria ?? 'all'})`);

      if (error) throw error;

      noticiasCache.set(cacheKey, { expiresAt: Date.now() + NOTICIAS_CACHE_TTL_MS, data });

      return { data, count: undefined };
    } catch (error) {
      console.error('Error obteniendo noticias públicas:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene noticias para la app VPN (visible_para = 'vpn')
   */
  static async obtenerNoticiasVPN(
    categoria?: string,
    page = 1,
    limit = 10
  ): Promise<NoticiasResponse> {
    try {
      const cacheKey = `vpn:${categoria ?? 'all'}:p${page}:l${limit}`;
      const cached = noticiasCache.get(cacheKey);
      if (cached && cached.expiresAt > Date.now()) {
        return { data: cached.data, count: cached.count };
      }

      const start = Date.now();

      // Usar la vista `noticias_vpn` (más eficiente que JOINs repetidos)
      let query: any = getSupabaseClient().from('noticias_vpn').select('*');

      if (categoria) {
        query = query.eq('categoria_slug', categoria);
      }

      query = query
        .order('destacada', { ascending: false })
        .order('prioridad', { ascending: false })
        .order('fecha_publicacion', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error } = await query; // evitamos count para ganar velocidad
      const took = Date.now() - start;
      console.log(`[NoticiasService] obtenerNoticiasVPN - query took ${took}ms (categoria=${categoria ?? 'all'})`);

      if (error) throw error;

      noticiasCache.set(cacheKey, { expiresAt: Date.now() + NOTICIAS_CACHE_TTL_MS, data });

      return { data, count: undefined };
    } catch (error) {
      console.error('Error obteniendo noticias VPN:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene una noticia específica por ID
   */
  static async obtenerNoticia(id: string): Promise<NoticiasResponse> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('noticias')
        .select(
          `*,
          categoria:noticia_categories(*),
          imagenes:noticia_imagenes(id, imagen_url, imagen_alt, orden),
          stats:noticia_stats(*)`,
          { count: 'exact' }
        )
        .eq('id', id)
        .eq('estado', 'publicada')
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error obteniendo noticia:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene todas las noticias (solo para admin)
   */
  static async obtenerTodasNoticias(
    estado?: string,
    page = 1,
    limit = 10
  ): Promise<NoticiasResponse> {
    try {
      let query = getSupabaseClient()
        .from('noticias')
        .select(
          `*,
          categoria:noticia_categories(id, nombre, slug),
          stats:noticia_stats(vistas, clics)`,
          { count: 'exact' }
        );

      if (estado) {
        query = query.eq('estado', estado);
      }

      query = query
        .order('fecha_publicacion', { ascending: false })
        .range((page - 1) * limit, page * limit - 1);

      const { data, error, count } = await query;

      if (error) throw error;

      return { data, count: count ?? undefined };
    } catch (error) {
      console.error('Error obteniendo todas las noticias:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Crea una nueva noticia
   */
  static async crearNoticia(noticia: NoticiasInsert): Promise<NoticiasResponse> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('noticias')
        .insert([noticia])
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error creando noticia:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Actualiza una noticia
   */
  static async actualizarNoticia(
    id: string,
    noticia: NoticiasUpdate
  ): Promise<NoticiasResponse> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('noticias')
        .update(noticia)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error actualizando noticia:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Elimina una noticia
   */
  static async eliminarNoticia(id: string): Promise<NoticiasResponse> {
    try {
      const { error } = await getSupabaseClient()
        .from('noticias')
        .delete()
        .eq('id', id);

      if (error) throw error;

      return { data: null };
    } catch (error) {
      console.error('Error eliminando noticia:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Cambia el estado de una noticia
   */
  static async cambiarEstado(
    id: string,
    nuevoEstado: 'borrador' | 'publicada' | 'archivada' | 'pausada'
  ): Promise<NoticiasResponse> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('noticias')
        .update({ estado: nuevoEstado })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error cambiando estado de noticia:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Obtiene las categorías
   */
  static async obtenerCategorias(): Promise<{
    data?: NoticiaCategoriesRow[] | null;
    error?: string;
  }> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('noticia_categories')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true });

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error obteniendo categorías:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Crea una categoría
   */
  static async crearCategoria(
    categoria: NoticiaCategoriesInsert
  ): Promise<{
    data?: NoticiaCategoriesRow | null;
    error?: string;
  }> {
    try {
      const { data, error } = await getSupabaseClient()
        .from('noticia_categories')
        .insert([categoria])
        .select()
        .single();

      if (error) throw error;

      return { data };
    } catch (error) {
      console.error('Error creando categoría:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Incrementa las vistas de una noticia
   */
  static async incrementarVistas(noticiaId: string): Promise<void> {
    try {
      // Obtener las estadísticas actuales
      const { data: stats, error: getError } = await getSupabaseClient()
        .from('noticia_stats')
        .select('*')
        .eq('noticia_id', noticiaId)
        .single();

      if (getError && getError.code !== 'PGRST116') throw getError;

      if (stats) {
        // Actualizar
        await getSupabaseClient()
          .from('noticia_stats')
          .update({ vistas: (stats.vistas || 0) + 1 })
          .eq('noticia_id', noticiaId);
      } else {
        // Crear
        await getSupabaseClient().from('noticia_stats').insert([
          {
            noticia_id: noticiaId,
            vistas: 1,
          },
        ]);
      }
    } catch (error) {
      console.error('Error incrementando vistas:', error);
    }
  }

  /**
   * Lista comentarios públicos de una noticia (solo si es pública y con comentarios habilitados)
   */
  static async obtenerComentariosPublicos(
    noticiaId: string,
    limit = 50
  ): Promise<NoticiasResponse> {
    try {
      const { data: noticia, error: noticiaError } = await getSupabaseClient()
        .from('noticias')
        .select('id, allow_comentarios')
        .eq('id', noticiaId)
        .eq('estado', 'publicada')
        .eq('visible_para', 'todos')
        .single();

      if (noticiaError) throw noticiaError;
      if (!noticia?.allow_comentarios) {
        return { error: 'Comentarios deshabilitados para esta noticia' };
      }

      const { data, error } = await getSupabaseClient()
        .from('noticia_comentarios')
        .select('*')
        .eq('noticia_id', noticiaId)
        .eq('aprobado', true)
        .order('created_at', { ascending: false })
        .limit(Math.min(100, Math.max(1, limit)));

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error obteniendo comentarios:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }

  /**
   * Crea un comentario público para una noticia (solo si es pública y con comentarios habilitados)
   */
  static async crearComentarioPublico(
    noticiaId: string,
    input: CrearNoticiaComentarioInput
  ): Promise<NoticiasResponse> {
    try {
      const nombre = (input.nombre || '').trim();
      const contenido = (input.contenido || '').trim();
      const email = (input.email || '').trim();

      if (!nombre || !contenido) {
        return { error: 'Faltan campos requeridos: nombre, contenido' };
      }

      if (nombre.length > 80) {
        return { error: 'El nombre es demasiado largo' };
      }
      if (contenido.length > 2000) {
        return { error: 'El comentario es demasiado largo' };
      }

      const { data: noticia, error: noticiaError } = await getSupabaseClient()
        .from('noticias')
        .select('id, allow_comentarios')
        .eq('id', noticiaId)
        .eq('estado', 'publicada')
        .eq('visible_para', 'todos')
        .single();

      if (noticiaError) throw noticiaError;
      if (!noticia?.allow_comentarios) {
        return { error: 'Comentarios deshabilitados para esta noticia' };
      }

      const payload: any = {
        noticia_id: noticiaId,
        nombre,
        contenido,
        aprobado: true,
      };
      if (email) payload.email = email;
      if (input.user_id) payload.user_id = input.user_id;

      const { data, error } = await getSupabaseClient()
        .from('noticia_comentarios')
        .insert([payload])
        .select('*')
        .single();

      if (error) throw error;
      return { data };
    } catch (error) {
      console.error('Error creando comentario:', error);
      return {
        error: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  }
}
