import { RefreshCw, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { ModoSeleccion } from "../types";

type ModeSelectorProps = {
  mode: ModoSeleccion;
  onSelectCompra: () => void;
  onSelectRenovacion: () => void;
};

export function ModeSelector({ mode, onSelectCompra, onSelectRenovacion }: ModeSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 sm:space-y-6"
    >
      {/* Tab Container */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-2xl p-2 sm:p-3 shadow-sm">
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={onSelectCompra}
            className={`group flex flex-col items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl transition-all ${
              mode === "compra"
                ? "bg-gradient-to-br from-zinc-800 to-zinc-800/50 shadow-md"
                : "text-zinc-400 hover:bg-zinc-800/50"
            }`}
          >
            <div
                className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl transition-all ${
                mode === "compra"
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
              }`}
            >
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="text-center">
              <p className={`text-sm font-semibold ${mode === "compra" ? "text-indigo-400" : "text-zinc-300"}`}>
                Comprar Plan
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Adquiere nuevos planes</p>
            </div>
          </button>

          <button
            onClick={onSelectRenovacion}
            className={`group flex flex-col items-center gap-2 sm:gap-3 px-4 sm:px-5 py-3 sm:py-4 rounded-xl transition-all ${
              mode === "renovacion"
                ? "bg-gradient-to-br from-zinc-800 to-zinc-800/50 shadow-md"
                : "text-zinc-400 hover:bg-zinc-800/50"
            }`}
          >
            <div
                className={`flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl transition-all ${
                mode === "renovacion"
                  ? "bg-indigo-500/10 text-indigo-400"
                  : "bg-zinc-800 text-zinc-500 group-hover:text-zinc-300"
              }`}
            >
              <RefreshCw className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
            <div className="text-center">
              <p className={`text-sm font-semibold ${mode === "renovacion" ? "text-indigo-400" : "text-zinc-300"}`}>
                Renovar Plan
              </p>
              <p className="text-xs text-zinc-500 mt-0.5">Renueva tu plan existente</p>
            </div>
          </button>
        </div>
      </div>

      {/* Info Banner */}
      <div className={`rounded-xl px-4 sm:px-5 py-3 sm:py-4 text-sm text-center border ${
        mode === "compra" 
          ? "bg-indigo-500/10 border-indigo-500/20 text-indigo-400" 
          : "bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
      }`}>
        {mode === "compra" ? (
          <span>
            <span className="font-semibold">Modo compra:</span> Combina Créditos y Validez para armar planes flexibles según tu estrategia.
          </span>
        ) : (
          <span>
            <span className="font-semibold">Modo renovación:</span> Busca tu cuenta, confirma datos y procesa el pago con un par de clics.
          </span>
        )}
      </div>
    </motion.div>
  );
}
