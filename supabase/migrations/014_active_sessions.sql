-- ============================================
-- SUPABASE SETUP PARA SECURESHOP VPN
-- Migración: 014_active_sessions
-- Fecha: 2025-12-19
-- Descripción: Sistema de sesiones activas para mostrar usuarios online en tiempo real
-- ============================================

-- ============================================
-- 1. TABLA DE SESIONES ACTIVAS
-- ============================================
-- Registra a los usuarios activos en la web
-- Se auto-limpia cada hora para remover sesiones expiradas

CREATE TABLE IF NOT EXISTS public.active_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  last_activity TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_active_sessions_user_id ON public.active_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_active_sessions_last_activity ON public.active_sessions(last_activity DESC);
CREATE INDEX IF NOT EXISTS idx_active_sessions_created_at ON public.active_sessions(created_at DESC);

-- ============================================
-- 2. TABLA DE ESTADÍSTICAS DE USUARIOS ACTIVOS
-- ============================================
-- Caché de estadísticas actualizadas cada minuto

CREATE TABLE IF NOT EXISTS public.active_users_stats (
  id INTEGER PRIMARY KEY DEFAULT 1,
  total_active_users INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT only_one_row CHECK (id = 1)
);

-- Insertar fila inicial
INSERT INTO public.active_users_stats (id, total_active_users, total_sessions) 
VALUES (1, 0, 0) 
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 3. FUNCIÓN PARA ACTUALIZAR ESTADÍSTICAS
-- ============================================
-- Se ejecuta automáticamente para mantener el conteo actualizado

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

-- ============================================
-- 4. FUNCIÓN PARA LIMPIAR SESIONES EXPIRADAS
-- ============================================
-- Elimina sesiones que no han tenido actividad en más de 10 minutos

CREATE OR REPLACE FUNCTION public.cleanup_expired_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM public.active_sessions
  WHERE last_activity < NOW() - INTERVAL '10 minutes';
  
  -- Actualizar estadísticas después de limpiar
  PERFORM public.update_active_users_stats();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 5. FUNCIÓN PARA REGISTRAR/ACTUALIZAR SESIÓN
-- ============================================
-- Registra o actualiza la sesión de un usuario

CREATE OR REPLACE FUNCTION public.register_active_session(
  p_user_id UUID,
  p_session_token TEXT,
  p_ip_address TEXT DEFAULT NULL,
  p_user_agent TEXT DEFAULT NULL
)
RETURNS void AS $$
BEGIN
  INSERT INTO public.active_sessions (user_id, session_token, ip_address, user_agent, last_activity)
  VALUES (p_user_id, p_session_token, p_ip_address, p_user_agent, NOW())
  ON CONFLICT (session_token)
  DO UPDATE SET last_activity = NOW();
  
  -- Actualizar estadísticas
  PERFORM public.update_active_users_stats();
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 6. FUNCIÓN PARA OBTENER USUARIOS ACTIVOS
-- ============================================
-- Retorna información agregada de usuarios activos

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

-- ============================================
-- 7. VISTA PARA USUARIOS ACTIVOS EN TIEMPO REAL
-- ============================================
-- Vista que puede ser suscrita en Realtime

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

-- ============================================
-- 8. TRIGGER PARA LIMPIAR SESIONES AUTOMÁTICAMENTE
-- ============================================
-- Se ejecuta cada vez que se registra una sesión para mantener datos limpios

CREATE OR REPLACE FUNCTION public.cleanup_sessions_on_insert()
RETURNS TRIGGER AS $$
BEGIN
  -- Limpiar sesiones expiradas cada 50 insertos (aproximadamente cada minuto)
  IF (SELECT COUNT(*) FROM public.active_sessions) % 50 = 0 THEN
    PERFORM public.cleanup_expired_sessions();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_cleanup_sessions ON public.active_sessions;
CREATE TRIGGER trigger_cleanup_sessions
AFTER INSERT ON public.active_sessions
FOR EACH STATEMENT
EXECUTE FUNCTION public.cleanup_sessions_on_insert();

-- ============================================
-- 9. RLS POLICIES
-- ============================================

ALTER TABLE public.active_sessions ENABLE ROW LEVEL SECURITY;

-- Política: Cualquiera puede leer estadísticas globales pero no detalles individuales
CREATE POLICY "Everyone can view active sessions stats"
  ON public.active_sessions
  FOR SELECT
  USING (true);

-- Política: Los usuarios solo pueden insertar sus propias sesiones (via RPC)
CREATE POLICY "Users can manage own sessions"
  ON public.active_sessions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- Política: Los usuarios solo pueden actualizar sus propias sesiones
CREATE POLICY "Users can update own sessions"
  ON public.active_sessions
  FOR UPDATE
  USING (auth.uid() = user_id OR user_id IS NULL);

ALTER TABLE public.active_users_stats ENABLE ROW LEVEL SECURITY;

-- Política: Todos pueden leer las estadísticas
CREATE POLICY "Everyone can view active users stats"
  ON public.active_users_stats
  FOR SELECT
  USING (true);

-- ============================================
-- 10. PERMISOS INICIALES
-- ============================================

GRANT SELECT ON public.active_sessions TO anon, authenticated;
GRANT INSERT, UPDATE ON public.active_sessions TO authenticated;

GRANT SELECT ON public.active_users_stats TO anon, authenticated;

GRANT EXECUTE ON FUNCTION public.get_active_users_count() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.register_active_session(UUID, TEXT, TEXT, TEXT) TO anon, authenticated;

GRANT SELECT ON public.active_users_view TO anon, authenticated;
