-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Migración: 002_rls_policies
-- Fecha: 2024-12-14
-- Descripción: Políticas de seguridad para tablas
-- ============================================

-- ============================================
-- RLS PARA PROFILES
-- ============================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver su propio perfil
CREATE POLICY "Users can view own profile" 
  ON public.profiles FOR SELECT 
  USING (auth.uid() = id);

-- Los usuarios solo pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile" 
  ON public.profiles FOR UPDATE 
  USING (auth.uid() = id);

-- Los usuarios solo pueden insertar su propio perfil
CREATE POLICY "Users can insert own profile" 
  ON public.profiles FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- ============================================
-- RLS PARA PURCHASE_HISTORY
-- ============================================

ALTER TABLE public.purchase_history ENABLE ROW LEVEL SECURITY;

-- Los usuarios solo pueden ver sus propias compras
CREATE POLICY "Users can view own purchases" 
  ON public.purchase_history FOR SELECT 
  USING (auth.uid() = user_id);

-- NOTA: El backend usa service_role key que bypasea RLS
-- por lo que puede insertar compras para cualquier usuario
