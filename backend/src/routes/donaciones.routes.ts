import { Router, Request, Response } from "express";
import { DonacionesService } from "../services/donaciones.service";
import { ApiResponse, CrearDonacionInput } from "../types";

export function crearRutasDonaciones(donacionesService: DonacionesService): Router {
  const router = Router();

  router.post("/donaciones", async (req: Request, res: Response) => {
    try {
      const { monto, donanteEmail, donanteNombre, mensaje } = req.body as CrearDonacionInput;

      if (typeof monto !== "number") {
        res.status(400).json({
          success: false,
          error: "Debe especificar un monto numérico",
        } as ApiResponse);
        return;
      }

      const resultado = await donacionesService.crearDonacion({
        monto,
        donanteEmail,
        donanteNombre,
        mensaje,
      });

      res.json({
        success: true,
        data: resultado,
      } as ApiResponse);
    } catch (error: any) {
      console.error("[Donaciones] Error creando donación:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error creando donación",
      } as ApiResponse);
    }
  });

  router.get("/donaciones/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const donacion = await donacionesService.verificarYProcesarDonacion(id);

      if (!donacion) {
        res.status(404).json({
          success: false,
          error: "Donación no encontrada",
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: donacion,
      } as ApiResponse);
    } catch (error: any) {
      console.error("[Donaciones] Error obteniendo donación:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error obteniendo donación",
      } as ApiResponse);
    }
  });

  router.post("/donaciones/:id/verificar", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const donacion = await donacionesService.verificarYProcesarDonacion(id);

      if (!donacion) {
        res.status(404).json({
          success: false,
          error: "Donación no encontrada",
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        data: donacion,
      } as ApiResponse);
    } catch (error: any) {
      console.error("[Donaciones] Error verificando donación:", error);
      res.status(500).json({
        success: false,
        error: error.message || "Error verificando donación",
      } as ApiResponse);
    }
  });

  return router;
}
