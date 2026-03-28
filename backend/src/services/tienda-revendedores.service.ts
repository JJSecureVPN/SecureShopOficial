import { v4 as uuidv4 } from "uuid";
import { DatabaseService } from "./database.service";
import { ServexService } from "./servex.service";
import { MercadoPagoService } from "./mercadopago.service";
import emailService from "./email.service";
import { cuponesSupabaseService } from "./cupones-supabase.service";
import { planesSupabaseService } from "./planes-supabase.service";
import { supabaseService } from "./supabase.service";
import {
  PlanRevendedor,
  PagoRevendedor,
  CrearPagoRevendedorInput,
  RevendedorServex,
} from "../types";

export class TiendaRevendedoresService {
  constructor(
    private db: DatabaseService,
    private servex: ServexService,
    private mercadopago: MercadoPagoService
  ) {}

  /**
   * Infers the duration in days for a reseller plan when the database does not provide it.
   * Falls back to parsing the plan's name/description so credit plans also get an expiration.
   */
  private inferirDuracionPlan(plan: PlanRevendedor): number | undefined {
    if (plan.dias && plan.dias > 0) {
      return plan.dias;
    }

    const texto = `${plan.nombre || ""} ${plan.descripcion || ""}`.toLowerCase();

    // Prefer explicit day counts if present (e.g. "30 días")
    const matchDias = texto.match(/(\d+)\s*d[ií]a?s?/);
    if (matchDias) {
      const dias = parseInt(matchDias[1], 10);
      if (Number.isFinite(dias) && dias > 0) {
        return dias;
      }
    }

    // Fall back to months hints (e.g. "1 mes", "5 meses")
    const matchMeses = texto.match(/(\d+)\s*mes(?:es)?/);
    if (matchMeses) {
      const meses = parseInt(matchMeses[1], 10);
      if (Number.isFinite(meses) && meses > 0) {
        return meses * 30;
      }
    }

    if (plan.account_type === "validity") {
      return 30;
    }

    if (plan.account_type === "credit") {
      return 30;
    }

    return undefined;
  }

  /**
   * Obtiene el servicio de MercadoPago (para acceso desde rutas)
   */
  getMercadoPagoService(): MercadoPagoService {
    return this.mercadopago;
  }

  /**
   * Obtiene un plan de revendedor por ID desde Supabase
   */
  async obtenerPlanPorId(planId: number): Promise<PlanRevendedor | null> {
    try {
      const plan = await planesSupabaseService.obtenerPlanRevendedorConPrecio(planId);
      if (!plan) return null;

      return {
        id: plan.id,
        nombre: plan.nombre,
        descripcion: plan.descripcion || "",
        precio: Number(plan.precio_efectivo),
        max_users: plan.max_users,
        account_type: plan.account_type,
        dias: plan.dias || undefined,
        activo: plan.activo,
      };
    } catch (error) {
      console.error("[TiendaRevendedores] Error obteniendo plan desde Supabase:", error);
      return null;
    }
  }

  /**
   * Obtiene todos los planes de revendedores activos desde Supabase
   */
  async obtenerPlanesRevendedoresAsync(): Promise<PlanRevendedor[]> {
    try {
      const planes = await planesSupabaseService.obtenerPlanesRevendedorConPrecios();
      return planes.map(plan => {
        const mapped: PlanRevendedor = {
          id: plan.id,
          nombre: plan.nombre,
          descripcion: plan.descripcion || "",
          precio: plan.precio_efectivo,
          max_users: plan.max_users,
          account_type: plan.account_type,
          dias: plan.dias || undefined,
          activo: plan.activo,
        };
        // Inferir duración si no existe
        const duracion = this.inferirDuracionPlan(mapped);
        if (!mapped.dias && duracion) {
          mapped.dias = duracion;
        }
        return mapped;
      });
    } catch (error) {
      console.error("[TiendaRevendedores] Error obteniendo planes desde Supabase:", error);
      return [];
    }
  }

