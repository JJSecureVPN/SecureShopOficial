import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combina clases de Tailwind de forma inteligente
 * Usa clsx para condiciones y twMerge para resolver conflictos
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
