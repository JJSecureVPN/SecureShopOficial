import { createElement } from "react";
import { Check, MessageCircle, Shield, Signal, Users, Zap } from "lucide-react";
import { BenefitConfig, SectionItem } from "./types";

export const PRECIOS_POR_DIA: Record<number, number> = {
  1: 500,
  2: 833,
  3: 1166,
  4: 1500,
};

export const DIAS_RENOVACION = [3, 7, 15, 20, 25, 30];
export const DISPOSITIVOS_RENOVACION = [1, 2, 3, 4];

export const PLAN_SECTIONS: SectionItem[] = [
  { id: "selector", label: "Selector de Planes", icon: createElement(Zap, { className: "w-4 h-4" }) },
  { id: "beneficios", label: "Beneficios", icon: createElement(Check, { className: "w-4 h-4" }) },
  { id: "soporte", label: "Soporte", icon: createElement(MessageCircle, { className: "w-4 h-4" }) },
];

export const HERO_STATS = [
  { value: "99.9%", label: "Uptime", icon: Signal },
  { value: "24/7", label: "Soporte", icon: MessageCircle },
  { value: "—", label: "Usuarios", icon: Users },
  { value: "—", label: "Servidores", icon: Shield },
];

export const BENEFITS: BenefitConfig[] = [
  { icon: Zap, title: "Velocidad ilimitada", description: "Sin restricciones de ancho de banda" },
  { icon: Shield, title: "Cifrado seguro", description: "Protección de nivel militar" },
  { icon: MessageCircle, title: "Soporte 24/7", description: "Disponible en múltiples canales" },
  { icon: Check, title: "Activación instantánea", description: "Acceso inmediato a tu plan" },
];
