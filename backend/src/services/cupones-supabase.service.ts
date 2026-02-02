import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Cupon, CrearCuponInput, ValidacionCupon } from "../types";

// ============================================
// TIPOS SUPABASE
// ============================================

export interface CuponDB {
  id: number;
  codigo: string;
  tipo: "porcentaje" | "monto_fijo";
  valor: number;
  limite_uso: number | null;
  usos_actuales: number;
  fecha_expiracion: string | null;
  activo: boolean;
  oculto: boolean;
  planes_aplicables: number[] | null;
  descripcion: string | null;
  solo_primera_compra: boolean;
  solo_renovaciones: boolean;
  created_at: string;
  updated_at: string;
}

export interface CuponUsoDB {
  id: number;
  cupon_id: number;
  cliente_email: string;
  pago_id: string | null;
  monto_descuento: number;
  precio_original: number;
  precio_final: number;
  created_at: string;
}

// ============================================
// SERVICIO DE CUPONES SUPABASE
// ============================================

class CuponesSupabaseService {
  private client: SupabaseClient | null = null;
  private enabled = false;

  constructor() {
    this.initClient();
  }

  private initClient() {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_KEY;

    if (supabaseUrl && supabaseKey) {
      this.client = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false },
      });
      this.enabled = true;
      console.log("[CuponesSupabase] ✅ Servicio inicializado");
    } else {
      console.error(
        "[CuponesSupabase] ❌ SUPABASE_URL o SUPABASE_SERVICE_KEY no configurados"
      );
    }
  }

  isEnabled(): boolean {
    return this.enabled && this.client !== null;
  }

  // ============================================
  // OPERACIONES CRUD
  // ============================================

  /**
   * Crea un nuevo cupón
   */
  async crearCupon(input: CrearCuponInput): Promise<Cupon> {
    if (!this.client) throw new Error("Supabase no está configurado");

    // Verificar que el código no exista
    const existente = await this.obtenerCuponPorCodigo(input.codigo);
    if (existente) {
      throw new Error("El código de cupón ya existe");
    }

    // Validar tipo y valor
    if (input.tipo === "porcentaje" && (input.valor <= 0 || input.valor > 100)) {
      throw new Error("El porcentaje debe estar entre 1 y 100");
    }

    if (input.tipo === "monto_fijo" && input.valor <= 0) {
      throw new Error("El monto fijo debe ser mayor a 0");
    }

    const { data, error } = await this.client
      .from("cupones")
      .insert({
        codigo: input.codigo.toUpperCase(),
        tipo: input.tipo,
        valor: input.valor,
        limite_uso: input.limite_uso || null,
        fecha_expiracion: input.fecha_expiracion
          ? input.fecha_expiracion.toISOString()
          : null,
        oculto: input.oculto || false,
        planes_aplicables: input.planes_aplicables || null,
        activo: input.activo !== false,
      })
      .select()
      .single();

    if (error) {
      console.error("[CuponesSupabase] Error al crear cupón:", error);
      throw new Error(`Error al crear cupón: ${error.message}`);
    }

    console.log(`[CuponesSupabase] ✅ Cupón ${input.codigo} creado`);
    return this.mapDBToCupon(data);
  }

  /**
   * Obtiene un cupón por ID
   */
  async obtenerCuponPorId(id: number): Promise<Cupon | null> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("cupones")
      .select("*")
      .eq("id", id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[CuponesSupabase] Error al obtener cupón:", error);
      throw new Error(`Error al obtener cupón: ${error.message}`);
    }

    return data ? this.mapDBToCupon(data) : null;
  }

  /**
   * Obtiene un cupón por código
   */
  async obtenerCuponPorCodigo(codigo: string): Promise<Cupon | null> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("cupones")
      .select("*")
      .eq("codigo", codigo.toUpperCase())
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("[CuponesSupabase] Error al obtener cupón:", error);
      return null;
    }

    return data ? this.mapDBToCupon(data) : null;
  }

  /**
   * Lista todos los cupones
   */
  async listarCupones(): Promise<Cupon[]> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("cupones")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[CuponesSupabase] Error al listar cupones:", error);
      throw new Error(`Error al listar cupones: ${error.message}`);
    }

    return (data || []).map((row) => this.mapDBToCupon(row));
  }

  /**
   * Lista cupones activos y públicos (para mostrar públicamente)
   */
  async listarCuponesActivos(): Promise<Cupon[]> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("cupones")
      .select("*")
      .eq("activo", true)
      .or("oculto.is.null,oculto.eq.false")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[CuponesSupabase] Error al listar cupones activos:", error);
      throw new Error(`Error al listar cupones: ${error.message}`);
    }

    // Filtrar cupones expirados
    const ahora = new Date();
    return (data || [])
      .filter((c) => !c.fecha_expiracion || new Date(c.fecha_expiracion) > ahora)
      .map((row) => this.mapDBToCupon(row));
  }

  /**
   * Actualiza un cupón
   */
  async actualizarCupon(
    id: number,
    updates: Partial<CrearCuponInput & { activo: boolean }>
  ): Promise<Cupon | null> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const updateData: Record<string, unknown> = {};

    if (updates.codigo !== undefined) {
      updateData.codigo = updates.codigo.toUpperCase();
    }
    if (updates.tipo !== undefined) {
      updateData.tipo = updates.tipo;
    }
    if (updates.valor !== undefined) {
      updateData.valor = updates.valor;
    }
    if (updates.limite_uso !== undefined) {
      updateData.limite_uso = updates.limite_uso;
    }
    if (updates.fecha_expiracion !== undefined) {
      updateData.fecha_expiracion = updates.fecha_expiracion
        ? updates.fecha_expiracion.toISOString()
        : null;
    }
    if (updates.planes_aplicables !== undefined) {
      updateData.planes_aplicables = updates.planes_aplicables;
    }
    if (updates.oculto !== undefined) {
      updateData.oculto = updates.oculto;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error("No hay campos para actualizar");
    }

    const { data, error } = await this.client
      .from("cupones")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("[CuponesSupabase] Error al actualizar cupón:", error);
      throw new Error(`Error al actualizar cupón: ${error.message}`);
    }

    console.log(`[CuponesSupabase] ✅ Cupón ${id} actualizado`);
    return data ? this.mapDBToCupon(data) : null;
  }

  /**
   * Desactiva un cupón
   */
  async desactivarCupon(id: number): Promise<void> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { error } = await this.client
      .from("cupones")
      .update({ activo: false })
      .eq("id", id);

    if (error) {
      console.error("[CuponesSupabase] Error al desactivar cupón:", error);
      throw new Error(`Error al desactivar cupón: ${error.message}`);
    }

    console.log(`[CuponesSupabase] ✅ Cupón ${id} desactivado`);
  }

  /**
   * Elimina un cupón
   */
  async eliminarCupon(id: number): Promise<void> {
    if (!this.client) throw new Error("Supabase no está configurado");

    // Primero eliminamos el historial de uso
    await this.client.from("cupones_uso").delete().eq("cupon_id", id);

    // Luego eliminamos el cupón
    const { error } = await this.client.from("cupones").delete().eq("id", id);

    if (error) {
      console.error("[CuponesSupabase] Error al eliminar cupón:", error);
      throw new Error(`Error al eliminar cupón: ${error.message}`);
    }

    console.log(`[CuponesSupabase] ✅ Cupón ${id} eliminado`);
  }

  // ============================================
  // VALIDACIÓN Y USO
  // ============================================

  /**
   * Valida un cupón para aplicarlo a una compra
   */
  async validarCupon(
    codigo: string,
    planId?: number,
    clienteEmail?: string
  ): Promise<ValidacionCupon> {
    try {
      const cupon = await this.obtenerCuponPorCodigo(codigo);
      if (!cupon) {
        return { valido: false, mensaje_error: "Cupón no encontrado" };
      }

      // Verificar si está activo
      if (!cupon.activo) {
        return { valido: false, mensaje_error: "Cupón inactivo" };
      }

      // Verificar expiración
      if (cupon.fecha_expiracion && new Date() > cupon.fecha_expiracion) {
        return { valido: false, mensaje_error: "Cupón expirado" };
      }

      // Verificar límite de uso
      if (cupon.limite_uso && (cupon.usos_actuales || 0) >= cupon.limite_uso) {
        return { valido: false, mensaje_error: "Cupón agotado" };
      }

      // Verificar si usuario ya usó el cupón (para cupones de bienvenida)
      if (clienteEmail && cupon.id) {
        const yaUsado = await this.usuarioYaUsoCupon(cupon.id, clienteEmail);
        if (yaUsado) {
          return {
            valido: false,
            mensaje_error: "Ya utilizaste este cupón anteriormente",
          };
        }
      }

      // Verificar aplicabilidad a plan
      if (cupon.planes_aplicables && cupon.planes_aplicables.length > 0 && planId) {
        if (!cupon.planes_aplicables.includes(planId)) {
          return { valido: false, mensaje_error: "Cupón no aplicable a este plan" };
        }
      }

      return {
        valido: true,
        cupon,
        tipo_descuento: cupon.tipo,
        descuento: 0, // Se calcula en el momento de aplicar
      };
    } catch (error) {
      console.error("[CuponesSupabase] Error validando cupón:", error);
      return { valido: false, mensaje_error: "Error interno del servidor" };
    }
  }

  /**
   * Verifica si un usuario ya usó un cupón específico
   */
  async usuarioYaUsoCupon(cuponId: number, clienteEmail: string): Promise<boolean> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("cupones_uso")
      .select("id")
      .eq("cupon_id", cuponId)
      .eq("cliente_email", clienteEmail)
      .limit(1);

    if (error) {
      console.error("[CuponesSupabase] Error verificando uso:", error);
      return false;
    }

    return (data?.length || 0) > 0;
  }

  /**
   * Aplica un cupón de forma simplificada (solo incrementa contador)
   * Compatible con código legacy que solo pasa cuponId
   */
  async aplicarCuponSimple(cuponId: number): Promise<void> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const cupon = await this.obtenerCuponPorId(cuponId);
    if (!cupon) {
      throw new Error("Cupón no encontrado");
    }

    const nuevosUsos = (cupon.usos_actuales || 0) + 1;
    const shouldDeactivate = cupon.limite_uso && nuevosUsos >= cupon.limite_uso;

    const { error } = await this.client
      .from("cupones")
      .update({
        usos_actuales: nuevosUsos,
        activo: shouldDeactivate ? false : cupon.activo,
      })
      .eq("id", cuponId);

    if (error) {
      console.error("[CuponesSupabase] Error aplicando cupón:", error);
      throw new Error(`Error al aplicar cupón: ${error.message}`);
    }

    if (shouldDeactivate) {
      console.log(
        `[CuponesSupabase] ✅ Cupón ${cupon.codigo} utilizado. Usos: ${nuevosUsos}/${cupon.limite_uso}. Desactivado.`
      );
    } else {
      console.log(
        `[CuponesSupabase] ✅ Cupón ${cupon.codigo} utilizado. Usos: ${nuevosUsos}/${cupon.limite_uso || "∞"}`
      );
    }
  }

  /**
   * Aplica un cupón (incrementa contador y registra uso)
   */
  async aplicarCupon(
    cuponId: number,
    clienteEmail: string,
    pagoId: string | null,
    montoDescuento: number,
    precioOriginal: number,
    precioFinal: number
  ): Promise<void> {
    if (!this.client) throw new Error("Supabase no está configurado");

    // Obtener cupón actual
    const cupon = await this.obtenerCuponPorId(cuponId);
    if (!cupon) {
      throw new Error("Cupón no encontrado");
    }

    const nuevosUsos = (cupon.usos_actuales || 0) + 1;
    const shouldDeactivate = cupon.limite_uso && nuevosUsos >= cupon.limite_uso;

    // Actualizar contador de usos
    const { error: updateError } = await this.client
      .from("cupones")
      .update({
        usos_actuales: nuevosUsos,
        activo: shouldDeactivate ? false : cupon.activo,
      })
      .eq("id", cuponId);

    if (updateError) {
      console.error("[CuponesSupabase] Error actualizando usos:", updateError);
      throw new Error(`Error al aplicar cupón: ${updateError.message}`);
    }

    // Registrar uso en historial
    const { error: insertError } = await this.client.from("cupones_uso").insert({
      cupon_id: cuponId,
      cliente_email: clienteEmail,
      pago_id: pagoId,
      monto_descuento: montoDescuento,
      precio_original: precioOriginal,
      precio_final: precioFinal,
    });

    if (insertError) {
      console.error("[CuponesSupabase] Error registrando uso:", insertError);
      // No lanzamos error aquí, el cupón ya se aplicó
    }

    if (shouldDeactivate) {
      console.log(
        `[CuponesSupabase] ✅ Cupón ${cupon.codigo} utilizado. Usos: ${nuevosUsos}/${cupon.limite_uso}. Desactivado.`
      );
    } else {
      console.log(
        `[CuponesSupabase] ✅ Cupón ${cupon.codigo} utilizado. Usos: ${nuevosUsos}/${cupon.limite_uso || "∞"}`
      );
    }
  }

  /**
   * Calcula el descuento basado en el precio original
   */
  calcularDescuento(cupon: Cupon, precioOriginal: number): number {
    if (cupon.tipo === "porcentaje") {
      return Math.round((precioOriginal * cupon.valor) / 100);
    } else {
      // Para monto fijo, no puede ser mayor al precio original
      return Math.min(cupon.valor, precioOriginal);
    }
  }

  // ============================================
  // ESTADÍSTICAS
  // ============================================

  /**
   * Obtiene estadísticas de uso de cupones
   */
  async obtenerEstadisticas(): Promise<{
    total_cupones: number;
    cupones_activos: number;
    usos_totales: number;
    cupones_expirados: number;
  }> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data: cupones, error } = await this.client.from("cupones").select("*");

    if (error) {
      console.error("[CuponesSupabase] Error obteniendo estadísticas:", error);
      throw new Error(`Error al obtener estadísticas: ${error.message}`);
    }

    const ahora = new Date();
    const stats = {
      total_cupones: cupones?.length || 0,
      cupones_activos: 0,
      usos_totales: 0,
      cupones_expirados: 0,
    };

    for (const c of cupones || []) {
      if (c.activo) stats.cupones_activos++;
      stats.usos_totales += c.usos_actuales || 0;
      if (c.fecha_expiracion && new Date(c.fecha_expiracion) < ahora && c.activo) {
        stats.cupones_expirados++;
      }
    }

    return stats;
  }

  /**
   * Detecta abuso de cupones (usuarios con múltiples usos)
   */
  async detectarAbusoCupon(
    cuponId: number
  ): Promise<Array<{ cliente_email: string; usos: number }>> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("cupones_uso")
      .select("cliente_email")
      .eq("cupon_id", cuponId);

    if (error) {
      console.error("[CuponesSupabase] Error detectando abuso:", error);
      return [];
    }

    // Contar usos por email
    const conteo: Record<string, number> = {};
    for (const row of data || []) {
      conteo[row.cliente_email] = (conteo[row.cliente_email] || 0) + 1;
    }

    // Filtrar los que tienen más de 1 uso
    return Object.entries(conteo)
      .filter(([, usos]) => usos > 1)
      .map(([cliente_email, usos]) => ({ cliente_email, usos }))
      .sort((a, b) => b.usos - a.usos);
  }

  /**
   * Obtiene historial de uso de un cupón
   */
  async obtenerHistorialUso(cuponId: number): Promise<CuponUsoDB[]> {
    if (!this.client) throw new Error("Supabase no está configurado");

    const { data, error } = await this.client
      .from("cupones_uso")
      .select("*")
      .eq("cupon_id", cuponId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[CuponesSupabase] Error obteniendo historial:", error);
      throw new Error(`Error al obtener historial: ${error.message}`);
    }

    return data || [];
  }

  // ============================================
  // HELPERS
  // ============================================

  private mapDBToCupon(row: CuponDB): Cupon {
    return {
      id: row.id,
      codigo: row.codigo,
      tipo: row.tipo,
      valor: Number(row.valor),
      limite_uso: row.limite_uso || undefined,
      usos_actuales: row.usos_actuales || 0,
      fecha_expiracion: row.fecha_expiracion
        ? new Date(row.fecha_expiracion)
        : undefined,
      activo: row.activo,
      oculto: row.oculto,
      planes_aplicables: row.planes_aplicables || undefined,
      creado_en: new Date(row.created_at),
      actualizado_en: new Date(row.updated_at),
    };
  }
}

// Exportar instancia singleton
export const cuponesSupabaseService = new CuponesSupabaseService();
