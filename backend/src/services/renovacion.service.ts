import { DatabaseService } from './database.service';
import { ServexService } from './servex.service';
import { MercadoPagoService } from './mercadopago.service';
import { configService } from './config.service';
import emailService from './email.service';
import { cuponesSupabaseService } from './cupones-supabase.service';
import { referidosService } from './referidos.service';
import { supabaseService } from './supabase.service';
import { RenovacionAutoRetryConfig } from '../types';
import { calcularPrecioResellerDecompuesto } from './billing.utils';

export class RenovacionService {
  constructor(
    private db: DatabaseService,
    private servex: ServexService,
    private mercadopago: MercadoPagoService
  ) {}

  private autoRetryTimer: NodeJS.Timeout | null = null;
  private autoRetryRunning = false;
  private autoRetryAttempts = new Map<number, number>();

  private parseYYYYMMDDToUTC(dateStr?: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') {
      return null;
    }

    // Extraer la parte de fecha (YYYY-MM-DD), permitiendo que tenga tiempo después (ISO format)
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(dateStr.trim());
    if (!match) {
      return null;
    }

    const year = Number(match[1]);
    const month = Number(match[2]);
    const day = Number(match[3]);

    if (!Number.isFinite(year) || !Number.isFinite(month) || !Number.isFinite(day)) {
      return null;
    }

