import { Check, Wallet, Clock, Shield, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { Plan } from "../../../types";
import { CHECKOUT_SECTIONS } from "../constants";
import { calcularPrecioFinal, calcularPrecioPorDia } from "../utils";

interface PlanSummaryProps {
  plan: Plan;
  descuentoVisual: number;
  saldoUsado?: number;
}

export const PlanSummary = ({ plan, descuentoVisual, saldoUsado = 0 }: PlanSummaryProps) => {
  const precioConDescuento = calcularPrecioFinal(plan, descuentoVisual);
  const precioFinal = Math.max(0, precioConDescuento - saldoUsado);
  const precioPorDia = calcularPrecioPorDia(precioFinal, plan.dias);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-gradient-to-br from-zinc-800 via-zinc-800/90 to-zinc-700 rounded-2xl border border-zinc-600 p-6 lg:p-8 space-y-6"
    >
      {/* Plan Info */}
      <div>
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium mb-3">
          <Check className="w-3 h-3" />
          {CHECKOUT_SECTIONS.PLAN_SELECTED}
        </span>
        <h2 className="text-2xl sm:text-3xl font-serif font-medium text-zinc-100 mb-1">
          {plan.nombre}
        </h2>
        <p className="text-zinc-400 flex items-center gap-1.5">
          <Clock className="w-4 h-4" />
          {plan.dias} días de acceso
        </p>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-600" />

      {/* Price Breakdown */}
      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-400">{CHECKOUT_SECTIONS.SUBTOTAL}</span>
          <span className="text-zinc-100 font-medium">
            ${plan.precio.toLocaleString("es-AR")}
          </span>
        </div>

        {descuentoVisual > 0 && (
          <div className="flex justify-between items-center text-sm text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              {CHECKOUT_SECTIONS.DISCOUNT}
            </span>
            <span className="font-medium">-${descuentoVisual.toLocaleString("es-AR")}</span>
          </div>
        )}

        {saldoUsado > 0 && (
          <div className="flex justify-between items-center text-sm text-emerald-400">
            <span className="flex items-center gap-1.5">
              <Wallet className="w-3.5 h-3.5" />
              Saldo aplicado
            </span>
            <span className="font-medium">-${saldoUsado.toLocaleString("es-AR")}</span>
          </div>
        )}

        <div className="border-t border-zinc-600 pt-4 flex justify-between items-center">
          <span className="text-zinc-100 font-medium">{CHECKOUT_SECTIONS.TOTAL}</span>
          <div className="text-right">
            <span className="text-3xl font-bold text-orange-400">
              ${precioFinal.toLocaleString("es-AR")}
            </span>
            <p className="text-xs text-zinc-500 mt-1">
              ${precioPorDia}{CHECKOUT_SECTIONS.PER_DAY}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-zinc-600" />

      {/* Plan Details */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
            <Shield className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <div className="font-medium text-zinc-100 text-sm">
              {plan.connection_limit} dispositivo{plan.connection_limit !== 1 ? "s" : ""}
            </div>
            <div className="text-xs text-zinc-400">
              {CHECKOUT_SECTIONS.CONNECTIONS}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <div className="font-medium text-zinc-100 text-sm">
              {CHECKOUT_SECTIONS.UNLIMITED_SPEED}
            </div>
            <div className="text-xs text-zinc-400">
              {CHECKOUT_SECTIONS.NO_RESTRICTIONS}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center">
            <Check className="w-5 h-5 text-sky-400" />
          </div>
          <div>
            <div className="font-medium text-zinc-100 text-sm">
              {CHECKOUT_SECTIONS.SUPPORT_24_7}
            </div>
            <div className="text-xs text-zinc-400">
              {CHECKOUT_SECTIONS.ANYTIME_ASSISTANCE}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};