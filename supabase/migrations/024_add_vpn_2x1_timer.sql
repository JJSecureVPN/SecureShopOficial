-- ============================================
-- MIGRACIÓN: 024_add_vpn_2x1_timer
-- Fecha: 2026-03-27
-- Descripción: Añade campos de temporizador y auto-desactivación para la oferta 2x1
-- ============================================

-- Añadir columnas para el temporizador 2x1 si no existen
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='promociones_config' AND column_name='vpn_2x1_activada_en') THEN
        ALTER TABLE public.promociones_config ADD COLUMN vpn_2x1_activada_en TIMESTAMPTZ;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='promociones_config' AND column_name='vpn_2x1_duracion_horas') THEN
        ALTER TABLE public.promociones_config ADD COLUMN vpn_2x1_duracion_horas INTEGER DEFAULT 24;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='promociones_config' AND column_name='vpn_2x1_auto_desactivar') THEN
        ALTER TABLE public.promociones_config ADD COLUMN vpn_2x1_auto_desactivar BOOLEAN DEFAULT true;
    END IF;
END $$;

-- Comentarios informativos
COMMENT ON COLUMN public.promociones_config.vpn_2x1_activada_en IS 'Fecha y hora en que se activó la oferta 2x1';
COMMENT ON COLUMN public.promociones_config.vpn_2x1_duracion_horas IS 'Duración en horas de la oferta 2x1';
COMMENT ON COLUMN public.promociones_config.vpn_2x1_auto_desactivar IS 'Indica si la oferta 2x1 se debe desactivar automáticamente al expirar el tiempo';
