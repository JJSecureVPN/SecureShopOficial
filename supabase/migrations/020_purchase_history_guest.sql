-- ============================================================
-- MIGRACIÓN 020: Soporte de compras de clientes sin cuenta
-- ============================================================
-- Problema: purchase_history requiere user_id NOT NULL, por lo
-- que las compras de clientes no registrados nunca se guardaban.
--
-- Solución:
--   1. Hacer user_id nullable
--   2. Agregar columna email para guardar compras sin usuario
--   3. Trigger automático que vincula las compras cuando el
--      cliente se registra

-- 1. Hacer user_id nullable (soporte para compras sin cuenta)
ALTER TABLE public.purchase_history
  ALTER COLUMN user_id DROP NOT NULL;

-- 2. Agregar columna email para poder vincular en el futuro
ALTER TABLE public.purchase_history
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Índice para búsquedas eficientes por email (vincular al registrarse)
CREATE INDEX IF NOT EXISTS idx_purchase_history_email
  ON public.purchase_history(email);

-- 3. Función: vincula compras sin user_id al usuario recién creado
CREATE OR REPLACE FUNCTION public.link_pending_purchases()
RETURNS TRIGGER AS $$
BEGIN
  -- Cuando se crea o actualiza un perfil, asignar user_id a
  -- todas las compras pendientes que coincidan por email
  UPDATE public.purchase_history
  SET user_id = NEW.id
  WHERE lower(email) = lower(NEW.email)
    AND user_id IS NULL;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger: se dispara al crear un perfil (registro nuevo usuario)
DROP TRIGGER IF EXISTS on_profile_created_link_purchases ON public.profiles;
CREATE TRIGGER on_profile_created_link_purchases
  AFTER INSERT OR UPDATE OF email ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.link_pending_purchases();
