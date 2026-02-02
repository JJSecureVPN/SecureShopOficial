-- Migración: 019_add_help_tutorials_html_column
-- Fecha: 2026-01-25
-- Añade columna content_html_url a help_tutorials para almacenar URL de archivos HTML subidos

ALTER TABLE public.help_tutorials
  ADD COLUMN IF NOT EXISTS content_html_url TEXT NULL;

-- Opcional: index para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_help_tutorials_content_html_url ON public.help_tutorials((content_html_url IS NOT NULL));
