-- Tabla para gestionar demostraciones con bloqueo por IP y email (SQLite)
CREATE TABLE IF NOT EXISTS demos (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  email_normalized TEXT NOT NULL,
  ip_address TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  servex_username TEXT,
  servex_password TEXT,
  estado TEXT DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'generado', 'enviado', 'expirado', 'cancelado')),
  created_at TEXT DEFAULT (datetime('now')),
  enviado_at TEXT,
  expires_at TEXT GENERATED ALWAYS AS (datetime(created_at, '+48 hours')) STORED
);

-- Crear índices para búsquedas rápidas
CREATE INDEX IF NOT EXISTS idx_demos_email ON demos(email);
CREATE INDEX IF NOT EXISTS idx_demos_email_normalized ON demos(email_normalized);
CREATE INDEX IF NOT EXISTS idx_demos_ip ON demos(ip_address);
CREATE INDEX IF NOT EXISTS idx_demos_expires ON demos(expires_at);
CREATE INDEX IF NOT EXISTS idx_demos_estado ON demos(estado);

