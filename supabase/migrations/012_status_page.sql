-- ============================================
-- MIGRACIÓN 012: STATUS PAGE (INCIDENTES)
-- ============================================
-- Objetivo: transparencia y confianza (incidentes públicos).
-- Admin: `public.is_chat_admin(auth.uid())`.
-- ============================================

-- ============================================
-- 1. COMPONENTES (opcional pero útil)
-- ============================================

CREATE TABLE IF NOT EXISTS public.status_components (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_components_slug ON public.status_components(slug);
CREATE INDEX IF NOT EXISTS idx_status_components_active ON public.status_components(is_active);

DROP TRIGGER IF EXISTS trigger_status_components_updated_at ON public.status_components;
CREATE TRIGGER trigger_status_components_updated_at
BEFORE UPDATE ON public.status_components
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Seed mínimo
INSERT INTO public.status_components (nombre, slug, descripcion) VALUES
  ('VPN', 'vpn', 'Conectividad principal del servicio VPN'),
  ('Pagos', 'pagos', 'Checkout, MercadoPago y confirmaciones')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. INCIDENTES
-- ============================================

CREATE TABLE IF NOT EXISTS public.status_incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo TEXT NOT NULL,
  descripcion TEXT,

  status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  impact TEXT NOT NULL DEFAULT 'minor' CHECK (impact IN ('none', 'minor', 'major', 'critical')),

  is_public BOOLEAN DEFAULT true NOT NULL,

  started_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  resolved_at TIMESTAMPTZ,

  creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_incidents_public ON public.status_incidents(is_public);
CREATE INDEX IF NOT EXISTS idx_status_incidents_status ON public.status_incidents(status);
CREATE INDEX IF NOT EXISTS idx_status_incidents_started_at ON public.status_incidents(started_at DESC);

DROP TRIGGER IF EXISTS trigger_status_incidents_updated_at ON public.status_incidents;
CREATE TRIGGER trigger_status_incidents_updated_at
BEFORE UPDATE ON public.status_incidents
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 3. RELACIÓN INCIDENTE -> COMPONENTES
-- ============================================

CREATE TABLE IF NOT EXISTS public.status_incident_components (
  incident_id UUID REFERENCES public.status_incidents(id) ON DELETE CASCADE NOT NULL,
  component_id UUID REFERENCES public.status_components(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (incident_id, component_id)
);

CREATE INDEX IF NOT EXISTS idx_status_incident_components_incident ON public.status_incident_components(incident_id);

-- ============================================
-- 4. UPDATES DEL INCIDENTE
-- ============================================

CREATE TABLE IF NOT EXISTS public.status_incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES public.status_incidents(id) ON DELETE CASCADE NOT NULL,
  mensaje TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'investigating' CHECK (status IN ('investigating', 'identified', 'monitoring', 'resolved')),
  is_public BOOLEAN DEFAULT true NOT NULL,
  creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_status_incident_updates_incident ON public.status_incident_updates(incident_id);
CREATE INDEX IF NOT EXISTS idx_status_incident_updates_created_at ON public.status_incident_updates(created_at DESC);

-- ============================================
-- 5. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.status_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_incident_components ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.status_incident_updates ENABLE ROW LEVEL SECURITY;

-- Lectura pública
DROP POLICY IF EXISTS status_components_select_public ON public.status_components;
CREATE POLICY "status_components_select_public"
ON public.status_components FOR SELECT
USING (is_active = true);

DROP POLICY IF EXISTS status_incidents_select_public ON public.status_incidents;
CREATE POLICY "status_incidents_select_public"
ON public.status_incidents FOR SELECT
USING (is_public = true);

DROP POLICY IF EXISTS status_incident_components_select_public ON public.status_incident_components;
CREATE POLICY "status_incident_components_select_public"
ON public.status_incident_components FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.status_incidents i
    WHERE i.id = status_incident_components.incident_id
      AND i.is_public = true
  )
);

DROP POLICY IF EXISTS status_incident_updates_select_public ON public.status_incident_updates;
CREATE POLICY "status_incident_updates_select_public"
ON public.status_incident_updates FOR SELECT
USING (
  is_public = true
  AND EXISTS (
    SELECT 1 FROM public.status_incidents i
    WHERE i.id = status_incident_updates.incident_id
      AND i.is_public = true
  )
);

-- Admin manage all
DROP POLICY IF EXISTS status_components_all_admin ON public.status_components;
CREATE POLICY "status_components_all_admin"
ON public.status_components
USING (public.is_chat_admin(auth.uid()))
WITH CHECK (public.is_chat_admin(auth.uid()));

DROP POLICY IF EXISTS status_incidents_all_admin ON public.status_incidents;
CREATE POLICY "status_incidents_all_admin"
ON public.status_incidents
USING (public.is_chat_admin(auth.uid()))
WITH CHECK (public.is_chat_admin(auth.uid()));

DROP POLICY IF EXISTS status_incident_components_all_admin ON public.status_incident_components;
CREATE POLICY "status_incident_components_all_admin"
ON public.status_incident_components
USING (public.is_chat_admin(auth.uid()))
WITH CHECK (public.is_chat_admin(auth.uid()));

DROP POLICY IF EXISTS status_incident_updates_all_admin ON public.status_incident_updates;
CREATE POLICY "status_incident_updates_all_admin"
ON public.status_incident_updates
USING (public.is_chat_admin(auth.uid()))
WITH CHECK (public.is_chat_admin(auth.uid()));

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================
