import nodemailer from "nodemailer";
import { InformacionCupon, InformacionReferido } from "../types";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

interface CredencialesCliente {
  username: string;
  password: string;
  categoria: string;
  expiracion: string;
  servidores: string[];
  cupon?: InformacionCupon;
  referido?: InformacionReferido;
}

interface CredencialesRevendedor {
  username: string;
  password: string;
  tipo: "credito" | "validez";
  credito?: number;
  validez?: string;
  panelUrl: string;
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function sanitizeEmailSubject(input: string): string {
  // Evita header injection por CRLF
  return input.replace(/[\r\n]+/g, " ").trim();
}

class EmailService {
  private transporter: nodemailer.Transporter;
  private fromAddress: string;
  private debug: boolean;

  constructor() {
    // Usar configuración SMTP directa en lugar de servicio "gmail"
    const user = process.env.EMAIL_USER || process.env.SMTP_USER;
    const pass = (process.env.EMAIL_PASS || process.env.SMTP_PASS || "").trim();

    this.fromAddress = (process.env.EMAIL_FROM || user || "").trim();
    this.debug = (process.env.EMAIL_DEBUG || "").toLowerCase() === "true";
    
    console.log("[Email] Configurando con usuario:", user);
    if (this.debug) {
      console.log("[Email] From address:", this.fromAddress);
      console.log("[Email] Contraseña length:", pass.length, "bytes:", Buffer.byteLength(pass));
    }
    
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587", 10),
      secure: false, // true para puerto 465, false para 587
      requireTLS: true,
      auth: {
        user: user,
        pass: pass,
      },
    });

