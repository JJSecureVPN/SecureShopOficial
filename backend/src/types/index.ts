// ============================================
// TIPOS PARA CUPONES
// ============================================

export interface InformacionCupon {
  codigo: string;
  tipo: 'porcentaje' | 'fijo';
  valor: number;
  descuentoAplicado: number;
  montoOriginal: number;
  montoFinal: number;
}

// ============================================
// TIPOS PARA REFERIDOS
// ============================================

export interface InformacionReferido {
  codigoUsado: string;
  referidorEmail: string;
  porcentajeDescuento: number;
  descuentoAplicado: number;
  comisionReferidor: number;
  saldoUsado?: number;
  metodoPago: 'mercadopago' | 'saldo' | 'mixto';
}

// ============================================
// TIPOS PARA PLANES
// ============================================

export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  dias: number;
  connection_limit: number;
  activo: boolean;
  fecha_creacion?: Date;
}

export interface CrearPlanInput {
  nombre: string;
  descripcion?: string;
  precio: number;
  dias: number;
  connection_limit: number;
  activo?: boolean;
}

// ============================================
// TIPOS PARA PLANES DE REVENDEDORES
// ============================================

export interface PlanRevendedor {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  max_users: number; // Límite de usuarios o créditos
  account_type: 'validity' | 'credit'; // Tipo de cuenta
  dias?: number; // Solo para cuentas de validez
  activo: boolean;
  fecha_creacion?: Date;
}

export interface CrearPlanRevendedorInput {
  nombre: string;
  descripcion?: string;
  precio: number;
  max_users: number;
  account_type: 'validity' | 'credit';
  dias?: number;
  activo?: boolean;
}

export interface PlanRevendedorRow {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  max_users: number;
  account_type: string;
  dias: number | null;
  activo: number;
  fecha_creacion: string;
}

// ============================================
// TIPOS PARA PAGOS
// ============================================

