import { Router, Request, Response } from "express";
import { SupabaseService } from "../services/supabase.service";
import { ActiveSessionsService } from "../services/active-sessions.service";
import crypto from "crypto";

export function crearRutasActiveSessions(
  supabaseService: SupabaseService
): Router {
  const router = Router();
  const supabaseClient = supabaseService.getClient();

  // Si Supabase no está configurado, retornar router vacío
  if (!supabaseClient) {
    console.warn("[Active Sessions] Supabase no está configurado, rutas deshabilitadas");
    router.post("/register", (_req, res) => {
      return res.json({
        success: true,
        sessionToken: "disabled",
        message: "Sesiones no configuradas",
      });
    });
    return router;
  }

  const activeSessionsService = new ActiveSessionsService(supabaseClient);

  /**
   * POST /api/sessions/register
   * Registra o actualiza una sesión activa de usuario
   * Body: { user_id?: string, session_token?: string }
   */
  router.post("/register", async (req: Request, res: Response) => {
    try {
      const { user_id } = req.body;
      
      // Generar token de sesión único
      const sessionToken =
        req.body.session_token ||
        crypto.randomBytes(32).toString("hex");
      
      // Obtener IP del cliente (considerando proxies)
      const ipAddress =
        (req.headers["x-forwarded-for"] as string)?.split(",")[0].trim() ||
        req.ip ||
        "unknown";

      // Obtener User-Agent
      const userAgent = req.headers["user-agent"] || "unknown";

      // Registrar sesión en Supabase
      await activeSessionsService.registerSession(
        user_id || null,
        sessionToken,
        ipAddress,
        userAgent
      );

      return res.json({
        success: true,
        sessionToken,
        message: "Sesión registrada correctamente",
      });
    } catch (error: any) {
      console.error("[Active Sessions] Error registrando sesión:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Error registrando sesión",
      });
    }
  });

  /**
   * POST /api/sessions/end
   * Termina una sesión activa
   * Body: { session_token: string }
   */
  router.post("/end", async (req: Request, res: Response) => {
    try {
      const { session_token } = req.body;

      if (!session_token) {
        return res.status(400).json({
          success: false,
          error: "session_token requerido",
        });
      }

      await activeSessionsService.endSession(session_token);

      return res.json({
        success: true,
        message: "Sesión terminada correctamente",
      });
    } catch (error: any) {
      console.error("[Active Sessions] Error terminando sesión:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Error terminando sesión",
      });
    }
  });

  /**
   * GET /api/sessions/active-users
   * Obtiene el conteo de usuarios activos
   */
  router.get("/active-users", async (_req: Request, res: Response) => {
    try {
      const result = await activeSessionsService.getActiveUsersCount();

      return res.json({
        success: true,
        totalUsers: result.totalUsers,
        totalSessions: result.totalSessions,
        updatedAt: result.updatedAt,
      });
    } catch (error: any) {
      console.error("[Active Sessions] Error obteniendo usuarios activos:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo usuarios activos",
      });
    }
  });

  /**
   * GET /api/sessions/stats
   * Obtiene estadísticas de sesiones activas (desde caché)
   */
  router.get("/stats", async (_req: Request, res: Response) => {
    try {
      const result = await activeSessionsService.getActiveUsersStats();

      return res.json({
        success: true,
        totalActiveUsers: result.totalUsers,
        totalSessions: result.totalSessions,
        updatedAt: result.updatedAt,
      });
    } catch (error: any) {
      console.error("[Active Sessions] Error obteniendo estadísticas:", error);
      return res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo estadísticas",
      });
    }
  });

  return router;
}
