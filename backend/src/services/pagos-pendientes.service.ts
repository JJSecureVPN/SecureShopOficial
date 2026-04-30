/**
 * Servicio de verificación automática de pagos pendientes
 * 
 * Este servicio actúa como RESPALDO en caso de que:
 * 1. El webhook de MercadoPago no llegue
 * 2. La redirección de success no se complete
 * 3. El usuario cierre el navegador antes de que se procese
 * 
 * Verifica periódicamente los pagos pendientes contra MercadoPago
 * y los procesa si ya fueron aprobados.
 */

import { DatabaseService } from "./database.service";
import { MercadoPagoService } from "./mercadopago.service";
import { TiendaService } from "./tienda.service";
import { TiendaRevendedoresService } from "./tienda-revendedores.service";

interface PagoPendienteConfig {
  enabled: boolean;
  intervalMs: number;           // Intervalo entre verificaciones (default: 2 minutos)
  minPendingAgeMinutes: number; // Edad mínima del pago para verificar (default: 3 minutos)
  maxPendingAgeHours: number;   // Edad máxima del pago para verificar (default: 24 horas)
  batchSize: number;            // Cantidad de pagos a verificar por ciclo
}

export class PagosPendientesService {
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning = false;
  private config: PagoPendienteConfig;

  constructor(
    private db: DatabaseService,
    private mercadopago: MercadoPagoService,
    private tiendaService: TiendaService,
    private tiendaRevendedoresService: TiendaRevendedoresService | null
  ) {
    this.config = {
      enabled: true,
      intervalMs: 2 * 60 * 1000,        // 2 minutos
      minPendingAgeMinutes: 3,          // Mínimo 3 minutos de antigüedad
      maxPendingAgeHours: 24,           // Máximo 24 horas de antigüedad
      batchSize: 10,                    // 10 pagos por ciclo
    };
  }

  /**
   * Inicia el servicio de verificación automática
   */
  start(): void {
    if (!this.config.enabled) {
      console.log("[PagosPendientes] ⏸️ Servicio deshabilitado por configuración");
      return;
    }

    if (this.intervalId) {
      console.log("[PagosPendientes] ⚠️ Servicio ya está corriendo");
      return;
    }

    console.log("[PagosPendientes] 🚀 Iniciando servicio de verificación automática");
    console.log(`[PagosPendientes] 📋 Configuración:`);
    console.log(`  - Intervalo: ${this.config.intervalMs / 1000}s`);
    console.log(`  - Edad mínima: ${this.config.minPendingAgeMinutes} minutos`);
    console.log(`  - Edad máxima: ${this.config.maxPendingAgeHours} horas`);
    console.log(`  - Batch size: ${this.config.batchSize}`);

    // Primera verificación después de 1 minuto (para dar tiempo a que arranque todo)
    setTimeout(() => {
      this.verificarPagosPendientes();
    }, 60 * 1000);

    // Verificaciones periódicas
    this.intervalId = setInterval(() => {
      this.verificarPagosPendientes();
    }, this.config.intervalMs);
  }

