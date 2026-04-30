-- Limpiar planes existentes
DELETE FROM planes;

-- PLANES CORTOS (3-7 días)

-- 3 DÍAS
INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Básico 3D', '1 dispositivo - 3 días', 3, 1500, 1, 1);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Doble 3D', '2 dispositivos - 3 días', 3, 2500, 1, 2);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Triple 3D', '3 dispositivos - 3 días', 3, 3500, 1, 3);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Familiar 3D', '4 dispositivos - 3 días', 3, 4500, 1, 4);

-- 7 DÍAS
INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Básico 7D', '1 dispositivo - 7 días', 7, 3000, 1, 1);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Doble 7D', '2 dispositivos - 7 días', 7, 5000, 1, 2);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Triple 7D', '3 dispositivos - 7 días', 7, 7000, 1, 3);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Familiar 7D', '4 dispositivos - 7 días', 7, 9000, 1, 4);

-- 15 DÍAS
INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Básico 15D', '1 dispositivo - 15 días', 15, 4500, 1, 1);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Doble 15D', '2 dispositivos - 15 días', 15, 7000, 1, 2);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Triple 15D', '3 dispositivos - 15 días', 15, 10000, 1, 3);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Familiar 15D', '4 dispositivos - 15 días', 15, 12000, 1, 4);

-- PLANES MEDIOS (20-25 días)

-- 20 DÍAS
INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Básico 20D', '1 dispositivo - 20 días', 20, 5000, 1, 1);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Doble 20D', '2 dispositivos - 20 días', 20, 8000, 1, 2);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Triple 20D', '3 dispositivos - 20 días', 20, 10500, 1, 3);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Familiar 20D', '4 dispositivos - 20 días', 20, 13000, 1, 4);

-- 25 DÍAS
INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Básico 25D', '1 dispositivo - 25 días', 25, 5500, 1, 1);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Doble 25D', '2 dispositivos - 25 días', 25, 9000, 1, 2);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Triple 25D', '3 dispositivos - 25 días', 25, 11000, 1, 3);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Familiar 25D', '4 dispositivos - 25 días', 25, 13500, 1, 4);

-- PLANES LARGOS (30 días)

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Básico 30D', '1 dispositivo - 30 días', 30, 6000, 1, 1);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Doble 30D', '2 dispositivos - 30 días', 30, 10000, 1, 2);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Triple 30D', '3 dispositivos - 30 días', 30, 12000, 1, 3);

INSERT INTO planes (nombre, descripcion, dias, precio, activo, connection_limit)
VALUES ('Plan Familiar 30D', '4 dispositivos - 30 días', 30, 15000, 1, 4);

