-- ============================================
-- MIGRACIÓN: Sistema de Cupones
-- Fecha: 2025-12-28
-- Descripción: Migra el sistema de cupones de SQLite a Supabase
-- ============================================

-- ============================================
-- TABLA PRINCIPAL: cupones
-- ============================================

CREATE TABLE IF NOT EXISTS cupones (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) NOT NULL UNIQUE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('porcentaje', 'monto_fijo')),
    valor DECIMAL(10, 2) NOT NULL CHECK (valor > 0),
    limite_uso INTEGER DEFAULT NULL,
    usos_actuales INTEGER DEFAULT 0,
    fecha_expiracion TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    activo BOOLEAN DEFAULT true,
    planes_aplicables JSONB DEFAULT NULL, -- Array de IDs de planes
    descripcion TEXT DEFAULT NULL, -- Descripción opcional del cupón
    solo_primera_compra BOOLEAN DEFAULT false, -- Si solo aplica a primera compra
    solo_renovaciones BOOLEAN DEFAULT false, -- Si solo aplica a renovaciones
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX IF NOT EXISTS idx_cupones_codigo ON cupones(codigo);
CREATE INDEX IF NOT EXISTS idx_cupones_activo ON cupones(activo);
CREATE INDEX IF NOT EXISTS idx_cupones_fecha_expiracion ON cupones(fecha_expiracion);

-- ============================================
-- TABLA: cupones_uso (Historial de uso)
-- ============================================