  /**
   * Calcula el precio de forma dinámica para cantidades grandes o personalizadas
   * Lógica: Price(100) + Price(Quantity - 100)
   */
  async calcularPrecioDinamico(
    maxUsers: number,
    accountType: "validity" | "credit" = "validity"
  ): Promise<{ precio: number; plan: PlanRevendedor }> {
    const planes = await this.obtenerPlanesRevendedoresAsync();
    const planesTipo = planes.filter((p) => p.account_type === accountType);

    // Intentar encontrar plan exacto primero
    const exactPlan = planesTipo.find((p) => p.max_users === maxUsers);
    if (exactPlan) {
      return { precio: exactPlan.precio, plan: exactPlan };
    }

    // Si es > 100, aplicar lógica de suma: Plan(100) + resto
    if (maxUsers > 100) {
      const plan100 = planesTipo.find((p) => p.max_users === 100);
      if (!plan100) {
        throw new Error(`No se encontró un plan base de 100 para el sistema de ${accountType === 'credit' ? 'créditos' : 'validez'}.`);
      }

      const resto = maxUsers - 100;
      const { precio: precioResto } = await this.calcularPrecioDinamico(resto, accountType);
      
      return { 
        precio: plan100.precio + precioResto, 
        plan: { ...plan100, max_users: maxUsers, nombre: `Plan Personalizado ${maxUsers} ${accountType === 'credit' ? 'créditos' : 'usuarios'}` } 
      };
    }

    // Si es < 100 y no hay plan exacto, buscar el más grande disponible que sea menor y sumar el resto
    // Esto permite que si tienen 10, 20, 30... funcione para cualquier múltiplo de 10
    const planesMenores = planesTipo
      .filter((p) => p.max_users < maxUsers)
      .sort((a, b) => b.max_users - a.max_users);

    if (planesMenores.length > 0) {
      const planBase = planesMenores[0];
      const resto = maxUsers - planBase.max_users;
      const { precio: precioResto } = await this.calcularPrecioDinamico(resto, accountType);
      
      return { 
        precio: planBase.precio + precioResto, 
        plan: { ...planBase, max_users: maxUsers, nombre: `Plan Personalizado ${maxUsers} ${accountType === 'credit' ? 'créditos' : 'usuarios'}` } 
      };
    }

    throw new Error(`No se pudo calcular el precio para ${maxUsers} ${accountType === 'credit' ? 'créditos' : 'usuarios'}. No hay planes base suficientes.`);
  }

