-- ============================================
-- MIGRACIÓN 013: CENTRO DE AYUDA / FAQ
-- ============================================
-- Objetivo: autoservicio (FAQ + guías) y mejor conversión.
-- Admin: `public.is_chat_admin(auth.uid())`.
-- ============================================

-- ============================================
-- 1. CATEGORÍAS
-- ============================================

CREATE TABLE IF NOT EXISTS public.help_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  descripcion TEXT,
  orden INTEGER DEFAULT 0,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_help_categories_slug ON public.help_categories(slug);
CREATE INDEX IF NOT EXISTS idx_help_categories_activo ON public.help_categories(activo);

DROP TRIGGER IF EXISTS trigger_help_categories_updated_at ON public.help_categories;
CREATE TRIGGER trigger_help_categories_updated_at
BEFORE UPDATE ON public.help_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- Seeds mínimos
INSERT INTO public.help_categories (nombre, slug, descripcion, orden) VALUES
  ('Instalación', 'instalacion', 'Guías para instalar y configurar', 1),
  ('Cuenta y Compras', 'cuenta-compras', 'Registro, pagos, historial y renovaciones', 2),
  ('Problemas comunes', 'problemas', 'Errores típicos y soluciones rápidas', 3)
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 2. ARTÍCULOS
-- ============================================

CREATE TABLE IF NOT EXISTS public.help_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria_id UUID NOT NULL REFERENCES public.help_categories(id) ON DELETE RESTRICT,

  titulo TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  resumen TEXT,
  contenido_md TEXT NOT NULL,

  estado TEXT NOT NULL DEFAULT 'borrador' CHECK (estado IN ('borrador', 'publicado', 'archivado')),
  visible_para TEXT NOT NULL DEFAULT 'todos' CHECK (visible_para IN ('todos', 'clientes', 'admin')),

  prioridad INTEGER DEFAULT 0,

  creado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actualizado_por UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_help_articles_categoria ON public.help_articles(categoria_id);
CREATE INDEX IF NOT EXISTS idx_help_articles_estado ON public.help_articles(estado);
CREATE INDEX IF NOT EXISTS idx_help_articles_visible_para ON public.help_articles(visible_para);
CREATE INDEX IF NOT EXISTS idx_help_articles_prioridad ON public.help_articles(prioridad DESC);

DROP TRIGGER IF EXISTS trigger_help_articles_updated_at ON public.help_articles;
CREATE TRIGGER trigger_help_articles_updated_at
BEFORE UPDATE ON public.help_articles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;

-- Categorías visibles públicamente (solo activas)
DROP POLICY IF EXISTS help_categories_select_public ON public.help_categories;
CREATE POLICY "help_categories_select_public"
ON public.help_categories FOR SELECT
USING (activo = true);

-- Artículos públicos: publicado y visible_para = todos
DROP POLICY IF EXISTS help_articles_select_public ON public.help_articles;
CREATE POLICY "help_articles_select_public"
ON public.help_articles FOR SELECT
USING (
  estado = 'publicado'
  AND visible_para = 'todos'
);

-- Artículos para clientes: publicado y visible_para en (todos, clientes)
DROP POLICY IF EXISTS help_articles_select_clientes ON public.help_articles;
CREATE POLICY "help_articles_select_clientes"
ON public.help_articles FOR SELECT
USING (
  estado = 'publicado'
  AND visible_para IN ('todos', 'clientes')
  AND auth.uid() IS NOT NULL
);

-- Admin manage
DROP POLICY IF EXISTS help_categories_all_admin ON public.help_categories;
CREATE POLICY "help_categories_all_admin"
ON public.help_categories
USING (public.is_chat_admin(auth.uid()))
WITH CHECK (public.is_chat_admin(auth.uid()));

DROP POLICY IF EXISTS help_articles_all_admin ON public.help_articles;
CREATE POLICY "help_articles_all_admin"
ON public.help_articles
USING (public.is_chat_admin(auth.uid()))
WITH CHECK (public.is_chat_admin(auth.uid()));

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================
