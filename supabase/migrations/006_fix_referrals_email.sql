-- ============================================
-- MIGRACIÓN 006: Arreglar referidos por email
-- Permite procesar referidos cuando el usuario
-- comprador no tiene cuenta en Supabase
-- ============================================

-- Modificar tabla referrals para permitir referred_id NULL y agregar referred_email
ALTER TABLE public.referrals 
  ALTER COLUMN referred_id DROP NOT NULL;

ALTER TABLE public.referrals 
  ADD COLUMN IF NOT EXISTS referred_email TEXT;

-- Eliminar constraint único existente si causa problemas
ALTER TABLE public.referrals 
  DROP CONSTRAINT IF EXISTS referrals_referrer_id_referred_id_key;

-- Crear nuevo índice único que permite múltiples referidos del mismo usuario
CREATE UNIQUE INDEX IF NOT EXISTS referrals_unique_purchase 
  ON public.referrals(referrer_id, purchase_id);

-- ============================================
-- FUNCIÓN PARA PROCESAR REFERIDO POR EMAIL
-- ============================================

CREATE OR REPLACE FUNCTION public.procesar_referido_email(
  p_referrer_code TEXT,
  p_referred_email TEXT,
  p_purchase_id TEXT,
  p_purchase_amount DECIMAL(10,2)
)
RETURNS TABLE(
  success BOOLEAN,
  reward_amount DECIMAL(10,2),
  message TEXT
) AS $$
DECLARE
  v_referrer_id UUID;
  v_referred_id UUID;
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
  
  -- Buscar si el comprador tiene cuenta (opcional)
  SELECT id INTO v_referred_id
  FROM public.profiles
  WHERE LOWER(email) = LOWER(p_referred_email);
  
  -- No puede referirse a sí mismo
  IF v_referred_id IS NOT NULL AND v_referrer_id = v_referred_id THEN
    RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'No puedes usar tu propio código'::TEXT;
    RETURN;
  END IF;
  
  -- Verificar por email del referidor
  DECLARE
    v_referrer_email TEXT;
  BEGIN
    SELECT email INTO v_referrer_email FROM public.profiles WHERE id = v_referrer_id;
    IF LOWER(v_referrer_email) = LOWER(p_referred_email) THEN
      RETURN QUERY SELECT false, 0::DECIMAL(10,2), 'No puedes usar tu propio código'::TEXT;
      RETURN;
    END IF;
  END;
  
  -- Verificar si ya existe un referido para esta compra específica
  SELECT id INTO v_existing_referral
  FROM public.referrals 
  WHERE referrer_id = v_referrer_id 
    AND (referred_email = LOWER(p_referred_email) OR referred_id = v_referred_id)
    AND status = 'completed'
  LIMIT 1;
  
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
    referrer_id, referred_id, referred_email, referral_code, purchase_id, 
    purchase_amount, reward_amount, reward_percentage, status, completed_at
  ) VALUES (
    v_referrer_id, 
    v_referred_id, -- puede ser NULL si no tiene cuenta
    LOWER(p_referred_email),
    UPPER(p_referrer_code), 
    p_purchase_id::UUID,
    p_purchase_amount, 
    v_reward, 
    v_settings.porcentaje_recompensa, 
    'completed', 
    NOW()
  );
  
  -- Acreditar saldo al referidor
  PERFORM public.acreditar_saldo(
    v_referrer_id,
    v_reward,
    'referido',
    FORMAT('Comisión por referido de %s - Compra de $%s', p_referred_email, p_purchase_amount),
    p_purchase_id::UUID
  );
  
  -- Actualizar contador de referidos
  UPDATE public.profiles 
  SET total_referrals = COALESCE(total_referrals, 0) + 1
  WHERE id = v_referrer_id;
  
  -- Si el comprador tiene cuenta, marcar quién lo refirió
  IF v_referred_id IS NOT NULL THEN
    UPDATE public.profiles 
    SET referred_by = v_referrer_id
    WHERE id = v_referred_id AND referred_by IS NULL;
  END IF;
  
  RETURN QUERY SELECT true, v_reward, 'Referido procesado exitosamente'::TEXT;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- ACTUALIZAR VISTA DE ESTADÍSTICAS
-- ============================================

-- Modificar la consulta de referidos para incluir referred_email
CREATE OR REPLACE VIEW public.referrals_with_details AS
SELECT 
  r.*,
  COALESCE(p.email, r.referred_email) as referred_email_display,
  COALESCE(p.nombre, SPLIT_PART(r.referred_email, '@', 1)) as referred_nombre_display
FROM public.referrals r
LEFT JOIN public.profiles p ON r.referred_id = p.id;

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================
