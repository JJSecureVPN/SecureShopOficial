-- ============================================
-- 019_add_noticias_vpn.sql
-- Añade soporte para noticias VPN (visible_para = 'vpn'), vista y políticas RLS
-- ============================================

-- 1) Actualiza la restricción visible_para para incluir 'vpn'
ALTER TABLE public.noticias
  DROP CONSTRAINT IF EXISTS noticias_visible_para_check;

ALTER TABLE public.noticias
  ADD CONSTRAINT noticias_visible_para_check CHECK (visible_para IN ('todos', 'clientes', 'admin', 'vpn'));

-- 2) Crea vista para noticias VPN (solo publicadas y visibles para vpn)
CREATE OR REPLACE VIEW public.noticias_vpn AS
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
  AND n.visible_para = 'vpn'
  AND (n.mostrar_desde IS NULL OR n.mostrar_desde <= NOW())
  AND (n.mostrar_hasta IS NULL OR n.mostrar_hasta > NOW())
ORDER BY n.destacada DESC, n.prioridad DESC, n.fecha_publicacion DESC;

ALTER VIEW public.noticias_vpn OWNER TO postgres;
GRANT SELECT ON public.noticias_vpn TO authenticated;

-- 3) Políticas RLS: permitir SELECT sobre noticias con visible_para = 'vpn'
DROP POLICY IF EXISTS "noticias_select_vpn" ON public.noticias;
CREATE POLICY "noticias_select_vpn"
ON public.noticias FOR SELECT
USING (
  estado = 'publicada'
  AND visible_para = 'vpn'
  AND (mostrar_desde IS NULL OR mostrar_desde <= NOW())
  AND (mostrar_hasta IS NULL OR mostrar_hasta > NOW())
);

-- 4) Permitir lectura de imagenes asociadas a noticias VPN
DROP POLICY IF EXISTS "noticia_imagenes_select_vpn" ON public.noticia_imagenes;
CREATE POLICY "noticia_imagenes_select_vpn"
ON public.noticia_imagenes FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.noticias 
  WHERE id = noticia_imagenes.noticia_id 
  AND estado = 'publicada'
  AND visible_para = 'vpn'
));

-- Nota: Este archivo debe ejecutarse en el SQL Editor de Supabase o aplicarse a través de su pipeline de migraciones.
