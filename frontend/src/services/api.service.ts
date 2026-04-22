import axios, { AxiosInstance } from "axios";
import {
  Plan,
  PlanRevendedor,
  Pago,
  CompraRequest,
  CompraRevendedorRequest,
  CompraResponse,
  ApiResponse,
  Usuario,
  Cupon,
  NoticiaConfig,
  RenovacionClienteRequest,
  RenovacionRevendedorRequest,
  RenovacionResponse,
  Donacion,
  Sponsor,
  CrearSponsorPayload,
  ActualizarSponsorPayload,
} from "../types";

export interface ValidacionCupon {
  valido: boolean;
  descuento?: number;
  precio_final?: number;
  mensaje?: string;
  cupon?: {
    id: number;
    codigo: string;
    tipo: "porcentaje" | "monto_fijo";
    valor: number;
  };
}

interface CrearCuponPayload {
  codigo: string;
  tipo: "porcentaje" | "monto_fijo";
  valor: number;
  limite_uso?: number;
  fecha_expiracion?: string;
  oculto?: boolean;
  planes_aplicables?: number[];
}

interface CrearDonacionPayload {
  monto: number;
  donanteEmail?: string;
  donanteNombre?: string;
  mensaje?: string;
}

class ApiService {
  private client: AxiosInstance;

