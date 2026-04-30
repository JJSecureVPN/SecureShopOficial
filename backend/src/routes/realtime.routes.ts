import { Router, Request, Response } from "express";
import { RealtimeService, RealtimeEvent } from "../services/realtime.service";

function sendEvent(res: Response, event: RealtimeEvent): void {
  res.write(`event: ${event.type}\n`);
  res.write(`data: ${JSON.stringify(event.payload)}\n\n`);
}

export function crearRutasRealtime(realtimeService: RealtimeService): Router {
  const router = Router();

  router.get("/snapshot", (_req: Request, res: Response) => {
    const state = realtimeService.getState();
    res.json({
      success: true,
      data: state,
    });
  });

  router.get("/stream", (req: Request, res: Response) => {
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, 25_000);

    const currentState = realtimeService.getState();
    if (currentState.clients) {
      sendEvent(res, { type: "clients", payload: currentState.clients });
    }
    if (currentState.serverStats) {
      sendEvent(res, { type: "server-stats", payload: currentState.serverStats });
    }

    const listener = (event: RealtimeEvent) => {
      sendEvent(res, event);
    };

    realtimeService.on("update", listener);

    req.on("close", () => {
      clearInterval(heartbeat);
      realtimeService.off("update", listener);
      res.end();
    });
  });

  return router;
}
