-- ============================================
-- FIX AVATAR EN CHAT
-- Migración: 008_fix_chat_avatar
-- Fecha: 2024-12-17
-- Descripción: Obtener avatar desde auth.users cuando no está en profiles
-- ============================================

-- ============================================
-- 1. ACTUALIZAR FUNCIÓN handle_new_user PARA GUARDAR AVATAR
-- ============================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', '')
  );
  RETURN NEW;
END;
$$;

-- ============================================
-- 2. ACTUALIZAR PERFILES EXISTENTES CON SU AVATAR
-- ============================================

UPDATE public.profiles p
SET avatar_url = COALESCE(
  u.raw_user_meta_data->>'avatar_url',
  u.raw_user_meta_data->>'picture',
  p.avatar_url
)
FROM auth.users u
WHERE p.id = u.id
  AND (p.avatar_url IS NULL OR p.avatar_url = '');

-- ============================================
-- 3. ACTUALIZAR VISTA PARA FALLBACK A AUTH.USERS
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
  COALESCE(
    NULLIF(p.avatar_url, ''),
    u.raw_user_meta_data->>'avatar_url',
    u.raw_user_meta_data->>'picture'
  ) as user_avatar,
  EXISTS (SELECT 1 FROM public.chat_admins WHERE user_id = m.user_id) as is_admin
FROM public.chat_messages m
JOIN public.profiles p ON p.id = m.user_id
JOIN auth.users u ON u.id = m.user_id
WHERE m.is_deleted = false;

-- Permitir acceso a la vista
GRANT SELECT ON public.chat_messages_with_user TO authenticated;
GRANT SELECT ON public.chat_messages_with_user TO anon;