    // Verificar configuración al iniciar
    this.verificarConexion();
  }

  private async verificarConexion() {
    try {
      await this.transporter.verify();
      console.log("[Email] ✅ Servicio de email configurado correctamente");
    } catch (error) {
      console.error("[Email] ⚠️ Error verificando conexión (continuaremos intentando enviar):", error);
      // No lanzar error aquí, permitir que intente enviar cuando sea necesario
    }
  }

  /**
   * Envía un email genérico
   */
  private async enviarEmail(options: EmailOptions): Promise<boolean> {
    try {
      if (!this.fromAddress) {
        console.error(
          "[Email] ❌ EMAIL_FROM/EMAIL_USER/SMTP_USER no configurado; no se puede enviar email"
        );
        return false;
      }

      if (this.debug) {
        console.log("[Email] Intentando enviar a:", options.to);
      }
      
      await this.transporter.sendMail({
        from: `"JJSecure VPN" <${this.fromAddress}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
      });

      console.log(`[Email] ✅ Email enviado exitosamente a ${options.to}`);
      return true;
    } catch (error: any) {
      console.error(
        `[Email] ❌ Error enviando email a ${options.to}:`,
        error.message
      );
      return false;
    }
  }

  /**
   * Envía credenciales de cliente VPN
   */
  async enviarCredencialesCliente(
    email: string,
    credenciales: CredencialesCliente
  ): Promise<boolean> {
    const cuponSection = credenciales.cupon ? `
      <div class="cupon-info">
        <h3>✅ Cupón Aplicado</h3>
        <div class="cupon-details">
          <div class="detail-item">
            <span class="detail-label">🎟️ Cupón:</span>
            <span class="detail-value">${credenciales.cupon.codigo}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">💰 Descuento:</span>
            <span class="detail-value">$${credenciales.cupon.descuentoAplicado.toFixed(2)} ${credenciales.cupon.tipo === 'porcentaje' ? `(${credenciales.cupon.valor}%)` : ''}</span>
          </div>
        </div>
      </div>
    ` : '';

    const referidoSection = credenciales.referido ? `
      <div class="referido-info">
        <h3>🎁 Código de Referido Usado</h3>
        <div class="referido-details">
          <div class="detail-item">
            <span class="detail-label">📋 Código:</span>
            <span class="detail-value">${credenciales.referido.codigoUsado}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">💸 Descuento obtenido:</span>
            <span class="detail-value">$${credenciales.referido.descuentoAplicado.toFixed(2)} (${credenciales.referido.porcentajeDescuento}%)</span>
          </div>
          ${credenciales.referido.saldoUsado && credenciales.referido.saldoUsado > 0 ? `
          <div class="detail-item">
            <span class="detail-label">💳 Saldo usado:</span>
            <span class="detail-value">$${credenciales.referido.saldoUsado.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="detail-item">
            <span class="detail-label">💰 Método de pago:</span>
            <span class="detail-value">${credenciales.referido.metodoPago === 'saldo' ? '100% Saldo' : credenciales.referido.metodoPago === 'mixto' ? 'Saldo + MercadoPago' : 'MercadoPago'}</span>
          </div>
        </div>
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .credential-item { margin: 10px 0; }
          .credential-label { font-weight: bold; color: #667eea; }
          .credential-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
          .servers { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .server-item { padding: 8px; margin: 5px 0; background: #f0f0f0; border-radius: 4px; }
          .cupon-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .cupon-details { background: #f0fff4; padding: 15px; border-radius: 6px; }
          .referido-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
          .referido-details { background: #faf5ff; padding: 15px; border-radius: 6px; }
          .detail-item { margin: 8px 0; display: flex; justify-content: space-between; align-items: center; }
          .detail-label { font-weight: bold; color: #28a745; }
          .referido-details .detail-label { color: #9333ea; }
          .detail-value { background: white; padding: 5px 10px; border-radius: 4px; }
          .sin-cupon { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Tu cuenta VPN está lista</h1>
            <p>Bienvenido a JJSecure VPN</p>
          </div>
          <div class="content">
            <h2>Hola,</h2>
            <p>Tu compra se ha procesado exitosamente. Aquí están tus credenciales de acceso:</p>
            
            <div class="credentials">
              <div class="credential-item">
                <span class="credential-label">👤 Usuario:</span>
                <span class="credential-value">${credenciales.username}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">🔑 Contraseña:</span>
                <span class="credential-value">${credenciales.password}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">📦 Plan:</span>
                <span class="credential-value">${credenciales.categoria}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">📅 Válido hasta:</span>
                <span class="credential-value">${credenciales.expiracion}</span>
              </div>
            </div>

            ${cuponSection}
            ${referidoSection}

            <div class="servers">
              <h3>🌍 Servidores Disponibles:</h3>
              ${credenciales.servidores
                .map(
                  (server) => `
                <div class="server-item">📡 ${server}</div>
              `
                )
                .join("")}
            </div>

            <h3>📱 ¿Cómo conectarte?</h3>
            <ol>
              <li>Descarga la app <strong>JJSecure VPN</strong> desde Play Store o App Store</li>
              <li>Abre la app e ingresa tu usuario y contraseña</li>
              <li>Selecciona un servidor y conecta</li>
            </ol>

            <p style="text-align: center;">
              <a href="https://shop.jhservices.com.ar" class="button">Ver más planes</a>
            </p>

            <p><strong>💡 Importante:</strong></p>
            <ul>
              <li>Guarda estas credenciales en un lugar seguro</li>
              <li>No compartas tu cuenta con otras personas</li>
              <li>Si tienes problemas, contáctanos</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Todos los derechos reservados</p>
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: "🔐 Tus credenciales VPN - JJSecure",
      html,
    });
  }

  /**
   * Envía notificación de venta al administrador
   */
  async notificarVentaAdmin(
    tipo:
      | "cliente"
      | "revendedor"
      | "renovacion-cliente"
      | "renovacion-revendedor",
    datos: {
      clienteNombre: string;
      clienteEmail: string;
      monto: number;
      descripcion: string;
      username?: string;
      cupon?: InformacionCupon;
      referido?: InformacionReferido;
    }
  ): Promise<boolean> {
    const jazminEmail = "jazmincardozoh05@gmail.com";

    const tipoTexto = {
      cliente: "Nueva venta - Cliente VPN",
      revendedor: "Nueva venta - Revendedor",
      "renovacion-cliente": "Renovación - Cliente VPN",
      "renovacion-revendedor": "Renovación - Revendedor",
    };

    const cuponSection = datos.cupon ? `
      <div class="cupon-section">
        <h3>🎟️ Cupón Utilizado</h3>
        <div class="cupon-data">
          <div class="cupon-item">
            <span class="cupon-label">Código:</span>
            <span class="cupon-value">${datos.cupon.codigo}</span>
          </div>
          <div class="cupon-item">
            <span class="cupon-label">Descuento:</span>
            <span class="cupon-value">$${datos.cupon.descuentoAplicado.toFixed(2)} ${datos.cupon.tipo === 'porcentaje' ? `(${datos.cupon.valor}%)` : ''}</span>
          </div>
          <div class="cupon-item">
            <span class="cupon-label">Precio original:</span>
            <span class="cupon-value" style="text-decoration: line-through; color: #999;">$${datos.cupon.montoOriginal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    ` : '';

    const referidoSection = datos.referido ? `
      <div class="referido-section">
        <h3>🎁 Código de Referido</h3>
        <div class="referido-data">
          <div class="referido-item">
            <span class="referido-label">Código usado:</span>
            <span class="referido-value">${datos.referido.codigoUsado}</span>
          </div>
          <div class="referido-item">
            <span class="referido-label">Referidor:</span>
            <span class="referido-value">${datos.referido.referidorEmail}</span>
          </div>
          <div class="referido-item">
            <span class="referido-label">Descuento cliente:</span>
            <span class="referido-value">$${datos.referido.descuentoAplicado.toFixed(2)} (${datos.referido.porcentajeDescuento}%)</span>
          </div>
          <div class="referido-item">
            <span class="referido-label">Comisión referidor:</span>
            <span class="referido-value" style="color: #28a745; font-weight: bold;">+$${datos.referido.comisionReferidor.toFixed(2)}</span>
          </div>
          ${datos.referido.saldoUsado && datos.referido.saldoUsado > 0 ? `
          <div class="referido-item">
            <span class="referido-label">Saldo usado:</span>
            <span class="referido-value">$${datos.referido.saldoUsado.toFixed(2)}</span>
          </div>
          ` : ''}
          <div class="referido-item">
            <span class="referido-label">Método pago:</span>
            <span class="referido-value">${datos.referido.metodoPago === 'saldo' ? '💳 100% Saldo' : datos.referido.metodoPago === 'mixto' ? '💳 Saldo + MercadoPago' : '💰 MercadoPago'}</span>
          </div>
        </div>
      </div>
    ` : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .venta-info { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; }
          .info-item { margin: 10px 0; }
          .info-label { font-weight: bold; color: #28a745; }
          .info-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
          .monto { font-size: 24px; font-weight: bold; color: #28a745; text-align: center; margin: 20px 0; }
          .cupon-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .cupon-data { background: #fffbea; padding: 15px; border-radius: 6px; }
          .cupon-item { margin: 8px 0; display: flex; justify-content: space-between; align-items: center; }
          .cupon-label { font-weight: bold; color: #ff9800; }
          .cupon-value { background: white; padding: 5px 10px; border-radius: 4px; }
          .referido-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #9333ea; }
          .referido-data { background: #faf5ff; padding: 15px; border-radius: 6px; }
          .referido-item { margin: 8px 0; display: flex; justify-content: space-between; align-items: center; }
          .referido-label { font-weight: bold; color: #9333ea; }
          .referido-value { background: white; padding: 5px 10px; border-radius: 4px; }
          .sin-cupon-section { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💰 ${tipoTexto[tipo]}</h1>
            <p>¡Nueva venta registrada!</p>
          </div>
          <div class="content">
            <h2>Detalles de la venta:</h2>
            
            <div class="venta-info">
              <div class="info-item">
                <span class="info-label">👤 Cliente:</span>
                <span class="info-value">${datos.clienteNombre}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📧 Email:</span>
                <span class="info-value">${datos.clienteEmail}</span>
              </div>
              ${
                datos.username
                  ? `
              <div class="info-item">
                <span class="info-label">🔑 Username:</span>
                <span class="info-value">${datos.username}</span>
              </div>
              `
                  : ""
              }
              <div class="info-item">
                <span class="info-label">📝 Descripción:</span>
                <span class="info-value">${datos.descripcion}</span>
              </div>
            </div>

            ${cuponSection}
            ${referidoSection}

            <div class="monto">
              💵 Monto final pagado: $${datos.monto}
            </div>

            <p><strong>✅ Esta venta ya ha sido procesada exitosamente.</strong></p>
            <p>El cliente ya recibió sus credenciales por email.</p>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Sistema de Notificaciones</p>
            <p>Este es un correo automático del sistema.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: jazminEmail,
      subject: `🔔 ${tipoTexto[tipo]} - $${datos.monto}`,
      html,
    });
  }

  /**
   * Notifica al admin cuando un usuario crea un ticket de soporte.
   * Se dispara típicamente desde el webhook de Supabase (INSERT en support_tickets).
   */
  async notificarTicketSoporteAdmin(datos: {
    ticketId: string;
    userEmail: string;
    userName?: string;
    asunto: string;
    descripcion?: string;
    createdAt?: string;
  }): Promise<boolean> {
    const to =
      process.env.SUPPORT_NOTIFY_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "jazmincardozoh05@gmail.com";

    const safeAsunto = datos.asunto || "(sin asunto)";
    const safeDescripcion = datos.descripcion || "(sin descripción)";
    
    // Formatear fecha legible
    let fechaLegible = "";
    try {
      const fecha = datos.createdAt ? new Date(datos.createdAt) : new Date();
      fechaLegible = fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      fechaLegible = datos.createdAt || new Date().toISOString();
    }

    // Ticket ID corto (primeros 8 caracteres)
    const ticketIdCorto = (datos.ticketId || "").substring(0, 8).toUpperCase();
    const userEmailHtml = escapeHtml(datos.userEmail || "(sin email)");
    const userNameHtml = escapeHtml(datos.userName || datos.userEmail || "");
    const asuntoHtml = escapeHtml(safeAsunto);
    const descripcionHtml = escapeHtml(safeDescripcion);
    const fechaHtml = escapeHtml(fechaLegible);
    const ticketIdHtml = escapeHtml(ticketIdCorto);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 22px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 22px; border-radius: 0 0 10px 10px; }
          .box { background: white; padding: 16px; border-radius: 8px; margin: 14px 0; border-left: 4px solid #2563eb; }
          .row { margin: 8px 0; }
          .label { font-weight: bold; color: #1d4ed8; }
          .value { font-family: monospace; background: #f0f0f0; padding: 3px 8px; border-radius: 4px; display: inline-block; }
          .desc { white-space: pre-wrap; background: #fff; border: 1px solid #eee; padding: 12px; border-radius: 8px; }
          .footer { text-align: center; margin-top: 18px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🎫 Nuevo ticket de soporte</h2>
            <p>Se creó un ticket desde la web</p>
          </div>
          <div class="content">
            <div class="box">
              <div class="row"><span class="label">📌 Ticket:</span> <span class="value">#${ticketIdHtml}</span></div>
              <div class="row"><span class="label">👤 Usuario:</span> ${userNameHtml}</div>
              <div class="row"><span class="label">📧 Email:</span> <a href="mailto:${userEmailHtml}">${userEmailHtml}</a></div>
              <div class="row"><span class="label">📅 Fecha:</span> ${fechaHtml}</div>
              <div class="row"><span class="label">📝 Asunto:</span> <strong>${asuntoHtml}</strong></div>
            </div>

            <h3>📋 Descripción</h3>
            <div class="desc">${descripcionHtml}</div>

            <div class="footer">
              <p>© 2025 JJSecure VPN - Notificación automática</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to,
      subject: sanitizeEmailSubject(`🎫 Nuevo ticket: ${safeAsunto}`),
      html,
    });
  }

  /**
   * Confirmación al usuario cuando crea un ticket.
   */
  async enviarConfirmacionTicketSoporteUsuario(datos: {
    to: string;
    ticketId: string;
    asunto: string;
    descripcion?: string;
    createdAt?: string;
  }): Promise<boolean> {
    const safeAsunto = datos.asunto || "(sin asunto)";
    const safeDescripcion = datos.descripcion || "(sin descripción)";
    
    // Formatear fecha legible
    let fechaLegible = "";
    try {
      const fecha = datos.createdAt ? new Date(datos.createdAt) : new Date();
      fechaLegible = fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      fechaLegible = datos.createdAt || new Date().toISOString();
    }

    // Ticket ID corto
    const ticketIdCorto = (datos.ticketId || "").substring(0, 8).toUpperCase();
    const ticketIdHtml = escapeHtml(ticketIdCorto);
    const asuntoHtml = escapeHtml(safeAsunto);
    const descripcionHtml = escapeHtml(safeDescripcion);
    const fechaHtml = escapeHtml(fechaLegible);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #16a34a 0%, #15803d 100%); color: white; padding: 22px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 22px; border-radius: 0 0 10px 10px; }
          .box { background: white; padding: 16px; border-radius: 8px; margin: 14px 0; border-left: 4px solid #16a34a; }
          .row { margin: 8px 0; }
          .label { font-weight: bold; color: #15803d; }
          .value { font-family: monospace; background: #f0f0f0; padding: 3px 8px; border-radius: 4px; display: inline-block; }
          .desc { white-space: pre-wrap; background: #fff; border: 1px solid #eee; padding: 12px; border-radius: 8px; }
          .footer { text-align: center; margin-top: 18px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>✅ Recibimos tu ticket</h2>
            <p>Te vamos a responder lo antes posible</p>
          </div>
          <div class="content">
            <div class="box">
              <div class="row"><span class="label">📌 Ticket:</span> <span class="value">#${ticketIdHtml}</span></div>
              <div class="row"><span class="label">📅 Fecha:</span> ${fechaHtml}</div>
              <div class="row"><span class="label">📝 Asunto:</span> <strong>${asuntoHtml}</strong></div>
            </div>

            <h3>📋 Tu mensaje</h3>
            <div class="desc">${descripcionHtml}</div>

            <div class="footer">
              <p>© 2025 JJSecure VPN - Soporte</p>
              <p>Este es un correo automático.</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: datos.to,
      subject: sanitizeEmailSubject(`✅ Ticket recibido: ${safeAsunto}`),
      html,
    });
  }

  /**
   * Notificación al usuario cuando un admin responde (mensaje no-interno).
   */
  async notificarRespuestaTicketSoporteUsuario(datos: {
    to: string;
    ticketId: string;
    asunto: string;
    content: string;
    createdAt?: string;
  }): Promise<boolean> {
    const safeAsunto = datos.asunto || "(sin asunto)";
    const safeContent = datos.content || "";

    // Formatear fecha legible
    let fechaLegible = "";
    try {
      const fecha = datos.createdAt ? new Date(datos.createdAt) : new Date();
      fechaLegible = fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      fechaLegible = datos.createdAt || new Date().toISOString();
    }

    // Ticket ID corto (primeros 8 caracteres)
    const ticketIdCorto = (datos.ticketId || "").substring(0, 8).toUpperCase();

    const ticketIdHtml = escapeHtml(ticketIdCorto);
    const asuntoHtml = escapeHtml(safeAsunto);
    const createdAtHtml = escapeHtml(fechaLegible);
    const contentHtml = escapeHtml(safeContent);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); color: white; padding: 22px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 22px; border-radius: 0 0 10px 10px; }
          .box { background: white; padding: 16px; border-radius: 8px; margin: 14px 0; border-left: 4px solid #2563eb; }
          .row { margin: 8px 0; }
          .label { font-weight: bold; color: #1d4ed8; }
          .value { font-family: monospace; background: #f0f0f0; padding: 3px 8px; border-radius: 4px; display: inline-block; }
          .msg { white-space: pre-wrap; background: #fff; border: 1px solid #eee; padding: 12px; border-radius: 8px; }
          .footer { text-align: center; margin-top: 18px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>📩 Respondimos tu ticket</h2>
            <p>Asunto: ${asuntoHtml}</p>
          </div>
          <div class="content">
            <div class="box">
              <div class="row"><span class="label">Ticket:</span> <span class="value">#${ticketIdHtml}</span></div>
              <div class="row"><span class="label">Fecha:</span> <span class="value">${createdAtHtml}</span></div>
            </div>

            <h3>Respuesta</h3>
            <div class="msg">${contentHtml}</div>

            <div class="footer">
              <p>© 2025 JJSecure VPN - Soporte</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: datos.to,
      subject: sanitizeEmailSubject(`📩 Respuesta a tu ticket: ${safeAsunto}`),
      html,
    });
  }

  /**
   * Notificación al admin cuando el usuario responde.
   */
  async notificarRespuestaTicketSoporteAdmin(datos: {
    ticketId: string;
    userId: string;
    userEmail: string;
    asunto: string;
    content: string;
    createdAt?: string;
  }): Promise<boolean> {
    const to =
      process.env.SUPPORT_NOTIFY_EMAIL ||
      process.env.ADMIN_EMAIL ||
      "jazmincardozoh05@gmail.com";

    const safeAsunto = datos.asunto || "(sin asunto)";
    const safeContent = datos.content || "";

    // Formatear fecha legible
    let fechaLegible = "";
    try {
      const fecha = datos.createdAt ? new Date(datos.createdAt) : new Date();
      fechaLegible = fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch {
      fechaLegible = datos.createdAt || new Date().toISOString();
    }

    // Ticket ID corto (primeros 8 caracteres)
    const ticketIdCorto = (datos.ticketId || "").substring(0, 8).toUpperCase();

    const ticketIdHtml = escapeHtml(ticketIdCorto);
    const userEmailHtml = escapeHtml(String(datos.userEmail || ""));
    const asuntoHtml = escapeHtml(safeAsunto);
    const createdAtHtml = escapeHtml(fechaLegible);
    const contentHtml = escapeHtml(safeContent);

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 22px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 22px; border-radius: 0 0 10px 10px; }
          .box { background: white; padding: 16px; border-radius: 8px; margin: 14px 0; border-left: 4px solid #f59e0b; }
          .row { margin: 8px 0; }
          .label { font-weight: bold; color: #b45309; }
          .value { font-family: monospace; background: #f0f0f0; padding: 3px 8px; border-radius: 4px; display: inline-block; }
          .msg { white-space: pre-wrap; background: #fff; border: 1px solid #eee; padding: 12px; border-radius: 8px; }
          .footer { text-align: center; margin-top: 18px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>🔔 Nueva respuesta del usuario</h2>
            <p>Ticket: ${asuntoHtml}</p>
          </div>
          <div class="content">
            <div class="box">
              <div class="row"><span class="label">Ticket:</span> <span class="value">#${ticketIdHtml}</span></div>
              <div class="row"><span class="label">Email:</span> <a href="mailto:${userEmailHtml}">${userEmailHtml}</a></div>
              <div class="row"><span class="label">Fecha:</span> <span class="value">${createdAtHtml}</span></div>
            </div>

            <h3>Mensaje</h3>
            <div class="msg">${contentHtml}</div>

            <div class="footer">
              <p>© 2025 JJSecure VPN - Notificación automática</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to,
      subject: sanitizeEmailSubject(`🔔 Respuesta en ticket: ${safeAsunto}`),
      html,
    });
  }

  async enviarAgradecimientoDonacion(
    email: string,
    datos: {
      nombre: string;
      monto: number;
      mensaje?: string;
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 24px; }
          .header h1 { color: #28a745; }
          .card { background: white; border-radius: 10px; padding: 20px; border-left: 4px solid #28a745; }
          .monto { font-size: 28px; font-weight: bold; color: #28a745; text-align: center; margin: 24px 0; }
          .mensaje { background: #f0f9f4; padding: 16px; border-radius: 8px; font-style: italic; color: #1e7e34; }
          .footer { text-align: center; margin-top: 24px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Gracias por tu aporte!</h1>
            <p>Hola ${datos.nombre}, apreciamos tu apoyo a JJSecure VPN.</p>
          </div>
          <div class="card">
            <p>Recibimos tu donación y queremos agradecerte por confiar en nuestro trabajo. Este aporte nos ayuda a seguir mejorando nuestros servicios y mantener la infraestructura segura para todos los usuarios.</p>
            <div class="monto">$${datos.monto.toFixed(2)}</div>
            ${datos.mensaje ? `<div class="mensaje">"${datos.mensaje}"</div>` : ""}
            <p>Si necesitas factura o deseas ponerte en contacto con nosotros, simplemente responde este correo.</p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} JJSecure VPN</p>
            <p>Este es un mensaje automático. Muchas gracias nuevamente.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: "🙏 ¡Gracias por apoyar a JJSecure VPN!",
      html,
    });
  }

  async notificarDonacionAdmin(datos: {
    monto: number;
    nombre: string;
    email?: string;
    mensaje?: string;
    donacionId: string;
  }): Promise<boolean> {
    const adminEmail = process.env.EMAIL_USER;
    if (!adminEmail) {
      console.error("[Email] ❌ EMAIL_USER no configurado para notificación de donaciones");
      return false;
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 12px; }
          .header { text-align: center; margin-bottom: 24px; }
          .header h1 { color: #007bff; }
          .card { background: white; border-radius: 10px; padding: 20px; border-left: 4px solid #007bff; }
          .info { margin: 12px 0; }
          .label { font-weight: bold; color: #007bff; }
          .monto { font-size: 28px; font-weight: bold; color: #28a745; text-align: center; margin: 24px 0; }
          .mensaje { background: #eef5ff; padding: 16px; border-radius: 8px; font-style: italic; color: #0d47a1; }
          .footer { text-align: center; margin-top: 24px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💝 Nueva donación recibida</h1>
            <p>ID de referencia: ${datos.donacionId}</p>
          </div>
          <div class="card">
            <div class="info"><span class="label">Nombre:</span> ${datos.nombre}</div>
            <div class="info"><span class="label">Email:</span> ${datos.email || "No informado"}</div>
            <div class="monto">$${datos.monto.toFixed(2)}</div>
            ${datos.mensaje ? `<div class="mensaje">"${datos.mensaje}"</div>` : ""}
            <p>La donación ha sido marcada como aprobada en el sistema.</p>
          </div>
          <div class="footer">
            <p>Enviado automáticamente por SecureShop VPN</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: adminEmail,
      subject: `💝 Nueva donación $${datos.monto.toFixed(2)} - ${datos.nombre}`,
      html,
    });
  }
  /**
   * Envía credenciales de revendedor
   */
  async enviarCredencialesRevendedor(
    email: string,
    credenciales: CredencialesRevendedor
  ): Promise<boolean> {
    const tipoTexto =
      credenciales.tipo === "credito"
        ? `${credenciales.credito} créditos`
        : `Válido hasta ${credenciales.validez}`;

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f5576c; }
          .credential-item { margin: 10px 0; }
          .credential-label { font-weight: bold; color: #f5576c; }
          .credential-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #f5576c; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🏪 Tu cuenta de Revendedor está lista</h1>
            <p>Bienvenido al Panel de Revendedores</p>
          </div>
          <div class="content">
            <h2>¡Felicitaciones!</h2>
            <p>Tu compra se ha procesado exitosamente. Ya puedes empezar a crear cuentas VPN para tus clientes.</p>
            
            <div class="credentials">
              <div class="credential-item">
                <span class="credential-label">👤 Usuario:</span>
                <span class="credential-value">${credenciales.username}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">🔑 Contraseña:</span>
                <span class="credential-value">${credenciales.password}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">💳 Plan:</span>
                <span class="credential-value">${tipoTexto}</span>
              </div>
            </div>

            <div class="highlight">
              <h3>🌐 Accede al Panel de Revendedor:</h3>
              <p style="text-align: center; font-size: 18px;">
                <a href="${credenciales.panelUrl}" class="button">Ir al Panel</a>
              </p>
              <p style="text-align: center; color: #666;">
                <code>${credenciales.panelUrl}</code>
              </p>
            </div>

            <h3>📋 ¿Qué puedes hacer?</h3>
            <ul>
              <li>✅ Crear cuentas VPN para tus clientes</li>
              <li>✅ Gestionar usuarios y renovaciones</li>
              <li>✅ Ver estadísticas de uso</li>
              <li>✅ Administrar tus créditos/validez</li>
            </ul>

            <h3>💡 Consejos importantes:</h3>
            <ul>
              <li>🔒 Guarda estas credenciales en un lugar seguro</li>
              <li>📱 Accede al panel desde cualquier dispositivo</li>
              <li>💬 Contacta soporte si tienes dudas</li>
              <li>📊 Revisa el panel regularmente para gestionar tus clientes</li>
            </ul>

            <div class="highlight" style="background: #e8f4f8; border-left-color: #0288d1;">
              <h3>📱 Descarga la App de Reventa</h3>
              <p>Gestiona tu negocio de reventa desde tu teléfono con nuestra aplicación móvil:</p>
              <p style="text-align: center;">
                <a href="https://www.dropbox.com/scl/fi/4pckvdls3e5zy4qw5u37a/SecureVPNReventaBase.apk?rlkey=z1co1z2k8cn5h66d6opyu7qnn&st=l656zqmn&dl=1" class="button" style="background: #0288d1;">📲 Descargar APK</a>
              </p>
            </div>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Panel de Revendedores</p>
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: "🏪 Tu cuenta de Revendedor - JJSecure VPN",
      html,
    });
  }

  /**
   * Envía confirmación de renovación (clientes y revendedores)
   */
  async enviarConfirmacionRenovacion(
    email: string,
    datos: {
      tipo: 'cliente' | 'revendedor';
      username: string;
      diasAgregados: number;
      nuevaExpiracion: string;
      monto: number;
      operacion?: string; // 'upgrade', 'validity', 'credit', etc.
      detallesExtra?: string; // Info adicional según tipo
    }
  ): Promise<boolean> {
    const esCliente = datos.tipo === 'cliente';
    const colorPrimario = esCliente ? '#667eea' : '#28a745';
    const icono = esCliente ? '🔐' : '🏪';
    const tipoTexto = esCliente ? 'Cliente VPN' : 'Revendedor';
    
    let tituloOperacion = 'Renovación exitosa';
    if (datos.operacion === 'upgrade') {
      tituloOperacion = 'Upgrade exitoso';
    } else if (datos.operacion === 'validity') {
      tituloOperacion = 'Renovación de validez exitosa';
    } else if (datos.operacion === 'credit') {
      tituloOperacion = 'Recarga de créditos exitosa';
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, ${colorPrimario} 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .info-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid ${colorPrimario}; }
          .info-item { margin: 12px 0; display: flex; justify-content: space-between; align-items: center; }
          .info-label { font-weight: bold; color: ${colorPrimario}; }
          .info-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; }
          .success-box { background: #d4edda; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #28a745; text-align: center; }
          .success-text { color: #155724; font-size: 18px; font-weight: bold; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: ${colorPrimario}; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>${icono} ${tituloOperacion}</h1>
            <p>${tipoTexto} - JJSecure VPN</p>
          </div>
          <div class="content">
            <div class="success-box">
              <p class="success-text">✅ Tu ${datos.tipo === 'cliente' ? 'cuenta' : 'panel de revendedor'} ha sido renovado exitosamente</p>
            </div>
            
            <div class="info-box">
              <h3>📋 Detalles de la renovación:</h3>
              <div class="info-item">
                <span class="info-label">👤 Usuario:</span>
                <span class="info-value">${datos.username}</span>
              </div>
              <div class="info-item">
                <span class="info-label">📅 Días agregados:</span>
                <span class="info-value">${datos.diasAgregados} días</span>
              </div>
              <div class="info-item">
                <span class="info-label">⏰ Nueva expiración:</span>
                <span class="info-value">${datos.nuevaExpiracion}</span>
              </div>
              <div class="info-item">
                <span class="info-label">💰 Monto pagado:</span>
                <span class="info-value">$${datos.monto.toLocaleString('es-AR')}</span>
              </div>
              ${datos.detallesExtra ? `
              <div class="info-item">
                <span class="info-label">ℹ️ Detalles:</span>
                <span class="info-value">${datos.detallesExtra}</span>
              </div>
              ` : ''}
            </div>

            <p style="text-align: center;">
              ${esCliente ? `
                <p>Tu cuenta está activa y lista para usar. ¡Disfruta de tu conexión segura!</p>
              ` : `
                <p>Tu panel de revendedor está actualizado. Puedes acceder desde:</p>
                <a href="https://servex.jhservices.com.ar/reseller" class="button">Ir al Panel de Revendedor</a>
              `}
            </p>

            <p><strong>💡 Recuerda:</strong></p>
            <ul>
              <li>Tu cuenta se renovará automáticamente desde la fecha actual</li>
              <li>Si tienes dudas, contáctanos por WhatsApp</li>
              <li>Guarda este email como comprobante de tu renovación</li>
            </ul>

            <p style="text-align: center;">
              <a href="https://shop.jhservices.com.ar" class="button">Visitar la tienda</a>
            </p>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Todos los derechos reservados</p>
            <p>Este es un correo automático, por favor no responder.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: `${icono} ${tituloOperacion} - ${datos.username} | JJSecure VPN`,
      html,
    });
  }

  /**
   * Envía credenciales de demostración gratuita (2 horas)
   */
  async enviarCredencialesDemo(
    email: string,
    credenciales: {
      nombre: string;
      username: string;
      password: string;
      horas_validas: number;
      servidores: string[];
    }
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
          .credentials { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
          .credential-item { margin: 10px 0; }
          .credential-label { font-weight: bold; color: #667eea; }
          .credential-value { font-family: monospace; background: #f0f0f0; padding: 5px 10px; border-radius: 4px; display: inline-block; }
          .servers { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .server-item { padding: 8px; margin: 5px 0; background: #f0f0f0; border-radius: 4px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
          .button { display: inline-block; padding: 12px 30px; background: #667eea; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .highlight { background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ffc107; }
          .warning { color: #856404; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎁 ¡Prueba gratuita de JJSecure VPN!</h1>
            <p>Acceso de ${
              credenciales.horas_validas
            } horas completamente gratis</p>
          </div>
          <div class="content">
            <h2>Hola ${credenciales.nombre},</h2>
            <p>¡Gracias por solicitar una demostración de JJSecure VPN! Aquí están tus credenciales para probar nuestro servicio:</p>
            
            <div class="credentials">
              <div class="credential-item">
                <span class="credential-label">👤 Usuario:</span>
                <span class="credential-value">${credenciales.username}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">🔑 Contraseña:</span>
                <span class="credential-value">${credenciales.password}</span>
              </div>
              <div class="credential-item">
                <span class="credential-label">⏱️ Duración:</span>
                <span class="credential-value">${
                  credenciales.horas_validas
                } horas desde ahora</span>
              </div>
            </div>

            <div class="servers">
              <h3>🌍 Servidores Disponibles:</h3>
              ${credenciales.servidores
                .map(
                  (server) => `
                <div class="server-item">📡 ${server}</div>
              `
                )
                .join("")}
            </div>

            <h3>📱 Cómo empezar:</h3>
            <ol>
              <li>Descarga la app <strong>JJSecure VPN</strong> desde <a href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR" target="_blank" style="color: #667eea;">Google Play Store</a></li>
              <li>Abre la app e ingresa tu usuario y contraseña</li>
              <li>Selecciona un servidor y conecta</li>
              <li>¡Disfruta de navegación segura y privada!</li>
            </ol>

            <div class="highlight warning">
              <h3>⏳ Información importante sobre tu demo:</h3>
              <ul>
                <li>✅ Acceso válido por ${
                  credenciales.horas_validas
                } horas</li>
                <li>✅ Velocidad completa sin limitaciones</li>
                <li>⚠️ No podrás solicitar otra demo desde este email o IP en 48 horas</li>
                <li>✅ Después, puedes adquirir un plan completo</li>
              </ul>
            </div>

            <p style="text-align: center;">
              <a href="https://shop.jhservices.com.ar" class="button">Ver planes disponibles</a>
            </p>

            <h3>💡 Preguntas frecuentes:</h3>
            <ul>
              <li><strong>¿Por qué necesito VPN?</strong> - Para proteger tu privacidad y seguridad en internet</li>
              <li><strong>¿Es anónimo?</strong> - Sí, navegas con total anonimato desde nuestros servidores</li>
              <li><strong>¿Qué ocurre después de ${
                credenciales.horas_validas
              } horas?</strong> - Tu acceso expira. Puedes comprar un plan desde nuestra tienda</li>
              <li><strong>¿Puedo usar múltiples dispositivos?</strong> - Depende de tu plan, algunos permiten 2-5 conexiones simultáneas</li>
            </ul>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Todos los derechos reservados</p>
            <p>Este es un correo automático, por favor no responder.</p>
            <p>Preguntas: jjsecurevpn@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: `🎁 Tu demostración gratuita de JJSecure VPN (${credenciales.horas_validas}hs) - Acceso ${credenciales.username}`,
      html,
    });
  }

  /**
   * Envía email de confirmación de cuenta personalizado
   * Usar esto en lugar del email por defecto de Supabase
   */
  async enviarConfirmacionCuenta(
    email: string,
    confirmationUrl: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .header p { margin: 10px 0 0 0; opacity: 0.9; }
          .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .welcome-icon { font-size: 60px; margin-bottom: 15px; }
          .message { font-size: 16px; color: #555; margin-bottom: 30px; }
          .button-container { text-align: center; margin: 35px 0; }
          .button { 
            display: inline-block; 
            padding: 16px 40px; 
            background: linear-gradient(135deg, #10b981 0%, #059669 100%); 
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            font-size: 16px;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
            transition: transform 0.2s;
          }
          .button:hover { transform: translateY(-2px); }
          .link-backup { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin-top: 25px; 
            font-size: 13px; 
            word-break: break-all;
            color: #666;
          }
          .link-backup a { color: #10b981; }
          .features { 
            display: flex; 
            justify-content: space-around; 
            margin: 30px 0; 
            padding: 20px 0; 
            border-top: 1px solid #eee;
            border-bottom: 1px solid #eee;
          }
          .feature { text-align: center; flex: 1; }
          .feature-icon { font-size: 30px; margin-bottom: 8px; }
          .feature-text { font-size: 12px; color: #666; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 25px; font-size: 13px; color: #92400e; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="welcome-icon">🔐</div>
            <h1>¡Bienvenido a JJSecure VPN!</h1>
            <p>Tu seguridad en internet es nuestra prioridad</p>
          </div>
          <div class="content">
            <p class="message">
              ¡Hola! 👋<br><br>
              Gracias por registrarte en <strong>JJSecure VPN</strong>. Estás a un paso de proteger tu navegación y disfrutar de internet sin límites.
            </p>
            
            <p style="text-align: center; font-size: 16px; color: #333;">
              Para activar tu cuenta, haz clic en el siguiente botón:
            </p>
            
            <div class="button-container">
              <a href="${confirmationUrl}" class="button">
                ✅ Confirmar mi cuenta
              </a>
            </div>

            <div class="features">
              <div class="feature">
                <div class="feature-icon">🛡️</div>
                <div class="feature-text">Navegación<br>Segura</div>
              </div>
              <div class="feature">
                <div class="feature-icon">🌍</div>
                <div class="feature-text">Acceso<br>Global</div>
              </div>
              <div class="feature">
                <div class="feature-icon">⚡</div>
                <div class="feature-text">Alta<br>Velocidad</div>
              </div>
              <div class="feature">
                <div class="feature-icon">🔒</div>
                <div class="feature-text">Privacidad<br>Total</div>
              </div>
            </div>

            <div class="link-backup">
              <strong>¿El botón no funciona?</strong><br>
              Copia y pega este enlace en tu navegador:<br>
              <a href="${confirmationUrl}">${confirmationUrl}</a>
            </div>

            <div class="warning">
              ⚠️ <strong>Importante:</strong> Este enlace expira en 24 horas. Si no solicitaste esta cuenta, puedes ignorar este mensaje.
            </div>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Todos los derechos reservados</p>
            <p>Este es un correo automático, por favor no responder.</p>
            <p>¿Tienes preguntas? Escríbenos a: jjsecurevpn@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: "🔐 Confirma tu cuenta - JJSecure VPN",
      html,
    });
  }

  /**
   * Envía email de restablecimiento de contraseña personalizado
   */
  async enviarResetPassword(
    email: string,
    resetUrl: string
  ): Promise<boolean> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f4f4f4; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 40px 30px; text-align: center; border-radius: 12px 12px 0 0; }
          .header h1 { margin: 0; font-size: 28px; }
          .content { background: white; padding: 40px 30px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
          .icon { font-size: 60px; margin-bottom: 15px; }
          .message { font-size: 16px; color: #555; margin-bottom: 30px; }
          .button-container { text-align: center; margin: 35px 0; }
          .button { 
            display: inline-block; 
            padding: 16px 40px; 
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); 
            color: white !important; 
            text-decoration: none; 
            border-radius: 8px; 
            font-weight: bold; 
            font-size: 16px;
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.4);
          }
          .link-backup { 
            background: #f8f9fa; 
            padding: 15px; 
            border-radius: 8px; 
            margin-top: 25px; 
            font-size: 13px; 
            word-break: break-all;
            color: #666;
          }
          .link-backup a { color: #f59e0b; }
          .warning { background: #fef2f2; border-left: 4px solid #ef4444; padding: 15px; border-radius: 0 8px 8px 0; margin-top: 25px; font-size: 13px; color: #991b1b; }
          .footer { text-align: center; margin-top: 30px; color: #999; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">🔑</div>
            <h1>Restablecer Contraseña</h1>
          </div>
          <div class="content">
            <p class="message">
              Hola,<br><br>
              Recibimos una solicitud para restablecer la contraseña de tu cuenta en <strong>JJSecure VPN</strong>.
            </p>
            
            <div class="button-container">
              <a href="${resetUrl}" class="button">
                🔐 Restablecer contraseña
              </a>
            </div>

            <div class="link-backup">
              <strong>¿El botón no funciona?</strong><br>
              Copia y pega este enlace en tu navegador:<br>
              <a href="${resetUrl}">${resetUrl}</a>
            </div>

            <div class="warning">
              🚨 <strong>¿No solicitaste esto?</strong> Ignora este correo. Tu contraseña seguirá siendo la misma.
              Este enlace expira en 1 hora.
            </div>
          </div>
          <div class="footer">
            <p>© 2025 JJSecure VPN - Todos los derechos reservados</p>
            <p>¿Tienes preguntas? Escríbenos a: jjsecurevpn@gmail.com</p>
          </div>
        </div>
      </body>
      </html>
    `;

    return this.enviarEmail({
      to: email,
      subject: "🔑 Restablecer contraseña - JJSecure VPN",
      html,
    });
  }
}

export default new EmailService();
