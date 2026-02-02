import { createClient, SupabaseClient } from "@supabase/supabase-js";

// ============================================
// TIPOS PARA PLANES EN SUPABASE
// ============================================

export interface PlanVPN {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  precio_promo: number | null;
  dispositivos: number;
  dias: number;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface PlanRevendedor {
  id: number;
  nombre: string;
  descripcion: string | null;
  precio: number;
  precio_promo: number | null;
  max_users: number;
  account_type: "credit" | "validity";
  dias: number | null;
  activo: boolean;
  orden: number;
  created_at: string;
  updated_at: string;
}

export interface PromocionesConfig {
  id: string;
  // VPN
  vpn_activa: boolean;
  vpn_descuento_porcentaje: number;
  vpn_texto: string;
  vpn_activada_en: string | null;
  vpn_duracion_horas: number;
  vpn_auto_desactivar: boolean;
  // Revendedores
  revendedor_activa: boolean;
  revendedor_descuento_porcentaje: number;
  revendedor_texto: string;
  revendedor_activada_en: string | null;
  revendedor_duracion_horas: number;
  revendedor_auto_desactivar: boolean;
  revendedor_solo_nuevos: boolean;
  revendedor_solo_renovaciones: boolean;
  // Meta
  updated_at: string;
}

// ============================================
// SERVICIO DE PLANES CON SUPABASE
// ============================================

class PlanesSupabaseService {
  private client: SupabaseClient | null = null;
  private enabled: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const url = process.env.SUPABASE_URL;
    const serviceKey = process.env.SUPABASE_SERVICE_KEY;

    if (url && serviceKey) {
      this.client = createClient(url, serviceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      this.enabled = true;
      console.log("[PlanesSupabase] ✅ Servicio inicializado");
    } else {
      console.error("[PlanesSupabase] ❌ SUPABASE_URL o SUPABASE_SERVICE_KEY no configurados");
    }
  }

  isEnabled(): boolean {
    return this.enabled && this.client !== null;
  }

  getClient(): SupabaseClient | null {
    return this.client;
  }

  // ============================================
  // PLANES VPN
  // ============================================

  /**
   * Obtiene todos los planes VPN activos
   */
  async obtenerPlanesVPN(): Promise<PlanVPN[]> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("planes_vpn")
      .select("*")
      .eq("activo", true)
      .order("orden", { ascending: true })
      .order("dias", { ascending: true })
      .order("dispositivos", { ascending: true });

    if (error) {
      console.error("[PlanesSupabase] Error al obtener planes VPN:", error);
      throw new Error(`Error al obtener planes VPN: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene un plan VPN por ID
   */
  async obtenerPlanVPN(id: number): Promise<PlanVPN | null> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("planes_vpn")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[PlanesSupabase] Error al obtener plan VPN:", error);
      throw new Error(`Error al obtener plan VPN: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtiene un plan VPN por ID CON precio efectivo (promociones aplicadas)
   */
  async obtenerPlanVPNConPrecio(id: number): Promise<(PlanVPN & { precio_efectivo: number; en_promocion: boolean; precio_original: number }) | null> {
    const [plan, config] = await Promise.all([
      this.obtenerPlanVPN(id),
      this.obtenerPromocionesConfig(),
    ]);

    if (!plan) return null;

    const precioOriginal = Number(plan.precio);
    let precioEfectivo = precioOriginal;
    let enPromocion = false;

    if (config?.vpn_activa) {
      if (plan.precio_promo) {
        precioEfectivo = Number(plan.precio_promo);
      } else {
        const descuento = config.vpn_descuento_porcentaje / 100;
        precioEfectivo = Math.round(precioOriginal * (1 - descuento));
      }
      enPromocion = true;
    }

    console.log(`[PlanesSupabase] Plan ${id}: precio_original=${precioOriginal}, precio_efectivo=${precioEfectivo}, en_promocion=${enPromocion}`);

    return {
      ...plan,
      precio: precioEfectivo, // ⚡ Sobrescribimos con precio efectivo
      precio_original: precioOriginal,
      precio_efectivo: precioEfectivo,
      en_promocion: enPromocion,
    };
  }

  /**
   * Actualiza un plan VPN
   */
  async actualizarPlanVPN(
    id: number,
    updates: Partial<Omit<PlanVPN, "id" | "created_at" | "updated_at">>
  ): Promise<PlanVPN> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("planes_vpn")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[PlanesSupabase] Error al actualizar plan VPN:", error);
      throw new Error(`Error al actualizar plan VPN: ${error.message}`);
    }

    console.log(`[PlanesSupabase] Plan VPN ${id} actualizado:`, updates);
    return data;
  }