  /**
   * Procesa una nueva compra de plan de revendedor
   */
  async procesarCompra(input: CrearPagoRevendedorInput): Promise<{
    pago: PagoRevendedor;
    linkPago: string;
  }> {
    let plan: PlanRevendedor | null = null;
    let precioFinal = 0;

    // 1. Obtener el plan (exacto o dinámico)
    if (input.planRevendedorId > 0) {
      plan = await this.obtenerPlanPorId(input.planRevendedorId);
      if (!plan) throw new Error("Plan de revendedor no encontrado");
      if (!plan.activo) throw new Error("Plan no disponible");
      precioFinal = plan.precio;
    } else if (input.maxUsers && input.maxUsers > 0) {
      // Cálculo dinámico para planes personalizados o > 100
      const resultado = await this.calcularPrecioDinamico(input.maxUsers);
      plan = resultado.plan;
      precioFinal = resultado.precio;
      console.log(`[TiendaRevendedores] 🧮 Cálculo dinámico para ${input.maxUsers} usuarios: $${precioFinal}`);
    } else {
      throw new Error("Debe proporcionar un planId o una cantidad de usuarios (maxUsers)");
    }
    let descuentoAplicado = 0;
    let cuponId: number | undefined;

    const duracionInferida = this.inferirDuracionPlan(plan);
    if (!plan.dias && duracionInferida) {
      plan = { ...plan, dias: duracionInferida } as PlanRevendedor;
      console.log(
        `[TiendaRevendedores] ℹ️ Duración ajustada para plan ${plan.id}: ${duracionInferida} días`
      );
    }
    console.log(
      `[TiendaRevendedores] Plan ${plan!.id} - Precio final: $${plan!.precio}`
    );

    // 3. Validar cupón si se proporcionó uno
    if (input.codigoCupon) {
      console.log(`[TiendaRevendedores] Validando cupón: ${input.codigoCupon}`);
      const validacion = await cuponesSupabaseService.validarCupon(input.codigoCupon, input.planRevendedorId, input.clienteEmail);

      if (!validacion.valido) {
        throw new Error(validacion.mensaje_error || "Cupón inválido");
      }

      // Validar que el cupón existe
      if (!validacion.cupon) {
        console.error('[TiendaRevendedores] ERROR: Cupón validado pero no encontrado!', validacion);
        throw new Error("Error: Cupón validado pero no encontrado");
      }

      // Calcular el descuento basado en el precio del plan
      descuentoAplicado = cuponesSupabaseService.calcularDescuento(validacion.cupon, plan!.precio);
      precioFinal = Math.max(0, plan!.precio - descuentoAplicado);
      cuponId = validacion.cupon.id;

      console.log(`[TiendaRevendedores] ✅ Cupón válido: ${validacion.cupon.codigo}`);
      console.log(`[TiendaRevendedores] 📊 Descuento: $${descuentoAplicado} aplicado`);
      console.log(`[TiendaRevendedores] 💰 Precio: $${plan!.precio} → $${precioFinal}`);
    }

    // 4. Crear registro de pago en la base de datos
    const pagoId = uuidv4();
    const pago = this.db.crearPagoRevendedor({
      id: pagoId,
      plan_revendedor_id: plan!.id || 0, // 0 para planes dinámicos
      monto: precioFinal,
      estado: "pendiente",
      metodo_pago: "mercadopago",
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
      cupon_id: cuponId,
      descuento_aplicado: descuentoAplicado,
      servex_max_users: plan!.max_users, // Guardamos la cantidad solicitada
      servex_account_type: plan!.account_type,
    });

    console.log("[TiendaRevendedores] Pago creado:", pagoId);

    // 3. Crear preferencia en MercadoPago
    try {
      const { id: preferenceId, initPoint } =
        await this.mercadopago.crearPreferencia(
          pagoId,
          plan!.nombre,
          precioFinal, // Usar precio con descuento aplicado
          input.clienteEmail,
          input.clienteNombre,
          "revendedor"
        );

      console.log(
        "[TiendaRevendedores] Preferencia de MercadoPago creada:",
        preferenceId
      );

      return {
        pago,
        linkPago: initPoint,
      };
    } catch (error: any) {
      // Si falla la creación de la preferencia, marcar el pago como rechazado
      this.db.actualizarEstadoPagoRevendedor(pagoId, "rechazado");
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  /**
   * Procesa un webhook de MercadoPago para revendedores
   * NOTA: Si el pagoId corresponde a una renovación (no a un pago directo), 
   * se delega al servicio de renovaciones
   */
  async procesarWebhook(body: any): Promise<void> {
    console.log("[TiendaRevendedores] 📨 Procesando webhook...", JSON.stringify(body).substring(0, 200));

    const resultado = await this.mercadopago.procesarWebhook(body);

    if (!resultado.procesado || !resultado.pagoId) {
      console.log(
        "[TiendaRevendedores] ⚠️ Webhook no procesado o sin referencia de pago",
        { procesado: resultado.procesado, pagoId: resultado.pagoId }
      );
      return;
    }

    const { pagoId, mpPaymentId, estado } = resultado;
    console.log(
      `[TiendaRevendedores] ✅ Webhook procesado: pagoId=${pagoId}, estado=${estado}, mpPaymentId=${mpPaymentId}`
    );

    // Obtener el pago de nuestra base de datos
    const pago = this.db.obtenerPagoRevendedorPorId(pagoId);
    if (!pago) {
      // ⚠️ IMPORTANTE: El pagoId podría ser un ID de renovación (no de pago directo)
      // Esto ocurre cuando se crea una renovación de revendedor: la external_reference
      // es el ID de la renovación, no del pago. En ese caso, ignoramos aquí y dejamos
      // que el webhook sea procesado por RenovacionService (vía webhook unificado o directo)
      console.warn(
        "[TiendaRevendedores] ℹ️ ID no encontrado en table pagos_revendedores:",
        pagoId,
        "- Podría ser una renovación de revendedor. Delegando a RenovacionService."
      );
      return;
    }

    console.log(
      `[TiendaRevendedores] 📊 Estado actual en BD: ${pago.estado}, estado MercadoPago: ${estado}`
    );

    // Actualizar estado según la respuesta de MercadoPago
    if (estado === "approved") {
      // Procesar si el pago está pendiente o rechazado (ya que puede llegar primero el webhook de rejected)
      if (pago.estado === "pendiente" || pago.estado === "rechazado") {
        console.log(
          `[TiendaRevendedores] 🔄 Pago aprobado en MP, creando revendedor...`
        );
        await this.confirmarPagoYCrearRevendedor(pagoId, mpPaymentId!);
      } else {
        console.log(
          `[TiendaRevendedores] ⚠️ Pago ya procesado anteriormente (estado: ${pago.estado})`
        );
      }
    } else if (estado === "rejected" || estado === "cancelled") {
      // Solo marcar como rechazado si aún está pendiente
      if (pago.estado === "pendiente") {
        this.db.actualizarEstadoPagoRevendedor(
          pagoId,
          "rechazado",
          mpPaymentId
        );
        console.log(
          `[TiendaRevendedores] ❌ Pago marcado como rechazado (estado MercadoPago: ${estado})`
        );
      }
    } else {
      console.log(
        `[TiendaRevendedores] ℹ️ Estado de pago no reconocido: ${estado}`
      );
    }
  }

  /**
   * Confirma un pago y crea el revendedor en Servex
   * ✅ MEJORADO: Validación anti-duplicado
   */
  private async confirmarPagoYCrearRevendedor(
    pagoId: string,
    mpPaymentId: string
  ): Promise<void> {
    console.log(
      "[TiendaRevendedores] Confirmando pago y creando revendedor:",
      pagoId
    );

    // Obtener pago y plan
    let pago = this.db.obtenerPagoRevendedorPorId(pagoId);
    if (!pago) {
      throw new Error("Pago no encontrado");
    }

    // ✅ VALIDACIÓN ANTI-DUPLICADO: Verificar si ya tiene revendedor
    if (pago.servex_revendedor_id) {
      console.log(
        "[TiendaRevendedores] ⚠️ Revendedor ya fue creado para este pago:",
        pago.servex_revendedor_id,
        "- Abortando para evitar duplicados"
      );
      return;
    }

    // ✅ VALIDACIÓN ANTI-RACE-CONDITION: Verificar si el pago ya fue procesado
    // (estado != "pendiente" significa que otro webhook ya lo procesó)
    if (pago.estado !== "pendiente") {
      console.log(
        "[TiendaRevendedores] ⚠️ Pago ya fue procesado (estado: " +
          pago.estado +
          ") - Abortando para evitar duplicados"
      );
      return;
    }

    const plan = await this.obtenerPlanPorId(pago.plan_revendedor_id);
    if (!plan) {
      throw new Error("Plan no encontrado");
    }

    try {
      // 1. Marcar estado como "aprobado" INMEDIATAMENTE para evitar race condition
      // Esto protege contra múltiples webhooks simultáneos
      this.db.actualizarEstadoPagoRevendedor(pagoId, "aprobado", mpPaymentId);
      console.log(
        "[TiendaRevendedores] ✅ Estado marcado como aprobado (bloqueo de duplicados)"
      );

      // 2. Generar credenciales usando el nombre del cliente
      const { username, password, name } =
        this.servex.generarCredencialesRevendedor(pago.cliente_nombre);
      console.log(
        `[TiendaRevendedores] Username generado: ${username} para cliente: ${pago.cliente_nombre}`
      );
      console.log(
        `[TiendaRevendedores] Nombre visible normalizado para Servex: ${name}`
      );

      // 3. Obtener categorías activas (no expiradas)
      const categorias = await this.servex.obtenerCategoriasActivas();
      if (categorias.length === 0) {
        throw new Error(
          "No hay categorías activas disponibles en Servex. Por favor contacte al administrador."
        );
      }

      // Usar todas las categorías activas disponibles
      const categoryIds = categorias.map((c) => c.id);
      console.log(
        `[TiendaRevendedores] Usando ${
          categoryIds.length
        } categorías activas: [${categoryIds.join(", ")}]`
      );

      // Preparar datos del revendedor
      const revendedorData: RevendedorServex = {
        name,
        username,
        password,
        max_users: plan.max_users,
        account_type: plan.account_type,
        category_ids: categoryIds,
        obs: `Cliente: ${pago.cliente_nombre} - Email: ${pago.cliente_email} - Plan: ${plan.nombre}`,
      };

      // Agregar fecha de expiración para ambos tipos de cuenta (validity y credit)
      // Servex requiere expiration_date para que las cuentas expiren correctamente
      const duracionDias = this.inferirDuracionPlan(plan);

      if (duracionDias) {
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + duracionDias);
        revendedorData.expiration_date = fechaExpiracion
          .toISOString()
          .split("T")[0]; // YYYY-MM-DD
        console.log(
          `[TiendaRevendedores] 📅 Fecha de expiración calculada para ${plan.account_type}:`,
          revendedorData.expiration_date
        );
      } else {
        console.warn(
          `[TiendaRevendedores] ⚠️ No se pudo inferir duración para el plan ${plan.id}, la cuenta no tendrá fecha de expiración inicial`
        );
      }

      // 5. Crear revendedor en Servex
      const revendedorCreado = await this.servex.crearRevendedor(
        revendedorData
      );

      // ✅ VALIDACIÓN CRÍTICA: Asegurar que tenemos un ID válido
      if (!revendedorCreado || !revendedorCreado.id || revendedorCreado.id === 0) {
        throw new Error(
          `Revendedor creado en Servex pero sin ID válido. Username: ${username}. ` +
          `Respuesta de Servex: ${JSON.stringify(revendedorCreado)}`
        );
      }

      console.log(
        `[TiendaRevendedores] ✅ ID del revendedor validado: ${revendedorCreado.id}`
      );

      // 6. Calcular y guardar información del revendedor en la base de datos
      // Usar la expiración devuelta por Servex, o calcularla si no la devuelve
      let expiracionFinal = revendedorCreado.expiration_date;
      if (!expiracionFinal && plan.dias) {
        // Si Servex no devuelve expiration_date pero el plan tiene días, calcular internamente
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + plan.dias);
        expiracionFinal = fechaExpiracion.toISOString().split("T")[0];
        console.log(
          "[TiendaRevendedores] 📅 Expiración calculada internamente:",
          expiracionFinal
        );
      }

      this.db.guardarRevendedorServex(
        pagoId,
        revendedorCreado.id,
        revendedorCreado.username,
        password, // Guardamos la contraseña generada, no la que devuelve Servex
        revendedorCreado.max_users,
        revendedorCreado.account_type,
        expiracionFinal,
        duracionDias // Guardar la duración en días del plan (incluye inferencia)
      );

      console.log(
        "[TiendaRevendedores] ✅ Revendedor creado exitosamente:",
        revendedorCreado.username
      );

      // Aplicar cupón si se usó uno
      if (pago.cupon_id) {
        try {
          await cuponesSupabaseService.aplicarCuponSimple(pago.cupon_id);
          console.log(`[TiendaRevendedores] ✅ Cupón ${pago.cupon_id} aplicado (uso incrementado)`);
        } catch (cuponError: any) {
          console.error(`[TiendaRevendedores] ⚠️ Error aplicando cupón ${pago.cupon_id}:`, cuponError.message);
          // No fallar la creación del revendedor por error en cupón
        }
      }

      // Enviar email con las credenciales
      try {
        await emailService.enviarCredencialesRevendedor(pago.cliente_email, {
          username: revendedorCreado.username,
          password: password,
          tipo: plan.account_type === "credit" ? "credito" : "validez",
          credito: plan.account_type === "credit" ? plan.max_users : undefined,
          validez:
            plan.account_type === "validity" && revendedorCreado.expiration_date
              ? new Date(revendedorCreado.expiration_date).toLocaleDateString(
                  "es-AR"
                )
              : undefined,
          panelUrl: "https://servex.ws",
        });
        console.log(
          "[TiendaRevendedores] ✅ Email enviado a:",
          pago.cliente_email
        );
      } catch (emailError: any) {
        console.error(
          "[TiendaRevendedores] ⚠️ Error enviando email:",
          emailError.message
        );
        // No lanzamos error, el servicio principal ya está creado
      }

      // Notificar al administrador
      try {
        await emailService.notificarVentaAdmin("revendedor", {
          clienteNombre: pago.cliente_nombre,
          clienteEmail: pago.cliente_email,
          monto: pago.monto,
          descripcion: `Plan Revendedor: ${plan.nombre} (${
            plan.account_type === "credit"
              ? `${plan.max_users} créditos`
              : `Válido hasta ${
                  revendedorCreado.expiration_date
                    ? new Date(
                        revendedorCreado.expiration_date
                      ).toLocaleDateString("es-AR")
                    : "N/A"
                }`
          })`,
          username: revendedorCreado.username,
        });
        console.log(
          "[TiendaRevendedores] ✅ Notificación enviada al administrador"
        );
      } catch (emailError: any) {
        console.error(
          "[TiendaRevendedores] ⚠️ Error notificando al admin:",
          emailError.message
        );
        // No lanzamos error, la venta ya está procesada
      }

      // Sincronizar con Supabase (historial de usuario)
      try {
        await supabaseService.syncApprovedPurchase({
          email: pago.cliente_email,
          planNombre: `Revendedor: ${plan.nombre}`,
          monto: pago.monto,
          tipo: "revendedor",
          servexUsername: revendedorCreado.username,
          servexPassword: password,
          servexExpiracion: expiracionFinal || undefined,
          servexConnectionLimit: revendedorCreado.max_users,
          mpPaymentId: mpPaymentId,
        });
      } catch (supabaseError: any) {
        console.error(
          "[TiendaRevendedores] ⚠️ Error sincronizando con Supabase:",
          supabaseError.message
        );
        // No bloqueamos la venta por error al sincronizar con Supabase
      }
    } catch (error: any) {
      console.error(
        "[TiendaRevendedores] ❌ Error creando revendedor:",
        error.message
      );
      // Revertir el estado del pago si falla la creación del revendedor
      this.db.actualizarEstadoPagoRevendedor(pagoId, "pendiente");
      throw error;
    }
  }

