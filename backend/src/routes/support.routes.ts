import express, { Request, Response } from "express";
import emailService from "../services/email.service";
import { supabaseService } from "../services/supabase.service";

const router = express.Router();

function getProvidedSecret(req: Request): string {
  const headerSecret =
    req.get("x-supabase-webhook-secret") ||
    req.get("x-webhook-secret") ||
    req.get("x-hook-secret") ||
    "";

  if (headerSecret) {
    return headerSecret;
  }

  const auth = req.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] || "";
}

function normalizeEventType(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.toUpperCase();
}

function getWebhookRecord(body: any): any {
  return body?.record ?? body?.new ?? body?.data?.record ?? body?.data?.new ?? null;
}

function safeString(value: unknown): string {
  if (typeof value === "string") return value;
  if (value == null) return "";
  try {
    return String(value);
  } catch {
    return "";
  }
}

/**
 * POST /api/support/webhook
 * Webhook para notificar por email cuando se crea un ticket de soporte
 * y cuando se insertan mensajes en tickets.
 *
 * Recomendado: usar Supabase "Database Webhooks" (INSERT en public.support_tickets)
 * y (INSERT en public.support_ticket_messages)
 * y configurar un secreto en header (x-supabase-webhook-secret).
 */
router.post("/webhook", async (req: Request, res: Response) => {
  try {
    const expectedSecret = (process.env.SUPABASE_WEBHOOK_SECRET || "").trim();
    const providedSecret = getProvidedSecret(req).trim();

    if (expectedSecret) {
      if (!providedSecret || providedSecret !== expectedSecret) {
        return res.status(401).json({ ok: false, error: "unauthorized" });
      }
    } else {
      // No bloqueamos por defecto para no romper entornos donde aún no se configuró.
      if (!providedSecret) {
        console.warn(
          "[SupportWebhook] ⚠️ SUPABASE_WEBHOOK_SECRET no configurado; webhook aceptado sin autenticación"
        );
      }
    }

    const body = req.body;
    const eventType = normalizeEventType(
      body?.type ??
        body?.eventType ??
        body?.data?.type ??
        body?.data?.eventType ??
        req.get("x-supabase-event") ??
        req.get("x-supabase-event-type")
    );
    const table = String(body?.table ?? body?.data?.table ?? body?.relation ?? "");
    const record = getWebhookRecord(body);

    // Log mínimo para diagnóstico en producción
    console.log("[SupportWebhook] event=", eventType, "table=", table);

    // Solo nos interesa creación de ticket (INSERT en support_tickets)
    if (eventType === "INSERT" && table === "support_tickets" && record) {
      const ticketId = String(record.id || "");
      const userId = String(record.user_id || "");
      const asunto = String(record.asunto || "");
      const descripcion = String(record.descripcion || "");
      const createdAt = String(record.created_at || "");

      console.log("[SupportWebhook] ticket INSERT id=", ticketId, "user=", userId);

      // Obtener perfil del usuario primero
      const profile = await supabaseService.getProfileById(userId);
      const userEmail = profile?.email || "(email no disponible)";
      const userName = profile?.nombre || userEmail;

      await emailService.notificarTicketSoporteAdmin({
        ticketId,
        userEmail,
        userName,
        asunto,
        descripcion,
        createdAt,
      });

      // Confirmación al usuario (userEmail ya obtenido arriba)
      if (profile?.email) {
        await emailService.enviarConfirmacionTicketSoporteUsuario({
          to: userEmail,
          ticketId,
          asunto,
          descripcion,
          createdAt,
        });
      }
    }

    // Mensajes (INSERT en support_ticket_messages)
    if (eventType === "INSERT" && table === "support_ticket_messages" && record) {
      const ticketId = String(record.ticket_id || "");
      const authorId = String(record.user_id || "");
      const content = safeString(record.content);
      const createdAt = String(record.created_at || "");
      const isInternal = Boolean(record.is_internal);

      console.log(
        "[SupportWebhook] message INSERT ticket=",
        ticketId,
        "author=",
        authorId,
        "internal=",
        isInternal
      );

      // Mensajes internos (admin-only): no notificar
      if (!isInternal && ticketId && authorId) {
        const ticket = await supabaseService.getSupportTicketById(ticketId);
        if (ticket) {
          const subject = ticket.asunto || "(sin asunto)";

          const isAuthorAdmin = await supabaseService.isChatAdmin(authorId);
          if (isAuthorAdmin) {
            // Admin respondió → avisar al usuario dueño del ticket
            const ownerProfile = await supabaseService.getProfileById(ticket.user_id);
            const ownerEmail = ownerProfile?.email;
            if (ownerEmail) {
              await emailService.notificarRespuestaTicketSoporteUsuario({
                to: ownerEmail,
                ticketId,
                asunto: subject,
                content,
                createdAt,
              });
            }
          } else {
            // Usuario respondió → avisar al admin
            const authorProfile = await supabaseService.getProfileById(authorId);
            const authorEmail = authorProfile?.email || "";

            await emailService.notificarRespuestaTicketSoporteAdmin({
              ticketId,
              userId: ticket.user_id,
              userEmail: authorEmail,
              asunto: subject,
              content,
              createdAt,
            });
          }
        }
      }
    }

    // Siempre 200 para evitar reintentos agresivos si falla el email
    return res.json({ ok: true });
  } catch (error) {
    console.error("[SupportWebhook] ❌ Error procesando webhook:", error);
    return res.json({ ok: true });
  }
});

export default router;
