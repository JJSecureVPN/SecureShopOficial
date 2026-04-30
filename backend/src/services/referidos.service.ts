import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  ReferralSettings,
  Referido,
  ReferralStats,
  SaldoTransaccion,
  AcreditarSaldoInput,
  ProcesarReferidoInput,
} from '../types';

/**
 * Servicio de Referidos y Saldo (Wallet)
 * Maneja el programa de referidos y el sistema de saldo en cuenta
 */
export class ReferidosService {
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
      console.log('[Referidos] Servicio inicializado correctamente');
    } else {
      console.warn('[Referidos] Supabase no configurado. Servicio deshabilitado.');
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  // ============================================
  // CONFIGURACIÓN DE REFERIDOS
  // ============================================

  /**
   * Obtener configuración del programa de referidos
   */
  async getSettings(): Promise<ReferralSettings | null> {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client
        .from('referral_settings')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        console.error('[Referidos] Error obteniendo configuración:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('[Referidos] Error obteniendo configuración:', error);
      return null;
    }
  }

  /**
   * Actualizar configuración del programa de referidos
   */
  async updateSettings(settings: Partial<ReferralSettings>): Promise<boolean> {
    if (!this.client) return false;

    try {
      const { error } = await this.client
        .from('referral_settings')
        .update({
          ...settings,
          updated_at: new Date().toISOString(),
        })
        .eq('id', 1);

      if (error) {
        console.error('[Referidos] Error actualizando configuración:', error);
        return false;
      }

      console.log('[Referidos] Configuración actualizada');
      return true;
    } catch (error) {
      console.error('[Referidos] Error actualizando configuración:', error);
      return false;
    }
  }

  // ============================================
  // GESTIÓN DE SALDO
  // ============================================

  /**
   * Obtener saldo de un usuario
   */
  async getSaldo(userId: string): Promise<number> {
    if (!this.client) return 0;

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('saldo')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Referidos] Error obteniendo saldo:', error);
        return 0;
      }

      return data?.saldo || 0;
    } catch (error) {
      console.error('[Referidos] Error obteniendo saldo:', error);
      return 0;
    }
  }

  /**
   * Obtener saldo por email
   */
  async getSaldoByEmail(email: string): Promise<{ userId: string; saldo: number } | null> {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('id, saldo')
        .eq('email', email.toLowerCase())
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          console.error('[Referidos] Error obteniendo saldo por email:', error);
        }
        return null;
      }

      return { userId: data.id, saldo: data.saldo || 0 };
    } catch (error) {
      console.error('[Referidos] Error obteniendo saldo por email:', error);
      return null;
    }
  }

  /**
   * Acreditar o debitar saldo directamente en la base de datos
   */
  async acreditarSaldo(input: AcreditarSaldoInput): Promise<number | null> {
    if (!this.client) return null;

    try {
      // Obtener saldo actual
      const { data: userData, error: userError } = await this.client
        .from('profiles')
        .select('saldo, total_earned')
        .eq('id', input.user_id)
        .single();

      if (userError || !userData) {
        console.error('[Referidos] Usuario no encontrado:', userError);
        return null;
      }

      const saldoAnterior = userData.saldo || 0;
      const nuevoSaldo = saldoAnterior + input.monto;

      // No permitir saldo negativo
      if (nuevoSaldo < 0) {
        console.error('[Referidos] Saldo insuficiente');
        return null;
      }

      // Actualizar saldo y total_earned si es positivo
      const updateData: any = { saldo: nuevoSaldo };
      if (input.monto > 0) {
        updateData.total_earned = (userData.total_earned || 0) + input.monto;
      }

      const { error: updateError } = await this.client
        .from('profiles')
        .update(updateData)
        .eq('id', input.user_id);

      if (updateError) {
        console.error('[Referidos] Error actualizando saldo:', updateError);
        return null;
      }

      // Registrar transacción
      const { error: transError } = await this.client
        .from('saldo_transacciones')
        .insert({
          user_id: input.user_id,
          tipo: input.tipo,
          monto: input.monto,
          saldo_anterior: saldoAnterior,
          saldo_nuevo: nuevoSaldo,
          descripcion: input.descripcion,
          referencia_id: input.referencia_id
        });

      if (transError) {
        console.error('[Referidos] Error registrando transacción:', transError);
        // No retornamos null aquí porque la actualización del saldo ya fue exitosa
      }

      console.log(`[Referidos] Saldo ${input.monto >= 0 ? 'acreditado' : 'debitado'}: $${Math.abs(input.monto)} - Usuario: ${input.user_id}`);
      return nuevoSaldo;
    } catch (error) {
      console.error('[Referidos] Error acreditando saldo:', error);
      return null;
    }
  }

  /**
   * Usar saldo para una compra
   */
  async usarSaldo(userId: string, monto: number, purchaseId?: string): Promise<boolean> {
    if (!this.client) return false;

    const saldoActual = await this.getSaldo(userId);
    if (saldoActual < monto) {
      console.error('[Referidos] Saldo insuficiente');
      return false;
    }

    const result = await this.acreditarSaldo({
      user_id: userId,
      monto: -monto, // Negativo para debitar
      tipo: 'compra',
      descripcion: `Pago con saldo - Compra`,
      referencia_id: purchaseId,
    });

    return result !== null;
  }

  /**
   * Obtener historial de transacciones de saldo
   */
  async getTransacciones(userId: string, limit = 50): Promise<SaldoTransaccion[]> {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('saldo_transacciones')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Referidos] Error obteniendo transacciones:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[Referidos] Error obteniendo transacciones:', error);
      return [];
    }
  }

  // ============================================
  // GESTIÓN DE REFERIDOS
  // ============================================

  /**
   * Obtener código de referido de un usuario
   */
  async getReferralCode(userId: string): Promise<string | null> {
    if (!this.client) return null;

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('referral_code')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('[Referidos] Error obteniendo código:', error);
        return null;
      }

      return data?.referral_code || null;
    } catch (error) {
      console.error('[Referidos] Error obteniendo código:', error);
      return null;
    }
  }

  /**
   * Validar un código de referido
   */
  async validarCodigo(code: string, userEmail?: string): Promise<{
    valido: boolean;
    referrer_id?: string;
    referrer_email?: string;
    descuento?: number;
    mensaje?: string;
  }> {
    if (!this.client) {
      return { valido: false, mensaje: 'Servicio no disponible' };
    }

    try {
      // Buscar el código
      const { data: referrer, error } = await this.client
        .from('profiles')
        .select('id, email, referral_code')
        .eq('referral_code', code.toUpperCase())
        .single();

      if (error || !referrer) {
        return { valido: false, mensaje: 'Código de referido no válido' };
      }

      // No puede usar su propio código
      if (userEmail && referrer.email.toLowerCase() === userEmail.toLowerCase()) {
        return { valido: false, mensaje: 'No puedes usar tu propio código de referido' };
      }

      // Obtener configuración para el descuento
      const settings = await this.getSettings();

      return {
        valido: true,
        referrer_id: referrer.id,
        referrer_email: referrer.email,
        descuento: settings?.porcentaje_descuento_referido || 0,
        mensaje: `Código válido. ${settings?.porcentaje_descuento_referido || 0}% de descuento aplicado.`,
      };
    } catch (error) {
      console.error('[Referidos] Error validando código:', error);
      return { valido: false, mensaje: 'Error validando código' };
    }
  }

  /**
   * Procesar un referido cuando se completa una compra
   */
  async procesarReferido(input: ProcesarReferidoInput): Promise<{
    success: boolean;
    reward_amount: number;
    message: string;
  }> {
    if (!this.client) {
      return { success: false, reward_amount: 0, message: 'Servicio no disponible' };
    }

    try {
      const { data, error } = await this.client.rpc('procesar_referido', {
        p_referrer_code: input.referral_code.toUpperCase(),
        p_referred_id: input.referred_user_id,
        p_purchase_id: input.purchase_id,
        p_purchase_amount: input.purchase_amount,
      });

      if (error) {
        console.error('[Referidos] Error procesando referido:', error);
        return { success: false, reward_amount: 0, message: 'Error procesando referido' };
      }

      const result = data?.[0] || { success: false, reward_amount: 0, message: 'Sin resultado' };
      
      if (result.success) {
        console.log(`[Referidos] ✅ Referido procesado - Recompensa: $${result.reward_amount}`);
      }

      return result;
    } catch (error) {
      console.error('[Referidos] Error procesando referido:', error);
      return { success: false, reward_amount: 0, message: 'Error procesando referido' };
    }
  }

  /**
   * Obtener estadísticas de referidos de un usuario
   */
  async getStats(userId: string): Promise<ReferralStats | null> {
    if (!this.client) return null;

    try {
      // Obtener datos del perfil
      const { data: profile, error: profileError } = await this.client
        .from('profiles')
        .select('referral_code, total_referrals, total_earned, saldo')
        .eq('id', userId)
        .single();

      if (profileError) {
        console.error('[Referidos] Error obteniendo perfil:', profileError);
        return null;
      }

      // Obtener lista de referidos (incluyendo referred_email para usuarios sin cuenta)
      const { data: referidos, error: refError } = await this.client
        .from('referrals')
        .select(`
          *,
          profiles!referrals_referred_id_fkey (
            email,
            nombre
          )
        `)
        .eq('referrer_id', userId)
        .order('created_at', { ascending: false });

      if (refError) {
        console.error('[Referidos] Error obteniendo referidos:', refError);
      }

      // Mapear referidos con datos del usuario referido (usa referred_email si no hay cuenta)
      const referidosMapped: Referido[] = (referidos || []).map((r: any) => ({
        ...r,
        referred_email: r.profiles?.email || r.referred_email,
        referred_nombre: r.profiles?.nombre || (r.referred_email ? r.referred_email.split('@')[0] : 'Usuario'),
      }));

      return {
        referral_code: profile.referral_code || '',
        total_referrals: profile.total_referrals || 0,
        total_earned: profile.total_earned || 0,
        saldo_actual: profile.saldo || 0,
        referidos: referidosMapped,
      };
    } catch (error) {
      console.error('[Referidos] Error obteniendo estadísticas:', error);
      return null;
    }
  }

  /**
   * Obtener todos los usuarios con saldo (admin)
   */
  async getUsuariosConSaldo(limit = 100): Promise<Array<{
    id: string;
    email: string;
    nombre: string;
    saldo: number;
    total_earned: number;
    referral_code: string;
    created_at: string;
  }>> {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('profiles')
        .select('id, email, nombre, saldo, total_earned, referral_code, created_at')
        .gt('saldo', 0)
        .order('saldo', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Referidos] Error obteniendo usuarios con saldo:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[Referidos] Error obteniendo usuarios con saldo:', error);
      return [];
    }
  }

  /**
   * Obtener todos los referidos del sistema (admin)
   */
  async getAllReferidos(limit = 100): Promise<Referido[]> {
    if (!this.client) return [];

    try {
      const { data, error } = await this.client
        .from('referrals')
        .select(`
          *,
          referrer:profiles!referrals_referrer_id_fkey (email, nombre),
          referred:profiles!referrals_referred_id_fkey (email, nombre)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('[Referidos] Error obteniendo todos los referidos:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('[Referidos] Error obteniendo todos los referidos:', error);
      return [];
    }
  }

  /**
   * Ajustar saldo manualmente (admin)
   */
  async ajustarSaldoAdmin(
    userEmail: string,
    monto: number,
    descripcion: string
  ): Promise<{ success: boolean; nuevo_saldo?: number; mensaje: string }> {
    if (!this.client) {
      return { success: false, mensaje: 'Servicio no disponible' };
    }

    try {
      // Buscar usuario por email
      const { data: user, error: userError } = await this.client
        .from('profiles')
        .select('id, email, saldo')
        .eq('email', userEmail.toLowerCase())
        .single();

      if (userError || !user) {
        return { success: false, mensaje: 'Usuario no encontrado' };
      }

      // Verificar que no quede negativo
      if (user.saldo + monto < 0) {
        return { success: false, mensaje: 'El ajuste resultaría en saldo negativo' };
      }

      const nuevoSaldo = await this.acreditarSaldo({
        user_id: user.id,
        monto,
        tipo: 'ajuste_admin',
        descripcion: descripcion || 'Ajuste manual por administrador',
      });

      if (nuevoSaldo === null) {
        return { success: false, mensaje: 'Error aplicando ajuste' };
      }

      console.log(`[Referidos] Admin ajustó saldo de ${userEmail}: ${monto >= 0 ? '+' : ''}$${monto}`);
      return { success: true, nuevo_saldo: nuevoSaldo, mensaje: 'Saldo ajustado correctamente' };
    } catch (error) {
      console.error('[Referidos] Error en ajuste admin:', error);
      return { success: false, mensaje: 'Error interno' };
    }
  }

  // ============================================
  // MÉTODOS HELPER CON EMAIL (para tienda.service)
  // ============================================

  /**
   * Debitar saldo por email (para pagos)
   */
  async debitarSaldoPorEmail(
    email: string,
    monto: number,
    descripcion: string
  ): Promise<boolean> {
    const userData = await this.getSaldoByEmail(email);
    if (!userData) {
      console.log(`[Referidos] Usuario ${email} no encontrado para debitar saldo`);
      return false;
    }

    const result = await this.acreditarSaldo({
      user_id: userData.userId,
      monto: -monto, // Negativo para debitar
      tipo: 'compra',
      descripcion,
    });

    return result !== null;
  }

  /**
   * Acreditar saldo por email (para reembolsos)
   */
  async acreditarSaldoPorEmail(
    email: string,
    monto: number,
    descripcion: string,
    tipo: 'reembolso' | 'ajuste_admin' | 'bonus' = 'reembolso'
  ): Promise<boolean> {
    const userData = await this.getSaldoByEmail(email);
    if (!userData) {
      console.log(`[Referidos] Usuario ${email} no encontrado para acreditar saldo`);
      return false;
    }

    const result = await this.acreditarSaldo({
      user_id: userData.userId,
      monto,
      tipo,
      descripcion,
    });

    return result !== null;
  }

  /**
   * Procesar referido por email (cuando se completa una compra)
   * Usa la función SQL procesar_referido_email que no requiere UUID
   */
  async procesarReferidoPorEmail(
    codigoReferido: string,
    emailComprador: string,
    montoCompra: number,
    purchaseId: string
  ): Promise<{ success: boolean; reward_amount: number; message: string }> {
    if (!this.client) {
      return { success: false, reward_amount: 0, message: 'Servicio no disponible' };
    }

    try {
      console.log(`[Referidos] Procesando referido - Código: ${codigoReferido}, Comprador: ${emailComprador}, Monto: ${montoCompra}`);
      
      const { data, error } = await this.client.rpc('procesar_referido_email', {
        p_referrer_code: codigoReferido.toUpperCase(),
        p_referred_email: emailComprador.toLowerCase(),
        p_purchase_id: purchaseId,
        p_purchase_amount: montoCompra,
      });

      if (error) {
        console.error('[Referidos] Error procesando referido:', error);
        return { success: false, reward_amount: 0, message: 'Error procesando referido' };
      }

      const result = data?.[0] || { success: false, reward_amount: 0, message: 'Sin resultado' };
      
      if (result.success) {
        console.log(`[Referidos] ✅ Referido procesado - Recompensa: $${result.reward_amount}`);
      } else {
        console.log(`[Referidos] ⚠️ Referido no procesado: ${result.message}`);
      }

      return result;
    } catch (error) {
      console.error('[Referidos] Error procesando referido por email:', error);
      return { success: false, reward_amount: 0, message: 'Error procesando referido' };
    }
  }
}

// Singleton
export const referidosService = new ReferidosService();
