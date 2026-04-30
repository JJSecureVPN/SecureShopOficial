import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

interface MobileCheckoutSummaryProps {
  isOpen: boolean;
  totalLabel: string;
  icon: ReactNode;
  children: ReactNode;
  onToggle: () => void;
}

export const MobileCheckoutSummary = ({
  isOpen,
  totalLabel,
  icon,
  children,
  onToggle,
}: MobileCheckoutSummaryProps) => {
  return (
    <div className="lg:hidden fixed top-[65px] left-0 right-0 z-[10000] border-b border-white/[0.06] bg-zinc-950 shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
      <button
        onClick={onToggle}
        className="w-full px-5 py-3.5 flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-orange-500/15 flex items-center justify-center">
            {icon}
          </div>
          <span className="text-sm font-medium text-zinc-300">
            {isOpen ? "Ocultar resumen" : "Ver resumen del pedido"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <motion.span
            key={totalLabel}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-lg font-bold text-orange-400 tabular-nums"
          >
            {totalLabel}
          </motion.span>
          <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown className="w-4 h-4 text-zinc-500" />
          </motion.div>
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/[0.04] bg-zinc-950">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};