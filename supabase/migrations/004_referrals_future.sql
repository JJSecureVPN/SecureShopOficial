-- ============================================
-- SISTEMA DE REFERIDOS (FUTURO)
-- Migración: 004_referrals_future
-- Fecha: 2024-12-14
-- Descripción: Tablas para sistema de referidos
-- Estado: PENDIENTE - No ejecutar aún
-- ============================================

-- ⚠️ ESTE ARCHIVO ES PARA FUTURO USO
-- Descomenta y ejecuta cuando quieras implementar referidos

/*
-- ============================================
-- TABLA DE REFERIDOS
-- ============================================

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

-- RLS para referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals" 
  ON public.referrals FOR SELECT 
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

-- ============================================
-- AGREGAR COLUMNAS A PROFILES
-- ============================================

-- Código único de referido para cada usuario
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Quién refirió a este usuario
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

-- Función para generar código de referido
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.referral_code = UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS generate_referral_code_trigger ON public.profiles;
CREATE TRIGGER generate_referral_code_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.generate_referral_code();
*/
