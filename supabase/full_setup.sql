-- ============================================
-- SETUP COMPLETO DE SUPABASE - SECURESHOP VPN
-- ============================================
-- Ejecuta este archivo completo en el SQL Editor de Supabase
-- URL: https://supabase.com/dashboard/project/yvxtlepjcpogiqgrzlpx/sql/new
-- ============================================

-- ============================================
-- 1. TABLA DE PERFILES DE USUARIO
-- ============================================

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT,
  telefono TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- 2. TABLA DE HISTORIAL DE COMPRAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('plan', 'renovacion', 'revendedor')),
  plan_nombre TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'aprobado',
  servex_username TEXT,
  servex_password TEXT,
  servex_expiracion TIMESTAMPTZ,
  servex_connection_limit INTEGER,
  mp_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON public.purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_created_at ON public.purchase_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_history_mp_payment_id ON public.purchase_history(mp_payment_id);

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Profiles RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Purchase History RLS
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" 
  ON public.purchase_history FOR SELECT 
  USING (auth.uid() = user_id);

-- ============================================
-- 4. FUNCIONES Y TRIGGERS
-- ============================================

-- Crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, nombre)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nombre', NEW.raw_user_meta_data->>'name', '')
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- ✅ SETUP COMPLETO
-- ============================================
-- Ahora configura en Supabase Dashboard:
-- 1. Authentication > URL Configuration > Site URL: https://shop.jhservices.com.ar
-- 2. Agregar Redirect URLs:
--    - https://shop.jhservices.com.ar
--    - https://shop.jhservices.com.ar/perfil
