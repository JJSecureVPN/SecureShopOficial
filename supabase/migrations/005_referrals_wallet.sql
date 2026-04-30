-- ============================================
-- SISTEMA DE SALDO (WALLET) Y REFERIDOS
-- Migración: 005_referrals_wallet
-- Fecha: 2024-12-15
-- Descripción: Sistema completo de saldo en cuenta y programa de referidos
-- ============================================

-- ============================================
-- 1. AGREGAR SALDO A PROFILES
-- ============================================

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS saldo DECIMAL(10,2) DEFAULT 0.00;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS total_earned DECIMAL(10,2) DEFAULT 0.00;

-- ============================================
-- 2. TABLA DE TRANSACCIONES DE SALDO
-- ============================================

CREATE TABLE IF NOT EXISTS public.saldo_transacciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('referido', 'compra', 'ajuste_admin', 'bonus', 'reembolso')),
  monto DECIMAL(10,2) NOT NULL, -- Positivo = ingreso, Negativo = egreso
  saldo_anterior DECIMAL(10,2) NOT NULL,
  saldo_nuevo DECIMAL(10,2) NOT NULL,
  descripcion TEXT,
  referencia_id UUID, -- ID de la compra/referido relacionado
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_saldo_trans_user ON public.saldo_transacciones(user_id);
CREATE INDEX IF NOT EXISTS idx_saldo_trans_created ON public.saldo_transacciones(created_at DESC);

-- RLS para transacciones de saldo
ALTER TABLE public.saldo_transacciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transactions" 
  ON public.saldo_transacciones FOR SELECT 
  USING (auth.uid() = user_id);

-- ============================================
-- 3. TABLA DE REFERIDOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referred_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  referral_code TEXT NOT NULL,
  purchase_id UUID REFERENCES public.purchase_history(id),
  purchase_amount DECIMAL(10,2) DEFAULT 0,
  reward_amount DECIMAL(10,2) DEFAULT 0,
  reward_percentage DECIMAL(5,2) DEFAULT 0,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  completed_at TIMESTAMPTZ,
  UNIQUE(referrer_id, referred_id)
);

CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON public.referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON public.referrals(status);

-- RLS para referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own referrals as referrer" 
  ON public.referrals FOR SELECT 
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view own referrals as referred" 
  ON public.referrals FOR SELECT 
  USING (auth.uid() = referred_id);

-- ============================================
-- 4. CONFIGURACIÓN DE REFERIDOS (ADMIN)
-- ============================================

