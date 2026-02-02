import { Zap, Star, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Plan } from "../../../types";
import { RefineButton } from "../../../components/RefineButton";

interface PlanCardProps {
  plan: Plan;
  precioPorDia: string | number;
  isPopular?: boolean;
  onSelect: () => void;
}

export function PlanCard({ plan, isPopular = false, onSelect }: PlanCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.3 }}
      className={`
        relative flex h-full flex-col rounded-2xl p-6 sm:p-8 transition-all duration-300
        ${isPopular 
          ? 'bg-zinc-900/80 ring-2 ring-indigo-500/30 shadow-xl shadow-indigo-500/10' 
          : 'bg-zinc-900/50 border border-zinc-700 hover:border-indigo-500/30 hover:shadow-xl shadow-lg'
        }
      `}
    >
      {/* Badge "Más Popular" */}
        {isPopular && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 bg-indigo-600 text-white shadow-lg">
          <Star className="h-3.5 w-3.5 fill-current" />
          Más Popular
        </div>
      )}

      {/* Header */}
      <div className="mb-6 pt-2">
        <div className="flex items-center justify-between mb-4">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400">
            <Zap className="h-3 w-3 text-orange-400" />
            {plan.dias} días
          </span>
          {isPopular && (
            <span className="text-xs font-medium text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20">
              Mejor valor
            </span>
          )}
        </div>
        <h3 className="font-serif text-xl sm:text-2xl font-medium text-white">
          {plan.connection_limit === 1 
            ? '1 dispositivo' 
            : `Hasta ${plan.connection_limit} dispositivos`
          }
        </h3>
        <p className="text-sm text-zinc-400 mt-1">
          Conexión simultánea
        </p>
      </div>

      {/* Precio removido - tarjeta simplificada */}

      {/* Detalles simplificados: lista de características removida por solicitud */}


      {/* CTA Button */}
      <RefineButton
        onClick={onSelect}
        variant="primary"
        className={`w-full ${
          isPopular ? '' : ''
        }`}
      >
        Obtener plan
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
      </RefineButton>
      {/* Footer removido */}
    </motion.div>
  );
}
