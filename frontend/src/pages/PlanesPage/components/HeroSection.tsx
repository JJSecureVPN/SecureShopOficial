import { Shield, Zap, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { PlanStatsConfig } from "../types";
import { HeroTitle, LeadText } from "../../../components/Typography";

interface HeroSectionProps {
  config?: PlanStatsConfig | null;
  modoSeleccion: "compra" | "renovacion";
  onActivarModoCompra: () => void;
  onActivarModoRenovacion: () => void;
}

export function HeroSection({ config, modoSeleccion, onActivarModoCompra, onActivarModoRenovacion }: HeroSectionProps) {
  return (
    <section className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-900 via-zinc-900 to-refine-dark pt-16 sm:pt-20 lg:pt-24 pb-8 sm:pb-12 lg:pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge animado */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700 shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-40"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500/80"></span>
          </span>
          <span className="text-xs font-medium text-indigo-400">Planes VPN Premium</span>
        </motion.div>

        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <HeroTitle as="h1" className="mb-4 sm:mb-6 text-white">
            {config?.titulo || "Elige tu Plan Perfecto"}
          </HeroTitle>
        </motion.div>

        {/* Subtitle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <LeadText as="p" className="max-w-2xl mx-auto mb-8 text-base sm:text-lg lg:text-xl text-zinc-400">
            {config?.descripcion ||
              "Protección completa para todos tus dispositivos. Sin límites de velocidad, sin compromisos."}
          </LeadText>
        </motion.div>

        {/* Stats rápidos */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8"
        >
            {[
            { icon: Shield, label: "Cifrado AES-256" },
            { icon: Zap, label: "Velocidad ilimitada" },
            { icon: Clock, label: "Soporte 24/7" },
          ].map((stat) => (
            <motion.div
              key={stat.label}
              whileHover={{ scale: 1.05 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-zinc-800 backdrop-blur-sm border border-zinc-700 text-zinc-300 hover:border-indigo-500/30 transition-all"
            >
              <stat.icon className="w-4 h-4 text-indigo-400" />
              {stat.label}
            </motion.div>
          ))}
        </motion.div>

        {/* Toggle Compra/Renovación */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex justify-center"
        >
          <div className="inline-flex items-center gap-1 rounded-full p-1.5 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700">
                <button
              onClick={onActivarModoCompra}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                modoSeleccion === "compra"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800"
              }`}
            >
              Nueva cuenta
            </button>
            <button
              onClick={onActivarModoRenovacion}
              className={`px-6 py-2.5 rounded-full font-semibold text-sm transition-all duration-200 ${
                modoSeleccion === "renovacion"
                  ? "bg-indigo-600 text-white shadow-md"
                  : "text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800"
              }`}
            >
              Renovar cuenta
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