CREATE TABLE IF NOT EXISTS public.referral_settings (
  id SERIAL PRIMARY KEY,
  porcentaje_recompensa DECIMAL(5,2) DEFAULT 10.00, -- % que recibe el referidor
  porcentaje_descuento_referido DECIMAL(5,2) DEFAULT 5.00, -- % descuento para el nuevo usuario
  min_compra_requerida DECIMAL(10,2) DEFAULT 0, -- Compra mínima para activar
  activo BOOLEAN DEFAULT TRUE,
  solo_primera_compra BOOLEAN DEFAULT TRUE, -- Solo la primera compra cuenta
  max_recompensa_por_referido DECIMAL(10,2) DEFAULT NULL, -- Límite máximo por referido
  mensaje_promocional TEXT DEFAULT '¡Invita amigos y gana saldo! Por cada amigo que compre, recibes 10% de su compra como saldo.',
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insertar configuración inicial
INSERT INTO public.referral_settings (porcentaje_recompensa, porcentaje_descuento_referido, activo)
VALUES (10.00, 5.00, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. AGREGAR CAMPOS A PURCHASE_HISTORY
-- ============================================

ALTER TABLE public.purchase_history 
ADD COLUMN IF NOT EXISTS saldo_usado DECIMAL(10,2) DEFAULT 0;

ALTER TABLE public.purchase_history 
ADD COLUMN IF NOT EXISTS monto_pagado_mp DECIMAL(10,2); -- Lo que realmente pagó en MP

ALTER TABLE public.purchase_history 
ADD COLUMN IF NOT EXISTS referral_code_used TEXT; -- Código de referido usado en la compra

-- ============================================
-- 6. FUNCIÓN PARA GENERAR CÓDIGO DE REFERIDO
-- ============================================

CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  -- Generar código único de 8 caracteres
  LOOP
    new_code := UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text || random()::text) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.referral_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para nuevos usuarios
DROP TRIGGER IF EXISTS generate_referral_code_trigger ON public.profiles;
CREATE TRIGGER generate_referral_code_trigger
  BEFORE INSERT ON public.profiles
  FOR EACH ROW 
  WHEN (NEW.referral_code IS NULL)
  EXECUTE FUNCTION public.generate_referral_code();

-- ============================================
-- 7. GENERAR CÓDIGOS PARA USUARIOS EXISTENTES
-- ============================================

-- Actualizar usuarios que no tienen código
UPDATE public.profiles 
SET referral_code = UPPER(SUBSTRING(MD5(id::text || NOW()::text || random()::text) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- ============================================
-- 8. FUNCIÓN PARA ACREDITAR SALDO
-- ============================================

CREATE OR REPLACE FUNCTION public.acreditar_saldo(
  p_user_id UUID,
  p_monto DECIMAL(10,2),
  p_tipo TEXT,
  p_descripcion TEXT DEFAULT NULL,
  p_referencia_id UUID DEFAULT NULL
)
RETURNS DECIMAL(10,2) AS $$
DECLARE
  v_saldo_anterior DECIMAL(10,2);
  v_saldo_nuevo DECIMAL(10,2);
BEGIN
  -- Obtener saldo actual
  SELECT COALESCE(saldo, 0) INTO v_saldo_anterior
  FROM public.profiles WHERE id = p_user_id;
  
  -- Calcular nuevo saldo
  v_saldo_nuevo := v_saldo_anterior + p_monto;
  
  -- No permitir saldo negativo
  IF v_saldo_nuevo < 0 THEN
    RAISE EXCEPTION 'Saldo insuficiente';
  END IF;
  
  -- Actualizar saldo
  UPDATE public.profiles 
  SET saldo = v_saldo_nuevo,
      total_earned = CASE WHEN p_monto > 0 THEN COALESCE(total_earned, 0) + p_monto ELSE total_earned END
  WHERE id = p_user_id;
  
  -- Registrar transacción
  INSERT INTO public.saldo_transacciones (
    user_id, tipo, monto, saldo_anterior, saldo_nuevo, descripcion, referencia_id
  ) VALUES (
    p_user_id, p_tipo, p_monto, v_saldo_anterior, v_saldo_nuevo, p_descripcion, p_referencia_id
  );
  
  RETURN v_saldo_nuevo;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 9. FUNCIÓN PARA PROCESAR REFERIDO
-- ============================================

CREATE OR REPLACE FUNCTION public.procesar_referido(
  p_referrer_code TEXT,
  p_referred_id UUID,
  p_purchase_id UUID,
  p_purchase_amount DECIMAL(10,2)
)
RETURNS TABLE(
  success BOOLEAN,
  reward_amount DECIMAL(10,2),
  message TEXT
) AS $$
DECLARE
  v_referrer_id UUID;
  v_settings RECORD;
  v_reward DECIMAL(10,2);
  v_existing_referral UUID;
BEGIN
  -- Obtener configuración
  SELECT * INTO v_settings FROM public.referral_settings WHERE id = 1;
  
  -- Verificar si el programa está activo
  IF NOT v_settings.activo THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'Programa de referidos no activo'::TEXT;
    RETURN;
  END IF;
  
  -- Buscar al referidor por código
  SELECT id INTO v_referrer_id 
  FROM public.profiles 
  WHERE referral_code = UPPER(p_referrer_code);
  
  IF v_referrer_id IS NULL THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'Código de referido no válido'::TEXT;
    RETURN;
  END IF;
  
  -- No puede referirse a sí mismo
  IF v_referrer_id = p_referred_id THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'No puedes usar tu propio código'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar si ya existe un referido entre estos usuarios
  SELECT id INTO v_existing_referral
  FROM public.referrals 
  WHERE referrer_id = v_referrer_id AND referred_id = p_referred_id AND status = 'completed';
  
  IF v_existing_referral IS NOT NULL AND v_settings.solo_primera_compra THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'Ya se procesó un referido anteriormente'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar monto mínimo
  IF p_purchase_amount < v_settings.min_compra_requerida THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10,2), 
      FORMAT('Compra mínima requerida: $%s', v_settings.min_compra_requerida)::TEXT;
    RETURN;
  END IF;
  
  -- Calcular recompensa
  v_reward := ROUND(p_purchase_amount * v_settings.porcentaje_recompensa / 100, 2);
  
  -- Aplicar límite máximo si existe
  IF v_settings.max_recompensa_por_referido IS NOT NULL AND v_reward > v_settings.max_recompensa_por_referido THEN
    v_reward := v_settings.max_recompensa_por_referido;
  END IF;
  
  -- Crear registro de referido
  INSERT INTO public.referrals (
    referrer_id, referred_id, referral_code, purchase_id, 
    purchase_amount, reward_amount, reward_percentage, status, completed_at
  ) VALUES (
    v_referrer_id, p_referred_id, p_referrer_code, p_purchase_id,
    p_purchase_amount, v_reward, v_settings.porcentaje_recompensa, 'completed', NOW()
  )
  ON CONFLICT (referrer_id, referred_id) 
  DO UPDATE SET 
    purchase_amount = EXCLUDED.purchase_amount + public.referrals.purchase_amount,
    reward_amount = EXCLUDED.reward_amount + public.referrals.reward_amount;
  
  -- Acreditar saldo al referidor
  PERFORM public.acreditar_saldo(
    v_referrer_id,
    v_reward,
    'referido',
    FORMAT('Comisión por referido - Compra de $%s', p_purchase_amount),
    p_purchase_id
  );
  
  -- Actualizar contador de referidos
  UPDATE public.profiles 
  SET total_referrals = COALESCE(total_referrals, 0) + 1
  WHERE id = v_referrer_id;
  
  -- Marcar quién refirió a este usuario
  UPDATE public.profiles 
  SET referred_by = v_referrer_id
  WHERE id = p_referred_id AND referred_by IS NULL;
  
  RETURN QUERY SELECT true, v_reward, 'Referido procesado exitosamente'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================
