import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  serviceKey: string;
}

export interface PurchaseHistoryRecord {
  user_id: string;
  tipo: 'plan' | 'renovacion' | 'revendedor';
  plan_nombre: string;
  monto: number;
  estado: string;
  servex_username?: string | null;
  servex_password?: string | null;
  servex_expiracion?: string | null;
  servex_connection_limit?: number | null;
  mp_payment_id?: string | null;
}

export interface Profile {
  id: string;
  email: string;
  nombre?: string | null;
  telefono?: string | null;
  avatar_url?: string | null;
}

export interface SupportTicketRecord {
  id: string;
  user_id: string;
  asunto: string;
  descripcion?: string | null;
  status?: string;
  priority?: string;
  created_at?: string;
  updated_at?: string;
  last_message_at?: string;
}

/**
 * Servicio de Supabase para el backend
 * Maneja la sincronización de compras al historial del usuario
 */
export class SupabaseService {
  private client: SupabaseClient | null = null;
  private enabled: boolean = false;

  constructor() {
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
      console.log('[Supabase] Servicio inicializado correctamente');
    } else {
      console.warn(
        '[Supabase] URL o Service Key no configurados. ' +
        'El historial de compras no se sincronizará con Supabase.'
      );
    }
  }

  /**
   * Verifica si el servicio está habilitado
   */
  isEnabled(): boolean {
    return this.enabled;
  }

  /**
   * Devuelve el cliente de Supabase (service role) si está habilitado.
   */
  getClient(): SupabaseClient | null {
    return this.client;
  }

  /**
   * Obtiene el perfil (incluye email) por user_id.
   */
  async getProfileById(userId: string): Promise<Profile | null> {
    if (!this.client || !this.enabled) return null;

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('[Supabase] Error obteniendo profile:', error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('[Supabase] Error obteniendo profile:', error);
      return null;
    }
  }

  /**
   * Verifica si un user_id es admin (reutiliza chat_admins).
   */
  async isChatAdmin(userId: string): Promise<boolean> {
    if (!this.client || !this.enabled) return false;

    try {
      const { data, error } = await this.client
        .from('chat_admins')
        .select('user_id')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Supabase] Error verificando chat_admins:', error);
        return false;
      }

      return Boolean(data?.user_id);
    } catch (error) {
      console.error('[Supabase] Error verificando chat_admins:', error);
      return false;
    }
  }

  /**
   * Obtiene un ticket de soporte por id.
   */
  async getSupportTicketById(ticketId: string): Promise<SupportTicketRecord | null> {
    if (!this.client || !this.enabled) return null;

    try {
      const { data, error } = await this.client
        .from('support_tickets')
        .select('*')
        .eq('id', ticketId)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('[Supabase] Error obteniendo support_ticket:', error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('[Supabase] Error obteniendo support_ticket:', error);
      return null;
    }
  }

  /**
   * Busca un usuario por email en Supabase
   */
  async findUserByEmail(email: string): Promise<Profile | null> {
    if (!this.client || !this.enabled) return null;

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('*')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('[Supabase] Error buscando usuario:', error);
        }
        return null;
      }

      return data;
    } catch (error) {
      console.error('[Supabase] Error buscando usuario:', error);
      return null;
    }
  }

  /**
   * Guarda una compra en el historial del usuario
   * Busca al usuario por email y, si existe, guarda la compra
   */
  async savePurchaseToHistory(
    email: string,
    purchase: Omit<PurchaseHistoryRecord, 'user_id'>
  ): Promise<string | null> {
    if (!this.client || !this.enabled) {
      console.log('[Supabase] Servicio no habilitado, omitiendo guardado de historial');
      return null;
    }

    try {
      // Buscar usuario por email
      const user = await this.findUserByEmail(email);

      if (!user) {
        console.log(`[Supabase] Usuario con email ${email} no encontrado. La compra no se guardará en historial hasta que se registre.`);
        return null;
      }

      // Guardar en historial
      const { data, error } = await this.client
        .from('purchase_history')
        .insert({
          user_id: user.id,
          ...purchase,
        })
        .select('id')
        .single();

      if (error) {
        console.error('[Supabase] Error guardando compra en historial:', error);
        return null;
      }

      console.log(`[Supabase] Compra guardada en historial para usuario ${email}, ID: ${data.id}`);
      return data.id;
    } catch (error) {
      console.error('[Supabase] Error guardando compra:', error);
      return null;
    }
  }

  /**
   * Sincroniza una compra aprobada al historial
   * Se llama cuando un pago es aprobado
   */
  async syncApprovedPurchase(data: {
    email: string;
    planNombre: string;
    monto: number;
    tipo: 'plan' | 'renovacion' | 'revendedor';
    servexUsername?: string;
    servexPassword?: string;
    servexExpiracion?: string;
    servexConnectionLimit?: number;
    mpPaymentId?: string;
  }): Promise<string | null> {
    return this.savePurchaseToHistory(data.email, {
      tipo: data.tipo,
      plan_nombre: data.planNombre,
      monto: data.monto,
      estado: 'aprobado',
      servex_username: data.servexUsername,
      servex_password: data.servexPassword,
      servex_expiracion: data.servexExpiracion,
      servex_connection_limit: data.servexConnectionLimit,
      mp_payment_id: data.mpPaymentId,
    });
  }

  /**
   * Vincula compras existentes (por email) a un usuario recién registrado
   * Útil cuando un usuario compra como invitado y luego se registra
   */
  async linkExistingPurchases(
    userId: string,
    email: string,
    purchases: Array<{
      planNombre: string;
      monto: number;
      tipo: 'plan' | 'renovacion' | 'revendedor';
      estado: string;
      servexUsername?: string;
      servexPassword?: string;
      servexExpiracion?: string;
      mpPaymentId?: string;
      fechaCreacion: string;
    }>
  ): Promise<number> {
    if (!this.client || !this.enabled) return 0;

    try {
      let linked = 0;

      for (const purchase of purchases) {
        // Verificar si ya existe esta compra en el historial
        const { data: existing } = await this.client
          .from('purchase_history')
          .select('id')
          .eq('user_id', userId)
          .eq('mp_payment_id', purchase.mpPaymentId)
          .single();

        if (!existing) {
          const { error } = await this.client
            .from('purchase_history')
            .insert({
              user_id: userId,
              tipo: purchase.tipo,
              plan_nombre: purchase.planNombre,
              monto: purchase.monto,
              estado: purchase.estado,
              servex_username: purchase.servexUsername,
              servex_password: purchase.servexPassword,
              servex_expiracion: purchase.servexExpiracion,
              mp_payment_id: purchase.mpPaymentId,
            });

          if (!error) {
            linked++;
          }
        }
      }

      console.log(`[Supabase] ${linked} compras vinculadas al usuario ${email}`);
      return linked;
    } catch (error) {
      console.error('[Supabase] Error vinculando compras:', error);
      return 0;
    }
  }

  /**
   * Obtiene el historial de compras de un usuario
   */
  async getPurchaseHistory(userId: string): Promise<PurchaseHistoryRecord[]> {
    if (!this.client || !this.enabled) return [];

    try {
      const { data, error } = await this.client
        .from('purchase_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[Supabase] Error obteniendo historial:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[Supabase] Error obteniendo historial:', error);
      return [];
    }
  }
}

// Singleton
export const supabaseService = new SupabaseService();
