import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
// React import removed — no runtime usage in this component

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
  // Use purple accent for creditos, orange for validez
  const accentText = group.accentText ?? (isCredits ? "text-purple-400" : "text-orange-400");
  const priceColor = isCredits ? "text-purple-500" : "text-orange-500";
  const outerStateClass = isConfirming
    ? (isCredits ? "bg-zinc-900 border-purple-500 ring-2 ring-purple-500 shadow-xl" : "bg-zinc-900 border-orange-500 ring-2 ring-orange-500 shadow-xl")
    : (isCredits ? "bg-zinc-900/80 border-purple-500/20 hover:border-purple-400/40 hover:shadow-lg" : "bg-zinc-900/80 border-orange-500/20 hover:border-orange-400/40 hover:shadow-lg");

  return (
    <motion.div
      layoutId={`plan-${plan.id}`}
      onClick={isConfirming ? undefined : onToggleConfirm}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className="cursor-pointer"
    >
      <motion.div
        className={`relative overflow-hidden rounded-2xl border transition-colors duration-200 ${outerStateClass}`}
        whileHover={!isConfirming ? { scale: 1.02 } : {}}
        whileTap={{ scale: 0.98 }}
      >
        {/* Header con precio */}
        <div className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white mb-2">{plan.nombre}</h3>
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className={`w-4 h-4 ${accentText.replace('text-', 'text-')}`} />
                <span>{plan.max_users.toLocaleString()} {unitLabel}</span>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${priceColor}`}>
                ${plan.precio.toLocaleString("es-AR")}
              </div>
              <div className="text-xs text-zinc-500 mt-1">
                {isCredits ? "único" : "mensual"}
              </div>
            </div>
          </div>
        </div>

        {/* Action Area */}
        <AnimatePresence mode="wait" initial={false}>
            {!isConfirming ? (
            <motion.div
              key="cta"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
                className="border-t border-zinc-800 px-6 py-4 bg-zinc-800/30"
            >
              <div className={`flex items-center justify-center gap-2 text-sm ${accentText} font-medium`}>
                Seleccionar
                <ArrowRight className="w-4 h-4" />
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="confirm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className={`border-t ${isCredits ? 'border-indigo-900/50 bg-indigo-950/20' : 'border-orange-900/50 bg-orange-950/20'} px-6 py-5`}
            >
              <p className="text-sm text-zinc-300 text-center mb-4">
                ¿Confirmar <span className={`${isCredits ? 'text-indigo-400' : 'text-orange-400'} font-semibold`}>{plan.nombre}</span>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleConfirm();
                  }}
                  className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium transition-colors duration-150"
                >
                  Cancelar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onConfirmarCompra(plan);
                    onToggleConfirm();
                  }}
                  className={`flex-1 px-4 py-2.5 rounded-xl ${isCredits ? 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30 text-white' : 'bg-orange-600 hover:bg-orange-500 text-white shadow-lg shadow-orange-900/30'} text-sm font-medium transition-colors duration-150`}
                >
                  Confirmar
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
