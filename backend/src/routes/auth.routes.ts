import { Router, Request, Response } from "express";
import { config } from "../config";

const router = Router();

/**
 * POST /api/auth/verify-turnstile
 * Verifica un token de Cloudflare Turnstile server-side.
 * La secret key nunca sale del servidor.
 */
router.post("/verify-turnstile", async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      res.status(400).json({ success: false, error: "Token requerido" });
      return;
    }

    if (!config.turnstile.secretKey) {
      // Si no está configurado, dejar pasar (entorno de desarrollo)
      console.warn("[Turnstile] TURNSTILE_SECRET_KEY no configurada, omitiendo verificación");
      res.json({ success: true });
      return;
    }

    const formData = new URLSearchParams();
    formData.append("secret", config.turnstile.secretKey);
    formData.append("response", token);
    formData.append("remoteip", req.ip || "");

    const cfResponse = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: formData.toString(),
      }
    );

    const data = (await cfResponse.json()) as { success: boolean; "error-codes"?: string[] };

    if (data.success) {
      res.json({ success: true });
    } else {
      console.warn("[Turnstile] Verificación fallida:", data["error-codes"]);
      res.status(403).json({
        success: false,
        error: "Verificación de seguridad fallida. Intenta de nuevo.",
      });
    }
  } catch (error: any) {
    console.error("[Turnstile] Error verificando token:", error.message);
    res.status(500).json({ success: false, error: "Error interno de verificación" });
  }
});

export default router;
