-- Tabla para planes de revendedores
CREATE TABLE IF NOT EXISTS planes_revendedores (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  precio REAL NOT NULL,
  max_users INTEGER NOT NULL, -- Límite de usuarios o créditos
  account_type TEXT NOT NULL CHECK(account_type IN ('validity', 'credit')),
  dias INTEGER, -- Solo para cuentas de validez
  activo INTEGER DEFAULT 1,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Tabla para pagos de revendedores
CREATE TABLE IF NOT EXISTS pagos_revendedores (
  id TEXT PRIMARY KEY,
  plan_revendedor_id INTEGER NOT NULL,
  monto REAL NOT NULL,
  estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
  metodo_pago TEXT NOT NULL,
  cliente_email TEXT NOT NULL,
  cliente_nombre TEXT NOT NULL,
  mp_payment_id TEXT,
  mp_preference_id TEXT,
  servex_revendedor_id INTEGER,
  servex_username TEXT,
  servex_password TEXT,
  servex_max_users INTEGER,
  servex_account_type TEXT,
  servex_expiracion TEXT,
  fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
  servex_duracion_dias INTEGER DEFAULT 0,
  FOREIGN KEY (plan_revendedor_id) REFERENCES planes_revendedores(id)
);

-- Índices para mejorar rendimiento
CREATE INDEX IF NOT EXISTS idx_pagos_revendedores_email ON pagos_revendedores(cliente_email);
CREATE INDEX IF NOT EXISTS idx_pagos_revendedores_estado ON pagos_revendedores(estado);
CREATE INDEX IF NOT EXISTS idx_pagos_revendedores_mp_payment ON pagos_revendedores(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_planes_revendedores_activo ON planes_revendedores(activo);

-- Insertar planes de ejemplo
-- Planes de CRÉDITOS (1-11) - Máxima flexibilidad (1 crédito = 30 días)
INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('5 créditos (1 mes)', 'Plan con 5 créditos - 1 mes de validez', 16000, 5, 'credit', NULL);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('10 créditos (2 meses)', 'Plan con 10 créditos - 2 meses de validez', 26500, 10, 'credit', NULL);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('20 créditos (3 meses)', 'Plan con 20 créditos - 3 meses de validez', 48000, 20, 'credit', NULL);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('30 créditos (4 meses)', 'Plan con 30 créditos - 4 meses de validez', 68000, 30, 'credit', NULL);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('40 créditos (5 meses)', 'Plan con 40 créditos - 5 meses de validez', 85000, 40, 'credit', NULL);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('50 créditos (5 meses)', 'Plan con 50 créditos - 5 meses de validez', 100000, 50, 'credit', NULL);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('60 créditos (5 meses)', 'Plan con 60 créditos - 5 meses de validez', 112000, 60, 'credit', NULL);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('80 créditos (5 meses)', 'Plan con 80 créditos - 5 meses de validez', 138000, 80, 'credit', NULL);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('100 créditos (5 meses)', 'Plan con 100 créditos - 5 meses de validez', 146000, 100, 'credit', NULL);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('150 créditos (5 meses)', 'Plan con 150 créditos - 5 meses de validez', 200000, 150, 'credit', NULL);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('200 créditos (5 meses)', 'Plan con 200 créditos - 5 meses de validez', 250000, 200, 'credit', NULL);

-- Planes de VALIDEZ / USUARIOS SIMULTÁNEOS (12-19) - Control total sobre usuarios (30 días de validez)
INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('5 Usuarios (30 días)', 'Plan con 5 usuarios simultáneos - 30 días de validez', 13500, 5, 'validity', 30);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('10 Usuarios (30 días)', 'Plan con 10 usuarios simultáneos - 30 días de validez', 24000, 10, 'validity', 30);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('20 Usuarios (30 días)', 'Plan con 20 usuarios simultáneos - 30 días de validez', 42500, 20, 'validity', 30);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('30 Usuarios (30 días)', 'Plan con 30 usuarios simultáneos - 30 días de validez', 56000, 30, 'validity', 30);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('45 Usuarios (30 días)', 'Plan con 45 usuarios simultáneos - 30 días de validez', 74000, 45, 'validity', 30);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('60 Usuarios (30 días)', 'Plan con 60 usuarios simultáneos - 30 días de validez', 93000, 60, 'validity', 30);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('75 Usuarios (30 días)', 'Plan con 75 usuarios simultáneos - 30 días de validez', 106000, 75, 'validity', 30);

INSERT INTO planes_revendedores (nombre, descripcion, precio, max_users, account_type, dias) 
VALUES ('90 Usuarios (30 días)', 'Plan con 90 usuarios simultáneos - 30 días de validez', 120000, 90, 'validity', 30);
