-- ============================================
-- SUPABASE SETUP PARA SECURESHOP VPN
-- ============================================
-- Ejecuta este SQL en el SQL Editor de Supabase:
-- https://supabase.com/dashboard/project/[tu-proyecto]/sql/new

-- ============================================
-- 1. TABLA DE PERFILES DE USUARIO
-- ============================================
-- Extiende la tabla auth.users con información adicional

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT,
  telefono TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- RLS (Row Level Security) - Los usuarios solo pueden ver/editar su propio perfil
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

-- Policy para que el service_role pueda insertar/actualizar (backend)
CREATE POLICY "Service role can manage profiles" 
  ON public.profiles FOR ALL 
  USING (auth.role() = 'service_role');

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

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON public.purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_created_at ON public.purchase_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_history_mp_payment_id ON public.purchase_history(mp_payment_id);

-- RLS - Los usuarios solo pueden ver sus propias compras
ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own purchases" 
  ON public.purchase_history FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy para que el service_role pueda insertar (backend cuando se aprueba un pago)
CREATE POLICY "Service role can manage purchases" 
  ON public.purchase_history FOR ALL 
  USING (auth.role() = 'service_role');

-- ============================================
-- 3. FUNCIÓN PARA CREAR PERFIL AUTOMÁTICAMENTE
-- ============================================
-- Crea un perfil cuando un usuario se registra

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

-- Trigger para ejecutar la función al crear usuario
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 4. FUNCIÓN PARA ACTUALIZAR updated_at
-- ============================================

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

-- Trigger para actualizar updated_at en profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 5. TABLA PARA REFERIDOS (OPCIONAL - FUTURO)
-- ============================================
-- Descomenta esto si quieres implementar sistema de referidos

/*
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  reward_claimed BOOLEAN DEFAULT FALSE,
  reward_amount DECIMAL(10,2),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" 
  ON public.referrals FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Service role can manage referrals" 
  ON public.referrals FOR ALL 
  USING (auth.role() = 'service_role');

-- Agregar código de referido al perfil
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);
*/

-- ============================================
-- LISTO! 🎉
-- ============================================
-- Ahora configura las variables de entorno:
-- 
-- Frontend (.env):
--   VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
--   VITE_SUPABASE_ANON_KEY=tu-anon-key
--
-- Backend (.env):
--   SUPABASE_URL=https://tu-proyecto.supabase.co
--   SUPABASE_SERVICE_KEY=tu-service-role-key
