-- ============================================
-- MIGRACIÓN 007: SISTEMA DE CHAT EN VIVO
-- ============================================
-- Ejecutar en Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. TABLA DE ADMINISTRADORES DEL CHAT
-- ============================================

CREATE TABLE IF NOT EXISTS public.chat_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_admins_user_id ON public.chat_admins(user_id);

-- ============================================
-- 2. TABLA DE SALAS DE CHAT
-- ============================================

CREATE TABLE IF NOT EXISTS public.chat_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  descripcion TEXT,
  is_public BOOLEAN DEFAULT true NOT NULL,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insertar sala de soporte general por defecto
INSERT INTO public.chat_rooms (nombre, descripcion, is_public)
VALUES 
  ('Chat Global', 'Sala general para la comunidad. Comparte experiencias y conoce a otros usuarios.', true),
  ('Soporte Técnico', 'Problemas con la conexión, configuración o uso del servicio VPN.', true),
  ('Reventa', 'Canal exclusivo para revendedores. Dudas sobre paneles, créditos y gestión.', true),
  ('Sugerencias', 'Comparte tus ideas para mejorar el servicio. ¡Tu opinión importa!', true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. TABLA DE MENSAJES DEL CHAT
-- ============================================

CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN DEFAULT false NOT NULL,
  is_deleted BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_room_id ON public.chat_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON public.chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON public.chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_messages_room_created ON public.chat_messages(room_id, created_at DESC);

-- ============================================
-- 4. TABLA DE PRESENCIA (usuarios online)
-- ============================================

CREATE TABLE IF NOT EXISTS public.chat_presence (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES public.chat_rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  last_seen TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_chat_presence_room_id ON public.chat_presence(room_id);
CREATE INDEX IF NOT EXISTS idx_chat_presence_last_seen ON public.chat_presence(last_seen);

-- ============================================
-- 5. FUNCIÓN PARA VERIFICAR SI ES ADMIN
-- ============================================

CREATE OR REPLACE FUNCTION public.is_chat_admin(check_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.chat_admins WHERE user_id = check_user_id
  );
END;
$$;

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Chat Rooms RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view public chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (is_public = true AND is_active = true);

CREATE POLICY "Admins can manage chat rooms"
  ON public.chat_rooms FOR ALL
  USING (public.is_chat_admin(auth.uid()));

-- Chat Messages RLS
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view messages in public rooms"
  ON public.chat_messages FOR SELECT
  USING (
    is_deleted = false AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND is_public = true AND is_active = true
    )
  );

CREATE POLICY "Authenticated users can insert messages"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.chat_rooms 
      WHERE id = room_id AND is_public = true AND is_active = true
    )
  );

CREATE POLICY "Users can delete own messages"
  ON public.chat_messages FOR UPDATE
  USING (auth.uid() = user_id OR public.is_chat_admin(auth.uid()))
  WITH CHECK (auth.uid() = user_id OR public.is_chat_admin(auth.uid()));

CREATE POLICY "Admins can manage all messages"
  ON public.chat_messages FOR ALL
  USING (public.is_chat_admin(auth.uid()));

-- Chat Admins RLS
ALTER TABLE public.chat_admins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can check admin status"
  ON public.chat_admins FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage admins"
  ON public.chat_admins FOR ALL
  USING (public.is_chat_admin(auth.uid()));

-- Chat Presence RLS
ALTER TABLE public.chat_presence ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view presence"
  ON public.chat_presence FOR SELECT
  USING (true);

CREATE POLICY "Users can update own presence"
  ON public.chat_presence FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own presence record"
  ON public.chat_presence FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own presence"
  ON public.chat_presence FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- 7. FUNCIÓN PARA LIMPIAR PRESENCIA ANTIGUA
-- ============================================

CREATE OR REPLACE FUNCTION public.cleanup_old_presence()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM public.chat_presence
  WHERE last_seen < NOW() - INTERVAL '5 minutes';
END;
$$;

-- ============================================
-- 8. HABILITAR REALTIME PARA LAS TABLAS
-- ============================================

-- Agregar tablas a la publicación de realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_presence;

-- ============================================
-- 9. VISTA PARA MENSAJES CON INFO DE USUARIO
-- ============================================

CREATE OR REPLACE VIEW public.chat_messages_with_user AS
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
  p.avatar_url as user_avatar,
  EXISTS (SELECT 1 FROM public.chat_admins WHERE user_id = m.user_id) as is_admin
FROM public.chat_messages m
JOIN public.profiles p ON p.id = m.user_id
WHERE m.is_deleted = false;

-- Permitir acceso a la vista
GRANT SELECT ON public.chat_messages_with_user TO authenticated;
GRANT SELECT ON public.chat_messages_with_user TO anon;

-- ============================================
-- INSTRUCCIONES PARA AGREGAR ADMINS
-- ============================================
-- Para agregar un administrador del chat, ejecuta:
-- 
-- INSERT INTO public.chat_admins (user_id)
-- SELECT id FROM public.profiles WHERE email = 'admin@tudominio.com';
--
-- ============================================