  /**
   * Crea un nuevo plan VPN
   */
  async crearPlanVPN(
    plan: Omit<PlanVPN, "created_at" | "updated_at">
  ): Promise<PlanVPN> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("planes_vpn")
      .insert(plan)
      .select()
      .single();

    if (error) {
      console.error("[PlanesSupabase] Error al crear plan VPN:", error);
      throw new Error(`Error al crear plan VPN: ${error.message}`);
    }

    console.log(`[PlanesSupabase] Plan VPN creado:`, data);
    return data;
  }

  // ============================================
  // PLANES REVENDEDORES
  // ============================================

  /**
   * Obtiene todos los planes de revendedores activos
   */
  async obtenerPlanesRevendedor(): Promise<PlanRevendedor[]> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("planes_revendedores")
      .select("*")
      .eq("activo", true)
      .order("account_type", { ascending: true })
      .order("max_users", { ascending: true });

    if (error) {
      console.error("[PlanesSupabase] Error al obtener planes revendedor:", error);
      throw new Error(`Error al obtener planes revendedor: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene un plan de revendedor por ID
   */
  async obtenerPlanRevendedor(id: number): Promise<PlanRevendedor | null> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("planes_revendedores")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[PlanesSupabase] Error al obtener plan revendedor:", error);
      throw new Error(`Error al obtener plan revendedor: ${error.message}`);
    }

    return data;
  }

  /**
   * Obtiene un plan de revendedor por ID CON precio efectivo (promociones aplicadas)
   */
  async obtenerPlanRevendedorConPrecio(
    id: number
  ): Promise<
    (PlanRevendedor & {
      precio_efectivo: number;
      en_promocion: boolean;
      precio_original: number;
    }) | null
  > {
    const [plan, config] = await Promise.all([
      this.obtenerPlanRevendedor(id),
      this.obtenerPromocionesConfig(),
    ]);

    if (!plan) return null;

    const precioOriginal = Number(plan.precio);
    let precioEfectivo = precioOriginal;
    let enPromocion = false;

    if (config?.revendedor_activa) {
      if (plan.precio_promo) {
        precioEfectivo = Number(plan.precio_promo);
      } else {
        const descuento = config.revendedor_descuento_porcentaje / 100;
        precioEfectivo = Math.round(precioOriginal * (1 - descuento));
      }
      enPromocion = true;
    }

    console.log(
      `[PlanesSupabase] Revendedor ${id}: precio_original=${precioOriginal}, precio_efectivo=${precioEfectivo}, en_promocion=${enPromocion}`
    );

    return {
      ...plan,
      precio: precioEfectivo, // ⚡ Sobrescribimos con precio efectivo
      precio_original: precioOriginal,
      precio_efectivo: precioEfectivo,
      en_promocion: enPromocion,
    };
  }

  /**
   * Actualiza un plan de revendedor
   */
  async actualizarPlanRevendedor(
    id: number,
    updates: Partial<Omit<PlanRevendedor, "id" | "created_at" | "updated_at">>
  ): Promise<PlanRevendedor> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("planes_revendedores")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[PlanesSupabase] Error al actualizar plan revendedor:", error);
      throw new Error(`Error al actualizar plan revendedor: ${error.message}`);
    }

    console.log(`[PlanesSupabase] Plan revendedor ${id} actualizado:`, updates);
    return data;
  }

  /**
   * Crea un nuevo plan de revendedor
   */
  async crearPlanRevendedor(
    plan: Omit<PlanRevendedor, "created_at" | "updated_at">
  ): Promise<PlanRevendedor> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("planes_revendedores")
      .insert(plan)
      .select()
      .single();

    if (error) {
      console.error("[PlanesSupabase] Error al crear plan revendedor:", error);
      throw new Error(`Error al crear plan revendedor: ${error.message}`);
    }

    console.log(`[PlanesSupabase] Plan revendedor creado:`, data);
    return data;
  }

  // ============================================
  // CONFIGURACIÓN DE PROMOCIONES
  // ============================================

  /**
   * Obtiene la configuración global de promociones
   */
  async obtenerPromocionesConfig(): Promise<PromocionesConfig | null> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("promociones_config")
      .select("*")
      .eq("id", "global")
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[PlanesSupabase] Error al obtener config promociones:", error);
      throw new Error(`Error al obtener config promociones: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualiza la configuración de promociones
   */
  async actualizarPromocionesConfig(
    updates: Partial<Omit<PromocionesConfig, "id" | "updated_at">>
  ): Promise<PromocionesConfig> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("promociones_config")
      .update(updates)
      .eq("id", "global")
      .select()
      .single();

    if (error) {
      console.error("[PlanesSupabase] Error al actualizar promociones:", error);
      throw new Error(`Error al actualizar promociones: ${error.message}`);
    }

    console.log("[PlanesSupabase] Config promociones actualizada:", updates);
    return data;
  }

  /**
   * Activa una promoción para planes VPN
   */
  async activarPromocionVPN(
    duracionHoras: number = 24,
    descuentoPorcentaje: number = 30,
    texto?: string
  ): Promise<PromocionesConfig> {
    const updates: Partial<PromocionesConfig> = {
      vpn_activa: true,
      vpn_activada_en: new Date().toISOString(),
      vpn_duracion_horas: duracionHoras,
      vpn_descuento_porcentaje: descuentoPorcentaje,
    };

    if (texto) {
      updates.vpn_texto = texto;
    }

    return this.actualizarPromocionesConfig(updates);
  }

  /**
   * Desactiva la promoción para planes VPN
   */
  async desactivarPromocionVPN(): Promise<PromocionesConfig> {
    return this.actualizarPromocionesConfig({
      vpn_activa: false,
      vpn_activada_en: null,
    });
  }

  /**
   * Activa una promoción para revendedores
   */
  async activarPromocionRevendedor(
    duracionHoras: number = 24,
    descuentoPorcentaje: number = 20,
    texto?: string,
    soloNuevos: boolean = false,
    soloRenovaciones: boolean = false
  ): Promise<PromocionesConfig> {
    const updates: Partial<PromocionesConfig> = {
      revendedor_activa: true,
      revendedor_activada_en: new Date().toISOString(),
      revendedor_duracion_horas: duracionHoras,
      revendedor_descuento_porcentaje: descuentoPorcentaje,
      revendedor_solo_nuevos: soloNuevos,
      revendedor_solo_renovaciones: soloRenovaciones,
    };

    if (texto) {
      updates.revendedor_texto = texto;
    }

    return this.actualizarPromocionesConfig(updates);
  }

  /**
   * Desactiva la promoción para revendedores
   */
  async desactivarPromocionRevendedor(): Promise<PromocionesConfig> {
    return this.actualizarPromocionesConfig({
      revendedor_activa: false,
      revendedor_activada_en: null,
    });
  }

  // ============================================
  // UTILIDADES
  // ============================================

  /**
   * Obtiene el precio efectivo de un plan VPN (considerando promoción)
   */
  async obtenerPrecioEfectivoVPN(planId: number): Promise<{ precio: number; esPromo: boolean }> {
    const [plan, config] = await Promise.all([
      this.obtenerPlanVPN(planId),
      this.obtenerPromocionesConfig(),
    ]);

    if (!plan) throw new Error(`Plan VPN ${planId} no encontrado`);

    if (config?.vpn_activa && plan.precio_promo) {
      return { precio: Number(plan.precio_promo), esPromo: true };
    }

    if (config?.vpn_activa) {
      const descuento = config.vpn_descuento_porcentaje / 100;
      const precioConDescuento = Math.round(Number(plan.precio) * (1 - descuento));
      return { precio: precioConDescuento, esPromo: true };
    }

    return { precio: Number(plan.precio), esPromo: false };
  }

  /**
   * Obtiene el precio efectivo de un plan de revendedor (considerando promoción)
   */
  async obtenerPrecioEfectivoRevendedor(
    planId: number
  ): Promise<{ precio: number; esPromo: boolean }> {
    const [plan, config] = await Promise.all([
      this.obtenerPlanRevendedor(planId),
      this.obtenerPromocionesConfig(),
    ]);

    if (!plan) throw new Error(`Plan revendedor ${planId} no encontrado`);

    if (config?.revendedor_activa && plan.precio_promo) {
      return { precio: Number(plan.precio_promo), esPromo: true };
    }

    if (config?.revendedor_activa) {
      const descuento = config.revendedor_descuento_porcentaje / 100;
      const precioConDescuento = Math.round(Number(plan.precio) * (1 - descuento));
      return { precio: precioConDescuento, esPromo: true };
    }

    return { precio: Number(plan.precio), esPromo: false };
  }

  /**
   * Obtiene todos los planes VPN con precios efectivos
   * Mapea 'dispositivos' -> 'connection_limit' para compatibilidad con frontend
   * IMPORTANTE: Sobrescribe 'precio' con el precio efectivo para que el frontend lo muestre correctamente
   */
  async obtenerPlanesVPNConPrecios(): Promise<
    (PlanVPN & { precio_efectivo: number; en_promocion: boolean; connection_limit: number; precio_original: number })[]
  > {
    const [planes, config] = await Promise.all([
      this.obtenerPlanesVPN(),
      this.obtenerPromocionesConfig(),
    ]);

    return planes.map((plan) => {
      const precioOriginal = Number(plan.precio);
      let precioEfectivo = precioOriginal;
      let enPromocion = false;

      if (config?.vpn_activa) {
        if (plan.precio_promo) {
          precioEfectivo = Number(plan.precio_promo);
        } else {
          const descuento = config.vpn_descuento_porcentaje / 100;
          precioEfectivo = Math.round(precioOriginal * (1 - descuento));
        }
        enPromocion = true;
      }

      return {
        ...plan,
        connection_limit: plan.dispositivos, // Compatibilidad con frontend
        precio: precioEfectivo, // ⚡ Sobrescribimos precio con el efectivo
        precio_original: precioOriginal, // Guardamos el original por si se necesita
        precio_efectivo: precioEfectivo,
        en_promocion: enPromocion,
      };
    });
  }

  /**
   * Obtiene todos los planes de revendedor con precios efectivos
   * IMPORTANTE: Sobrescribe 'precio' con el precio efectivo para que el frontend lo muestre correctamente
   */
  async obtenerPlanesRevendedorConPrecios(): Promise<
    (PlanRevendedor & { precio_efectivo: number; en_promocion: boolean; precio_original: number })[]
  > {
    const [planes, config] = await Promise.all([
      this.obtenerPlanesRevendedor(),
      this.obtenerPromocionesConfig(),
    ]);

    return planes.map((plan) => {
      const precioOriginal = Number(plan.precio);
      let precioEfectivo = precioOriginal;
      let enPromocion = false;

      if (config?.revendedor_activa) {
        if (plan.precio_promo) {
          precioEfectivo = Number(plan.precio_promo);
        } else {
          const descuento = config.revendedor_descuento_porcentaje / 100;
          precioEfectivo = Math.round(precioOriginal * (1 - descuento));
        }
        enPromocion = true;
      }

      return {
        ...plan,
        precio: precioEfectivo, // ⚡ Sobrescribimos precio con el efectivo
        precio_original: precioOriginal, // Guardamos el original por si se necesita
        precio_efectivo: precioEfectivo,
        en_promocion: enPromocion,
      };
    });
  }
}

// Exportar instancia singleton
export const planesSupabaseService = new PlanesSupabaseService();
