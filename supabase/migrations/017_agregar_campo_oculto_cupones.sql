-- ============================================
-- MIGRACIÓN: Agregar campo oculto a cupones
-- Fecha: 2026-01-08
-- Descripción: Agrega campo para cupones ocultos (no visibles en header)
-- ============================================

-- Agregar columna oculto a la tabla cupones
ALTER TABLE cupones ADD COLUMN oculto BOOLEAN DEFAULT false;

-- Comentario para documentación
COMMENT ON COLUMN cupones.oculto IS 'Si es true, el cupón no se muestra públicamente en el header, solo accesible por código directo';

-- Actualizar RLS para permitir acceso a cupones ocultos solo por service_role
-- La política existente ya filtra por activo=true para usuarios normales
-- Los cupones ocultos solo serán visibles si se consulta directamente por código</content>
<parameter name="filePath">c:\Users\tiin-\Documents\secureshop-vpn\supabase\migrations\017_agregar_campo_oculto_cupones.sql