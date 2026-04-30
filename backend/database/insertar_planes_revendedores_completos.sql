-- Limpiar planes antiguos (si existen más de 4, probablemente hay duplicados)
-- IMPORTANTE: Esto es solo para limpiar el ambiente inicial
-- DELETE FROM planes_revendedores WHERE id > 4;

-- Planes de CRÉDITOS (1-11) - Máxima flexibilidad (1 crédito = 30 días)
-- ID 1-5 y luego 6-11

-- Actualizar o crear Plan 1: 5 créditos (1 mes)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (1, '5 créditos (1 mes)', 'Plan con 5 créditos - 1 mes de validez', 16000, 5, 'credit', 1, CURRENT_TIMESTAMP);

-- Plan 2: 10 créditos (2 meses)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (2, '10 créditos (2 meses)', 'Plan con 10 créditos - 2 meses de validez', 26500, 10, 'credit', 1, CURRENT_TIMESTAMP);

-- Plan 3: 20 créditos (3 meses)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (3, '20 créditos (3 meses)', 'Plan con 20 créditos - 3 meses de validez', 48000, 20, 'credit', 1, CURRENT_TIMESTAMP);

-- Plan 4: 30 créditos (4 meses) - Actualizar el Plan 4 existente
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (4, '30 créditos (4 meses)', 'Plan con 30 créditos - 4 meses de validez', 68000, 30, 'credit', 1, CURRENT_TIMESTAMP);

-- Plan 5: 40 créditos (5 meses)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (5, '40 créditos (5 meses)', 'Plan con 40 créditos - 5 meses de validez', 85000, 40, 'credit', 1, CURRENT_TIMESTAMP);

-- Plan 6: 50 créditos (5 meses) - Actualizar el Plan 3 existente
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (6, '50 créditos (5 meses)', 'Plan con 50 créditos - 5 meses de validez', 100000, 50, 'credit', 1, CURRENT_TIMESTAMP);

-- Plan 7: 60 créditos (5 meses)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (7, '60 créditos (5 meses)', 'Plan con 60 créditos - 5 meses de validez', 112000, 60, 'credit', 1, CURRENT_TIMESTAMP);

-- Plan 8: 80 créditos (5 meses)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (8, '80 créditos (5 meses)', 'Plan con 80 créditos - 5 meses de validez', 138000, 80, 'credit', 1, CURRENT_TIMESTAMP);

-- Plan 9: 100 créditos (5 meses)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (9, '100 créditos (5 meses)', 'Plan con 100 créditos - 5 meses de validez', 146000, 100, 'credit', 1, CURRENT_TIMESTAMP);

-- Plan 10: 150 créditos (5 meses)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (10, '150 créditos (5 meses)', 'Plan con 150 créditos - 5 meses de validez', 200000, 150, 'credit', 1, CURRENT_TIMESTAMP);

-- Plan 11: 200 créditos (5 meses)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, activo, fecha_creacion)
VALUES (11, '200 créditos (5 meses)', 'Plan con 200 créditos - 5 meses de validez', 250000, 200, 'credit', 1, CURRENT_TIMESTAMP);

-- Planes de VALIDEZ / USUARIOS SIMULTÁNEOS (12-19) - Control total sobre usuarios (30 días de validez)

-- Plan 12: 5 Usuarios (30 días)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, dias, activo, fecha_creacion)
VALUES (12, '5 Usuarios (30 días)', 'Plan con 5 usuarios simultáneos - 30 días de validez', 13500, 5, 'validity', 30, 1, CURRENT_TIMESTAMP);

-- Plan 13: 10 Usuarios (30 días)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, dias, activo, fecha_creacion)
VALUES (13, '10 Usuarios (30 días)', 'Plan con 10 usuarios simultáneos - 30 días de validez', 24000, 10, 'validity', 30, 1, CURRENT_TIMESTAMP);

-- Plan 14: 20 Usuarios (30 días)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, dias, activo, fecha_creacion)
VALUES (14, '20 Usuarios (30 días)', 'Plan con 20 usuarios simultáneos - 30 días de validez', 42500, 20, 'validity', 30, 1, CURRENT_TIMESTAMP);

-- Plan 15: 30 Usuarios (30 días)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, dias, activo, fecha_creacion)
VALUES (15, '30 Usuarios (30 días)', 'Plan con 30 usuarios simultáneos - 30 días de validez', 56000, 30, 'validity', 30, 1, CURRENT_TIMESTAMP);

-- Plan 16: 45 Usuarios (30 días)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, dias, activo, fecha_creacion)
VALUES (16, '45 Usuarios (30 días)', 'Plan con 45 usuarios simultáneos - 30 días de validez', 74000, 45, 'validity', 30, 1, CURRENT_TIMESTAMP);

-- Plan 17: 60 Usuarios (30 días)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, dias, activo, fecha_creacion)
VALUES (17, '60 Usuarios (30 días)', 'Plan con 60 usuarios simultáneos - 30 días de validez', 93000, 60, 'validity', 30, 1, CURRENT_TIMESTAMP);

-- Plan 18: 75 Usuarios (30 días)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, dias, activo, fecha_creacion)
VALUES (18, '75 Usuarios (30 días)', 'Plan con 75 usuarios simultáneos - 30 días de validez', 106000, 75, 'validity', 30, 1, CURRENT_TIMESTAMP);

-- Plan 19: 90 Usuarios (30 días)
INSERT OR REPLACE INTO planes_revendedores (id, nombre, descripcion, precio, max_users, account_type, dias, activo, fecha_creacion)
VALUES (19, '90 Usuarios (30 días)', 'Plan con 90 usuarios simultáneos - 30 días de validez', 120000, 90, 'validity', 30, 1, CURRENT_TIMESTAMP);

-- Verificar inserciones
SELECT 'Planes de créditos:' as tipo, COUNT(*) as cantidad FROM planes_revendedores WHERE account_type = 'credit';
SELECT 'Planes de validez:' as tipo, COUNT(*) as cantidad FROM planes_revendedores WHERE account_type = 'validity';
SELECT 'Total planes revendedores:' as tipo, COUNT(*) as cantidad FROM planes_revendedores;