CREATE TABLE IF NOT EXISTS cupones_uso (
    id SERIAL PRIMARY KEY,
    cupon_id INTEGER NOT NULL REFERENCES cupones(id) ON DELETE CASCADE,
    cliente_email VARCHAR(255) NOT NULL,
    pago_id VARCHAR(100) DEFAULT NULL, -- ID del pago asociado
    monto_descuento DECIMAL(10, 2) NOT NULL,
    precio_original DECIMAL(10, 2) NOT NULL,
    precio_final DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para consultas de abuso
CREATE INDEX IF NOT EXISTS idx_cupones_uso_cupon_id ON cupones_uso(cupon_id);
CREATE INDEX IF NOT EXISTS idx_cupones_uso_cliente_email ON cupones_uso(cliente_email);
CREATE INDEX IF NOT EXISTS idx_cupones_uso_cupon_email ON cupones_uso(cupon_id, cliente_email);

-- ============================================
-- FUNCIÓN: Actualizar updated_at automáticamente
-- ============================================

CREATE OR REPLACE FUNCTION update_cupones_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para actualizar updated_at
DROP TRIGGER IF EXISTS trigger_cupones_updated_at ON cupones;
CREATE TRIGGER trigger_cupones_updated_at
    BEFORE UPDATE ON cupones
    FOR EACH ROW
    EXECUTE FUNCTION update_cupones_updated_at();

-- ============================================
-- FUNCIÓN: Incrementar usos de cupón
-- ============================================

-- Eliminar versiones anteriores de la función
DROP FUNCTION IF EXISTS incrementar_uso_cupon(INTEGER);
DROP FUNCTION IF EXISTS incrementar_uso_cupon(INTEGER, VARCHAR);
DROP FUNCTION IF EXISTS incrementar_uso_cupon(INTEGER, VARCHAR, VARCHAR);
DROP FUNCTION IF EXISTS incrementar_uso_cupon(INTEGER, VARCHAR, VARCHAR, DECIMAL);
DROP FUNCTION IF EXISTS incrementar_uso_cupon(INTEGER, VARCHAR, VARCHAR, DECIMAL, DECIMAL);
DROP FUNCTION IF EXISTS incrementar_uso_cupon(INTEGER, VARCHAR, VARCHAR, DECIMAL, DECIMAL, DECIMAL);

CREATE OR REPLACE FUNCTION incrementar_uso_cupon(
    p_cupon_id INTEGER,
    p_cliente_email VARCHAR(255),
    p_pago_id VARCHAR(100),
    p_monto_descuento DECIMAL(10, 2),
    p_precio_original DECIMAL(10, 2),
    p_precio_final DECIMAL(10, 2)
)
RETURNS JSONB AS $$
DECLARE
    v_cupon RECORD;
    v_result JSONB;
BEGIN
    -- Obtener cupón con bloqueo para evitar race conditions
    SELECT * INTO v_cupon FROM cupones WHERE id = p_cupon_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cupón no encontrado');
    END IF;
    
    -- Verificar si está activo
    IF NOT v_cupon.activo THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cupón inactivo');
    END IF;
    
    -- Verificar límite de uso
    IF v_cupon.limite_uso IS NOT NULL AND v_cupon.usos_actuales >= v_cupon.limite_uso THEN
        RETURN jsonb_build_object('success', false, 'error', 'Cupón agotado');
    END IF;
    
    -- Incrementar contador
    UPDATE cupones 
    SET usos_actuales = usos_actuales + 1,
        activo = CASE 
            WHEN limite_uso IS NOT NULL AND usos_actuales + 1 >= limite_uso THEN false 
            ELSE activo 
        END
    WHERE id = p_cupon_id;
    
    -- Registrar uso en historial
    INSERT INTO cupones_uso (cupon_id, cliente_email, pago_id, monto_descuento, precio_original, precio_final)
    VALUES (p_cupon_id, p_cliente_email, p_pago_id, p_monto_descuento, p_precio_original, p_precio_final);
    
    RETURN jsonb_build_object(
        'success', true, 
        'usos_actuales', v_cupon.usos_actuales + 1,
        'limite_uso', v_cupon.limite_uso,
        'agotado', v_cupon.limite_uso IS NOT NULL AND v_cupon.usos_actuales + 1 >= v_cupon.limite_uso
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- FUNCIÓN: Verificar si usuario ya usó cupón
-- ============================================

CREATE OR REPLACE FUNCTION usuario_ya_uso_cupon(
    p_cupon_id INTEGER,
    p_cliente_email VARCHAR(255)
)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM cupones_uso 
        WHERE cupon_id = p_cupon_id AND cliente_email = p_cliente_email
    );
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS (Row Level Security)
-- ============================================

ALTER TABLE cupones ENABLE ROW LEVEL SECURITY;
ALTER TABLE cupones_uso ENABLE ROW LEVEL SECURITY;

-- Políticas para cupones (lectura pública de activos, escritura solo service_role)
DROP POLICY IF EXISTS "Cupones visibles públicamente si activos" ON cupones;
CREATE POLICY "Cupones visibles públicamente si activos" ON cupones
    FOR SELECT USING (activo = true);

DROP POLICY IF EXISTS "Service role full access cupones" ON cupones;
CREATE POLICY "Service role full access cupones" ON cupones
    FOR ALL USING (auth.role() = 'service_role');

-- Políticas para cupones_uso (solo service_role)
DROP POLICY IF EXISTS "Service role full access cupones_uso" ON cupones_uso;
CREATE POLICY "Service role full access cupones_uso" ON cupones_uso
    FOR ALL USING (auth.role() = 'service_role');

-- ============================================
-- Habilitar Realtime
-- ============================================

ALTER PUBLICATION supabase_realtime ADD TABLE cupones;

-- ============================================
-- Comentarios de documentación
-- ============================================

COMMENT ON TABLE cupones IS 'Tabla principal de cupones de descuento';
COMMENT ON COLUMN cupones.tipo IS 'Tipo de descuento: porcentaje o monto_fijo';
COMMENT ON COLUMN cupones.planes_aplicables IS 'Array JSON de IDs de planes donde aplica el cupón. NULL = todos los planes';
COMMENT ON COLUMN cupones.solo_primera_compra IS 'Si es true, solo aplica a usuarios sin compras previas';

COMMENT ON TABLE cupones_uso IS 'Historial de uso de cupones para tracking y prevención de abuso';
COMMENT ON FUNCTION incrementar_uso_cupon IS 'Incrementa el contador de uso de un cupón de forma atómica';
COMMENT ON FUNCTION usuario_ya_uso_cupon IS 'Verifica si un usuario ya usó un cupón específico';
