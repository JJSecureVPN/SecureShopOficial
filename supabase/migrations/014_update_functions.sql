-- ============================================
-- ACTUALIZACIÓN: Funciones para contar usuarios activos
-- Se debe ejecutar en Supabase SQL Editor
-- ============================================

-- Actualizar función de estadísticas para contar sesiones cuando user_id es NULL
CREATE OR REPLACE FUNCTION public.update_active_users_stats()
RETURNS void AS $$
BEGIN
  UPDATE public.active_users_stats
  SET 
    total_active_users = (
      SELECT GREATEST(
        COUNT(DISTINCT user_id) FILTER (WHERE user_id IS NOT NULL),
        COUNT(*) FILTER (WHERE user_id IS NULL)
      )
      FROM public.active_sessions 
      WHERE last_activity > NOW() - INTERVAL '5 minutes'
    ),
    total_sessions = (
      SELECT COUNT(*) 
      FROM public.active_sessions 
      WHERE last_activity > NOW() - INTERVAL '5 minutes'
    ),
    updated_at = NOW()
  WHERE id = 1;
END;
$$ LANGUAGE plpgsql;

-- Actualizar función para obtener usuarios activos
CREATE OR REPLACE FUNCTION public.get_active_users_count()
RETURNS TABLE (
  total_users INTEGER,
  total_sessions INTEGER,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    GREATEST(
      (SELECT COUNT(DISTINCT user_id) FROM public.active_sessions 
       WHERE last_activity > NOW() - INTERVAL '5 minutes' AND user_id IS NOT NULL)::INTEGER,
      (SELECT COUNT(*) FROM public.active_sessions 
       WHERE last_activity > NOW() - INTERVAL '5 minutes' AND user_id IS NULL)::INTEGER
    ),
    (SELECT COUNT(*) FROM public.active_sessions 
     WHERE last_activity > NOW() - INTERVAL '5 minutes')::INTEGER,
    NOW();
END;
$$ LANGUAGE plpgsql;

-- Actualizar vista de usuarios activos
CREATE OR REPLACE VIEW public.active_users_view AS
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
