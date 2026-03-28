import { ReactNode } from "react";
import { PlanRevendedor } from "../../types";

export type ModoSeleccion = "compra" | "renovacion" | "expansion";
export type PasoRenovacion = "buscar" | "configurar";

export interface RevendedorRenovacionDatos {
  servex_revendedor_id: number;
  servex_username: string;
  servex_account_type: "validity" | "credit";
  max_users: number;
  expiration_date?: string;
  cliente_nombre: string;
  cliente_email: string;
}

export interface RevendedorEncontrado {
  tipo: "revendedor";
  datos: RevendedorRenovacionDatos;
}

export interface PlanGroupFeature {
  icon: "zap" | "clock" | "users" | "check-circle" | "refresh-cw" | "dollar-sign" | "maximize";
  title: string;
  description: string;
}

export interface PlanGroup {
  id: string;
  title: string;
  subtitle: string;
  accent: string;
  accentText: string;
  icon: ReactNode;
  recommended?: boolean;
  mainDescription: string;
  shortDescription: string;
  keyFeatures: PlanGroupFeature[];
  useCases: string[];
  bestFor: string;
  items: PlanRevendedor[];
}

export interface MobileSection {
  id: string;
  label: string;
  subtitle?: string;
  icon: ReactNode;
  isGroup?: boolean;
  isPlan?: boolean;
  planId?: number;
  parentGroup?: string;
  isExpanded?: boolean;
  onToggle?: () => void;
  scrollId?: string;
}
