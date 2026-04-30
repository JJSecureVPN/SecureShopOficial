-- ============================================
-- MIGRACIÓN: 023_add_vpn_2x1
-- Fecha: 2026-03-27
-- Descripción: Añade soporte para la oferta 2x1 en la configuración global
-- ============================================

-- Añadir columna vpn_2x1_activa si no existe
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='promociones_config' AND column_name='vpn_2x1_activa') THEN
        ALTER TABLE public.promociones_config ADD COLUMN vpn_2x1_activa BOOLEAN DEFAULT false;
    END IF;
END $$;

-- Comentario informativo
COMMENT ON COLUMN public.promociones_config.vpn_2x1_activa IS 'Indica si la oferta 2x1 (doble dispositivos) está activa para planes VPN';