    return new Date(Date.UTC(year, month - 1, day));
  }

  private utcTodayStart(): Date {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  }

  private addDaysUTC(date: Date, days: number): Date {
    const result = new Date(date.getTime());
    result.setUTCDate(result.getUTCDate() + days);
    return result;
  }

  private formatUTCDateOnly(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private getRenovacionBaseDateUTC(expirationDateStr?: string): Date {
    const today = this.utcTodayStart();
    const expiration = this.parseYYYYMMDDToUTC(expirationDateStr);

    console.log(`[Renovacion] 🕒 getRenovacionBaseDateUTC: Recibido="${expirationDateStr}", Hoy="${this.formatUTCDateOnly(today)}"`);

    if (expiration) {
      console.log(`[Renovacion] 📅 Fecha expiración parseada: ${this.formatUTCDateOnly(expiration)}`);
      if (expiration.getTime() >= today.getTime()) {
        console.log(`[Renovacion] 📈 Renovación CUMULATIVA desde: ${this.formatUTCDateOnly(expiration)}`);
        return expiration;
      }
      console.log(`[Renovacion] ⏳ La expiración está en el pasado, renovando desde HOY`);
    } else {
      console.log(`[Renovacion] ❓ No se pudo parsear la fecha o no existe, renovando desde HOY`);
    }

    return today;
  }

  /**
   * Getter para acceder al servicio de Servex desde las rutas
   */
  getServexService(): ServexService {
    return this.servex;
  }

  iniciarAutoRevisionesPendientes(config: RenovacionAutoRetryConfig): void {
    if (!config.enabled) {
      console.log('[Renovacion] Auto-revisión de pendientes deshabilitada por configuración');
      return;
    }

    if (this.autoRetryTimer) {
      return;
    }

    const revisarPendientes = async () => {
      if (this.autoRetryRunning) {
        return;
      }

      this.autoRetryRunning = true;

      try {
        const pendientes = this.db.obtenerRenovacionesPendientes({
          updatedBeforeMinutes: config.minPendingAgeMinutes,
          limit: config.batchSize,
        });

        if (!pendientes.length) {
          return;
        }

        console.log(`[Renovacion] 🔄 Revisando ${pendientes.length} renovaciones pendientes automaticamente`);

        for (const pendiente of pendientes) {
          const renovacionId = Number(pendiente.id);
          if (!Number.isFinite(renovacionId)) {
            continue;
          }

          const tipoRenovacion = pendiente.tipo === 'revendedor' ? '🔄 Revendedor' : '👤 Cliente';
          console.log(`[Renovacion] ${tipoRenovacion}: Procesando renovación ${renovacionId}...`);

          if (typeof config.maxAttempts === 'number' && config.maxAttempts > 0) {
            const intentosPrevios = this.autoRetryAttempts.get(renovacionId) ?? 0;
            if (intentosPrevios >= config.maxAttempts) {
              console.warn(
                `[Renovacion] ⚠️ Renovación ${renovacionId} alcanzó el máximo de reintentos automáticos (${config.maxAttempts})`
              );
              this.db.refrescarTimestampRenovacion(renovacionId);
              continue;
            }
          }

          try {
            const resultado = await this.verificarYProcesarRenovacion(renovacionId, false);

            if (resultado && resultado.estado === 'aprobado') {
              this.autoRetryAttempts.delete(renovacionId);
              console.log(`[Renovacion] ✅ Renovación ${renovacionId} (${pendiente.tipo}) aprobada mediante auto-revisión`);
            } else {
              const intentosPrevios = this.autoRetryAttempts.get(renovacionId) ?? 0;
              this.autoRetryAttempts.set(renovacionId, intentosPrevios + 1);
              this.db.refrescarTimestampRenovacion(renovacionId);
              console.log(`[Renovacion] ⏳ Renovación ${renovacionId} (${pendiente.tipo}) sigue pendiente tras auto-revisión`);
            }
          } catch (error: any) {
            console.error(
              `[Renovacion] ❌ Error en auto-revisión de renovación ${renovacionId} (${pendiente.tipo}):`,
              error?.message || error
            );
            this.db.refrescarTimestampRenovacion(renovacionId);
          }
        }
      } finally {
        this.autoRetryRunning = false;
      }
    };

    const programarIntervalo = () => {
      const intervalo = Math.max(config.intervalMs, 60_000);
      this.autoRetryTimer = setInterval(() => {
        revisarPendientes().catch((error) =>
          console.error('[Renovacion] ❌ Error inesperado en auto-revisión programada:', error?.message || error)
        );
      }, intervalo);
    };

    const delayInicial = Math.max(0, config.initialDelayMs);
    setTimeout(() => {
      revisarPendientes()
        .catch((error) =>
          console.error('[Renovacion] ❌ Error inesperado en auto-revisión inicial:', error?.message || error)
        )
        .finally(programarIntervalo);
    }, delayInicial);
  }

  /**
   * Busca un cliente o revendedor por username en Servex
   * @param busqueda - Email o username a buscar
   * @param soloClientes - Si es true, solo busca clientes, no revendedores
   * @param soloRevendedores - Si es true, solo busca revendedores, no clientes
   */
  async buscarCliente(busqueda: string, soloClientes: boolean = false, soloRevendedores: boolean = false): Promise<{
    encontrado: boolean;
    tipo?: 'cliente' | 'revendedor';
    datos?: any;
  }> {
    console.log(`[Renovacion] 🔍 Buscando cuenta: "${busqueda}", soloClientes: ${soloClientes}, soloRevendedores: ${soloRevendedores}`);

    // Primero buscar en la base de datos local (compras anteriores)
    if (!soloRevendedores) {
      const clienteDB = this.db.buscarClientePorUsername(busqueda);
      if (clienteDB) {
        console.log(`[Renovacion] ✅ Cliente encontrado en DB local: ${clienteDB.servex_username} (ID: ${clienteDB.servex_cuenta_id})`);
        return {
          encontrado: true,
          tipo: 'cliente',
          datos: {
            servex_cuenta_id: clienteDB.servex_cuenta_id,
            servex_username: clienteDB.servex_username,
            cliente_nombre: clienteDB.cliente_nombre,
            cliente_email: clienteDB.cliente_email,
            plan_nombre: clienteDB.plan_nombre
          }
        };
      }
    }

    if (!soloClientes) {
      const revendedorDB = this.db.buscarRevendedorPorUsername(busqueda);
      if (revendedorDB) {
        let servexId = revendedorDB.servex_revendedor_id;
        
        // 🔧 SIEMPRE CONSULTAR SERVEX para obtener datos actuales (max_users, expiration_date, etc)
        console.log(`[Renovacion] 🔄 Revendedor encontrado en DB local, obteniendo datos actuales de Servex...`);
        try {
          const revendedorServex = await this.servex.buscarRevendedorPorUsername(revendedorDB.servex_username);
          if (revendedorServex && revendedorServex.id) {
            servexId = revendedorServex.id;
            
            // Si el ID cambió, actualizar la DB
            if (servexId !== revendedorDB.servex_revendedor_id) {
              this.db.actualizarServexIdRevendedor(revendedorDB.servex_username, servexId);
              console.log(`[Renovacion] ✅ ID actualizado en DB: ${revendedorDB.servex_username} -> ID: ${servexId}`);
            }
            
            console.log(`[Renovacion] ✅ Revendedor con datos actuales de Servex: ${revendedorServex.username} (ID: ${servexId}, max_users: ${revendedorServex.max_users}, expiration: ${revendedorServex.expiration_date})`);
            return {
              encontrado: true,
              tipo: 'revendedor',
              datos: {
                servex_revendedor_id: servexId,
                servex_username: revendedorServex.username,
                servex_account_type: revendedorServex.account_type,
                max_users: revendedorServex.max_users || 0,
                expiration_date: revendedorServex.expiration_date,
                cliente_nombre: revendedorDB.cliente_nombre,
                cliente_email: revendedorDB.cliente_email,
                plan_nombre: revendedorDB.plan_nombre
              }
            };
          } else {
            console.error(`[Renovacion] ❌ No se pudo obtener datos actuales de Servex para ${revendedorDB.servex_username}`);
          }
        } catch (servexError: any) {
          console.error(`[Renovacion] ❌ Error consultando Servex:`, servexError.message);
          // Continuar con datos de DB local como fallback
        }
        
        // Fallback: usar datos de DB local si falla Servex
        const maxUsersDb = revendedorDB.servex_max_users ?? revendedorDB.max_users ?? 0;
        console.log(`[Renovacion] ⚠️ Usando datos de DB local como fallback: ${revendedorDB.servex_username} (ID: ${servexId}, max_users: ${maxUsersDb})`);
        return {
          encontrado: true,
          tipo: 'revendedor',
          datos: {
            servex_revendedor_id: servexId,
            servex_username: revendedorDB.servex_username,
            servex_account_type: revendedorDB.servex_account_type,
            max_users: Number(maxUsersDb) || 0,
            expiration_date: revendedorDB.expiration_date,
            cliente_nombre: revendedorDB.cliente_nombre,
            cliente_email: revendedorDB.cliente_email,
            plan_nombre: revendedorDB.plan_nombre
          }
        };
      }
    }

    // Si no está en la DB, buscar directamente en Servex por username
    try {
      console.log(`[Renovacion] 🔍 Buscando en Servex API...`);
      if (!soloRevendedores) {
        const clienteServex = await this.servex.buscarClientePorUsername(busqueda);
        if (clienteServex) {
          console.log(`[Renovacion] ✅ Cliente encontrado en Servex: ${clienteServex.username} (ID: ${clienteServex.id})`);
          return {
            encontrado: true,
            tipo: 'cliente',
            datos: {
              servex_cuenta_id: clienteServex.id,
              servex_username: clienteServex.username,
              connection_limit: clienteServex.connection_limit || 1,
              cliente_nombre: busqueda,
              cliente_email: ''
            }
          };
        }
      }

      if (!soloClientes) {
        const revendedorServex = await this.servex.buscarRevendedorPorUsername(busqueda);
        if (revendedorServex) {
          console.log(`[Renovacion] ✅ Revendedor encontrado en Servex: ${revendedorServex.username} (ID: ${revendedorServex.id}, max_users: ${revendedorServex.max_users})`);
          return {
            encontrado: true,
            tipo: 'revendedor',
            datos: {
              servex_revendedor_id: revendedorServex.id,
              servex_username: revendedorServex.username,
              servex_account_type: revendedorServex.account_type,
              max_users: revendedorServex.max_users || 0,
              expiration_date: revendedorServex.expiration_date,
              cliente_nombre: busqueda,
              cliente_email: ''
            }
          };
        }
      }
    } catch (error: any) {
      console.error('[Renovacion] ❌ Error buscando en Servex:', error.message);
    }

    console.log(`[Renovacion] ❌ Cuenta no encontrada: "${busqueda}"`);
    return { encontrado: false };
  }

  /**
   * Procesa una renovación de cliente
   */
  async procesarRenovacionCliente(input: {
    busqueda: string;
    dias: number;
    precio?: number; // Precio calculado desde el frontend con overrides aplicados
    clienteEmail: string;
    clienteNombre: string;
    saldoEmail?: string;
    nuevoConnectionLimit?: number;
    precioOriginal?: number;
    planId?: number;
    codigoCupon?: string;
    cuponId?: number;
    descuentoAplicado?: number;
    codigoReferido?: string;
    saldoUsado?: number;
  }): Promise<{
    renovacion: any;
    linkPago?: string;
    descuentoAplicado?: number;
    cuponAplicado?: any;
    descuentoReferido?: number;
    saldoAplicado?: number;
    procesadoAlInstante?: boolean;
  }> {
    console.log(`[Renovacion] 🚀 Iniciando procesamiento de renovación de cliente: ${input.busqueda} (${input.dias} días)`);
    console.log('[Renovacion] Input recibido:', JSON.stringify(input, null, 2));
    
    // 1. Buscar cliente existente
    const resultado = await this.buscarCliente(input.busqueda, true);
    
    if (!resultado.encontrado || resultado.tipo !== 'cliente') {
      throw new Error('Cliente no encontrado');
    }

    const clienteExistente = resultado.datos;

    // 2. Determinar si hay cambio de dispositivos
    const connectionLimitActual = clienteExistente.connection_limit || 1;
    const connectionLimitNuevo = input.nuevoConnectionLimit || connectionLimitActual;
    const hayCambioDispositivos = connectionLimitNuevo !== connectionLimitActual;
    const operacion = hayCambioDispositivos ? 'upgrade' : 'renovacion';
    
    console.log(`[Renovacion] Límite actual: ${connectionLimitActual}, Nuevo límite: ${connectionLimitNuevo}, Hay cambio: ${hayCambioDispositivos}`);

    // 3. Calcular precio base considerando overrides actuales
    const precioBaseCalculado = this.calcularPrecioBaseRenovacion(input.dias, connectionLimitNuevo);
    let precioBase = precioBaseCalculado;

    if (input.precioOriginal && input.precioOriginal > 0) {
      if (Math.abs(input.precioOriginal - precioBaseCalculado) > 1) {
        console.log(
          `[Renovacion] ⚠️ Precio original recibido (${input.precioOriginal}) difiere del calculado (${precioBaseCalculado}). Usando recibido.`
        );
      }
      precioBase = Math.round(input.precioOriginal);
    }

    let cuponAplicado: any = null;
    let descuentoAplicado = 0;

    if (input.codigoCupon) {
      const codigoNormalizado = input.codigoCupon.trim().toUpperCase();
      console.log(`[Renovacion] Validando cupón ${codigoNormalizado} para renovación`);

      const validacion = await cuponesSupabaseService.validarCupon(
        codigoNormalizado,
        input.planId,
        input.clienteEmail
      );

      if (!validacion.valido || !validacion.cupon) {
        throw new Error(validacion.mensaje_error || 'Cupón inválido');
      }

      cuponAplicado = validacion.cupon;
      if (input.cuponId && cuponAplicado.id && input.cuponId !== cuponAplicado.id) {
        console.warn(
          `[Renovacion] ⚠️ ID de cupón recibido (${input.cuponId}) difiere del validado (${cuponAplicado.id})`
        );
      }

      descuentoAplicado = Math.min(
        precioBase,
        Math.round(cuponesSupabaseService.calcularDescuento(cuponAplicado, precioBase))
      );

      console.log(
        `[Renovacion] Cupón ${cuponAplicado.codigo} válido. Descuento: $${descuentoAplicado}. Precio base: $${precioBase}`
      );
    }

    // 3.1. Aplicar descuento de referido
    let descuentoReferido = 0;
    if (input.codigoReferido && referidosService.isEnabled()) {
      const saldoOwnerEmail = input.saldoEmail || input.clienteEmail;
      const validacion = await referidosService.validarCodigo(input.codigoReferido, saldoOwnerEmail);
      if (validacion.valido && validacion.descuento) {
        descuentoReferido = Math.round((precioBase * validacion.descuento) / 100);
        console.log(`[Renovacion] Código de referido ${input.codigoReferido} aplicado. Descuento: $${descuentoReferido}`);
      }
    }

    let montoSubtotal = Math.max(0, Math.round(precioBase - descuentoAplicado - descuentoReferido));

    // 3.2. Aplicar uso de saldo
    let saldoAplicado = 0;
    if (input.saldoUsado && input.saldoUsado > 0 && referidosService.isEnabled()) {
      const saldoOwnerEmail = input.saldoEmail || input.clienteEmail;
      const userData = await referidosService.getSaldoByEmail(saldoOwnerEmail);
      if (userData && userData.saldo > 0) {
        saldoAplicado = Math.min(montoSubtotal, userData.saldo, input.saldoUsado);
        console.log(`[Renovacion] Usando $${saldoAplicado} del saldo del usuario (${userData.saldo} disponible) [email: ${saldoOwnerEmail}]`);
      }
    }

    let monto = Math.max(0, Math.round(montoSubtotal - saldoAplicado));

    if (!monto || monto <= 0) {
      throw new Error('El total a pagar con el cupón debe ser mayor a 0');
    }

    if (input.precio && Math.abs(input.precio - monto) > 1) {
      console.log(
        `[Renovacion] ⚠️ Diferencia entre precio recibido (${input.precio}) y calculado (${monto}). Se usará el calculado.`
      );
    }

    console.log(`[Renovacion] ${hayCambioDispositivos ? 'Upgrade' : 'Renovación'}: ${connectionLimitActual} -> ${connectionLimitNuevo} dispositivos`);
    console.log(`[Renovacion] Precio base: $${precioBase}. Descuento aplicado: $${descuentoAplicado}. Monto final: $${monto}`);

    // 4. Crear registro de renovación
    const renovacionData: any = {
      tipo: 'cliente',
      servex_id: clienteExistente.servex_cuenta_id,
      servex_username: clienteExistente.servex_username,
      operacion,
      dias_agregados: input.dias,
      monto,
      metodo_pago: 'mercadopago',
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
      estado: 'pendiente',
      cupon_id: cuponAplicado?.id || null,
      descuento_aplicado: descuentoAplicado,
      metadata: JSON.stringify({
        codigoReferido: input.codigoReferido || null,
        saldoEmail: input.saldoEmail || null,
        saldoUsado: saldoAplicado || 0,
        montoOriginal: precioBase,
        descuentoReferido: descuentoReferido || 0
      })
    };

    if (hayCambioDispositivos) {
      renovacionData.datos_anteriores = JSON.stringify({ connection_limit: connectionLimitActual });
      renovacionData.datos_nuevos = JSON.stringify({ connection_limit: connectionLimitNuevo });
    }

    const renovacion = this.db.crearRenovacion(renovacionData);
    const renovacionId = renovacion.id;

      console.log('[Renovacion] Renovación creada:', renovacionId);

    // 4.1. Si el monto es 0, procesar al instante
    if (monto <= 0) {
      console.log(`[Renovacion] ✅ Monto final es 0. Procesando renovación ID ${renovacionId} al instante.`);
      await this.confirmarRenovacion(renovacionId, 'PAGO_SALDO_COMPLETO');
      
      return {
        renovacion: this.db.obtenerRenovacionPorId(renovacionId),
        procesadoAlInstante: true,
        descuentoAplicado: descuentoAplicado > 0 ? descuentoAplicado : undefined,
        cuponAplicado,
        descuentoReferido: descuentoReferido > 0 ? descuentoReferido : undefined,
        saldoAplicado: saldoAplicado > 0 ? saldoAplicado : undefined
      };
    }

    // 5. Crear preferencia en MercadoPago
    try {
      const descripcion = hayCambioDispositivos
        ? `${operacion === 'upgrade' ? 'Upgrade' : 'Cambio'} a ${connectionLimitNuevo} disp. + ${input.dias} días - ${clienteExistente.servex_username}`
        : `Renovación ${input.dias} días - ${clienteExistente.servex_username}`;

      const { id: preferenceId, initPoint } = await this.mercadopago.crearPreferencia(
        renovacionId.toString(),
        descripcion,
        monto,
        input.clienteEmail,
        input.clienteNombre,
        'renovacion-cliente'
      );

      console.log('[Renovacion] Preferencia de MercadoPago creada:', preferenceId);

      console.log(`[Renovacion] ✅ Renovación de cliente procesada exitosamente: ID ${renovacionId}, link: ${initPoint}`);
      return {
        renovacion,
        linkPago: initPoint,
        descuentoAplicado: descuentoAplicado > 0 ? descuentoAplicado : undefined,
        cuponAplicado: cuponAplicado,
        descuentoReferido: descuentoReferido > 0 ? descuentoReferido : undefined,
        saldoAplicado: saldoAplicado > 0 ? saldoAplicado : undefined
      };
    } catch (error: any) {
      this.db.actualizarEstadoRenovacion(renovacionId, 'rechazado');
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  private calcularPrecioBaseRenovacion(dias: number, connectionLimit: number): number {
    if (!dias || dias <= 0) {
      return 0;
    }

    const planesBase = this.db.obtenerPlanes();
    const planesConOverrides = configService.aceptarOverridesAListaPlanes(
      planesBase,
      { forNewCustomers: false }
    );

    const planCoincidente = planesConOverrides.find(
      (plan: any) => plan.dias === dias && plan.connection_limit === connectionLimit
    );

    if (planCoincidente) {
      return Math.round(planCoincidente.precio);
    }

    // Fallback: tomar plan de 30 días con el mismo límite para estimar precio diario
    const planReferencia = planesConOverrides.find(
      (plan: any) => plan.dias === 30 && plan.connection_limit === connectionLimit
    );

    let precioPorDia: number;
    if (planReferencia) {
      precioPorDia = planReferencia.precio / 30;
    } else {
      switch (connectionLimit) {
        case 1:
          precioPorDia = 200;
          break;
        case 2:
          precioPorDia = 333.33;
          break;
        case 3:
          precioPorDia = 400;
          break;
        case 4:
          precioPorDia = 500;
          break;
        default:
          precioPorDia = 200 * Math.max(1, connectionLimit);
          break;
      }
    }

    return Math.max(0, Math.round(dias * precioPorDia));
  }

  /**
   * Procesa una renovación de revendedor
   */
  async procesarRenovacionRevendedor(input: {
    busqueda: string;
    dias: number;
    clienteEmail: string;
    clienteNombre: string;
    tipoRenovacion?: 'validity' | 'credit';
    cantidadSeleccionada?: number;
    precio?: number;
    precioOriginal?: number;
    codigoCupon?: string;
    cuponId?: number;
    descuentoAplicado?: number;
    planId?: number;
    operacion?: 'renovacion' | 'expansion';
  }): Promise<{ renovacion: any; linkPago: string; descuentoAplicado?: number; cuponAplicado?: any }> {
    const operacion = input.operacion || 'renovacion';
    console.log(`[Renovacion] 🚀 Iniciando procesamiento de ${operacion} de revendedor: ${input.busqueda} (${input.dias} días, tipo: ${input.tipoRenovacion})`);
    console.log('[Renovacion] Input recibido:', JSON.stringify(input, null, 2));
    const resultado = await this.buscarCliente(input.busqueda, false);
    
    if (!resultado.encontrado || resultado.tipo !== 'revendedor') {
      throw new Error('Revendedor no encontrado');
    }

    const revendedorExistente = resultado.datos;

    // 2. Obtener planes de revendedores con overrides de configuración aplicados
    const planesBase = this.db.obtenerPlanesRevendedores();
    console.log(`[Renovacion] 📊 Planes base obtenidos: ${planesBase.length} planes`);
    console.log(`[Renovacion] 📊 Planes base:`, JSON.stringify(planesBase.map((p: any) => ({id: p.id, max_users: p.max_users, account_type: p.account_type, precio: p.precio})), null, 2));
    const planesConOverrides =
      configService.aceptarOverridesAListaPlanesRevendedor(planesBase, {
        forNewCustomers: false,
      });
    console.log(`[Renovacion] 📊 Planes con overrides: ${planesConOverrides.length} planes`);
    console.log(`[Renovacion] 📊 Planes con overrides:`, JSON.stringify(planesConOverrides.map((p: any) => ({id: p.id, max_users: p.max_users, account_type: p.account_type, precio: p.precio})), null, 2));
    
    // 3. Calcular precio según el plan seleccionado
    const tipoRenovacion = input.tipoRenovacion || 'validity';
    let cantidad = input.cantidadSeleccionada || 5;
    
    // Para renovaciones de validity, usar la cantidad de usuarios actuales del revendedor
    // Para expansiones, respetar la cantidad target (cantidadSeleccionada)
    if (operacion === 'renovacion' && tipoRenovacion === 'validity' && revendedorExistente.max_users) {
      cantidad = revendedorExistente.max_users;
      console.log(`[Renovacion] 📊 Validity: Usando usuarios actuales del revendedor: ${cantidad}`);
    } else if (operacion === 'expansion') {
      console.log(`[Renovacion] 📊 Expansión: Usando cantidad target: ${cantidad} (actuales: ${revendedorExistente.max_users || 0})`);
    }
    
    console.log(`[Renovacion] 🔍 Buscando plan con: tipo=${tipoRenovacion}, cantidad=${cantidad}`);
    console.log(`[Renovacion] 📋 Planes disponibles: ${JSON.stringify(planesConOverrides.map((p: any) => ({id: p.id, max_users: p.max_users, account_type: p.account_type, precio: p.precio})))}`);

    let planSeleccionado: any = null;

    if (input.planId) {
      planSeleccionado = planesConOverrides.find((p: any) => Number(p.id) === Number(input.planId)) || null;
    }

    if (!planSeleccionado) {
      planSeleccionado = planesConOverrides.find((p: any) =>
        p.account_type === tipoRenovacion && p.max_users === cantidad
      ) || null;
    }

    // Si no hay plan exacto, usar la utilidad de descomposición
    if (!planSeleccionado) {
      const planesMismoTipo = planesConOverrides
        .filter((p: any) => p.account_type === tipoRenovacion && p.max_users > 0)
        .sort((a: any, b: any) => a.max_users - b.max_users);

      if (planesMismoTipo.length > 0) {
        if (operacion === 'expansion') {
          const extraUsers = cantidad - (revendedorExistente.max_users || 0);
          console.log(`[Renovacion] 📊 Calculando expansión: ${revendedorExistente.max_users} -> ${cantidad} usuarios (${extraUsers} extras)`);
          
          if (extraUsers <= 0) {
            // Si por alguna razón la cantidad es menor o igual, el precio base de los extras es 0
            planSeleccionado = { max_users: cantidad, precio: 0, calculado: true };
          } else {
            const { precio: precio30dExtra, composicion } = calcularPrecioResellerDecompuesto(extraUsers, planesMismoTipo);
            
            // Prorratear por días restantes
            const hoy = this.utcTodayStart();
            const expiracion = this.parseYYYYMMDDToUTC(revendedorExistente.expiration_date);
            let diasRestantes = 30;
            if (expiracion) {
              const diffTime = expiracion.getTime() - hoy.getTime();
              diasRestantes = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            }
            
            const diasProporcional = Math.min(30, Math.max(1, diasRestantes));
            const precioFinalExpansion = Math.round((precio30dExtra / 30) * diasProporcional);
            
            planSeleccionado = {
              max_users: cantidad,
              precio: precioFinalExpansion,
              calculado: true,
              extra_info: { precio30dExtra, diasProporcional, composicion }
            };
            
            console.log(`[Renovacion] 📊 Precio expansión: $${precioFinalExpansion} (${extraUsers} extras, ${diasProporcional} días restantes). Comp: ${composicion.join(' + ')}`);
          }
        } else {
          // Renovación estándar o sistema de créditos: Precio total por 30 días
          const { precio: precioTotal, composicion } = calcularPrecioResellerDecompuesto(cantidad, planesMismoTipo);
          
          planSeleccionado = {
            max_users: cantidad,
            precio: precioTotal,
            calculado: true,
            composicion
          };
          
          console.log(`[Renovacion] 📊 Precio renovacion: $${precioTotal} (${cantidad} usuarios). Comp: ${composicion.join(' + ')}`);
        }
      }
    }

    if (!planSeleccionado) {
      console.warn(`[Renovacion] ⚠️ No se encontró un plan para tipo=${tipoRenovacion}, cantidad=${cantidad}. Usando defaults.`);
    }

    let precioBase = planSeleccionado?.precio !== undefined ? Math.round(Number(planSeleccionado.precio)) : 0;

    if (!precioBase) {
      precioBase = tipoRenovacion === 'validity' ? 8500 : 10200;
    }

    if (input.precioOriginal && input.precioOriginal > 0) {
      if (Math.abs(input.precioOriginal - precioBase) > 1) {
        console.warn(
          `[Renovacion] ⚠️ Precio original recibido (${input.precioOriginal}) difiere del calculado (${precioBase}). Usando recibido.`
        );
      }
      precioBase = Math.round(input.precioOriginal);
    }

    let cuponAplicado: any = null;
    let descuentoAplicado = 0;

    if (input.codigoCupon) {
      const codigoNormalizado = input.codigoCupon.trim().toUpperCase();
      console.log(`[Renovacion] Validando cupón ${codigoNormalizado} para renovación de revendedor`);

      const validacion = await cuponesSupabaseService.validarCupon(
        codigoNormalizado,
        planSeleccionado?.id ?? input.planId,
        input.clienteEmail
      );

      if (!validacion.valido || !validacion.cupon) {
        throw new Error(validacion.mensaje_error || 'Cupón inválido');
      }

      cuponAplicado = validacion.cupon;

      if (input.cuponId && cuponAplicado.id && input.cuponId !== cuponAplicado.id) {
        console.warn(
          `[Renovacion] ⚠️ ID de cupón recibido (${input.cuponId}) difiere del validado (${cuponAplicado.id})`
        );
      }

      descuentoAplicado = Math.min(
        precioBase,
        Math.round(cuponesSupabaseService.calcularDescuento(cuponAplicado, precioBase))
      );

      console.log(`[Renovacion] Cupón ${cuponAplicado.codigo} aplicado. Descuento: $${descuentoAplicado}. Precio base: $${precioBase}`);
    }

    if (!input.codigoCupon && input.descuentoAplicado) {
      console.warn(
        `[Renovacion] ⚠️ Se recibió descuento aplicado (${input.descuentoAplicado}) sin código de cupón. Ignorando valor recibido.`
      );
    }

    if (input.descuentoAplicado && Math.abs(input.descuentoAplicado - descuentoAplicado) > 1) {
      console.warn(
        `[Renovacion] ⚠️ Diferencia entre descuento recibido (${input.descuentoAplicado}) y calculado (${descuentoAplicado}). Se utilizará el calculado.`
      );
    }

    let montoCalculado = Math.max(0, Math.round(precioBase - descuentoAplicado));

    if (input.precio && Math.abs(input.precio - montoCalculado) > 1) {
      console.warn(
        `[Renovacion] ⚠️ Diferencia entre precio recibido (${input.precio}) y calculado (${montoCalculado}). Se usará el calculado.`
      );
    }

    if (!montoCalculado || montoCalculado <= 0) {
      throw new Error('El total a pagar con el cupón debe ser mayor a 0');
    }

    const datosNuevos: any = {
      tipo_renovacion: tipoRenovacion,
      cantidad,
      precio_base: precioBase,
      precio_final: montoCalculado,
    };

    if (planSeleccionado?.id) {
      datosNuevos.plan_id = planSeleccionado.id;
    }

    if (planSeleccionado?.nombre) {
      datosNuevos.plan_nombre = planSeleccionado.nombre;
    }

    if (cuponAplicado) {
      datosNuevos.cupon_codigo = cuponAplicado.codigo;
      datosNuevos.descuento_aplicado = descuentoAplicado;
    }

    // 5. Crear registro de renovación
    const renovacion = this.db.crearRenovacion({
      tipo: 'revendedor',
      servex_id: revendedorExistente.servex_revendedor_id,
      servex_username: revendedorExistente.servex_username,
      operacion: operacion,
      dias_agregados: input.dias,
      datos_nuevos: JSON.stringify(datosNuevos),
      monto: montoCalculado,
      metodo_pago: 'mercadopago',
      cliente_email: input.clienteEmail,
      cliente_nombre: input.clienteNombre,
      estado: 'pendiente',
      cupon_id: cuponAplicado?.id || null,
      descuento_aplicado: descuentoAplicado
    });

    const renovacionId = renovacion.id;
    console.log(`[Renovacion] ${operacion} de revendedor creada:`, renovacionId);

    // 6. Crear preferencia en MercadoPago
    const descripcion = operacion === 'expansion'
      ? `Expansión +${cantidad - (revendedorExistente.max_users || 0)} usuarios (${revendedorExistente.max_users || 0}→${cantidad}) - ${revendedorExistente.servex_username}`
      : tipoRenovacion === 'validity'
        ? `Renovación ${input.dias} días - ${cantidad} usuarios - ${revendedorExistente.servex_username}`
        : `Recarga ${cantidad} créditos - ${revendedorExistente.servex_username}`;

    try {
      const { id: preferenceId, initPoint } = await this.mercadopago.crearPreferencia(
        renovacionId.toString(),
        descripcion,
        montoCalculado,
        input.clienteEmail,
        input.clienteNombre,
        'renovacion-revendedor'
      );

      console.log('[Renovacion] Preferencia de MercadoPago creada:', preferenceId);

      console.log(`[Renovacion] ✅ Renovación de revendedor procesada exitosamente: ID ${renovacionId}, link: ${initPoint}`);
      return {
        renovacion,
        linkPago: initPoint,
        descuentoAplicado: descuentoAplicado > 0 ? descuentoAplicado : undefined,
        cuponAplicado
      };
    } catch (error: any) {
      this.db.actualizarEstadoRenovacion(renovacionId, 'rechazado');
      throw new Error(`Error creando link de pago: ${error.message}`);
    }
  }

  /**
   * Confirma una renovación y ejecuta la renovación en Servex
   */
  async confirmarRenovacion(renovacionId: number, mpPaymentId: string | null): Promise<void> {
    console.log('[Renovacion] Confirmando renovación:', renovacionId);

    if (!mpPaymentId || (typeof mpPaymentId === 'string' && mpPaymentId.trim() === '')) {
      throw new Error('No se puede confirmar renovación sin ID de pago válido');
    }

    const renovacion = this.db.obtenerRenovacionPorId(renovacionId);
    if (!renovacion) {
      throw new Error('Renovación no encontrada');
    }

    // Idempotencia: si ya se aplicó en Servex, no volver a ejecutar (evita sumar días duplicados)
    const yaProcesadaEnServex = Boolean((renovacion as any).servex_procesado);
    if (renovacion.estado === 'aprobado' && yaProcesadaEnServex) {
      console.warn(`[Renovacion] ⚠️ Renovación ${renovacionId} ya fue procesada en Servex. Omitiendo re-ejecución.`);
      return;
    }

    const estadoPrevio = renovacion.estado;

    try {
      // 1. Actualizar estado a aprobado
      this.db.actualizarEstadoRenovacion(renovacionId, 'aprobado', mpPaymentId);

      let referralPurchaseId: string | null = null;
      let renovacionMetadata = null;

      if (renovacion.tipo === 'cliente') {
        renovacionMetadata = this.db.obtenerMetadataRenovacion(renovacionId);
        referralPurchaseId = renovacionMetadata?.purchaseHistoryId || null;
      }

      let servexExpiracion: string | undefined = undefined;
      try {
        if (renovacion.servex_username) {
          if (renovacion.tipo === 'cliente') {
            const clienteActualizado = await this.servex.buscarClientePorUsername(renovacion.servex_username);
            servexExpiracion = clienteActualizado?.expiration_date;
          } else {
            const revendedorActualizado = await this.servex.buscarRevendedorPorUsername(renovacion.servex_username);
            servexExpiracion = revendedorActualizado?.expiration_date;
          }
        }
      } catch (servexError: any) {
        console.warn('[Renovacion] No se pudo obtener expiración de Servex para sincronizar con Supabase:', servexError?.message || servexError);
      }

      // Sincronizar con Supabase ANTES de procesar el referido, para obtener un purchase_history.id válido
      try {
        const purchaseHistoryId = await supabaseService.syncApprovedPurchase({
          email: renovacion.cliente_email,
          planNombre: renovacion.operacion === 'upgrade'
            ? `Upgrade: ${renovacion.dias_agregados} días`
            : `Renovación: ${renovacion.dias_agregados} días`,
          monto: renovacion.monto,
          tipo: 'renovacion',
          servexUsername: renovacion.servex_username,
          servexExpiracion,
          mpPaymentId: mpPaymentId || undefined,
        });

        if (purchaseHistoryId) {
          referralPurchaseId = purchaseHistoryId;
          if (renovacionMetadata && renovacionMetadata.purchaseHistoryId !== purchaseHistoryId) {
            renovacionMetadata = {
              ...renovacionMetadata,
              purchaseHistoryId,
            };
            this.db.actualizarMetadataRenovacion(renovacionId, renovacionMetadata);
          }
        }
      } catch (syncError: any) {
        console.error('[Renovacion] ⚠️ Error sincronizando con Supabase antes de procesar el referido:', syncError?.message || syncError);
      }

      if (renovacion.tipo === 'cliente' && renovacionMetadata) {
        const { codigoReferido, saldoUsado, saldoEmail } = renovacionMetadata;
        const saldoOwnerEmail = saldoEmail || renovacion.cliente_email;

        // Debitar saldo si se usó
        if (saldoUsado && saldoUsado > 0) {
          console.log(`[Renovacion] Debitando $${saldoUsado} de saldo para renovación ${renovacionId} (email: ${saldoOwnerEmail})`);
          await referidosService.debitarSaldoPorEmail(
            saldoOwnerEmail,
            saldoUsado,
            `Pago de Renovación ${renovacion.servex_username}`
          );
        }

        // Procesar referido si se usó
        if (codigoReferido && referidosService.isEnabled()) {
          if (!referralPurchaseId) {
            console.warn(`[Renovacion] ⚠️ No se obtuvo purchase_history.id válido para el referido de renovación ${renovacionId}. Se omitirá el procesamiento del referido por seguridad.`);
          } else {
            console.log(`[Renovacion] Procesando comisión de referido para renovación ${renovacionId}`);
            await referidosService.procesarReferidoPorEmail(
              codigoReferido,
              saldoOwnerEmail,
              renovacion.monto,
              referralPurchaseId
            );
          }
        }
      }

      // 2. Si es un upgrade (cambio de dispositivos), actualizar primero el connection_limit
      if (renovacion.operacion === 'upgrade' && renovacion.tipo === 'cliente' && renovacion.datos_nuevos) {
        try {
          const datosNuevos = JSON.parse(renovacion.datos_nuevos);
          if (datosNuevos.connection_limit) {
            console.log(`[Renovacion] Actualizando connection_limit a ${datosNuevos.connection_limit} para usuario ${renovacion.servex_username}`);
            
            // Buscar cliente por username para obtener todos sus datos
            const clienteActual = await this.servex.buscarClientePorUsername(renovacion.servex_username);
            if (!clienteActual) {
              throw new Error(`Cliente no encontrado: ${renovacion.servex_username}`);
            }
            
            // Construir payload completo pero IGNORANDO contraseña para no corromperla
            // Si el password de clienteActual es un hash, enviarlo de vuelta rompería la cuenta.
            const payload: any = {
              username: clienteActual.username,
              // No incluimos password por petición explícita de ignorar datos de contraseña
              category_id: clienteActual.category_id,
              connection_limit: datosNuevos.connection_limit, // El nuevo límite
              type: 'user', // Forzar tipo user para asegurar activación
              ...(clienteActual.observation && { observation: clienteActual.observation }),
              ...(clienteActual.v2ray_uuid && { v2ray_uuid: clienteActual.v2ray_uuid })
            };
            
            console.log(`[Renovacion] Actualizando cliente ID ${renovacion.servex_id} (Upgrade) con payload (sin password):`, JSON.stringify(payload));
            await this.servex.actualizarCliente(renovacion.servex_id, payload);
            console.log('[Renovacion] ✅ Connection limit actualizado y cuenta marcada como "user"');
          }
        } catch (parseError) {
          console.error('[Renovacion] Error actualizando connection_limit:', parseError);
          throw parseError; // Re-lanzar el error para que se maneje arriba
        }
      }

      // 3. Procesar renovación de revendedor si tiene datos_nuevos
      if (renovacion.tipo === 'revendedor' && renovacion.datos_nuevos) {
        try {
          const datosNuevos = JSON.parse(renovacion.datos_nuevos);
          const tipoRenovacion = datosNuevos.tipo_renovacion;
          const cantidad = datosNuevos.cantidad;
          
          console.log(`[Renovacion] Procesando ${tipoRenovacion} para revendedor: ${cantidad}`);
          console.log(`[Renovacion] servex_id: ${renovacion.servex_id}, dias_agregados: ${renovacion.dias_agregados}`);

          if (renovacion.operacion === 'expansion') {
            // Expansión: SOLO actualizar usuarios y MANTENER fecha de vencimiento
            console.log(`[Renovacion] 🚀 Expansión: Actualizando a ${cantidad} usuarios, manteniendo fecha de vencimiento`);
            
            // Obtener datos actuales del revendedor para obtener su fecha de vencimiento actual
            const revendedorActual = await this.servex.buscarRevendedorPorUsername(renovacion.servex_username);
            const currentExpiration = revendedorActual?.expiration_date;
            
            // Normalizar a YYYY-MM-DD si viene en formato ISO
            const expirationDate = currentExpiration 
              ? this.formatUTCDateOnly(new Date(currentExpiration)) 
              : this.formatUTCDateOnly(new Date());
            
            console.log(`[Renovacion] 📅 Expansión: Manteniendo fecha ${expirationDate} para ${renovacion.servex_username}`);
            
            // Actualizar: cambiar usuarios, mantener fecha y tipo
            await this.servex.actualizarRevendedor(renovacion.servex_id, {
              max_users: cantidad,
              account_type: 'validity',
              expiration_date: expirationDate
            }, renovacion.servex_username);

            this.db.actualizarDatosRevendedorPorServexId({
              servexId: renovacion.servex_id,
              maxUsers: cantidad,
              expiracion: expirationDate,
              accountType: 'validity'
            });
          } else if (tipoRenovacion === 'validity') {
            // Renovación de validez: MANTENER usuarios actuales y AGREGAR días (acumulativo)
            const diasAgregar = Number(renovacion.dias_agregados) || 30;
            console.log(`[Renovacion] ⏳ Validity: Agregando ${diasAgregar} días (acumulativo), manteniendo usuarios actuales`);
            
            // Obtener datos actuales del revendedor
            const revendedorActual = await this.servex.buscarRevendedorPorUsername(renovacion.servex_username);
            const usuariosActuales = revendedorActual?.max_users || 0;
            
            console.log(`[Renovacion] 👥 Usuarios actuales: ${usuariosActuales} (se mantienen)`);
            
            // Calcular nueva fecha de vencimiento: suma sobre expiración actual si está vigente,
            // si ya venció (o no hay fecha) suma desde hoy.
            const fechaBase = this.getRenovacionBaseDateUTC(revendedorActual?.expiration_date);
            const fechaVencimiento = this.addDaysUTC(fechaBase, diasAgregar);
            const expirationDate = this.formatUTCDateOnly(fechaVencimiento);

            console.log(
              `[Renovacion] 📅 Base expiración: ${this.formatUTCDateOnly(fechaBase)}, nueva fecha: ${expirationDate}`
            );
            
            // Actualizar: cambiar fecha de vencimiento, MANTENER usuarios
            await this.servex.actualizarRevendedor(renovacion.servex_id, {
              max_users: usuariosActuales,
              account_type: 'validity',
              expiration_date: expirationDate
            }, renovacion.servex_username);

            this.db.actualizarDatosRevendedorPorServexId({
              servexId: renovacion.servex_id,
              maxUsers: usuariosActuales,
              expiracion: expirationDate,
              accountType: 'validity'
            });
          } else if (tipoRenovacion === 'credit') {
            // Recarga de créditos: Agregar días según plan + SUMAR créditos
            console.log(`[Renovacion] 💳 Credit: Agregando ${renovacion.dias_agregados} días y sumando ${cantidad} créditos`);
            
            // Obtener datos actuales del revendedor
            const revendedorActual = await this.servex.buscarRevendedorPorUsername(renovacion.servex_username);
            const creditosActuales = revendedorActual?.max_users || 0;
            const creditosTotales = creditosActuales + cantidad;
            
            console.log(`[Renovacion] 👥 Créditos actuales: ${creditosActuales}, sumando: ${cantidad}, total: ${creditosTotales}`);
            
            // Calcular nueva fecha de vencimiento (acumulativo): suma sobre expiración vigente,
            // si ya venció suma desde hoy.
            const diasAgregar = Number(renovacion.dias_agregados) || 0;
            const fechaBase = this.getRenovacionBaseDateUTC(revendedorActual?.expiration_date);
            const fechaVencimiento = this.addDaysUTC(fechaBase, diasAgregar);
            const expirationDate = this.formatUTCDateOnly(fechaVencimiento);
            
            console.log(`[Renovacion] 📅 Base expiración: ${this.formatUTCDateOnly(fechaBase)}, nueva fecha: ${expirationDate}`);
            
            // Actualizar: mantener account_type credit, sumar créditos y establecer nueva fecha
            await this.servex.actualizarRevendedor(renovacion.servex_id, {
              max_users: creditosTotales,
              account_type: 'credit',
              expiration_date: expirationDate
            }, renovacion.servex_username);

            this.db.actualizarDatosRevendedorPorServexId({
              servexId: renovacion.servex_id,
              maxUsers: creditosTotales,
              expiracion: expirationDate,
              accountType: 'credit'
            });
          }
          
          console.log('[Renovacion] ✅ Revendedor actualizado exitosamente');
        } catch (error) {
          console.error('[Renovacion] Error procesando datos de revendedor:', error);
          throw error;
        }
      } else {
        // 4. Ejecutar renovación simple de días en Servex
        if (renovacion.tipo === 'cliente') {
          try {
            // 1. Renovar sumando días
            await this.servex.renovarCliente(renovacion.servex_id, renovacion.dias_agregados);
            
            // 2. ⚡️ REACTIVACIÓN CRÍTICA: Asegurar que el estado sea 'user' y refrescar en nodos
            // Esto equivale al "Guardar sin cambios" que hace el admin para que conecte.
            console.log(`[Renovacion] ⚡️ Reactivando cuenta para ${renovacion.servex_username} post-renovación...`);
            const clienteActual = await this.servex.buscarClientePorUsername(renovacion.servex_username);
            
            if (clienteActual) {
              const refreshPayload: any = {
                username: clienteActual.username,
                category_id: clienteActual.category_id,
                connection_limit: clienteActual.connection_limit,
                type: 'user', // Forzar activación
                ...(clienteActual.observation && { observation: clienteActual.observation }),
                ...(clienteActual.v2ray_uuid && { v2ray_uuid: clienteActual.v2ray_uuid })
              };

              // 🔄 CICLO DE SUSPENSIÓN EXTRA:
              // Forzamos un ciclo de suspensión/activación para asegurar que los nodos limpien la caché
              // de "cuenta expirada" y permitan la conexión inmediata.
              try {
                await this.servex.suspenderCliente(renovacion.servex_id);
                await new Promise(resolve => setTimeout(resolve, 1000));
                await this.servex.suspenderCliente(renovacion.servex_id);
              } catch (suspError: any) {
                console.warn(`[Renovacion] ⚠️ No se pudo completar el ciclo de suspensión: ${suspError.message}`);
              }
              
              // Omitimos password explícitamente para no tocarla
              await this.servex.actualizarCliente(renovacion.servex_id, refreshPayload);
              console.log(`[Renovacion] ✅ Cuenta ${renovacion.servex_username} reactivada y sincronizada correctamente.`);
            }
          } catch (renovarError: any) {
            const mensajeError = renovarError.message?.toLowerCase() || '';
            const esAccesoDenegado = mensajeError.includes('acesso negado') || 
                                     mensajeError.includes('access denied') ||
                                     mensajeError.includes('403');
            
            if (esAccesoDenegado) {
              console.log('[Renovacion] ⚠️ Cliente no accesible en Servex, intentando recrear...');
              
              // Intentar recrear el cliente
              const nuevoCliente = await this.recrearClienteEnServex(renovacion);
              
              if (nuevoCliente) {
                console.log(`[Renovacion] ✅ Cliente recreado exitosamente: ID ${nuevoCliente.id}, username: ${nuevoCliente.username}`);
                // No es necesario renovar ya que el cliente recién creado ya tiene los días
              } else {
                throw new Error('No se pudo recrear el cliente en Servex');
              }
            } else {
              throw renovarError;
            }
          }
        } else if (renovacion.tipo === 'revendedor') {
          await this.servex.renovarRevendedor(renovacion.servex_id, renovacion.dias_agregados);
        }

        console.log(`[Renovacion] ✅ ${renovacion.tipo} renovado exitosamente`);
      }

      // Marcar como procesada en Servex luego de un update exitoso
      this.db.marcarRenovacionProcesadaEnServex(renovacionId);

      // Aplicar cupón si corresponde
      if (renovacion.cupon_id && estadoPrevio !== 'aprobado') {
        try {
          await cuponesSupabaseService.aplicarCuponSimple(renovacion.cupon_id);
          console.log(`[Renovacion] ✅ Cupón ${renovacion.cupon_id} marcado como utilizado`);
        } catch (cuponError: any) {
          console.error('[Renovacion] ⚠️ Error aplicando cupón:', cuponError.message);
        }
      }

      // Notificar al administrador
      try {
        let tipoNotificacion: any = renovacion.tipo === 'cliente' ? 'renovacion-cliente' : 'renovacion-revendedor';
        
        if (renovacion.operacion === 'expansion') {
          tipoNotificacion = 'expansion-revendedor';
        } else if (renovacion.operacion === 'upgrade' && renovacion.tipo === 'cliente') {
          tipoNotificacion = 'upgrade-cliente';
        }

        let descripcion = '';

        if (renovacion.tipo === 'cliente') {
          if (renovacion.operacion === 'upgrade') {
            const datosNuevos = JSON.parse(renovacion.datos_nuevos || '{}');
            descripcion = `Upgrade cliente: ${renovacion.dias_agregados} días, ${datosNuevos.connection_limit} conexiones`;
          } else {
            descripcion = `Renovación cliente: ${renovacion.dias_agregados} días`;
          }
        } else {
          if (renovacion.datos_nuevos) {
            const datosNuevos = JSON.parse(renovacion.datos_nuevos);
            if (datosNuevos.tipo_renovacion === 'validity') {
              const prefijo = renovacion.operacion === 'expansion' ? 'Expansión' : 'Renovación';
              descripcion = `${prefijo} revendedor: ${renovacion.dias_agregados} días, ${datosNuevos.cantidad} usuarios`;
            } else {
              descripcion = `Recarga revendedor: ${renovacion.dias_agregados} días, +${datosNuevos.cantidad} créditos`;
            }
          } else {
            descripcion = `Renovación revendedor: ${renovacion.dias_agregados} días`;
          }
        }

        await emailService.notificarVentaAdmin(tipoNotificacion, {
          clienteNombre: renovacion.cliente_nombre,
          clienteEmail: renovacion.cliente_email,
          monto: renovacion.monto,
          descripcion,
          username: renovacion.servex_username
        });
        console.log('[Renovacion] ✅ Notificación enviada al administrador');
      } catch (emailError: any) {
        console.error('[Renovacion] ⚠️ Error notificando al admin:', emailError.message);
        // No lanzamos error, la renovación ya está procesada
      }

      // Enviar email de confirmación al cliente
      try {
        // Obtener la nueva fecha de expiración
        let nuevaExpiracion = '';
        let detallesExtra = '';
        let infoAgregada = renovacion.dias_agregados;
        let operacionEmail = renovacion.operacion;
        
        if (renovacion.tipo === 'cliente') {
          const clienteActualizado = await this.servex.buscarClientePorUsername(renovacion.servex_username);
          if (clienteActualizado?.expiration_date) {
            nuevaExpiracion = new Date(clienteActualizado.expiration_date).toLocaleDateString('es-AR', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            });
          }
          if (renovacion.operacion === 'upgrade') {
            const datosNuevos = JSON.parse(renovacion.datos_nuevos || '{}');
            detallesExtra = `Nuevo límite: ${datosNuevos.connection_limit} dispositivos`;
          }
        } else if (renovacion.tipo === 'revendedor') {
          const revendedorActualizado = await this.servex.buscarRevendedorPorUsername(renovacion.servex_username);
          if (revendedorActualizado?.expiration_date) {
            nuevaExpiracion = new Date(revendedorActualizado.expiration_date).toLocaleDateString('es-AR', {
              day: '2-digit', month: '2-digit', year: 'numeric'
            });
          }
          if (renovacion.datos_nuevos) {
            const datosNuevos = JSON.parse(renovacion.datos_nuevos);
            if (renovacion.operacion === 'expansion') {
              infoAgregada = datosNuevos.cantidad; // Total usuarios para el email
              detallesExtra = `Upgrade a ${datosNuevos.cantidad} usuarios`;
              operacionEmail = 'expansion';
            } else if (datosNuevos.tipo_renovacion === 'validity') {
              detallesExtra = `${datosNuevos.cantidad} usuarios máx`;
            } else if (datosNuevos.tipo_renovacion === 'credit') {
              detallesExtra = `+${datosNuevos.cantidad} créditos`;
            }
          }
        }
        
        await emailService.enviarConfirmacionRenovacion(renovacion.cliente_email, {
          tipo: renovacion.tipo,
          username: renovacion.servex_username,
          diasAgregados: infoAgregada,
          nuevaExpiracion: nuevaExpiracion || 'Ver en panel',
          monto: renovacion.monto,
          operacion: operacionEmail || (renovacion.datos_nuevos ? JSON.parse(renovacion.datos_nuevos).tipo_renovacion : undefined),
          detallesExtra: detallesExtra || undefined,
        });
        console.log(`[Renovacion] ✅ Email de confirmación (${operacionEmail}) enviado a ${renovacion.cliente_email}`);
      } catch (emailClienteError: any) {
        console.error('[Renovacion] ⚠️ Error enviando email de confirmación al cliente:', emailClienteError.message);
        // No lanzamos error, la renovación ya está procesada
      }

    } catch (error: any) {
      console.error('[Renovacion] ❌ Error ejecutando renovación:', error.message);
      this.db.actualizarEstadoRenovacion(renovacionId, 'pendiente');
      throw error;
    }
  }

  /**
   * Procesa webhook de MercadoPago para renovaciones
   * MEJORADO: Si la renovación no existe en BD pero el pago está aprobado en MP,
   * intenta cargar automáticamente la renovación pendiente
   */
  async procesarWebhook(body: any): Promise<void> {
    console.log('[Renovacion] Procesando webhook...');

    const resultado = await this.mercadopago.procesarWebhook(body);

    if (!resultado.procesado || !resultado.pagoId) {
      console.log('[Renovacion] Webhook no procesado o sin referencia');
      return;
    }

    const { pagoId, mpPaymentId, estado } = resultado;

    // Convertir pagoId a número (el ID de renovación es un número autoincremental)
    const renovacionId = parseInt(pagoId, 10);
    if (isNaN(renovacionId)) {
      console.error('[Renovacion] ID de renovación inválido:', pagoId);
      return;
    }

    let renovacion = this.db.obtenerRenovacionPorId(renovacionId);
    if (!renovacion) {
      // ⚠️ Si la renovación no existe en BD, podría ser:
      // 1. Un retraso en la sincronización
      // 2. Una renovación de revendedor que no se registró correctamente
      // En cualquier caso, si MercadoPago dice que el pago está aprobado y tenemos mpPaymentId,
      // intentamos procesar de todas formas (sin registrar error crítico)
      console.warn(
        '[Renovacion] ⚠️ Renovación no encontrada:',
        renovacionId,
        '- Estado MP:',
        estado,
        '- mpPaymentId:',
        mpPaymentId
      );
      
      // Si el estado es aprobado y tenemos mpPaymentId válido, es probable que sea una renovación
      // de revendedor donde el pago llegó antes de que la renovación se registrara
      if (estado === 'approved' && mpPaymentId && (typeof mpPaymentId === 'string' && mpPaymentId.trim() !== '')) {
        console.log(
          '[Renovacion] ✅ Pago aprobado en MP pero renovación no en BD. ID de pago: ' + mpPaymentId +
          ' - Podría sincronizarse después'
        );
        // No lanzar error, permitir que TiendaRevendedores procese si es necesario
      }
      return;
    }

    console.log(`[Renovacion] 🔔 Webhook: renovación ${renovacionId}, estado: ${estado}, mpPaymentId: ${mpPaymentId}`);

    if (estado === 'approved') {
      if (renovacion.estado === 'pendiente' || renovacion.estado === 'rechazado') {
        // Validar que tenemos un ID de pago válido
        if (!mpPaymentId || (typeof mpPaymentId === 'string' && mpPaymentId.trim() === '')) {
          console.warn(`[Renovacion] ⚠️ Webhook indica pago aprobado pero sin mpPaymentId válido. ID: ${pagoId}`);
          // No procesar sin ID de pago válido
          return;
        }
        
        console.log(`[Renovacion] ✅ Confirmando renovación desde webhook: ${renovacionId}`);
        await this.confirmarRenovacion(renovacionId, mpPaymentId);
      }
    } else if (estado === 'rejected' || estado === 'cancelled') {
      if (renovacion.estado === 'pendiente') {
        this.db.actualizarEstadoRenovacion(renovacionId, 'rechazado', mpPaymentId);
        console.log('[Renovacion] ❌ Renovación marcada como rechazada por webhook');
      }
    } else if (estado === 'pending') {
      console.log('[Renovacion] ⏳ Webhook: pago aún pendiente');
    }
  }

  /**
   * Verifica y procesa una renovación manualmente (para cuando el cliente vuelve de MP)
   */
  async verificarYProcesarRenovacion(renovacionId: number, forzarReproceso: boolean = false): Promise<any | null> {
    const renovacion = this.db.obtenerRenovacionPorId(renovacionId);
    if (!renovacion) {
      return null;
    }

    console.log(`[Renovacion] verificarYProcesarRenovacion: ${renovacionId}, forzarReproceso=${forzarReproceso}, estado=${renovacion.estado}, mp_payment_id=${renovacion.mp_payment_id}`);

    // Si está aprobada y se fuerza reproceso, ejecutar de nuevo
    if (renovacion.estado === 'aprobado' && forzarReproceso && renovacion.mp_payment_id) {
      console.log(`[Renovacion] 🔄 Reprocesando renovación aprobada: ${renovacionId}`);
      await this.confirmarRenovacion(renovacionId, renovacion.mp_payment_id);
      return this.db.obtenerRenovacionPorId(renovacionId);
    }

    // Si la renovación ya está aprobada, solo devolver la información
    if (renovacion.estado === 'aprobado') {
      return renovacion;
    }

    // Si está pendiente, verificar en MercadoPago
    if (renovacion.estado === 'pendiente') {
      const pagoMP = await this.mercadopago.verificarPagoPorReferencia(renovacionId.toString());

      if (pagoMP && pagoMP.status === 'approved') {
        console.log(`[Renovacion] ✅ Pago encontrado en MercadoPago: ${pagoMP.id}, status: ${pagoMP.status}`);
        
        // Confirmar la renovación con el ID de pago de MercadoPago
        if (!pagoMP.id) {
          console.error(`[Renovacion] ⚠️ Pago aprobado pero sin ID de pago`);
          throw new Error('Pago aprobado pero sin ID de pago válido');
        }
        
        await this.confirmarRenovacion(renovacionId, pagoMP.id);
        // Devolver la renovación actualizada
        return this.db.obtenerRenovacionPorId(renovacionId);
      } else if (pagoMP && pagoMP.status !== 'approved') {
        console.log(`[Renovacion] ⏳ Pago encontrado pero aún no aprobado. Estado: ${pagoMP.status}`);
      } else {
        console.warn(`[Renovacion] ⚠️ No se encontró pago en MercadoPago para renovación ${renovacionId}`);
      }
    }

    return renovacion;
  }

  /**
   * Obtiene una renovación por ID
   */
  obtenerRenovacionPorId(renovacionId: number): any | null {
    return this.db.obtenerRenovacionPorId(renovacionId);
  }

  /**
   * Busca renovaciones por email del cliente
   */
  buscarRenovacionesPorEmail(email: string): any[] {
    return this.db.buscarRenovacionesPorEmail(email);
  }

  /**
   * Obtiene información actualizada del cliente desde Servex
   */
  async obtenerClienteActualizado(username: string): Promise<any | null> {
    try {
      return await this.servex.buscarClientePorUsername(username);
    } catch (error) {
      console.error('[Renovacion] Error obteniendo cliente actualizado:', error);
      return null;
    }
  }

  async obtenerRevendedorActualizado(username: string): Promise<any | null> {
    try {
      return await this.servex.buscarRevendedorPorUsername(username);
    } catch (error) {
      console.error('[Renovacion] Error obteniendo revendedor actualizado:', error);
      return null;
    }
  }

  /**
   * Recrea un cliente en Servex cuando fue eliminado pero tiene una renovación pagada
   * Usa los mismos datos que tenía originalmente (username, password, etc.)
   */
  private async recrearClienteEnServex(renovacion: any): Promise<any | null> {
    try {
      console.log(`[Renovacion] 🔄 Intentando recrear cliente ${renovacion.servex_username} en Servex...`);

      // 1. Buscar el pago original para obtener los datos del cliente
      const pagoOriginal = this.db.buscarClientePorUsername(renovacion.servex_username);
      
      if (!pagoOriginal) {
        console.error(`[Renovacion] ❌ No se encontró pago original para ${renovacion.servex_username}`);
        return null;
      }

      // 2. Obtener categorías activas
      const categorias = await this.servex.obtenerCategoriasActivas();
      if (categorias.length === 0) {
        console.error('[Renovacion] ❌ No hay categorías activas disponibles en Servex');
        return null;
      }
      const categoria = categorias[0];

      // 3. Determinar connection_limit (del pago original o de datos_nuevos si es upgrade)
      let connectionLimit = pagoOriginal.servex_connection_limit || 1;
      if (renovacion.datos_nuevos) {
        try {
          const datosNuevos = JSON.parse(renovacion.datos_nuevos);
          if (datosNuevos.connection_limit) {
            connectionLimit = datosNuevos.connection_limit;
          }
        } catch (e) {
          // Ignorar error de parseo
        }
      }

      // 4. Crear el cliente con los días de la renovación
      const clienteData = {
        username: pagoOriginal.servex_username,
        password: pagoOriginal.servex_password,
        category_id: categoria.id,
        connection_limit: connectionLimit,
        duration: renovacion.dias_agregados,
        type: 'user' as const,
        observation: `Cliente recreado: ${renovacion.cliente_nombre} - Email: ${renovacion.cliente_email} - Renovación ID: ${renovacion.id}`,
      };

      console.log('[Renovacion] 📋 Datos para recrear cliente:', JSON.stringify(clienteData, null, 2));

      const clienteCreado = await this.servex.crearCliente(clienteData);

      // 5. Actualizar la base de datos local con el nuevo ID
      this.db.actualizarCuentaServexPorUsername(
        pagoOriginal.servex_username,
        clienteCreado.id,
        clienteCreado.expiration_date,
        connectionLimit
      );

      // 6. Actualizar el servex_id en la renovación
      this.db.actualizarServexIdRenovacion(renovacion.id, clienteCreado.id);

      console.log(`[Renovacion] ✅ Cliente recreado: ID ${clienteCreado.id}, expira: ${clienteCreado.expiration_date}`);

      // 7. Enviar email de confirmación con las credenciales (ya que es como una nueva cuenta)
      try {
        const expiracionFormateada = new Date(clienteCreado.expiration_date).toLocaleDateString('es-AR');
        await emailService.enviarCredencialesCliente(renovacion.cliente_email, {
          username: clienteCreado.username,
          password: pagoOriginal.servex_password,
          categoria: categoria.name,
          expiracion: expiracionFormateada,
          servidores: [],
        });
        console.log(`[Renovacion] ✅ Credenciales reenviadas a ${renovacion.cliente_email}`);
      } catch (emailError: any) {
        console.error('[Renovacion] ⚠️ Error enviando email de credenciales:', emailError.message);
      }

      return clienteCreado;
    } catch (error: any) {
      console.error('[Renovacion] ❌ Error recreando cliente:', error.message);
      return null;
    }
  }
}
