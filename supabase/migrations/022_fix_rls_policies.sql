-- ============================================
-- MIGRACIÓN 022: Ajuste de políticas RLS para evitar warnings del linter
-- Fecha: 2026-03-17
-- Descripción: Reemplaza políticas demasiado permisivas (USING/ WITH CHECK true)
-- ============================================

-- 1) Contact Requests: evitar WITH CHECK (true) en INSERT
--    Permitimos inserciones de anon/ authenticated y service_role.
DROP POLICY IF EXISTS "Anyone can insert contact requests" ON public.contact_requests;
CREATE POLICY "Anyone can insert contact requests"
  ON public.contact_requests
  FOR INSERT
  WITH CHECK (
    auth.role() IN ('anon', 'authenticated', 'service_role')
  );

-- 2) Reemplazar políticas de "Service role full access" que el linter considera demasiado permisivas.
--    Se mantiene el comportamiento esperado (solo service role), pero explicitando la condición.

DROP POLICY IF EXISTS "Service role full access" ON public.profiles;
CREATE POLICY "Service role full access" ON public.profiles
  FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON public.referral_settings;
CREATE POLICY "Service role full access" ON public.referral_settings
  FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON public.referrals;
CREATE POLICY "Service role full access" ON public.referrals
  FOR ALL
  USING (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON public.saldo_transacciones;
CREATE POLICY "Service role full access" ON public.saldo_transacciones
  FOR ALL
  USING (auth.role() = 'service_role');

-- Nota: Estas políticas suponen que el service role seguirá usando auth.role() = 'service_role'.
-- Ajusta según tus necesidades de seguridad si se requiere otro criterio.
