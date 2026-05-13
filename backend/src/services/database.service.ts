import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import {
  Pago,
  PagoRow,
  PagoRevendedor,
  PagoRevendedorRow,
  Donacion,
  DonacionRow,
  Sponsor,
  SponsorRow,
  CrearSponsorInput,
  ActualizarSponsorInput,
} from "../types";

export class DatabaseService {
  private db: Database.Database;

  constructor(dbPath: string) {
    // Crear directorio si no existe
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    // Desactivar FOREIGN KEYS ya que los planes ahora están en Supabase, no en SQLite local
    this.db.pragma("foreign_keys = OFF");
    this.inicializarTablas();
  }

  /**
   * Retorna la instancia de better-sqlite3 para uso en servicios que la requieran
   */
  getDatabase(): Database.Database {
    return this.db;
  }

  private inicializarTablas(): void {

    // Tabla de pagos
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pagos (
        id TEXT PRIMARY KEY,
        plan_id INTEGER NOT NULL,
        monto REAL NOT NULL,
        estado TEXT NOT NULL DEFAULT 'pendiente',
        metodo_pago TEXT NOT NULL DEFAULT 'mercadopago',
        cliente_email TEXT NOT NULL,
        cliente_nombre TEXT NOT NULL,
        mp_payment_id TEXT,
        mp_preference_id TEXT,
        servex_cuenta_id INTEGER,
        servex_username TEXT,
        servex_password TEXT,
        servex_categoria TEXT,
        servex_expiracion TEXT,
        servex_connection_limit INTEGER,
        cupon_id INTEGER,
        descuento_aplicado REAL DEFAULT 0,
        fecha_creacion TEXT NOT NULL DEFAULT (datetime('now')),
        fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (plan_id) REFERENCES planes(id),
        FOREIGN KEY (cupon_id) REFERENCES cupones(id)
      )
    `);

    // Índices para optimizar consultas
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_pagos_estado ON pagos(estado);
      CREATE INDEX IF NOT EXISTS idx_pagos_mp_payment ON pagos(mp_payment_id);
      CREATE INDEX IF NOT EXISTS idx_pagos_email ON pagos(cliente_email);
    `);

    // Agregar columna metadata si no existe (para saldo y referidos)
    try {
      this.db.exec(`ALTER TABLE pagos ADD COLUMN metadata TEXT`);
    } catch {
      // La columna ya existe, ignorar
    }

