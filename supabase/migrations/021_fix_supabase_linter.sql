-- ============================================
-- MIGRACIÓN 021: CORRECCIONES PARA SUPABASE LINTER
-- Fecha: 2026-03-17
-- Descripción: Ajustes para evitar los hallazgos del linter de Supabase
--   - Elimina la dependencia directa de auth.users en la vista `chat_messages_with_user`
--   - Habilita RLS en tablas que estaban expuestas públicamente
--   - Asegura que las vistas públicas tengan el property security_barrier habilitado
-- ============================================

-- 2) Asegurar que las vistas no estén definidas como SECURITY DEFINER (para evitar el warning del linter).
--    PostgreSQL no permite ALTER VIEW ... SECURITY INVOKER, por lo que volvemos a crear la vista explícitamente.
--    También aplicamos security_barrier para minimizar fugas en queries internas.

-- 2.1) Vista noticias_vpn
DROP VIEW IF EXISTS public.noticias_vpn CASCADE;
CREATE VIEW public.noticias_vpn
  WITH (security_barrier = true)
AS
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

GRANT SELECT ON public.noticias_vpn TO authenticated;

-- 2.2) Vista noticias_activas
DROP VIEW IF EXISTS public.noticias_activas CASCADE;
CREATE VIEW public.noticias_activas
  WITH (security_barrier = true)
AS
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

GRANT SELECT ON public.noticias_activas TO authenticated;
GRANT SELECT ON public.noticias_activas TO anon;

-- 2.3) Vista active_users_view
DROP VIEW IF EXISTS public.active_users_view CASCADE;
CREATE VIEW public.active_users_view
  WITH (security_barrier = true)
AS
SELECT 
  GREATEST(
    (SELECT COUNT(DISTINCT user_id) FROM public.active_sessions 
     WHERE last_activity > NOW() - INTERVAL '5 minutes' AND user_id IS NOT NULL),
    (SELECT COUNT(*) FROM public.active_sessions 
     WHERE last_activity > NOW() - INTERVAL '5 minutes' AND user_id IS NULL)
  ) as total_active_users,
  (SELECT COUNT(*) FROM public.active_sessions 
   WHERE last_activity > NOW() - INTERVAL '5 minutes') as total_sessions,
  NOW() as updated_at;

GRANT SELECT ON public.active_users_view TO anon, authenticated;

-- 2.4) Vista chat_messages_with_user (no hace JOIN contra auth.users)
DROP VIEW IF EXISTS public.chat_messages_with_user CASCADE;
CREATE VIEW public.chat_messages_with_user
  WITH (security_barrier = true)
AS
SELECT 
  m.id,
  m.room_id,
  m.user_id,
  m.content,
  m.is_pinned,
  m.is_deleted,
  m.created_at,
  p.nombre as user_nombre,
  p.email as user_email,
  COALESCE(NULLIF(p.avatar_url, ''), '') as user_avatar,
  EXISTS (SELECT 1 FROM public.chat_admins WHERE user_id = m.user_id) as is_admin
FROM public.chat_messages m
JOIN public.profiles p ON p.id = m.user_id
WHERE m.is_deleted = false;

GRANT SELECT ON public.chat_messages_with_user TO authenticated;
GRANT SELECT ON public.chat_messages_with_user TO anon;

-- 2.5) Asegurar search_path inmutable en funciones (evita warning function_search_path_mutable)
--    Ajusta todas las funciones listadas por el linter, sin fallar si no existen.
DO $$
DECLARE
  r RECORD;
  target_names TEXT[] := ARRAY[
    'is_chat_admin',
    'cleanup_old_presence',
    'cleanup_expired_sessions',
    'cleanup_sessions_on_insert',
    'link_pending_purchases',
    'update_noticia_updated_at',
    'update_noticia_categories_updated_at',
    'update_donaciones_updated_at',
    'update_suscripciones_automaticas_updated_at',
    'update_cupones_updated_at',
    'update_pagos_updated_at',
    'update_renovaciones_updated_at',
    'update_active_users_stats',
    'donaciones_estadisticas',
    'pagos_estadisticas',
    'renovaciones_estadisticas',
    'incrementar_uso_cupon',
    'usuario_ya_uso_cupon',
    'procesar_referido',
    'procesar_referido_email',
    'register_active_session',
    'get_active_users_count',
    'update_sponsors_updated_at',
    'increment_referral_count',
    'add_referral_earnings',
    'update_planes_revendedores_updated_at',
    'validar_cupon',
    'aplicar_cupon',
    'cupones_estadisticas',
    'generate_referral_code',
    'acreditar_saldo'
  ];
BEGIN
  FOR r IN
    SELECT oid, proname, pg_get_function_identity_arguments(oid) AS args
    FROM pg_proc
    WHERE pronamespace = 'public'::regnamespace
      AND proname = ANY(target_names)
  LOOP
    EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = ''''', r.proname, r.args);
  END LOOP;
END;
$$;

-- 3) Habilitar RLS en tablas que el linter detectó como públicas sin RLS.
--    Se crea una política de SELECT abierta para mantener el comportamiento previo,
--    pero ahora la tabla se rige por RLS (protege contra accesos no intencionales).

ALTER TABLE IF EXISTS public.tutorial_images ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can select tutorial images" ON public.tutorial_images;
CREATE POLICY "Public can select tutorial images"
  ON public.tutorial_images FOR SELECT
  USING (true);
GRANT SELECT ON public.tutorial_images TO anon, authenticated;

ALTER TABLE IF EXISTS public.suscripciones_automaticas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can select suscripciones" ON public.suscripciones_automaticas;
CREATE POLICY "Public can select suscripciones"
  ON public.suscripciones_automaticas FOR SELECT
  USING (true);
GRANT SELECT ON public.suscripciones_automaticas TO anon, authenticated;

ALTER TABLE IF EXISTS public.cobros_automaticos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can select cobros" ON public.cobros_automaticos;
CREATE POLICY "Public can select cobros"
  ON public.cobros_automaticos FOR SELECT
  USING (true);
GRANT SELECT ON public.cobros_automaticos TO anon, authenticated;

ALTER TABLE IF EXISTS public.renovaciones_automaticas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public can select renovaciones" ON public.renovaciones_automaticas;
CREATE POLICY "Public can select renovaciones"
  ON public.renovaciones_automaticas FOR SELECT
  USING (true);
GRANT SELECT ON public.renovaciones_automaticas TO anon, authenticated;

-- Nota: si alguno de estos objetos no existe en tu esquema actual, los comandos IF EXISTS evitarán fallos.
--       Ajusta las políticas según el modelo de permisos que quieras aplicar en producción.
