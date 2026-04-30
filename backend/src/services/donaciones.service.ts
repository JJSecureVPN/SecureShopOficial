import { v4 as uuidv4 } from "uuid";
import { DatabaseService } from "./database.service";
import { MercadoPagoService } from "./mercadopago.service";
import emailService from "./email.service";
import {
  CrearDonacionInput,
  Donacion,
} from "../types";

export class DonacionesService {
  constructor(
    private db: DatabaseService,
    private mercadopago: MercadoPagoService
  ) {}

  async crearDonacion(input: CrearDonacionInput): Promise<{
    donacion: Donacion;
    linkPago: string;
    preferenceId: string;
  }> {
    if (!input || typeof input.monto !== "number") {
      throw new Error("Monto de donación inválido");
    }

    const monto = Number(input.monto);
    if (!Number.isFinite(monto) || monto <= 0) {
      throw new Error("El monto debe ser mayor a 0");
    }

    if (monto > 1_000_000) {
      throw new Error("El monto no puede superar $1.000.000");
    }

    const id = uuidv4();
    const donacion = this.db.crearDonacion({
      id,
      monto,
      estado: "pendiente",
      metodo_pago: "mercadopago",
      donante_email: input.donanteEmail,
      donante_nombre: input.donanteNombre,
      mensaje: input.mensaje,
    });

    const fallbackEmail = "donaciones@jjsecurevpn.com";
    const sanitizedEmail =
      (input.donanteEmail && this.validarEmail(input.donanteEmail)
        ? input.donanteEmail
        : fallbackEmail);
    const sanitizedNombre = input.donanteNombre?.trim() || "Donante";

    const { id: preferenceId, initPoint } =
      await this.mercadopago.crearPreferencia(
        donacion.id,
        `Donación voluntaria JJSecure VPN`,
        monto,
        sanitizedEmail,
        sanitizedNombre,
        "donacion"
      );

    this.db.actualizarPreferenciaDonacion(donacion.id, preferenceId);

    return {
      donacion: this.db.obtenerDonacionPorId(donacion.id)!,
      linkPago: initPoint,
      preferenceId,
    };
  }

  obtenerDonacion(id: string): Donacion | null {
    return this.db.obtenerDonacionPorId(id);
  }

  async verificarYProcesarDonacion(id: string): Promise<Donacion | null> {
    const donacion = this.db.obtenerDonacionPorId(id);
    if (!donacion) {
      return null;
    }

    if (donacion.estado === "aprobado") {
      // Asegurar que se haya enviado agradecimiento si estaba pendiente
      await this.enviarNotificacionesSiCorresponde(donacion);
      return donacion;
    }

    if (donacion.estado === "pendiente") {
      const pagoMP = await this.mercadopago.verificarPagoPorReferencia(id);
      if (pagoMP && pagoMP.status === "approved") {
        await this.confirmarDonacion(id, pagoMP.id);
        return this.db.obtenerDonacionPorId(id);
      }
    }

    return donacion;
  }

  async procesarWebhook(body: any): Promise<void> {
    const resultado = await this.mercadopago.procesarWebhook(body);

    if (!resultado.procesado || !resultado.pagoId) {
      return;
    }

    const donacion = this.db.obtenerDonacionPorId(resultado.pagoId);
    if (!donacion) {
      console.warn(
        `[Donaciones] Donación no encontrada para pago ${resultado.pagoId}`
      );
      return;
    }

    if (resultado.estado === "approved") {
      await this.confirmarDonacion(donacion.id, resultado.mpPaymentId);
    } else if (resultado.estado === "rejected" || resultado.estado === "cancelled") {
      this.db.actualizarEstadoDonacion(donacion.id, "rechazado", resultado.mpPaymentId);
    }
  }

  private async confirmarDonacion(id: string, mpPaymentId?: string): Promise<void> {
    const donacion = this.db.obtenerDonacionPorId(id);
    if (!donacion) {
      throw new Error("Donación no encontrada");
    }

    if (donacion.estado === "aprobado") {
      await this.enviarNotificacionesSiCorresponde(donacion);
      return;
    }

    this.db.actualizarEstadoDonacion(id, "aprobado", mpPaymentId);
    const actualizada = this.db.obtenerDonacionPorId(id);
    if (!actualizada) {
      return;
    }

    await this.enviarNotificacionesSiCorresponde(actualizada);
  }

  private async enviarNotificacionesSiCorresponde(donacion: Donacion): Promise<void> {
    if (donacion.estado !== "aprobado") {
      return;
    }

    if (donacion.agradecimiento_enviado) {
      return;
    }

  let notificado: boolean = donacion.agradecimiento_enviado;

    if (!notificado && donacion.donante_email) {
      try {
        const enviado = await emailService.enviarAgradecimientoDonacion(
          donacion.donante_email,
          {
            nombre: donacion.donante_nombre || "Donante",
            monto: donacion.monto,
            mensaje: donacion.mensaje || undefined,
          }
        );
        if (enviado) {
          notificado = true;
        }
      } catch (error: any) {
        console.error(
          `[Donaciones] Error enviando agradecimiento: ${error.message}`
        );
      }
    }

    // Siempre notificar al administrador
    try {
      await emailService.notificarDonacionAdmin({
        monto: donacion.monto,
        nombre: donacion.donante_nombre || "Donante",
        email: donacion.donante_email,
        mensaje: donacion.mensaje,
        donacionId: donacion.id,
      });
    } catch (error: any) {
      console.error(
        `[Donaciones] Error notificando donación al admin: ${error.message}`
      );
    }

    if (!notificado) {
      this.db.marcarAgradecimientoEnviado(donacion.id);
    }
  }

  private validarEmail(email: string): boolean {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }
}
