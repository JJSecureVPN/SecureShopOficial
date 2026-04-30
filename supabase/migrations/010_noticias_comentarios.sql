-- ============================================
-- COMENTARIOS PARA NOTICIAS - SUPABASE MIGRATION
-- ============================================
-- Ejecuta este archivo en el SQL Editor de Supabase

CREATE TABLE IF NOT EXISTS public.noticia_comentarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  noticia_id UUID NOT NULL REFERENCES public.noticias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  email TEXT,
  contenido TEXT NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  aprobado BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_noticia_comentarios_noticia_id ON public.noticia_comentarios(noticia_id);
CREATE INDEX IF NOT EXISTS idx_noticia_comentarios_created_at ON public.noticia_comentarios(created_at DESC);

-- RLS
ALTER TABLE public.noticia_comentarios ENABLE ROW LEVEL SECURITY;

-- Lectura pública: solo comentarios aprobados de noticias públicas y con comentarios habilitados
DROP POLICY IF EXISTS noticia_comentarios_select_public ON public.noticia_comentarios;
CREATE POLICY "noticia_comentarios_select_public"
ON public.noticia_comentarios FOR SELECT
USING (
  aprobado = true
  AND EXISTS (
    SELECT 1
    FROM public.noticias n
    WHERE n.id = noticia_comentarios.noticia_id
      AND n.estado = 'publicada'
      AND n.visible_para = 'todos'
      AND n.allow_comentarios = true
      AND (n.mostrar_desde IS NULL OR n.mostrar_desde <= NOW())
      AND (n.mostrar_hasta IS NULL OR n.mostrar_hasta > NOW())
  )
);

-- Inserción pública: permite comentar solo si la noticia es pública y tiene comentarios habilitados
DROP POLICY IF EXISTS noticia_comentarios_insert_public ON public.noticia_comentarios;
CREATE POLICY "noticia_comentarios_insert_public"
ON public.noticia_comentarios FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.noticias n
    WHERE n.id = noticia_comentarios.noticia_id
      AND n.estado = 'publicada'
      AND n.visible_para = 'todos'
      AND n.allow_comentarios = true
      AND (n.mostrar_desde IS NULL OR n.mostrar_desde <= NOW())
      AND (n.mostrar_hasta IS NULL OR n.mostrar_hasta > NOW())
  )
);
