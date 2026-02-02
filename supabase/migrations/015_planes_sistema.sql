-- ============================================
-- MIGRACIÓN: 015_planes_sistema
-- Fecha: 2025-12-28
-- Descripción: Tablas de planes VPN y revendedores
-- ============================================

-- ============================================
-- 1. TABLA DE PLANES VPN (Para clientes finales)
-- ============================================
CREATE TABLE IF NOT EXISTS public.planes_vpn (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2) NOT NULL,
  precio_promo DECIMAL(12,2),
  dispositivos INTEGER NOT NULL DEFAULT 1,
  dias INTEGER NOT NULL DEFAULT 30,
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_planes_vpn_activo ON public.planes_vpn(activo);
CREATE INDEX IF NOT EXISTS idx_planes_vpn_orden ON public.planes_vpn(orden);

-- ============================================
-- 2. TABLA DE PLANES REVENDEDORES
-- ============================================
CREATE TABLE IF NOT EXISTS public.planes_revendedores (
  id INTEGER PRIMARY KEY,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio DECIMAL(12,2) NOT NULL,
  precio_promo DECIMAL(12,2),
  max_users INTEGER NOT NULL,
  account_type TEXT NOT NULL CHECK (account_type IN ('credit', 'validity')),
  dias INTEGER, -- NULL para credit, 30 para validity
  activo BOOLEAN DEFAULT true,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_planes_revendedores_activo ON public.planes_revendedores(activo);
CREATE INDEX IF NOT EXISTS idx_planes_revendedores_account_type ON public.planes_revendedores(account_type);

-- ============================================
-- 3. TABLA DE CONFIGURACIÓN DE PROMOCIONES
-- ============================================
CREATE TABLE IF NOT EXISTS public.promociones_config (
  id TEXT PRIMARY KEY DEFAULT 'global',
  -- Promoción planes VPN
  vpn_activa BOOLEAN DEFAULT false,
  vpn_descuento_porcentaje INTEGER DEFAULT 30,
  vpn_texto TEXT DEFAULT '⚡ PROMOCIÓN ESPECIAL - 30% OFF EN TODOS LOS PLANES',
  vpn_activada_en TIMESTAMPTZ,
  vpn_duracion_horas INTEGER DEFAULT 24,
  vpn_auto_desactivar BOOLEAN DEFAULT true,
  -- Promoción revendedores
  revendedor_activa BOOLEAN DEFAULT false,
  revendedor_descuento_porcentaje INTEGER DEFAULT 20,
  revendedor_texto TEXT DEFAULT '💼 PROMOCIÓN ESPECIAL - 20% OFF EN PLANES DE REVENTA',
  revendedor_activada_en TIMESTAMPTZ,
  revendedor_duracion_horas INTEGER DEFAULT 24,
  revendedor_auto_desactivar BOOLEAN DEFAULT true,
  revendedor_solo_nuevos BOOLEAN DEFAULT false,
  revendedor_solo_renovaciones BOOLEAN DEFAULT false,
  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Insertar configuración inicial
INSERT INTO public.promociones_config (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. ROW LEVEL SECURITY (RLS)
-- ============================================

-- Planes VPN - Lectura pública, escritura solo admin
ALTER TABLE public.planes_vpn ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planes VPN son públicos para lectura"
  ON public.planes_vpn FOR SELECT
  USING (true);

CREATE POLICY "Solo admins pueden modificar planes VPN"
  ON public.planes_vpn FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_admins 
      WHERE user_id = auth.uid()
    )
  );

-- Planes Revendedores - Lectura pública, escritura solo admin
ALTER TABLE public.planes_revendedores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Planes revendedores son públicos para lectura"
  ON public.planes_revendedores FOR SELECT
  USING (true);

CREATE POLICY "Solo admins pueden modificar planes revendedores"
  ON public.planes_revendedores FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_admins 
      WHERE user_id = auth.uid()
    )
  );

-- Promociones Config - Lectura pública, escritura solo admin
ALTER TABLE public.promociones_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Config promociones es pública para lectura"
  ON public.promociones_config FOR SELECT
  USING (true);

CREATE POLICY "Solo admins pueden modificar promociones"
  ON public.promociones_config FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_admins 
      WHERE user_id = auth.uid()
    )
  );

-- ============================================
-- 5. TRIGGERS PARA UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION public.update_planes_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_planes_vpn_updated_at ON public.planes_vpn;
CREATE TRIGGER update_planes_vpn_updated_at
  BEFORE UPDATE ON public.planes_vpn
  FOR EACH ROW EXECUTE FUNCTION public.update_planes_updated_at();

DROP TRIGGER IF EXISTS update_planes_revendedores_updated_at ON public.planes_revendedores;
CREATE TRIGGER update_planes_revendedores_updated_at
  BEFORE UPDATE ON public.planes_revendedores
  FOR EACH ROW EXECUTE FUNCTION public.update_planes_updated_at();

DROP TRIGGER IF EXISTS update_promociones_config_updated_at ON public.promociones_config;
CREATE TRIGGER update_promociones_config_updated_at
  BEFORE UPDATE ON public.promociones_config
  FOR EACH ROW EXECUTE FUNCTION public.update_planes_updated_at();

-- ============================================
-- 6. HABILITAR REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.planes_vpn;
ALTER PUBLICATION supabase_realtime ADD TABLE public.planes_revendedores;
ALTER PUBLICATION supabase_realtime ADD TABLE public.promociones_config;

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================
