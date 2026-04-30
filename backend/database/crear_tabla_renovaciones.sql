-- Tabla para historial de renovaciones y upgrades
CREATE TABLE IF NOT EXISTS renovaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tipo TEXT NOT NULL CHECK(tipo IN ('cliente', 'revendedor')),
  servex_id INTEGER NOT NULL, -- ID del cliente o revendedor en Servex
  servex_username TEXT NOT NULL,
  operacion TEXT NOT NULL CHECK(operacion IN ('renovacion', 'upgrade')),
  
  -- Datos antes de la renovación/upgrade
  dias_agregados INTEGER, -- Para renovaciones
  datos_anteriores TEXT, -- JSON con datos antes del cambio
  datos_nuevos TEXT, -- JSON con datos después del cambio
  
  -- Información del pago
  monto REAL NOT NULL,
  metodo_pago TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  
  -- Estado
  estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
  
  -- Fechas
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_renovaciones_tipo ON renovaciones(tipo);
CREATE INDEX IF NOT EXISTS idx_renovaciones_servex_id ON renovaciones(servex_id);
CREATE INDEX IF NOT EXISTS idx_renovaciones_username ON renovaciones(servex_username);
CREATE INDEX IF NOT EXISTS idx_renovaciones_email ON renovaciones(cliente_email);
CREATE INDEX IF NOT EXISTS idx_renovaciones_estado ON renovaciones(estado);
CREATE INDEX IF NOT EXISTS idx_renovaciones_mp_payment ON renovaciones(mp_payment_id);
