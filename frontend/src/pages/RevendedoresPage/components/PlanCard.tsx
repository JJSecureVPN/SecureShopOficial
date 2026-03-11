import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock3, Users } from "lucide-react";

import { PlanRevendedor } from "../../../types";
import { PlanGroup } from "../types";

export default function PlanCard({
  plan,
  group,
  isConfirming,
  onToggleConfirm,
  onConfirmarCompra,
}: {
  plan: PlanRevendedor;
  group: PlanGroup;
  isConfirming: boolean;
  onToggleConfirm: () => void;
  onConfirmarCompra: (plan: PlanRevendedor) => void;
}) {
  const isCredits = group.id === "creditos";
  const unitLabel = isCredits ? "créditos" : "cupos mensuales";

  const priceLabel = isCredits ? "único" : "por mes";
  const diasLabel = typeof plan.dias === "number" && plan.dias > 0 ? `${plan.dias} días` : null;
  const unitPrice = plan.max_users > 0 ? Math.round(plan.precio / plan.max_users) : null;

  return (
    <motion.div
      layoutId={`plan-${plan.id}`}
      id={`plan-${plan.id}`}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className={`group rounded-2xl border overflow-hidden
        ${isConfirming
          ? "border-transparent ring-1 ring-orange-400/35 bg-zinc-950/60"
          : "border-white/[0.08] bg-zinc-950/40 hover:border-white/[0.14] hover:bg-zinc-950/50"
        } relative`}
    >
      {/* Subtle top accent line (contained) */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1">
        <div
          className={
            "h-full w-full transition-colors duration-200 " +
            (isConfirming
              ? "bg-orange-400/80"
              : "bg-white/0 group-hover:bg-white/[0.06]")
          }
        />
      </div>

      {/* Content */}
      <div className="px-5 pt-5 pb-4">
        {/* Plan name + badge */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <p className="text-[11px] font-medium tracking-widest uppercase text-zinc-600 mb-1">
              Plan
            </p>
            <h3 className="text-lg font-semibold text-white leading-tight tracking-tight">
              {plan.nombre}
            </h3>

            {plan.popular && (
              <div className="mt-2 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-orange-500/15 border border-orange-500/25 text-orange-300 text-[11px] font-semibold">
                <BadgeCheck className="w-3.5 h-3.5" />
                Más popular
              </div>
            )}
          </div>

          {/* Price */}
          <div className="text-right shrink-0">
            <p className="text-2xl font-bold tracking-tight text-orange-400">
              ${plan.precio.toLocaleString("es-AR")}
            </p>
            <p className="text-[10px] text-zinc-600 mt-0.5 tracking-wide uppercase">
              {priceLabel}
            </p>
          </div>
        </div>

        {/* Quick facts */}
        <div className="flex flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/15">
            <Users className="w-4 h-4 text-orange-300" />
            <span className="text-xs font-semibold text-orange-200">
              {plan.max_users.toLocaleString()} {unitLabel}
            </span>
          </div>

          {diasLabel && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <Clock3 className="w-4 h-4 text-zinc-400" />
              <span className="text-xs font-medium text-zinc-300">{diasLabel}</span>
            </div>
          )}

          {unitPrice != null && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-white/[0.06]">
              <span className="text-xs font-medium text-zinc-400">≈</span>
              <span className="text-xs font-medium text-zinc-300">
                ${unitPrice.toLocaleString("es-AR")} / {isCredits ? "crédito" : "cupo"}
              </span>
            </div>
          )}
        </div>

        {plan.descripcion?.trim() && (
          <p className="mt-4 text-sm text-zinc-500 leading-relaxed line-clamp-2">
            {plan.descripcion}
          </p>
        )}
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-white/[0.08]" />

      {/* Action zone */}
      <AnimatePresence mode="wait" initial={false}>
        {!isConfirming ? (
          <motion.div
            key="cta"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="px-5 py-4"
          >
            <button
              type="button"
              onClick={onToggleConfirm}
              className="w-full inline-flex items-center justify-between gap-3 rounded-xl bg-orange-500/15 hover:bg-orange-500/20 border border-orange-500/20 px-4 py-3 text-sm font-semibold text-orange-200"
            >
              <span>Elegir este plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        ) : (
          <motion.div
            key="confirm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="px-5 py-4"
          >
            <p className="text-xs text-zinc-500 text-center mb-3">
              Confirmar <span className="text-orange-300 font-semibold">{plan.nombre}</span>
            </p>
            <div className="flex gap-2.5">
              <button
                onClick={(e) => { e.stopPropagation(); onToggleConfirm(); }}
                type="button"
                className="flex-1 py-2.5 rounded-xl bg-white/[0.08] hover:bg-white/[0.12] text-zinc-300 text-sm font-medium transition-colors duration-150"
              >
                Cancelar
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onConfirmarCompra(plan); onToggleConfirm(); }}
                type="button"
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors duration-150 bg-orange-400 hover:bg-orange-300 text-zinc-950"
              >
                Confirmar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
