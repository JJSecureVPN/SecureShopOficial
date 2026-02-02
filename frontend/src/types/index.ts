export interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  dias: number;
  connection_limit: number;
  activo?: boolean;
  avatarUrl?: string;
  fecha_creacion?: string;
  popular?: boolean;
}

export interface PlanRevendedor {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  max_users: number;
  account_type: "validity" | "credit";
  dias?: number;
  activo?: boolean;
  avatarUrl?: string;
  fecha_creacion?: string;
  popular?: boolean;
}

export interface Pago {
  id: string;
  plan_id: number;
  monto: number;
  estado: "pendiente" | "aprobado" | "rechazado" | "cancelado";
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
  servex_creditos?: number;
  fecha_creacion: string;
  fecha_actualizacion: string;
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
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface CompraRequest {
  planId: number;
  clienteEmail: string;
  clienteNombre: string;
  codigoCupon?: string;
  // Nuevos campos para referidos y saldo
  codigoReferido?: string;
  saldoUsado?: number;
  // Campos para pago automático
  esAutomatico?: boolean;
  frecuenciaAutomatica?: 'mensual' | 'trimestral' | 'anual';
}

export interface CompraRevendedorRequest {
  planRevendedorId: number;
  clienteEmail: string;
  clienteNombre: string;
  codigoCupon?: string;
}

export interface CompraResponse {
  pago: Pago;
  linkPago: string;
  preferenceId: string;
  // Nuevos campos para pago con saldo
  pagoConSaldoCompleto?: boolean;
  saldoUsado?: number;
  descuentoAplicado?: number;
  codigoReferidoUsado?: string;
  // Datos de la cuenta VPN (solo si se pagó con saldo completo)
  cuentaVPN?: {
    username: string;
    password: string;
    expiracion: string;
    categoria: string;
  };
}

export interface Usuario {
  id: number;
  username: string;
  category_id: number;
  connection_limit: number;
  duration: number;
  type: "user" | "test";
  observation?: string;
  v2ray_uuid?: string;
  owner_id?: number;
  created_at: string;
  expires_at: string;
  status: "active" | "expired" | "suspended";
}

export interface Cupon {
  id: number;
  codigo: string;
  tipo: "porcentaje" | "monto_fijo";
  valor: number;
  limite_uso?: number | null;
  usos_actuales?: number;
  fecha_expiracion?: string | null;
  activo: boolean;
  oculto?: boolean;
  planes_aplicables?: number[];
  creado_en?: string;
  actualizado_en?: string;
}

export interface NoticiaConfig {
  enabled: boolean;
  version: string;
  ultima_actualizacion: string;
  aviso: {
    habilitado: boolean;
    texto: string;
    bgColor?: string;
    textColor?: string;
    subtitulo?: string;
    variant?: string;
    icon?: string;
  };
  _instrucciones?: Record<string, string>;
}

// ============================================
// TIPOS PARA SISTEMA DE NOTICIAS (Supabase)
// ============================================

export interface NoticiaCategoria {
  id: string;
  nombre: string;
  slug: string;
  descripcion?: string;
  color: string;
  icono: string;
  orden: number;
  activo: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoticiaImagen {
  id: string;
  noticia_id: string;
  imagen_url: string;
  imagen_alt?: string;
  orden: number;
  created_at: string;
}

export interface NoticiaStats {
  id: string;
  noticia_id: string;
  vistas: number;
  clics: number;
  compartidas: number;
  updated_at: string;
}

export interface NoticiaComentario {
  id: string;
  noticia_id: string;
  nombre: string;
  email?: string;
  contenido: string;
  user_id?: string;
  aprobado?: boolean;
  created_at: string;
}

export interface CrearNoticiaComentario {
  nombre: string;
  email?: string;
  contenido: string;
  user_id?: string;
}

export interface Noticia {
  id: string;
  titulo: string;
  descripcion: string;
  contenido_completo?: string;
  categoria_id: string;
  imagen_url?: string;
  imagen_alt?: string;
  estado: 'borrador' | 'publicada' | 'archivada' | 'pausada';
  visible_para: 'todos' | 'clientes' | 'admin';
  fecha_publicacion?: string;
  fecha_expiracion?: string;
  mostrar_desde?: string;
  mostrar_hasta?: string;
  prioridad: number;
  destacada: boolean;
  allow_comentarios: boolean;
  creado_por?: string;
  actualizado_por?: string;
  created_at: string;
  updated_at: string;
  // Relaciones
  categoria?: NoticiaCategoria;
  imagenes?: NoticiaImagen[];
  stats?: NoticiaStats;
  // Campos de vista
  categoria_nombre?: string;
  categoria_slug?: string;
  categoria_color?: string;
  categoria_icono?: string;
  total_vistas?: number;
  total_clics?: number;
  total_compartidas?: number;
}

export interface CrearNoticia {
  titulo: string;
  descripcion: string;
  contenido_completo?: string;
  categoria_id: string;
  imagen_url?: string;
  imagen_alt?: string;
  estado?: 'borrador' | 'publicada' | 'archivada' | 'pausada';
  visible_para?: 'todos' | 'clientes' | 'admin';
  fecha_publicacion?: string;
  fecha_expiracion?: string;
  mostrar_desde?: string;
  mostrar_hasta?: string;
  prioridad?: number;
  destacada?: boolean;
  allow_comentarios?: boolean;
}

export interface ActualizarNoticia extends Partial<CrearNoticia> {
  id: string;
}

export interface RenovacionClienteRequest {
  busqueda: string;
  dias: number;
  precio?: number;
  clienteEmail: string;
  clienteNombre: string;
  nuevoConnectionLimit?: number;
  precioOriginal?: number;
  codigoCupon?: string;
  cuponId?: number;
  descuentoAplicado?: number;
  planId?: number;
}

export interface RenovacionRevendedorRequest {
  busqueda: string;
  dias: number;
  clienteEmail: string;
  clienteNombre: string;
  tipoRenovacion?: "validity" | "credit";
  cantidadSeleccionada?: number;
  precio?: number;
  precioOriginal?: number;
  codigoCupon?: string;
  cuponId?: number;
  descuentoAplicado?: number;
  planId?: number;
}

export interface RenovacionResponse {
  renovacion: {
    id: number;
    tipo: "cliente" | "revendedor";
    servex_username: string;
    dias_agregados: number;
    monto: number;
    operacion: string;
    datos_nuevos?: string | null;
    cupon_id?: number | null;
    descuento_aplicado?: number | null;
    [key: string]: any;
  };
  linkPago: string;
  descuentoAplicado?: number;
  cuponAplicado?: {
    id?: number;
    codigo: string;
    tipo: "porcentaje" | "monto_fijo";
    valor: number;
  } | null;
}

export type SponsorCategory = "empresa" | "persona";

export interface Sponsor {
  id: number;
  name: string;
  role: string;
  message: string;
  highlight: boolean;
  link?: string;
  avatarInitials: string;
  avatarClass: string;
  avatarUrl?: string;
  order: number;
  category: SponsorCategory;
  createdAt: string;
  updatedAt: string;
}

export interface CrearSponsorPayload {
  name: string;
  role: string;
  message: string;
  highlight?: boolean;
  link?: string;
  avatarInitials: string;
  avatarClass: string;
  avatarUrl?: string;
  order?: number;
  category: SponsorCategory;
}

export type ActualizarSponsorPayload = Partial<CrearSponsorPayload>;

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
  created_at: string;
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
  created_at: string;
  completed_at: string | null;
  // Datos del referido (join)
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
  updated_at: string;
}

export interface ReferralStats {
  total_referrals: number;
  total_earned: number;
  saldo_actual: number;
  referral_code: string;
  referidos: Referido[];
}

export interface UsarSaldoRequest {
  monto: number;
}