  /**
   * Obtiene información de un pago de revendedor
   */
  obtenerPago(pagoId: string): PagoRevendedor | null {
    return this.db.obtenerPagoRevendedorPorId(pagoId);
  }

  /**
   * Verifica y procesa un pago manualmente (para cuando el cliente vuelve de MP)
   */
  async verificarYProcesarPago(pagoId: string): Promise<PagoRevendedor | null> {
    console.log(`[TiendaRevendedores] 🔍 verificarYProcesarPago: ${pagoId}`);
    try {
      const pago = this.db.obtenerPagoRevendedorPorId(pagoId);
      console.log(`[TiendaRevendedores] ✅ Pago obtenido de BD:`, pago ? "SÍ" : "NO");
      
      if (!pago) {
        console.log(`[TiendaRevendedores] ❌ Pago no encontrado`);
        return null;
      }

      console.log(`[TiendaRevendedores] 📊 Estado del pago:`, pago.estado);

      // Si el pago ya está aprobado, solo devolver la información
      if (pago.estado === "aprobado") {
        console.log(`[TiendaRevendedores] ✅ Pago ya aprobado, devolviendo...`);
        return pago;
      }

      // Si está pendiente O rechazado, verificar en MercadoPago
      // (rechazado también porque el usuario puede haber hecho un segundo intento exitoso)
      if (pago.estado === "pendiente" || pago.estado === "rechazado") {
        console.log(`[TiendaRevendedores] 🌐 Pago ${pago.estado}, verificando en MercadoPago...`);
        const pagoMP = await this.mercadopago.verificarPagoPorReferencia(pagoId);
        console.log(`[TiendaRevendedores] 📊 Respuesta MercadoPago:`, pagoMP ? `ENCONTRADO (status: ${pagoMP.status}, id: ${pagoMP.id})` : "NO ENCONTRADO");

        if (pagoMP && pagoMP.status === "approved") {
          console.log(`[TiendaRevendedores] ✅ MercadoPago aprobado (payment_id: ${pagoMP.id}), creando revendedor...`);
          
          // Si el pago estaba rechazado, primero lo volvemos a pendiente para que confirmarPagoYCrearRevendedor funcione
          if (pago.estado === "rechazado") {
            console.log(`[TiendaRevendedores] 🔄 Pago rechazado tiene nuevo pago aprobado, reseteando a pendiente...`);
            this.db.actualizarEstadoPagoRevendedor(pagoId, "pendiente");
          }
          
          // Confirmar el pago y crear el revendedor
          await this.confirmarPagoYCrearRevendedor(pagoId, pagoMP.id);
          // Devolver el pago actualizado
          const pagoActualizado = this.db.obtenerPagoRevendedorPorId(pagoId);
          console.log(`[TiendaRevendedores] ✅ Revendedor creado, devolviendo pago actualizado`);
          return pagoActualizado;
        } else {
          console.log(`[TiendaRevendedores] ⚠️ MercadoPago no aprobado (status: ${pagoMP?.status || 'N/A'})`);
        }
      }

      console.log(`[TiendaRevendedores] ℹ️ Devolviendo pago con estado:`, pago.estado);
      return pago;
    } catch (error: any) {
      console.error(`[TiendaRevendedores] ❌ ERROR EN verificarYProcesarPago:`, error.message);
      console.error(`[TiendaRevendedores] Stack:`, error.stack);
      throw error;
    }
  }
}