  /**
   * Detiene el servicio
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log("[PagosPendientes] 🛑 Servicio detenido");
    }
  }

  /**
   * Verifica y procesa pagos pendientes
   */
  private async verificarPagosPendientes(): Promise<void> {
    if (this.isRunning) {
      console.log("[PagosPendientes] ⏳ Ya hay una verificación en curso, saltando...");
      return;
    }

    this.isRunning = true;
    const timestamp = new Date().toISOString();

    try {
      // Calcular rangos de tiempo
      const now = Date.now();
      const minAge = new Date(now - this.config.minPendingAgeMinutes * 60 * 1000);
      const maxAge = new Date(now - this.config.maxPendingAgeHours * 60 * 60 * 1000);

      // Obtener pagos pendientes de clientes normales
      const pagosPendientes = this.obtenerPagosPendientes('pagos', minAge, maxAge);
      
      // Obtener pagos pendientes de revendedores
      const pagosRevendedoresPendientes = this.obtenerPagosPendientes('pagos_revendedores', minAge, maxAge);

      const totalPendientes = pagosPendientes.length + pagosRevendedoresPendientes.length;

      if (totalPendientes === 0) {
        // No loguear si no hay nada pendiente (para no llenar los logs)
        this.isRunning = false;
        return;
      }

      console.log(`[PagosPendientes] 🔍 [${timestamp}] Verificando ${totalPendientes} pagos pendientes...`);
      console.log(`  - Clientes: ${pagosPendientes.length}`);
      console.log(`  - Revendedores: ${pagosRevendedoresPendientes.length}`);

      let procesados = 0;
      let errores = 0;

      // Procesar pagos de clientes
      for (const pago of pagosPendientes.slice(0, this.config.batchSize)) {
        try {
          const resultado = await this.verificarYProcesarPago(pago.id, 'cliente');
          if (resultado) procesados++;
        } catch (error: any) {
          errores++;
          console.error(`[PagosPendientes] ❌ Error verificando pago ${pago.id}:`, error.message);
        }
        
        // Pequeño delay entre verificaciones para no saturar la API
        await this.delay(500);
      }

      // Procesar pagos de revendedores
      for (const pago of pagosRevendedoresPendientes.slice(0, this.config.batchSize)) {
        try {
          const resultado = await this.verificarYProcesarPago(pago.id, 'revendedor');
          if (resultado) procesados++;
        } catch (error: any) {
          errores++;
          console.error(`[PagosPendientes] ❌ Error verificando pago revendedor ${pago.id}:`, error.message);
        }
        
        await this.delay(500);
      }

      if (procesados > 0 || errores > 0) {
        console.log(`[PagosPendientes] ✅ Ciclo completado: ${procesados} procesados, ${errores} errores`);
      }

    } catch (error: any) {
      console.error("[PagosPendientes] ❌ Error en verificación:", error.message);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Obtiene pagos pendientes de una tabla específica
   * También incluye pagos "rechazados" recientes porque el usuario puede haber hecho un reintento exitoso
   */
  private obtenerPagosPendientes(tabla: 'pagos' | 'pagos_revendedores', minAge: Date, maxAge: Date): any[] {
    try {
      const db = this.db.getDatabase();
      // Incluimos estado 'rechazado' porque el usuario puede hacer múltiples intentos
      // de pago y el segundo intento puede ser exitoso
      const query = `
        SELECT id, fecha_creacion, cliente_email, estado
        FROM ${tabla}
        WHERE estado IN ('pendiente', 'rechazado')
          AND datetime(fecha_creacion) < datetime(?)
          AND datetime(fecha_creacion) > datetime(?)
        ORDER BY fecha_creacion ASC
        LIMIT ?
      `;
      
      return db.prepare(query).all(
        minAge.toISOString().replace('T', ' ').substring(0, 19),
        maxAge.toISOString().replace('T', ' ').substring(0, 19),
        this.config.batchSize * 2
      );
    } catch (error: any) {
      console.error(`[PagosPendientes] Error obteniendo pagos de ${tabla}:`, error.message);
      return [];
    }
  }

  /**
   * Verifica un pago contra MercadoPago y lo procesa si está aprobado
   * También maneja pagos "rechazados" que pueden haber tenido un reintento exitoso
   */
  private async verificarYProcesarPago(pagoId: string, tipo: 'cliente' | 'revendedor'): Promise<boolean> {
    try {
      // Consultar MercadoPago
      const pagoMP = await this.mercadopago.verificarPagoPorReferencia(pagoId);

      if (!pagoMP) {
        // Pago no encontrado en MercadoPago (puede que aún no haya pagado)
        return false;
      }

      if (pagoMP.status === 'approved') {
        console.log(`[PagosPendientes] 💰 Pago ${pagoId} aprobado en MP (payment_id: ${pagoMP.id}), procesando...`);

        if (tipo === 'cliente') {
          // Usar el método existente de TiendaService
          await this.tiendaService.verificarYProcesarPago(pagoId);
        } else if (tipo === 'revendedor' && this.tiendaRevendedoresService) {
          // Usar el método existente de TiendaRevendedoresService
          // (este método ya maneja el caso de pagos rechazados con reintento exitoso)
          await this.tiendaRevendedoresService.verificarYProcesarPago(pagoId);
        }

        console.log(`[PagosPendientes] ✅ Pago ${pagoId} procesado exitosamente (rescatado)`);
        return true;
      }

      if (pagoMP.status === 'rejected' || pagoMP.status === 'cancelled') {
        // Solo marcar como rechazado si está pendiente
        // NO marcar si ya está rechazado (para permitir reintentos futuros del mismo external_reference)
        if (tipo === 'cliente') {
          const pagoActual = this.db.obtenerPagoPorId(pagoId);
          if (pagoActual && pagoActual.estado === 'pendiente') {
            this.db.actualizarEstadoPago(pagoId, 'rechazado', pagoMP.id?.toString());
            console.log(`[PagosPendientes] ❌ Pago ${pagoId} rechazado/cancelado en MP`);
          }
        } else {
          const pagoActual = this.db.obtenerPagoRevendedorPorId(pagoId);
          if (pagoActual && pagoActual.estado === 'pendiente') {
            this.db.actualizarEstadoPagoRevendedor(pagoId, 'rechazado', pagoMP.id?.toString());
            console.log(`[PagosPendientes] ❌ Pago ${pagoId} rechazado/cancelado en MP`);
          }
        }
        return false;
      }

      // Estado pendiente en MP - no hacer nada
      return false;

    } catch (error: any) {
      throw error;
    }
  }

  /**
   * Helper para delays
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Ejecuta una verificación manual (útil para debugging)
   */
  async verificarManual(): Promise<{ procesados: number; errores: number }> {
    console.log("[PagosPendientes] 🔧 Iniciando verificación manual...");
    
    // Reset para permitir ejecución
    this.isRunning = false;
    
    await this.verificarPagosPendientes();
    
    return { procesados: 0, errores: 0 }; // TODO: Retornar stats reales
  }
}
