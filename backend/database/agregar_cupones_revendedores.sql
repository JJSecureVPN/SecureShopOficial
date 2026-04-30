-- Agregar soporte para cupones en pagos de revendedores
ALTER TABLE pagos_revendedores ADD COLUMN cupon_id INTEGER REFERENCES cupones(id);
ALTER TABLE pagos_revendedores ADD COLUMN descuento_aplicado REAL DEFAULT 0;