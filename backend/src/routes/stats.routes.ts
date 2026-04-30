import { Router, Request, Response } from "express";
import { WebSocketService } from "../services/websocket.service";
import { ServexService } from "../services/servex.service";
import { RealtimeService } from "../services/realtime.service";

export function crearRutasStats(
  wsService: WebSocketService,
  servexService: ServexService,
  realtimeService?: RealtimeService
): Router {
  const router = Router();

  /**
   * GET /api/stats/servidores
   * Obtiene estadísticas en tiempo real de los servidores
   */
  router.get("/servidores", async (_req: Request, res: Response) => {
    try {
      const realtimeSnapshot = realtimeService?.getState().serverStats;

      if (realtimeSnapshot) {
        return res.json({
          servidores: realtimeSnapshot.servers,
          totalUsuarios: realtimeSnapshot.totalUsers,
          servidoresOnline: realtimeSnapshot.onlineServers,
          onlineServers: realtimeSnapshot.onlineServers,
          ultimaActualizacion: realtimeSnapshot.fetchedAt,
          nota: "Datos en tiempo real obtenidos desde Servex y cacheados en backend",
        });
      }

      const stats = wsService.obtenerEstadisticas();
      const totalUsuarios = stats.reduce(
        (acc, server) => acc + (server.connectedUsers ?? 0),
        0
      );
      const onlineServers = stats.filter((server) => server.status === "online").length;

      return res.json({
        servidores: stats,
        totalUsuarios,
        servidoresOnline: onlineServers,
        onlineServers,
        ultimaActualizacion: new Date().toISOString(),
        nota: "Datos en tiempo real de usuarios conectados a través de nuestro panel",
      });
    } catch (error: any) {
      console.error("[Stats API] Error obteniendo estadísticas:", error);
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * GET /api/stats/revendedores
   * Obtiene el conteo total de revendedores activos
   */
  router.get("/revendedores", async (_req: Request, res: Response) => {
    try {
      const conteo = await servexService.obtenerConteoRevendedores();

      return res.json({
        totalRevendedores: conteo,
        ultimaActualizacion: new Date(),
        nota: "Conteo de revendedores activos en el sistema Servex",
      });
    } catch (error: any) {
      console.error(
        "[Stats API] Error obteniendo conteo de revendedores:",
        error
      );
      return res.status(500).json({ error: error.message });
    }
  });

  /**
   * POST /api/stats/reconectar-websocket
   * Fuerza reconexión del WebSocket a Servex (limpia cache y reconecta)
   */
  router.post("/reconectar-websocket", async (_req: Request, res: Response) => {
    try {
      console.log('[API] Solicitando reconexión del WebSocket...');
      await wsService.forzarReconexion();
      
      return res.json({
        success: true,
        mensaje: "WebSocket reconectado exitosamente",
        timestamp: new Date(),
      });
    } catch (error: any) {
      console.error("[Stats API] Error reconectando WebSocket:", error);
      return res.status(500).json({ 
        success: false,
        error: error.message 
      });
    }
  });

  return router;
}
