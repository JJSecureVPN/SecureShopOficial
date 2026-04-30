-- ============================================
-- SISTEMA DE NOTICIAS - SUPABASE MIGRATION
-- ============================================
-- Ejecuta este archivo en el SQL Editor de Supabase

-- ============================================
-- 1. TABLA DE CATEGORÍAS DE NOTICIAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.noticia_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  color TEXT DEFAULT '#3B82F6',
  icono TEXT DEFAULT 'Bell',
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_noticia_categories_slug ON public.noticia_categories(slug);
CREATE INDEX IF NOT EXISTS idx_noticia_categories_activo ON public.noticia_categories(activo);

-- ============================================
-- 2. TABLA PRINCIPAL DE NOTICIAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.noticias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  contenido_completo TEXT,
  categoria_id UUID NOT NULL REFERENCES public.noticia_categories(id) ON DELETE RESTRICT,
  
  -- Imagen
  imagen_url TEXT,
  imagen_alt TEXT,
  
  -- Estado y visibilidad
  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicada', 'archivada', 'pausada')),
  visible_para TEXT NOT NULL DEFAULT 'todos' CHECK (visible_para IN ('todos', 'clientes', 'admin')),
  
  -- Fechas de publicación
  fecha_publicacion TIMESTAMPTZ,
  fecha_expiracion TIMESTAMPTZ,
  mostrar_desde TIMESTAMPTZ DEFAULT NOW(),
  mostrar_hasta TIMESTAMPTZ,
  
  -- Prioridad
  prioridad INTEGER DEFAULT 0,
  destacada BOOLEAN DEFAULT false,
  
  -- Interacción
  allow_comentarios BOOLEAN DEFAULT false,
  
  -- Auditoría
  creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actualizado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_noticias_categoria ON public.noticias(categoria_id);
CREATE INDEX IF NOT EXISTS idx_noticias_estado ON public.noticias(estado);
CREATE INDEX IF NOT EXISTS idx_noticias_visible_para ON public.noticias(visible_para);
CREATE INDEX IF NOT EXISTS idx_noticias_fecha_publicacion ON public.noticias(fecha_publicacion DESC);
CREATE INDEX IF NOT EXISTS idx_noticias_destacada ON public.noticias(destacada);
CREATE INDEX IF NOT EXISTS idx_noticias_mostrar_desde ON public.noticias(mostrar_desde, mostrar_hasta);

-- ============================================
-- 3. TABLA DE IMÁGENES DE NOTICIAS (Galería)
-- ============================================

CREATE TABLE IF NOT EXISTS public.noticia_imagenes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  noticia_id UUID NOT NULL REFERENCES public.noticias(id) ON DELETE CASCADE,
  imagen_url TEXT NOT NULL,
  imagen_alt TEXT,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_noticia_imagenes_noticia_id ON public.noticia_imagenes(noticia_id);

-- ============================================
-- 4. TABLA DE ESTADÍSTICAS DE NOTICIAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.noticia_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  noticia_id UUID NOT NULL REFERENCES public.noticias(id) ON DELETE CASCADE UNIQUE,
  vistas INTEGER DEFAULT 0,
  clics INTEGER DEFAULT 0,
  compartidas INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_noticia_stats_noticia_id ON public.noticia_stats(noticia_id);

-- ============================================
-- 5. FUNCIÓN PARA ACTUALIZAR TIMESTAMP
-- ============================================

CREATE OR REPLACE FUNCTION update_noticia_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_noticia_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. TRIGGERS PARA TIMESTAMP
-- ============================================

DROP TRIGGER IF EXISTS trigger_noticias_updated_at ON public.noticias;
CREATE TRIGGER trigger_noticias_updated_at
BEFORE UPDATE ON public.noticias
FOR EACH ROW
EXECUTE FUNCTION update_noticia_updated_at();

DROP TRIGGER IF EXISTS trigger_noticia_categories_updated_at ON public.noticia_categories;
CREATE TRIGGER trigger_noticia_categories_updated_at
BEFORE UPDATE ON public.noticia_categories
FOR EACH ROW
EXECUTE FUNCTION update_noticia_categories_updated_at();

-- ============================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.noticia_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticias ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticia_imagenes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.noticia_stats ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS PARA noticia_categories
CREATE POLICY "noticia_categories_select_public"
ON public.noticia_categories FOR SELECT
USING (activo = true);

