-- ============================================
-- Migración: 018_help_center_tutorials
-- Fecha: 2026-01-25
-- Descripción: Tablas para Centro de Ayuda / Tutoriales, imágenes y solicitudes de contacto
-- ============================================

-- 1. Tabla de tutoriales enviados por usuarios
CREATE TABLE IF NOT EXISTS public.help_tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author_name TEXT NOT NULL,
  author_email TEXT,
  author_phone TEXT,
  content TEXT,
  links TEXT[],
  images TEXT[], -- rutas a objetos en storage (array de text)
  status TEXT NOT NULL DEFAULT 'pending', -- pending | approved | rejected
  created_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  reviewed_by UUID NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMPTZ NULL,
  admin_notes TEXT NULL
);

CREATE INDEX IF NOT EXISTS idx_help_tutorials_status ON public.help_tutorials(status);
CREATE INDEX IF NOT EXISTS idx_help_tutorials_created_at ON public.help_tutorials(created_at DESC);

-- 2. Tabla de imágenes (opcional, referencias a storage)
CREATE TABLE IF NOT EXISTS public.tutorial_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutorial_id UUID REFERENCES public.help_tutorials(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL,
  filename TEXT NOT NULL,
  size_bytes BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_tutorial_images_tutorial_id ON public.tutorial_images(tutorial_id);

-- 3. Tabla para solicitudes de contacto (usuarios que permiten ser contactados)
CREATE TABLE IF NOT EXISTS public.contact_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  message TEXT NULL,
  allow_contact BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_contact_requests_created_at ON public.contact_requests(created_at DESC);

-- 4. RLS (habilitar y políticas básicas)
ALTER TABLE public.help_tutorials ENABLE ROW LEVEL SECURITY;

-- Política: lectura pública sólo de tutoriales aprobados
CREATE POLICY "Public can select approved tutorials"
  ON public.help_tutorials
  FOR SELECT
  USING (status = 'approved');

-- Política: usuarios autenticados pueden insertar su propio tutorial (con auth.uid())
CREATE POLICY "Authenticated can insert tutorials"
  ON public.help_tutorials
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role' OR auth.uid() IS NULL);

-- Política: el creador puede actualizar su propio tutorial mientras esté pending
CREATE POLICY "Owner can update own pending tutorials"
  ON public.help_tutorials
  FOR UPDATE
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid() AND status = 'pending');

-- Política: sólo admins (tabla chat_admins) pueden aprobar/rechazar
CREATE POLICY "Admins can review tutorials"
  ON public.help_tutorials
  FOR UPDATE
  USING (EXISTS (SELECT 1 FROM public.chat_admins WHERE chat_admins.user_id = auth.uid()));

GRANT SELECT ON public.help_tutorials TO anon, authenticated;
GRANT INSERT ON public.help_tutorials TO authenticated;
GRANT UPDATE ON public.help_tutorials TO authenticated;

-- RLS para contact_requests: cualquiera puede insertar; lectura sólo admins
ALTER TABLE public.contact_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can insert contact requests"
  ON public.contact_requests
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can read contact requests"
  ON public.contact_requests
  FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.chat_admins WHERE chat_admins.user_id = auth.uid()));

GRANT INSERT ON public.contact_requests TO anon, authenticated;
GRANT SELECT ON public.contact_requests TO authenticated;

-- Nota: revisar y ajustar políticas en producción según su modelo de permisos
