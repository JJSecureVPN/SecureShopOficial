import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";
import { Plan } from "../../types";

export type ModoSeleccion = "compra" | "renovacion";
export type PasoRenovacion = "buscar" | "configurar";

export interface PlanesPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export interface CuentaRenovacion {
  tipo: "cliente" | "revendedor";
  datos: {
    id?: string;
    servex_cuenta_id?: number;
    servex_revendedor_id?: number;
    servex_username: string;
    connection_limit?: number;
    cliente_nombre: string;
    cliente_email: string;
    plan_nombre?: string;
    servex_account_type?: "validity" | "credit";
  };
  encontrado?: boolean;
}

export interface SectionItem {
  id: string;
  label: string;
  icon: ReactNode;
}

export interface BenefitConfig {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface PlanStatsConfig {
  titulo?: string;
  descripcion?: string;
  promocion?: {
    habilitada?: boolean;
    texto?: string;
  } | null;
}

export interface PlanSelectorState {
  diasSeleccionados: number;
  dispositivosSeleccionados: number;
  planSeleccionado: Plan | undefined;
  precioPorDia: string;
}