CREATE POLICY "noticia_categories_all_admin"
ON public.noticia_categories
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND email LIKE '%@admin%' OR email = 'admin@secureshop.vpn'
));

-- POLÍTICAS PARA noticias (Lectura)
CREATE POLICY "noticias_select_public"
ON public.noticias FOR SELECT
USING (
  estado = 'publicada' 
  AND visible_para = 'todos'
  AND (mostrar_desde IS NULL OR mostrar_desde <= NOW())
  AND (mostrar_hasta IS NULL OR mostrar_hasta > NOW())
);

CREATE POLICY "noticias_select_clientes"
ON public.noticias FOR SELECT
USING (
  estado = 'publicada'
  AND visible_para IN ('todos', 'clientes')
  AND (mostrar_desde IS NULL OR mostrar_desde <= NOW())
  AND (mostrar_hasta IS NULL OR mostrar_hasta > NOW())
);

-- POLÍTICAS PARA noticias (Escritura - Solo Admin)
CREATE POLICY "noticias_insert_admin"
ON public.noticias FOR INSERT
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND (email LIKE '%@admin%' OR email = 'admin@secureshop.vpn')
));

CREATE POLICY "noticias_update_admin"
ON public.noticias FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND (email LIKE '%@admin%' OR email = 'admin@secureshop.vpn')
))
WITH CHECK (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND (email LIKE '%@admin%' OR email = 'admin@secureshop.vpn')
));

CREATE POLICY "noticias_delete_admin"
ON public.noticias FOR DELETE
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND (email LIKE '%@admin%' OR email = 'admin@secureshop.vpn')
));

-- POLÍTICAS PARA noticia_imagenes
CREATE POLICY "noticia_imagenes_select_public"
ON public.noticia_imagenes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.noticias 
  WHERE id = noticia_imagenes.noticia_id 
  AND estado = 'publicada' 
  AND visible_para = 'todos'
));

CREATE POLICY "noticia_imagenes_all_admin"
ON public.noticia_imagenes
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND (email LIKE '%@admin%' OR email = 'admin@secureshop.vpn')
));

-- POLÍTICAS PARA noticia_stats
CREATE POLICY "noticia_stats_select_public"
ON public.noticia_stats FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.noticias 
  WHERE id = noticia_stats.noticia_id 
  AND estado = 'publicada'
));

-- ============================================
-- 8. CATEGORÍAS INICIALES
-- ============================================

INSERT INTO public.noticia_categories (nombre, slug, descripcion, color, icono, orden) VALUES
('Promociones', 'promociones', 'Ofertas y promociones especiales', '#F59E0B', 'Gift', 1),
('Noticias', 'noticias', 'Noticias importantes', '#3B82F6', 'Newspaper', 2),
('Avisos de la Comunidad', 'avisos-comunidad', 'Avisos y anuncios importantes', '#8B5CF6', 'AlertCircle', 3),
('Mantenimiento', 'mantenimiento', 'Avisos de mantenimiento', '#EF4444', 'Wrench', 4),
('Seguridad', 'seguridad', 'Alertas de seguridad', '#DC2626', 'Shield', 5)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 9. VISTA PARA NOTICIAS ACTIVAS
-- ============================================

CREATE OR REPLACE VIEW public.noticias_activas AS
SELECT 
  n.*,
  nc.nombre as categoria_nombre,
  nc.slug as categoria_slug,
  nc.color as categoria_color,
  nc.icono as categoria_icono,
  COALESCE(ns.vistas, 0) as total_vistas,
  COALESCE(ns.clics, 0) as total_clics,
  COALESCE(ns.compartidas, 0) as total_compartidas
FROM public.noticias n
LEFT JOIN public.noticia_categories nc ON n.categoria_id = nc.id
LEFT JOIN public.noticia_stats ns ON n.id = ns.noticia_id
WHERE n.estado = 'publicada'
  AND n.visible_para = 'todos'
  AND (n.mostrar_desde IS NULL OR n.mostrar_desde <= NOW())
  AND (n.mostrar_hasta IS NULL OR n.mostrar_hasta > NOW())
ORDER BY n.destacada DESC, n.prioridad DESC, n.fecha_publicacion DESC;

-- ============================================
-- PERMISOS DE LECTURA PARA LA VISTA
-- ============================================

ALTER VIEW public.noticias_activas OWNER TO postgres;
GRANT SELECT ON public.noticias_activas TO authenticated;
GRANT SELECT ON public.noticias_activas TO anon;