  constructor() {
    const baseURL = import.meta.env.VITE_API_URL || "/api";

    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Interceptor para logging y manejo de errores
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response;
          // Mensajes por defecto según el código de estado
          const mensajesEstandar: { [key: number]: string } = {
            429: "Demasiadas solicitudes. Por favor espera antes de intentar nuevamente.",
            500: "Error interno en el servidor. Por favor intenta más tarde.",
            400: "Solicitud inválida. Por favor verifica los datos.",
            404: "El recurso solicitado no existe.",
            401: "No autorizado. Por favor inicia sesión.",
            403: "Acceso denegado.",
          };

          // Prioridad: 
          // 1. Mensaje específico del servidor (data.error o data.message)
          // 2. Mensaje estándar basado en el status
          // 3. El mensaje crudo del error de axios
          const mensajeError =
            data?.error || 
            data?.message || 
            mensajesEstandar[status] || 
            error.message;

          console.error(`[API Error ${status}]`, mensajeError);
          error.mensaje = mensajeError;
        } else if (error.request) {
          console.error(
            "[API Error] No hay respuesta del servidor:",
            error.message
          );
          error.mensaje =
            "No hay conexión con el servidor. Verifica tu conexión a internet.";
        } else {
          console.error("[API Error]", error.message);
          error.mensaje = error.message;
        }
        throw error;
      }
    );
  }

  /**
   * Obtiene la lista de planes disponibles
   * @param forceReload Si es true, fuerza el cache bust
   * @param context Determina si la lista se usa para compra o renovaciones
   */
  async obtenerPlanes(
    forceReload: boolean = false,
    context: "compra" | "renovacion" = "compra"
  ): Promise<Plan[]> {
    const params: Record<string, any> = {};
    if (forceReload) {
      params._t = Date.now();
    }
    if (context === "renovacion") {
      params.context = "renovacion";
    }

    const response = await this.client.get<ApiResponse<Plan[]>>("/planes", {
      params,
    });
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo planes");
    }
    return response.data.data || [];
  }

  /**
   * Inicia el proceso de compra
   */
  async comprarPlan(data: CompraRequest): Promise<CompraResponse> {
    const response = await this.client.post<ApiResponse<CompraResponse>>(
      "/comprar",
      data
    );
    if (!response.data.success) {
      throw new Error(response.data.error || "Error procesando compra");
    }
    return response.data.data!;
  }

  /**
   * Procesa la renovación de un cliente y devuelve el link de pago generado
   */
  async procesarRenovacionCliente(
    data: RenovacionClienteRequest
  ): Promise<RenovacionResponse> {
    const response = await this.client.post<RenovacionResponse>(
      "/renovacion/cliente",
      data
    );
    return response.data;
  }

  /**
   * Procesa la renovación de un revendedor y devuelve el link de pago generado
   */
  async procesarRenovacionRevendedor(
    data: RenovacionRevendedorRequest
  ): Promise<RenovacionResponse> {
    const response = await this.client.post<RenovacionResponse>(
      "/renovacion/revendedor",
      data
    );
    return response.data;
  }

  /**
   * Obtiene información de un pago
   */
  async obtenerPago(pagoId: string): Promise<Pago> {
    const response = await this.client.get<ApiResponse<Pago>>(
      `/pago/${pagoId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo pago");
    }
    return response.data.data!;
  }

  /**
   * Obtiene la lista de planes de revendedores disponibles
   * @param forceReload Si es true, se añade un query param `_t` con timestamp para evitar caches intermedios/304
   * @param context Determina si la lista se usará para compra (default) o renovación
   */
  async obtenerPlanesRevendedores(
    forceReload: boolean = false,
    context: "compra" | "renovacion" = "compra"
  ): Promise<PlanRevendedor[]> {
    const params: Record<string, any> = {};
    if (forceReload) {
      params._t = Date.now();
    }
    if (context === "renovacion") {
      params.context = "renovacion";
    }
    const response = await this.client.get<ApiResponse<PlanRevendedor[]>>(
      "/planes-revendedores",
      { params }
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error obteniendo planes de revendedores"
      );
    }
    return response.data.data || [];
  }

  /**
   * Inicia el proceso de compra de plan de revendedor
   */
  async comprarPlanRevendedor(
    data: CompraRevendedorRequest
  ): Promise<CompraResponse> {
    const response = await this.client.post<ApiResponse<CompraResponse>>(
      "/comprar-revendedor",
      data
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error procesando compra de revendedor"
      );
    }
    return response.data.data!;
  }

  /**
   * Crea una donación y devuelve el link/preferencia de pago
   */
  async crearDonacion(
    payload: CrearDonacionPayload
  ): Promise<{ donacion: Donacion; linkPago: string; preferenceId: string }> {
    const response = await this.client.post<
      ApiResponse<{ donacion: Donacion; linkPago: string; preferenceId: string }>
    >("/donaciones", payload);

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error creando donación");
    }

    return response.data.data;
  }

  /**
   * Obtiene una donación y fuerza la verificación de estado
   */
  async obtenerDonacion(id: string): Promise<Donacion> {
    const response = await this.client.get<ApiResponse<Donacion>>(
      `/donaciones/${id}`
    );

    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Donación no encontrada");
    }

    return response.data.data;
  }

  /**
   * Obtiene información de un pago de revendedor
   */
  async obtenerPagoRevendedor(pagoId: string): Promise<Pago> {
    const response = await this.client.get<ApiResponse<Pago>>(
      `/pago-revendedor/${pagoId}`
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error obteniendo pago de revendedor"
      );
    }
    return response.data.data!;
  }

  /**
   * Obtiene los últimos usuarios creados
   */
  async obtenerUltimosUsuarios(limit: number = 10): Promise<Usuario[]> {
    const response = await this.client.get<ApiResponse<Usuario[]>>(
      `/clients?limit=${limit}`
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error obteniendo últimos usuarios"
      );
    }
    return response.data.data || [];
  }

  /**
   * Obtiene la configuración del hero para revendedores
   */
  async obtenerConfigHeroRevendedores(): Promise<any> {
    const response = await this.client.get<any>("/config/hero-revendedores");

    // El backend puede devolver dos formatos:
    // 1) { success: true, data: { ... } }
    // 2) { titulo: ..., descripcion: ..., promocion: { ... } }
    const body = response.data;

    // Caso 1: envoltorio ApiResponse
    if (typeof body === "object" && body !== null && "success" in body) {
      if (!body.success) {
        throw new Error(
          body.error || "Error obteniendo configuración del hero"
        );
      }
      return body.data || {};
    }

    // Caso 2: respuesta directa con las propiedades del hero
    if (
      typeof body === "object" &&
      body !== null &&
      ("titulo" in body || "promocion" in body)
    ) {
      return body;
    }

    // En caso inesperado, devolver objeto vacío
    return {};
  }

  /**
   * Obtiene la configuración del hero para planes normales
   */
  async obtenerConfigHero(): Promise<any> {
    const response = await this.client.get<any>("/config/hero");

    // El backend puede devolver dos formatos
    const body = response.data;

    // Caso 1: envoltorio ApiResponse
    if (typeof body === "object" && body !== null && "success" in body) {
      if (!body.success) {
        throw new Error(
          body.error || "Error obteniendo configuración del hero"
        );
      }
      return body.data || {};
    }

    // Caso 2: respuesta directa
    if (typeof body === "object" && body !== null && "data" in body) {
      return body.data || {};
    }

    // Caso 3: respuesta directa con las propiedades del hero
    if (
      typeof body === "object" &&
      body !== null &&
      ("titulo" in body || "promocion" in body)
    ) {
      return body;
    }

    return {};
  }

  /**
   * Guarda la configuración del hero (incluida la promoción)
   */
  async guardarConfigHero(heroConfig: any, tipo: "planes" | "revendedores" = "planes"): Promise<void> {
    const endpoint = tipo === "planes" ? "/config/hero" : "/config/hero-revendedores";
    const response = await this.client.post<ApiResponse>(endpoint, heroConfig);
    if (!response.data.success) {
      throw new Error(response.data.error || "Error guardando configuración del hero");
    }
  }

  /**
   * Solicita una demostración gratuita
   * Requiere usuario logueado y tiene límite de 2 demos por cuenta
   */
  async solicitarDemo(nombre: string, email: string, userId: string): Promise<any> {
    try {
      const response = await this.client.post<ApiResponse<any>>("/demo", {
        nombre,
        email,
        user_id: userId
      });
      return response.data;
    } catch (error: any) {
      // Capturar respuesta 401 (requiere login)
      if (error.response?.status === 401 && error.response?.data) {
        return error.response.data;
      }
      // Capturar respuesta 429 (bloqueado o límite alcanzado)
      if (error.response?.status === 429 && error.response?.data) {
        return error.response.data;
      }

      // Para otros errores, retornar con mensaje amigable
      return {
        success: false,
        error: error.mensaje || error.message || "Error al solicitar demo",
      };
    }
  }

  /**
   * Consulta cuántas demos tiene disponibles un usuario
   */
  async obtenerDemosDisponibles(userId: string): Promise<{
    demos_usadas: number;
    demos_maximas: number;
    demos_disponibles: number;
    puede_solicitar: boolean;
  } | null> {
    try {
      const response = await this.client.get<ApiResponse<any>>(`/demo/disponibles/${userId}`);
      if (response.data.success) {
        return response.data.data;
      }
      return null;
    } catch (error) {
      console.error("Error obteniendo demos disponibles:", error);
      return null;
    }
  }

  /**
   * Obtiene la configuración de MercadoPago
   */
  async obtenerConfigMercadoPago(): Promise<{ publicKey: string }> {
    const response = await this.client.get<{
      success: boolean;
      publicKey: string;
      error?: string;
    }>("/config/mercadopago");

    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error obteniendo configuración de MercadoPago"
      );
    }
    return { publicKey: response.data.publicKey };
  }

  /**
   * Valida un cupón de descuento
   */
  async validarCupon(codigo: string, planId?: number, precioPlan?: number, clienteEmail?: string): Promise<ValidacionCupon> {
    try {
      const response = await this.client.post<{
        success: boolean;
        data?: any;
        error?: string;
      }>("/cupones/validar", {
        codigo: codigo.trim().toUpperCase(),
        planId,
        precioPlan,
        clienteEmail,
      });

      if (!response.data.success) {
        return {
          valido: false,
          mensaje: response.data.error || "Error validando cupón",
        };
      }

      // El backend devuelve success: true cuando el cupón es válido
      // Mapear la respuesta del backend a la interfaz ValidacionCupon
      const data = response.data.data;
      if (data && data.cupon) {
        return {
          valido: true,
          descuento: data.descuento,
          precio_final: data.precio_final,
          cupon: data.cupon,
        };
      } else {
        return {
          valido: false,
          mensaje: "Respuesta inválida del servidor",
        };
      }
    } catch (error: any) {
      console.error("[ApiService] Error validando cupón:", error);
      return {
        valido: false,
        mensaje: error.mensaje || "Error de conexión. Intenta nuevamente.",
      };
    }
  }

  /**
   * Aplica un cupón a una compra (se llama automáticamente en el backend)
   */
  async aplicarCupon(cuponId: number): Promise<boolean> {
    try {
      const response = await this.client.post<{
        success: boolean;
        error?: string;
      }>("/cupones/aplicar", {
        cuponId,
      });

      return response.data.success;
    } catch (error: any) {
      console.error("[ApiService] Error aplicando cupón:", error);
      return false;
    }
  }

  /**
   * Lista todos los cupones disponibles (admin)
   */
  async listarCupones(): Promise<Cupon[]> {
    const response = await this.client.get<ApiResponse<Cupon[]>>("/cupones");
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo cupones");
    }
    return response.data.data || [];
  }

  /**
   * Crea un cupón nuevo
   */
  async crearCupon(payload: CrearCuponPayload): Promise<Cupon> {
    const response = await this.client.post<ApiResponse<Cupon>>(
      "/cupones",
      payload
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error creando cupón");
    }
    return response.data.data;
  }

  /**
   * Desactiva un cupón existente
   */
  async desactivarCupon(cuponId: number): Promise<void> {
    const response = await this.client.delete<ApiResponse>(
      `/cupones/${cuponId}`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || "Error desactivando cupón");
    }
  }

  /**
   * Elimina permanentemente un cupón (solo si nunca se usó)
   */
  async eliminarCupon(cuponId: number): Promise<void> {
    const response = await this.client.delete<ApiResponse>(
      `/cupones/${cuponId}/eliminar`
    );
    if (!response.data.success) {
      throw new Error(response.data.error || "Error eliminando cupón");
    }
  }

  /**
   * Obtiene la configuración de noticias
   */
  async obtenerNoticiasConfig(): Promise<NoticiaConfig | null> {
    const response = await this.client.get<ApiResponse<NoticiaConfig | null>>(
      "/config/noticias"
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error obteniendo configuración de noticias"
      );
    }
    return response.data.data ?? null;
  }

  /**
   * Guarda la configuración de noticias
   */
  async guardarNoticiasConfig(config: NoticiaConfig): Promise<void> {
    const response = await this.client.post<ApiResponse>(
      "/config/noticias",
      config
    );
    if (!response.data.success) {
      throw new Error(
        response.data.error || "Error guardando configuración de noticias"
      );
    }
  }

  /**
   * Obtiene el estado actual de la promoción global
   */
  async obtenerPromoStatus(): Promise<any> {
    const response = await this.client.get<any>(
      "/config/promo-status"
    );
    if (response.status !== 200) {
      throw new Error(
        response.data?.error || "Error obteniendo estado de promoción"
      );
    }
    return response.data.promo_config || response.data.data || {
      activa: false,
      activada_en: null,
      duracion_horas: 12,
      auto_desactivar: true,
    };
  }

  /**
   * Obtiene el estado actual de la promoción global para revendedores
   */
  async obtenerPromoStatusRevendedores(): Promise<any> {
    const response = await this.client.get<any>(
      "/config/promo-status-revendedores"
    );
    if (response.status !== 200) {
      throw new Error(
        response.data?.error || "Error obteniendo estado de promoción"
      );
    }
    return response.data.promo_config || response.data.data || {
      activa: false,
      activada_en: null,
      duracion_horas: 12,
      auto_desactivar: true,
    };
  }

  /**
   * Activa la promoción global por una duración específica
   */
  async activarPromo(
    duracion_horas: number,
    tipo: "planes" | "revendedores" = "planes",
    descuento_porcentaje: number = 20,
    solo_nuevos: boolean = false,
    solo_renovaciones: boolean = false
  ): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(
      "/config/activar-promo",
      { duracion_horas, tipo, descuento_porcentaje, solo_nuevos, solo_renovaciones }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || "Error activando promoción");
    }
    return response.data.data || response.data;
  }

  /**
   * Desactiva la promoción global inmediatamente
   */
  async desactivarPromo(tipo: "planes" | "revendedores" = "planes"): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>(
      "/config/desactivar-promo",
      { tipo }
    );
    if (!response.data.success) {
      throw new Error(response.data.error || "Error desactivando promoción");
    }
    return response.data.data || response.data;
  }

  /**
   * Activa la oferta 2x1 para planes VPN
   */
  async activar2x1(duracion_horas?: number, auto_desactivar?: boolean): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>("/config/activar-2x1", {
      duracion_horas,
      auto_desactivar
    });
    if (!response.data.success) {
      throw new Error(response.data.error || "Error activando oferta 2x1");
    }
    return response.data;
  }

  /**
   * Desactiva la oferta 2x1 para planes VPN
   */
  async desactivar2x1(): Promise<any> {
    const response = await this.client.post<ApiResponse<any>>("/config/desactivar-2x1");
    if (!response.data.success) {
      throw new Error(response.data.error || "Error desactivando oferta 2x1");
    }
    return response.data;
  }

  async obtenerSponsors(): Promise<Sponsor[]> {
    const response = await this.client.get<ApiResponse<Sponsor[]>>(
      "/sponsors"
    );
    if (!response.data.success) {
      throw new Error(response.data.error || "Error obteniendo sponsors");
    }
    return response.data.data || [];
  }

  async crearSponsor(payload: CrearSponsorPayload): Promise<Sponsor> {
    const response = await this.client.post<ApiResponse<Sponsor>>(
      "/sponsors",
      payload
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error creando sponsor");
    }
    return response.data.data;
  }

  async actualizarSponsor(
    id: number,
    payload: ActualizarSponsorPayload
  ): Promise<Sponsor> {
    const response = await this.client.put<ApiResponse<Sponsor>>(
      `/sponsors/${id}`,
      payload
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error actualizando sponsor");
    }
    return response.data.data;
  }

  async eliminarSponsor(id: number): Promise<void> {
    const response = await this.client.delete(`/sponsors/${id}`);
    if (response.status !== 204) {
      throw new Error("Error eliminando sponsor");
    }
  }

  // ============================================
  // ESTADO DE CUENTA (Servex)
  // ============================================

  /**
   * Obtiene el estado actual de una cuenta desde Servex
   * Incluye días restantes, conexiones, etc.
   */
  async obtenerEstadoCuenta(username: string): Promise<EstadoCuenta> {
    const response = await this.client.get<ApiResponse<EstadoCuenta>>(
      `/clients/estado/${encodeURIComponent(username)}`
    );
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || "Error obteniendo estado de cuenta");
    }
    return response.data.data;
  }

  /**
   * Forza una resincronización de la cuenta en Servex (Auto-reparación)
   */
  async repararConexion(username: string): Promise<ApiResponse<any>> {
    const response = await this.client.post<ApiResponse<any>>(
      `/clients/reparar/${encodeURIComponent(username)}`
    );
    return response.data;
  }
}

// Tipo para el estado de cuenta
export interface EstadoCuenta {
  username: string;
  tipo: 'cliente' | 'revendedor';
  estado: 'activo' | 'por_expirar' | 'expirado';
  activo: boolean;
  diasRestantes: number;
  fechaExpiracion: string | null;
  // Para clientes
  conexionesMaximas?: number;
  online?: boolean;
  // Para revendedores
  tipoRevendedor?: 'credit' | 'validity'; // Tipo de cuenta de revendedor
  maxUsuarios?: number; // Para cuentas de validez
  usuariosActuales?: number; // Para cuentas de validez
  creditos?: number; // Para cuentas de crédito
  // Fechas
  fechaCreacion?: string;
  ultimaConexion?: string;
}

// ============================================
// TIPOS PARA REFERIDOS
// ============================================

export interface ReferralSettings {
  activo: boolean;
  porcentaje_recompensa: number;
  porcentaje_descuento_referido: number;
  mensaje_promocional: string;
}

export interface ReferralStats {
  referral_code: string;
  total_referrals: number;
  total_earned: number;
  saldo_actual: number;
  referidos: Array<{
    id: string;
    referred_email?: string;
    referred_nombre?: string;
    purchase_amount: number;
    reward_amount: number;
    status: string;
    created_at: string;
  }>;
}

export interface SaldoTransaccion {
  id: string;
  tipo: string;
  monto: number;
  saldo_anterior: number;
  saldo_nuevo: number;
  descripcion: string | null;
  created_at: string;
}

export interface ValidacionCodigoReferido {
  valido: boolean;
  referrer_id?: string;
  descuento?: number;
  mensaje?: string;
}

export const apiService = new ApiService();

// ============================================
// SERVICIO DE REFERIDOS (separado para claridad)
// ============================================

class ReferidosApiService {
  private client = apiService['client']; // Reutilizar el cliente axios

  /**
   * Obtiene la configuración pública del programa de referidos
   */
  async getSettings(): Promise<ReferralSettings> {
    const response = await this.client.get('/referidos/settings');
    return response.data;
  }

  /**
   * Valida un código de referido
   */
  async validarCodigo(codigo: string, email?: string): Promise<ValidacionCodigoReferido> {
    const params = email ? { email } : {};
    const response = await this.client.get(`/referidos/validar/${codigo}`, { params });
    return response.data;
  }

  /**
   * Obtiene el saldo de un usuario por email
   */
  async getSaldoByEmail(email: string): Promise<{ userId: string | null; saldo: number }> {
    const response = await this.client.get(`/referidos/saldo/${encodeURIComponent(email)}`);
    return response.data;
  }

  /**
   * Obtiene estadísticas de referidos de un usuario
   */
  async getStats(userId: string): Promise<ReferralStats> {
    const response = await this.client.get(`/referidos/stats/${userId}`);
    return response.data;
  }

  /**
   * Obtiene el historial de transacciones de saldo
   */
  async getTransacciones(userId: string, limit = 50): Promise<SaldoTransaccion[]> {
    const response = await this.client.get(`/referidos/transacciones/${userId}`, {
      params: { limit }
    });
    return response.data;
  }

  // ============================================
  // MÉTODOS ADMIN
  // ============================================

  /**
   * Obtiene configuración completa (admin)
   */
  async getAdminSettings(): Promise<any> {
    const response = await this.client.get('/referidos/admin/settings');
    return response.data;
  }

  /**
   * Actualiza configuración del programa (admin)
   */
  async updateSettings(settings: Partial<ReferralSettings>): Promise<{ success: boolean }> {
    const response = await this.client.put('/referidos/admin/settings', settings);
    return response.data;
  }

  /**
   * Obtiene todos los usuarios con saldo (admin)
   */
  async getUsuariosConSaldo(limit = 100): Promise<any[]> {
    const response = await this.client.get('/referidos/admin/usuarios-saldo', { params: { limit } });
    return response.data;
  }

  /**
   * Obtiene todos los referidos del sistema (admin)
   */
  async getAllReferidos(limit = 100): Promise<any[]> {
    const response = await this.client.get('/referidos/admin/all', { params: { limit } });
    return response.data;
  }

  /**
   * Ajusta el saldo de un usuario manualmente (admin)
   */
  async ajustarSaldo(email: string, monto: number, descripcion: string): Promise<{
    success: boolean;
    nuevo_saldo?: number;
    mensaje: string;
  }> {
    const response = await this.client.post('/referidos/admin/ajustar-saldo', {
      email,
      monto,
      descripcion
    });
    return response.data;
  }
}

export const referidosService = new ReferidosApiService();