    // Tabla de donaciones
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS donaciones (
        id TEXT PRIMARY KEY,
        monto REAL NOT NULL,
        estado TEXT NOT NULL DEFAULT 'pendiente',
        metodo_pago TEXT NOT NULL DEFAULT 'mercadopago',
        donante_email TEXT,
        donante_nombre TEXT,
        mensaje TEXT,
        mp_payment_id TEXT,
        mp_preference_id TEXT,
        agradecimiento_enviado INTEGER NOT NULL DEFAULT 0,
        fecha_creacion TEXT NOT NULL DEFAULT (datetime('now')),
        fecha_actualizacion TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_donaciones_estado ON donaciones(estado);
      CREATE INDEX IF NOT EXISTS idx_donaciones_mp_payment ON donaciones(mp_payment_id);
      CREATE INDEX IF NOT EXISTS idx_donaciones_email ON donaciones(donante_email);
    `);

    // Tabla de sponsors
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS sponsors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nombre TEXT NOT NULL,
        categoria TEXT NOT NULL CHECK(categoria IN ('empresa', 'persona')),
        rol TEXT NOT NULL,
        mensaje TEXT NOT NULL,
        avatar_initials TEXT NOT NULL,
        avatar_class TEXT NOT NULL,
  avatar_url TEXT,
        destacado INTEGER NOT NULL DEFAULT 0,
        link TEXT,
        orden INTEGER NOT NULL DEFAULT 0,
        creado_en TEXT NOT NULL DEFAULT (datetime('now')),
        actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sponsors_destacado ON sponsors(destacado);
    `);

    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_sponsors_orden ON sponsors(orden DESC);
    `);

    try {
      this.db.exec(`ALTER TABLE sponsors ADD COLUMN avatar_url TEXT`);
    } catch (error: any) {
      if (!error?.message?.includes("duplicate column name")) {
        throw error;
      }
    }

    // Tabla de cupones de descuento
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS cupones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        codigo VARCHAR(50) UNIQUE NOT NULL,
        tipo TEXT NOT NULL,
        valor DECIMAL(10,2) NOT NULL,
        limite_uso INTEGER DEFAULT NULL,
        usos_actuales INTEGER DEFAULT 0,
        fecha_expiracion DATETIME,
        activo BOOLEAN DEFAULT TRUE,
        planes_aplicables JSON,
        creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        actualizado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Índices para cupones
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_cupones_codigo ON cupones(codigo);
      CREATE INDEX IF NOT EXISTS idx_cupones_activo ON cupones(activo);
      CREATE INDEX IF NOT EXISTS idx_cupones_fecha_expiracion ON cupones(fecha_expiracion);
    `);

    // Tabla para historial de renovaciones y upgrades
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS renovaciones (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tipo TEXT NOT NULL CHECK(tipo IN ('cliente', 'revendedor')),
        servex_id INTEGER NOT NULL,
        servex_username TEXT NOT NULL,
        operacion TEXT NOT NULL CHECK(operacion IN ('renovacion', 'upgrade')),
        dias_agregados INTEGER,
        datos_anteriores TEXT,
        datos_nuevos TEXT,
        monto REAL NOT NULL,
        metodo_pago TEXT NOT NULL,
        cliente_email TEXT NOT NULL,
        cliente_nombre TEXT NOT NULL,
        mp_payment_id TEXT,
        mp_preference_id TEXT,
        estado TEXT NOT NULL CHECK(estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
        servex_procesado INTEGER DEFAULT 0,
        servex_procesado_en DATETIME,
        cupon_id INTEGER,
        descuento_aplicado REAL DEFAULT 0,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        metadata TEXT
      )
    `);

    // Asegurar columnas recientes en renovaciones (compatibilidad hacia atrás)
    try {
      this.db.exec(`ALTER TABLE renovaciones ADD COLUMN metadata TEXT`);
    } catch (error: any) {
      if (!error?.message?.includes('duplicate column name')) {
        throw error;
      }
    }

    // Asegurar columnas recientes en renovaciones (compatibilidad hacia atrás)
    try {
      this.db.exec(`ALTER TABLE renovaciones ADD COLUMN cupon_id INTEGER`);
    } catch (error: any) {
      if (!error?.message?.includes('duplicate column name')) {
        throw error;
      }
    }

    try {
      this.db.exec(`ALTER TABLE renovaciones ADD COLUMN descuento_aplicado REAL DEFAULT 0`);
    } catch (error: any) {
      if (!error?.message?.includes('duplicate column name')) {
        throw error;
      }
    }

    try {
      this.db.exec(`ALTER TABLE renovaciones ADD COLUMN servex_procesado INTEGER DEFAULT 0`);
    } catch (error: any) {
      if (!error?.message?.includes('duplicate column name')) {
        throw error;
      }
    }

    try {
      this.db.exec(`ALTER TABLE renovaciones ADD COLUMN servex_procesado_en DATETIME`);
    } catch (error: any) {
      if (!error?.message?.includes('duplicate column name')) {
        throw error;
      }
    }

    // Índices para renovaciones
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_renovaciones_tipo ON renovaciones(tipo);
      CREATE INDEX IF NOT EXISTS idx_renovaciones_servex_id ON renovaciones(servex_id);
      CREATE INDEX IF NOT EXISTS idx_renovaciones_username ON renovaciones(servex_username);
      CREATE INDEX IF NOT EXISTS idx_renovaciones_email ON renovaciones(cliente_email);
      CREATE INDEX IF NOT EXISTS idx_renovaciones_estado ON renovaciones(estado);
      CREATE INDEX IF NOT EXISTS idx_renovaciones_mp_payment ON renovaciones(mp_payment_id);
    `);


    // Tabla para pagos de revendedores
    this.db.exec(`
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
        cupon_id INTEGER,
        descuento_aplicado REAL DEFAULT 0,
        fecha_creacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        fecha_actualizacion DATETIME DEFAULT CURRENT_TIMESTAMP,
        servex_duracion_dias INTEGER DEFAULT 0
      )
    `);

    // Índices para tablas de revendedores
    this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_pagos_revendedores_email ON pagos_revendedores(cliente_email);
      CREATE INDEX IF NOT EXISTS idx_pagos_revendedores_estado ON pagos_revendedores(estado);
      CREATE INDEX IF NOT EXISTS idx_pagos_revendedores_mp_payment ON pagos_revendedores(mp_payment_id);
      CREATE INDEX IF NOT EXISTS idx_planes_revendedores_activo ON planes_revendedores(activo);
    `);
  }


  // ============================================
  // MÉTODOS PARA PAGOS
  // ============================================

  crearPago(pago: Omit<Pago, "fecha_creacion" | "fecha_actualizacion">): Pago {
    const stmt = this.db.prepare(`
      INSERT INTO pagos (
        id, plan_id, monto, estado, metodo_pago,
        cliente_email, cliente_nombre, mp_payment_id, mp_preference_id,
        cupon_id, descuento_aplicado
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      pago.id,
      pago.plan_id,
      pago.monto,
      pago.estado,
      pago.metodo_pago,
      pago.cliente_email,
      pago.cliente_nombre,
      pago.mp_payment_id || null,
      pago.mp_preference_id || null,
      pago.cupon_id || null,
      pago.descuento_aplicado || 0
    );

    const pagoBuscado = this.obtenerPagoPorId(pago.id);
    if (!pagoBuscado) throw new Error("Error al crear pago");
    return pagoBuscado;
  }

  obtenerPagoPorId(id: string): Pago | null {
    const stmt = this.db.prepare("SELECT * FROM pagos WHERE id = ?");
    const row = stmt.get(id) as PagoRow | undefined;
    return row ? this.mapPagoRowToPago(row) : null;
  }

  obtenerPagoPorMpPaymentId(mpPaymentId: string): Pago | null {
    const stmt = this.db.prepare("SELECT * FROM pagos WHERE mp_payment_id = ?");
    const row = stmt.get(mpPaymentId) as PagoRow | undefined;
    return row ? this.mapPagoRowToPago(row) : null;
  }

  actualizarEstadoPago(
    pagoId: string,
    estado: Pago["estado"],
    mpPaymentId?: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE pagos
      SET estado = ?, mp_payment_id = COALESCE(?, mp_payment_id), fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);
    stmt.run(estado, mpPaymentId || null, pagoId);
  }

  actualizarMetadataPago(pagoId: string, metadata: Record<string, any>): void {
    const stmt = this.db.prepare(`
      UPDATE pagos
      SET metadata = ?, fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);
    stmt.run(JSON.stringify(metadata), pagoId);
  }

  obtenerMetadataPago(pagoId: string): Record<string, any> | null {
    const stmt = this.db.prepare("SELECT metadata FROM pagos WHERE id = ?");
    const row = stmt.get(pagoId) as { metadata: string | null } | undefined;
    if (row?.metadata) {
      try {
        return JSON.parse(row.metadata);
      } catch {
        return null;
      }
    }
    return null;
  }

  guardarCuentaServex(
    pagoId: string,
    cuentaId: number,
    username: string,
    password: string,
    categoria: string,
    expiracion: string,
    connectionLimit: number
  ): void {
    const stmt = this.db.prepare(`
      UPDATE pagos
      SET servex_cuenta_id = ?,
          servex_username = ?,
          servex_password = ?,
          servex_categoria = ?,
          servex_expiracion = ?,
          servex_connection_limit = ?,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);
    stmt.run(
      cuentaId,
      username,
      password,
      categoria,
      expiracion,
      connectionLimit,
      pagoId
    );
  }

  /**
   * Actualiza los datos de una cuenta Servex existente por username
   * Usado cuando se recrea un cliente eliminado
   */
  actualizarCuentaServexPorUsername(
    username: string,
    nuevoCuentaId: number,
    nuevaExpiracion: string,
    connectionLimit: number
  ): void {
    const stmt = this.db.prepare(`
      UPDATE pagos
      SET servex_cuenta_id = ?,
          servex_expiracion = ?,
          servex_connection_limit = ?,
          fecha_actualizacion = datetime('now')
      WHERE LOWER(servex_username) = LOWER(?)
      AND estado = 'aprobado'
    `);
    stmt.run(nuevoCuentaId, nuevaExpiracion, connectionLimit, username);
  }

  /**
   * Actualiza el servex_id de una renovación
   * Usado cuando se recrea un cliente eliminado
   */
  actualizarServexIdRenovacion(renovacionId: number, nuevoServexId: number): void {
    const stmt = this.db.prepare(`
      UPDATE renovaciones
      SET servex_id = ?,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);
    stmt.run(nuevoServexId, renovacionId);
  }

  // ============================================
  // MÉTODOS PARA DONACIONES
  // ============================================

  crearDonacion(data: {
    id: string;
    monto: number;
    estado: Donacion["estado"];
    metodo_pago: string;
    donante_email?: string;
    donante_nombre?: string;
    mensaje?: string;
  }): Donacion {
    const stmt = this.db.prepare(`
      INSERT INTO donaciones (
        id, monto, estado, metodo_pago, donante_email,
        donante_nombre, mensaje
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.id,
      data.monto,
      data.estado,
      data.metodo_pago,
      data.donante_email || null,
      data.donante_nombre || null,
      data.mensaje || null
    );

    const donacion = this.obtenerDonacionPorId(data.id);
    if (!donacion) {
      throw new Error("Error al crear donación");
    }
    return donacion;
  }

  obtenerDonacionPorId(id: string): Donacion | null {
    const stmt = this.db.prepare(`SELECT * FROM donaciones WHERE id = ?`);
    const row = stmt.get(id) as DonacionRow | undefined;
    return row ? this.mapDonacionRowToDonacion(row) : null;
  }

  actualizarEstadoDonacion(
    id: string,
    estado: Donacion["estado"],
    mpPaymentId?: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE donaciones
      SET estado = ?,
          mp_payment_id = COALESCE(?, mp_payment_id),
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);
    stmt.run(estado, mpPaymentId || null, id);
  }

  actualizarPreferenciaDonacion(
    id: string,
    preferenceId: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE donaciones
      SET mp_preference_id = ?,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);
    stmt.run(preferenceId, id);
  }

  marcarAgradecimientoEnviado(id: string): void {
    const stmt = this.db.prepare(`
      UPDATE donaciones
      SET agradecimiento_enviado = 1,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);
    stmt.run(id);
  }

  // ============================================
  // MÉTODOS PARA SPONSORS
  // ============================================

  obtenerSponsors(): Sponsor[] {
    const stmt = this.db.prepare(`
      SELECT *
      FROM sponsors
      ORDER BY destacado DESC, orden DESC, creado_en DESC
    `);
    const rows = stmt.all() as SponsorRow[];
    return rows.map((row) => this.mapSponsorRowToSponsor(row));
  }

  obtenerSponsorPorId(id: number): Sponsor | null {
    const stmt = this.db.prepare(`SELECT * FROM sponsors WHERE id = ?`);
    const row = stmt.get(id) as SponsorRow | undefined;
    return row ? this.mapSponsorRowToSponsor(row) : null;
  }

  crearSponsor(input: CrearSponsorInput): Sponsor {
    const stmt = this.db.prepare(`
      INSERT INTO sponsors (
        nombre,
        categoria,
        rol,
        mensaje,
        avatar_initials,
        avatar_class,
        avatar_url,
        destacado,
        link,
        orden
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const orden = input.order ?? Date.now();

    const result = stmt.run(
      input.name,
      input.category,
      input.role,
      input.message,
      input.avatarInitials,
      input.avatarClass,
      input.avatarUrl || null,
      input.highlight ? 1 : 0,
      input.link || null,
      orden
    );

    const sponsor = this.obtenerSponsorPorId(result.lastInsertRowid as number);
    if (!sponsor) {
      throw new Error("Error al crear sponsor");
    }
    return sponsor;
  }

  actualizarSponsor(
    id: number,
    input: ActualizarSponsorInput
  ): Sponsor | null {
    const existente = this.obtenerSponsorPorId(id);
    if (!existente) {
      return null;
    }

    const stmt = this.db.prepare(`
      UPDATE sponsors
      SET nombre = ?,
          categoria = ?,
          rol = ?,
          mensaje = ?,
          avatar_initials = ?,
          avatar_class = ?,
      avatar_url = ?,
          destacado = ?,
          link = ?,
          orden = ?,
          actualizado_en = datetime('now')
      WHERE id = ?
    `);

    const orden = input.order ?? existente.order;

    stmt.run(
      input.name,
      input.category,
      input.role,
      input.message,
      input.avatarInitials,
      input.avatarClass,
      input.avatarUrl || null,
      input.highlight ? 1 : 0,
      input.link || null,
      orden,
      id
    );

    return this.obtenerSponsorPorId(id);
  }

  eliminarSponsor(id: number): void {
    const stmt = this.db.prepare(`DELETE FROM sponsors WHERE id = ?`);
    stmt.run(id);
  }

  // ============================================
  // MAPPERS
  // ============================================

  private mapSponsorRowToSponsor(row: SponsorRow): Sponsor {
    return {
      id: row.id,
      name: row.nombre,
      category: row.categoria as Sponsor["category"],
      role: row.rol,
      message: row.mensaje,
      avatarInitials: row.avatar_initials,
      avatarClass: row.avatar_class,
  avatarUrl: row.avatar_url || undefined,
      highlight: row.destacado === 1,
      link: row.link || undefined,
      order: row.orden,
      createdAt: new Date(row.creado_en),
      updatedAt: new Date(row.actualizado_en),
    };
  }


  private mapPagoRowToPago(row: PagoRow): Pago {
    return {
      id: row.id,
      plan_id: row.plan_id,
      monto: row.monto,
      estado: row.estado as Pago["estado"],
      metodo_pago: row.metodo_pago,
      cliente_email: row.cliente_email,
      cliente_nombre: row.cliente_nombre,
      mp_payment_id: row.mp_payment_id || undefined,
      mp_preference_id: row.mp_preference_id || undefined,
      servex_cuenta_id: row.servex_cuenta_id || undefined,
      servex_username: row.servex_username || undefined,
      servex_password: row.servex_password || undefined,
      servex_categoria: row.servex_categoria || undefined,
      servex_expiracion: row.servex_expiracion || undefined,
      servex_connection_limit: row.servex_connection_limit || undefined,
      cupon_id: row.cupon_id || undefined,
      descuento_aplicado: row.descuento_aplicado || undefined,
      fecha_creacion: new Date(row.fecha_creacion),
      fecha_actualizacion: new Date(row.fecha_actualizacion),
    };
  }

  private mapDonacionRowToDonacion(row: DonacionRow): Donacion {
    return {
      id: row.id,
      monto: row.monto,
      estado: row.estado as Donacion["estado"],
      metodo_pago: row.metodo_pago,
      donante_email: row.donante_email || undefined,
      donante_nombre: row.donante_nombre || undefined,
      mensaje: row.mensaje || undefined,
      mp_payment_id: row.mp_payment_id || undefined,
      mp_preference_id: row.mp_preference_id || undefined,
      agradecimiento_enviado: row.agradecimiento_enviado === 1,
      fecha_creacion: new Date(row.fecha_creacion),
      fecha_actualizacion: new Date(row.fecha_actualizacion),
    };
  }


  // ============================================
  // PAGOS DE REVENDEDORES
  // ============================================

  crearPagoRevendedor(data: {
    id: string;
    plan_revendedor_id: number;
    monto: number;
    estado: string;
    metodo_pago: string;
    cliente_email: string;
    cliente_nombre: string;
    cupon_id?: number;
    descuento_aplicado?: number;
    servex_max_users?: number;
    servex_account_type?: string;
  }): PagoRevendedor {
    const stmt = this.db.prepare(`
      INSERT INTO pagos_revendedores 
      (id, plan_revendedor_id, monto, estado, metodo_pago, cliente_email, cliente_nombre, cupon_id, descuento_aplicado, servex_max_users, servex_account_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      data.id,
      data.plan_revendedor_id,
      data.monto,
      data.estado,
      data.metodo_pago,
      data.cliente_email,
      data.cliente_nombre,
      data.cupon_id || null,
      data.descuento_aplicado || 0,
      data.servex_max_users || null,
      data.servex_account_type || null
    );

    const pago = this.obtenerPagoRevendedorPorId(data.id);
    if (!pago) {
      throw new Error("Error al crear el pago de revendedor");
    }

    return pago;
  }

  obtenerPagoRevendedorPorId(id: string): PagoRevendedor | null {
    const stmt = this.db.prepare(
      "SELECT * FROM pagos_revendedores WHERE id = ?"
    );
    const row = stmt.get(id) as PagoRevendedorRow | undefined;
    return row ? this.mapRowToPagoRevendedor(row) : null;
  }

  actualizarEstadoPagoRevendedor(
    id: string,
    estado: string,
    mpPaymentId?: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE pagos_revendedores 
      SET estado = ?, 
          mp_payment_id = COALESCE(?, mp_payment_id),
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(estado, mpPaymentId || null, id);
  }

  guardarRevendedorServex(
    pagoId: string,
    revendedorId: number,
    username: string,
    password: string,
    maxUsers: number,
    accountType: string,
    expiracion?: string,
    duracionDias?: number
  ): void {
    const stmt = this.db.prepare(`
      UPDATE pagos_revendedores 
      SET servex_revendedor_id = ?,
          servex_username = ?,
          servex_password = ?,
          servex_max_users = ?,
          servex_account_type = ?,
          servex_expiracion = ?,
          servex_duracion_dias = ?,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(
      revendedorId,
      username,
      password,
      maxUsers,
      accountType,
      expiracion || null,
      duracionDias || null,
      pagoId
    );
  }

  actualizarDatosRevendedorPorServexId(options: {
    servexId: number;
    maxUsers?: number;
    expiracion?: string | null;
    accountType?: string;
  }): void {
    const { servexId, maxUsers, expiracion, accountType } = options;

    const stmt = this.db.prepare(`
      UPDATE pagos_revendedores
      SET servex_max_users = CASE WHEN ? IS NOT NULL THEN ? ELSE servex_max_users END,
          servex_expiracion = CASE WHEN ? IS NOT NULL THEN ? ELSE servex_expiracion END,
          servex_account_type = CASE WHEN ? IS NOT NULL THEN ? ELSE servex_account_type END,
          fecha_actualizacion = datetime('now')
      WHERE servex_revendedor_id = ?
    `);

    stmt.run(
      maxUsers !== undefined ? maxUsers : null,
      maxUsers !== undefined ? maxUsers : null,
      expiracion !== undefined ? expiracion : null,
      expiracion !== undefined ? expiracion : null,
      accountType !== undefined ? accountType : null,
      accountType !== undefined ? accountType : null,
      servexId
    );
  }

  /**
   * Actualiza el servex_revendedor_id de un revendedor por su username
   * Usado para reparar registros con ID = 0 o null
   */
  actualizarServexIdRevendedor(username: string, nuevoServexId: number): void {
    const stmt = this.db.prepare(`
      UPDATE pagos_revendedores
      SET servex_revendedor_id = ?,
          fecha_actualizacion = datetime('now')
      WHERE LOWER(servex_username) = LOWER(?)
    `);

    const result = stmt.run(nuevoServexId, username);
    console.log(`[Database] ✅ ID de revendedor actualizado: ${username} -> ${nuevoServexId} (${result.changes} filas afectadas)`);
  }

  // ============================================
  // MAPPERS PARA REVENDEDORES
  // ============================================


  private mapRowToPagoRevendedor(row: PagoRevendedorRow): PagoRevendedor {
    return {
      id: row.id,
      plan_revendedor_id: row.plan_revendedor_id,
      monto: row.monto,
      estado: row.estado as PagoRevendedor["estado"],
      metodo_pago: row.metodo_pago,
      cliente_email: row.cliente_email,
      cliente_nombre: row.cliente_nombre,
      mp_payment_id: row.mp_payment_id || undefined,
      mp_preference_id: row.mp_preference_id || undefined,
      servex_revendedor_id: row.servex_revendedor_id || undefined,
      servex_username: row.servex_username || undefined,
      servex_password: row.servex_password || undefined,
      servex_max_users: row.servex_max_users || undefined,
      servex_account_type: row.servex_account_type || undefined,
      servex_expiracion: row.servex_expiracion || undefined,
      cupon_id: row.cupon_id || undefined,
      descuento_aplicado: row.descuento_aplicado || undefined,
      fecha_creacion: new Date(row.fecha_creacion),
      fecha_actualizacion: new Date(row.fecha_actualizacion),
    };
  }

  // ============================================
  // RENOVACIONES
  // ============================================

  /**
   * Busca un cliente por username
   */
  buscarClientePorUsername(username: string): any | null {
    const stmt = this.db.prepare(`
      SELECT * FROM pagos 
      WHERE LOWER(servex_username) = LOWER(?)
      AND estado = 'aprobado'
      ORDER BY fecha_creacion DESC
      LIMIT 1
    `);
    return stmt.get(username);
  }

  /**
   * Busca un revendedor por username
   */
  buscarRevendedorPorUsername(username: string): any | null {
    const stmt = this.db.prepare(`
      SELECT * FROM pagos_revendedores 
      WHERE LOWER(servex_username) = LOWER(?)
      AND estado = 'aprobado'
      ORDER BY fecha_creacion DESC
      LIMIT 1
    `);
    return stmt.get(username);
  }

  /**
   * Crea un registro de renovación
   */
  crearRenovacion(data: {
    tipo: "cliente" | "revendedor";
    servex_id: number;
    servex_username: string;
    operacion: "renovacion" | "upgrade" | "expansion";
    dias_agregados?: number;
    datos_anteriores?: string;
    datos_nuevos?: string;
    monto: number;
    metodo_pago: string;
    cliente_email: string;
    cliente_nombre: string;
    estado: string;
    cupon_id?: number | null;
    descuento_aplicado?: number;
    metadata?: string | null;
  }): any {
    const stmt = this.db.prepare(`
      INSERT INTO renovaciones (
        tipo, servex_id, servex_username, operacion,
        dias_agregados, datos_anteriores, datos_nuevos,
        monto, metodo_pago, cliente_email, cliente_nombre, estado,
        cupon_id, descuento_aplicado, metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const result = stmt.run(
      data.tipo,
      data.servex_id,
      data.servex_username,
      data.operacion,
      data.dias_agregados || null,
      data.datos_anteriores || null,
      data.datos_nuevos || null,
      data.monto,
      data.metodo_pago,
      data.cliente_email,
      data.cliente_nombre,
      data.estado,
      data.cupon_id ?? null,
      data.descuento_aplicado ?? 0,
      data.metadata || null
    );

    return this.obtenerRenovacionPorId(result.lastInsertRowid as number);
  }

  /**
   * Obtiene una renovación por ID
   */
  obtenerRenovacionPorId(id: number): any | null {
    const stmt = this.db.prepare("SELECT * FROM renovaciones WHERE id = ?");
    return stmt.get(id);
  }

  /**
   * Busca renovaciones por email del cliente
   */
  buscarRenovacionesPorEmail(email: string): any[] {
    const stmt = this.db.prepare(`
      SELECT * FROM renovaciones 
      WHERE cliente_email LIKE ? 
      ORDER BY fecha_creacion DESC 
      LIMIT 50
    `);
    return stmt.all(`%${email}%`);
  }

  /**
   * Actualiza el estado de una renovación
   */
  actualizarEstadoRenovacion(
    id: number,
    estado: string,
    mpPaymentId?: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE renovaciones 
      SET estado = ?,
          mp_payment_id = ?,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(estado, mpPaymentId || null, id);
  }

  marcarRenovacionProcesadaEnServex(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE renovaciones
      SET servex_procesado = 1,
          servex_procesado_en = datetime('now'),
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(id);
  }

  /**
   * Guarda información adicional de la renovación después de procesarla
   */
  guardarInfoRenovacion(
    id: string,
    datosAnteriores: string,
    datosNuevos: string
  ): void {
    const stmt = this.db.prepare(`
      UPDATE renovaciones 
      SET datos_anteriores = ?,
          datos_nuevos = ?,
          fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(datosAnteriores, datosNuevos, id);
  }

  obtenerRenovacionesPendientes(options: {
    updatedBeforeMinutes?: number;
    limit?: number;
  } = {}): any[] {
    const updatedBeforeMinutes = Math.max(0, options.updatedBeforeMinutes ?? 5);
    const limit = Math.max(1, options.limit ?? 10);

    const stmt = this.db.prepare(`
      SELECT *
      FROM renovaciones
      WHERE estado = 'pendiente'
        AND datetime(COALESCE(fecha_actualizacion, fecha_creacion)) <= datetime('now', ?)
      ORDER BY fecha_actualizacion ASC
      LIMIT ?
    `);

    return stmt.all(`-${updatedBeforeMinutes} minutes`, limit);
  }

  refrescarTimestampRenovacion(id: number): void {
    const stmt = this.db.prepare(`
      UPDATE renovaciones
      SET fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);

    stmt.run(id);
  }

  actualizarMetadataRenovacion(id: number, metadata: Record<string, any>): void {
    const stmt = this.db.prepare(`
      UPDATE renovaciones
      SET metadata = ?, fecha_actualizacion = datetime('now')
      WHERE id = ?
    `);
    stmt.run(JSON.stringify(metadata), id);
  }

  obtenerMetadataRenovacion(id: number): Record<string, any> | null {
    const stmt = this.db.prepare("SELECT metadata FROM renovaciones WHERE id = ?");
    const row = stmt.get(id) as { metadata: string | null } | undefined;
    if (row?.metadata) {
      try {
        return JSON.parse(row.metadata);
      } catch {
        return null;
      }
    }
    return null;
  }

  // ============================================
  // UTILIDADES
  // ============================================

  close(): void {
    this.db.close();
  }

  // ============================================
  // MÉTODOS ADMIN
  // ============================================

  /**
   * Buscar pagos por email del cliente
   */
  buscarPagosPorEmail(email: string): Pago[] {
    const stmt = this.db.prepare(`
      SELECT * FROM pagos 
      WHERE cliente_email LIKE ?
      ORDER BY fecha_creacion DESC
      LIMIT 50
    `);
    const rows = stmt.all(`%${email}%`) as PagoRow[];
    return rows.map((row) => this.mapPagoRowToPago(row));
  }

  /**
   * Obtener últimos pagos pendientes
   */
  obtenerPagosPendientes(limite: number = 20): Pago[] {
    const stmt = this.db.prepare(`
      SELECT * FROM pagos 
      WHERE estado = 'pendiente'
      ORDER BY fecha_creacion DESC
      LIMIT ?
    `);
    const rows = stmt.all(limite) as PagoRow[];
    return rows.map((row) => this.mapPagoRowToPago(row));
  }
}