export interface Pago {
  id: string;
  plan_id: number;
  monto: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  metodo_pago: string;
  cliente_email: string;
  cliente_nombre: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  servex_cuenta_id?: number;
  servex_username?: string;
  servex_password?: string;
  servex_categoria?: string;
  servex_expiracion?: string;
  servex_connection_limit?: number;
  cupon_id?: number;
  descuento_aplicado?: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface CrearPagoInput {
  planId: number;
  clienteEmail: string;
  clienteNombre: string;
  codigoCupon?: string;
  // Nuevos campos para referidos y saldo
  codigoReferido?: string;
  saldoUsado?: number;
}

export interface Donacion {
  id: string;
  monto: number;
  estado: "pendiente" | "aprobado" | "rechazado" | "cancelado";
  metodo_pago: string;
  donante_email?: string;
  donante_nombre?: string;
  mensaje?: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  agradecimiento_enviado: boolean;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface CrearDonacionInput {
  monto: number;
  donanteEmail?: string;
  donanteNombre?: string;
  mensaje?: string;
}

// ============================================
// TIPOS PARA SPONSORS
// ============================================

export type SponsorCategory = "empresa" | "persona";

export interface Sponsor {
  id: number;
  name: string;
  category: SponsorCategory;
  role: string;
  message: string;
  avatarInitials: string;
  avatarClass: string;
  avatarUrl?: string;
  highlight: boolean;
  link?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SponsorRow {
  id: number;
  nombre: string;
  categoria: string;
  rol: string;
  mensaje: string;
  avatar_initials: string;
  avatar_class: string;
  avatar_url: string | null;
  destacado: number;
  link: string | null;
  orden: number;
  creado_en: string;
  actualizado_en: string;
}

export interface SponsorInput {
  name: string;
  category: SponsorCategory;
  role: string;
  message: string;
  avatarInitials: string;
  avatarClass: string;
  avatarUrl?: string;
  highlight?: boolean;
  link?: string;
  order?: number;
}

export type CrearSponsorInput = SponsorInput;

export type ActualizarSponsorInput = SponsorInput;

export interface PagoRevendedor {
  id: string;
  plan_revendedor_id: number;
  monto: number;
  estado: 'pendiente' | 'aprobado' | 'rechazado' | 'cancelado';
  metodo_pago: string;
  cliente_email: string;
  cliente_nombre: string;
  mp_payment_id?: string;
  mp_preference_id?: string;
  servex_revendedor_id?: number;
  servex_username?: string;
  servex_password?: string;
  servex_max_users?: number;
  servex_account_type?: string;
  servex_expiracion?: string;
  cupon_id?: number;
  descuento_aplicado?: number;
  fecha_creacion: Date;
  fecha_actualizacion: Date;
}

export interface CrearPagoRevendedorInput {
  planRevendedorId: number;
  clienteEmail: string;
  clienteNombre: string;
  codigoCupon?: string;
  maxUsers?: number; // Nueva opción para cantidades personalizadas
}

export interface PagoRevendedorRow {
  id: string;
  plan_revendedor_id: number;
  monto: number;
  estado: string;
  metodo_pago: string;
  cliente_email: string;
  cliente_nombre: string;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  servex_revendedor_id: number | null;
  servex_username: string | null;
  servex_password: string | null;
  servex_max_users: number | null;
  servex_account_type: string | null;
  servex_expiracion: string | null;
  cupon_id: number | null;
  descuento_aplicado: number | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

// ============================================
// TIPOS PARA SERVEX API
// ============================================

export interface ServexApiConfig {
  apiKey: string;
  baseUrl: string;
  timeout: number;
  pollIntervalMs: number;
  pollMaxBackoffMs: number;
  pollClientsLimit: number;
}

export interface ClienteServex {
  username: string;
  password: string;
  category_id: number;
  connection_limit: number;
  duration: number;
  type: 'user' | 'test';
  observation?: string;
  v2ray_uuid?: string;
}

export interface ClienteCreado {
  id: number;
  username: string;
  password: string;
  category_id: number;
  connection_limit: number;
  expiration_date: string;
  type: string;
  status: string;
  observation?: string;
  v2ray_uuid?: string;
  created_at: string;
  updated_at?: string;
  owner_id?: number;
  owner_type?: string;
}

export interface ServexClienteResponse {
  message: string;
  client: ClienteCreado;
}

export interface CategoriaServex {
  id: number;
  name: string;
  description?: string;
  admin_id?: number;
  limiter_active: boolean;
  valid_until?: string; // Fecha de expiración en formato ISO (YYYY-MM-DDTHH:mm:ss.sssZ)
  is_expired?: boolean; // Indica si la categoría está expirada (calculado en el cliente)
}

export interface RevendedorServex {
  name: string;
  username: string;
  password: string;
  max_users: number; // Límite de usuarios o créditos
  account_type: 'validity' | 'credit';
  category_ids: number[]; // IDs de categorías permitidas
  expiration_date?: string; // Solo para cuentas de validez (YYYY-MM-DD)
  obs?: string;
}

export interface RevendedorCreado {
  id: number;
  name: string;
  username: string;
  max_users: number;
  account_type: string;
  expiration_date?: string;
  category_ids: number[];
  status: string;
  created_at: string;
  updated_at?: string;
  obs?: string;
}

export interface ServexRevendedorResponse {
  message: string;
  reseller: RevendedorCreado;
}

// ============================================
// TIPOS PARA MERCADOPAGO
// ============================================

export interface MercadoPagoConfig {
  accessToken: string;
  publicKey: string;
  webhookUrl: string;
  frontendUrl: string;
}

export interface PreferenciaMercadoPago {
  items: Array<{
    title: string;
    unit_price: number;
    quantity: number;
    currency_id: string;
  }>;
  payer: {
    email: string;
    name: string;
  };
  external_reference: string;
  back_urls: {
    success: string;
    failure: string;
    pending: string;
  };
  auto_return: 'approved' | 'all';
  notification_url: string;
}

export interface WebhookMercadoPago {
  type: string;
  data: {
    id: string;
  };
}

export interface PagoMercadoPago {
  id: string;
  status: 'pending' | 'approved' | 'in_process' | 'rejected' | 'cancelled';
  external_reference: string;
  transaction_amount: number;
  payment_method_id: string;
  payer: {
    email: string;
    first_name: string;
    last_name: string;
  };
}

// ============================================
// TIPOS PARA RESPUESTAS API
// ============================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  meta?: Record<string, any>;
}

// ============================================
// TIPOS PARA LA BASE DE DATOS
// ============================================

export interface PagoRow {
  id: string;
  plan_id: number;
  monto: number;
  estado: string;
  metodo_pago: string;
  cliente_email: string;
  cliente_nombre: string;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  servex_cuenta_id: number | null;
  servex_username: string | null;
  servex_password: string | null;
  servex_categoria: string | null;
  servex_expiracion: string | null;
  servex_connection_limit: number | null;
  cupon_id: number | null;
  descuento_aplicado: number | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface DonacionRow {
  id: string;
  monto: number;
  estado: string;
  metodo_pago: string;
  donante_email: string | null;
  donante_nombre: string | null;
  mensaje: string | null;
  mp_payment_id: string | null;
  mp_preference_id: string | null;
  agradecimiento_enviado: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface PlanRow {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  dias: number;
  connection_limit: number;
  activo: number;
  fecha_creacion: string;
}

// ============================================
// TIPOS PARA CONFIGURACIÓN
// ============================================

export interface AppConfig {
  port: number;
  nodeEnv: string;
  servex: ServexApiConfig;
  mercadopago: MercadoPagoConfig;
  database: {
    path: string;
  };
  cors: {
    origin: string;
  };
  rateLimit: {
    windowMs: number;
    max: number;
  };
  demo: {
    maxPerIp: number;
    maxPerEmail: number;
    windowHours: number;
  };
  turnstile: {
    secretKey: string;
  };
  logLevel: string;
  renovaciones: RenovacionAutoRetryConfig;
}

export interface RenovacionAutoRetryConfig {
  enabled: boolean;
  intervalMs: number;
  initialDelayMs: number;
  minPendingAgeMinutes: number;
  batchSize: number;
  maxAttempts?: number;
}

// ============================================
// TIPOS PARA CUPONES DE DESCUENTO
// ============================================

export interface Cupon {
  id?: number;
  codigo: string;
  tipo: 'porcentaje' | 'monto_fijo';
  valor: number;
  limite_uso?: number;
  usos_actuales?: number;
  fecha_expiracion?: Date;
  activo?: boolean;
  oculto?: boolean;
  planes_aplicables?: number[];
  creado_en?: Date;
  actualizado_en?: Date;
}

export interface CuponRow {
  id: number;
  codigo: string;
  tipo: 'porcentaje' | 'monto_fijo';
  valor: number;
  limite_uso: number | null;
  usos_actuales: number;
  fecha_expiracion: string | null;
  activo: number;
  oculto: number;
  planes_aplicables: string | null;
  creado_en: string;
  actualizado_en: string;
}

export interface CrearCuponInput {
  codigo: string;
  tipo: 'porcentaje' | 'monto_fijo';
  valor: number;
  limite_uso?: number;
  fecha_expiracion?: Date;
  oculto?: boolean;
  planes_aplicables?: number[];
  activo?: boolean;
}

export interface ValidacionCupon {
  valido: boolean;
  descuento?: number;
  tipo_descuento?: 'porcentaje' | 'monto_fijo';
  mensaje_error?: string;
  cupon?: Cupon;
}

// ============================================
// TIPOS PARA SALDO Y REFERIDOS
// ============================================

export interface SaldoTransaccion {
  id: string;
  user_id: string;
  tipo: 'referido' | 'compra' | 'ajuste_admin' | 'bonus' | 'reembolso';
  monto: number;
  saldo_anterior: number;
  saldo_nuevo: number;
  descripcion: string | null;
  referencia_id: string | null;
  created_at: Date;
}

export interface Referido {
  id: string;
  referrer_id: string;
  referred_id: string;
  referral_code: string;
  purchase_id: string | null;
  purchase_amount: number;
  reward_amount: number;
  reward_percentage: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: Date;
  completed_at: Date | null;
  referred_email?: string;
  referred_nombre?: string;
}

export interface ReferralSettings {
  id: number;
  porcentaje_recompensa: number;
  porcentaje_descuento_referido: number;
  min_compra_requerida: number;
  activo: boolean;
  solo_primera_compra: boolean;
  max_recompensa_por_referido: number | null;
  mensaje_promocional: string;
  updated_at: Date;
}

export interface ReferralStats {
  total_referrals: number;
  total_earned: number;
  saldo_actual: number;
  referral_code: string;
  referidos: Referido[];
}

export interface ProcesarReferidoInput {
  referral_code: string;
  referred_user_id: string;
  purchase_id: string;
  purchase_amount: number;
}

export interface AcreditarSaldoInput {
  user_id: string;
  monto: number;
  tipo: 'referido' | 'compra' | 'ajuste_admin' | 'bonus' | 'reembolso';
  descripcion?: string;
  referencia_id?: string;
}
