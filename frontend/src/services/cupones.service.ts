import { apiService, ValidacionCupon } from "./api.service";

export interface ValidarCuponRequest {
  codigo: string;
  planId?: number;
}

export class CuponesService {
  /**
   * Valida un cupón de descuento
   */
  async validarCupon(codigo: string, planId?: number, precioPlan?: number, clienteEmail?: string): Promise<ValidacionCupon> {
    return apiService.validarCupon(codigo, planId, precioPlan, clienteEmail);
  }

  /**
   * Aplica un cupón a una compra (se llama automáticamente en el backend)
   * Este método es principalmente para logging/debugging en frontend
   */
  async aplicarCupon(cuponId: number): Promise<boolean> {
    return apiService.aplicarCupon(cuponId);
  }
}

export const cuponesService = new CuponesService();
