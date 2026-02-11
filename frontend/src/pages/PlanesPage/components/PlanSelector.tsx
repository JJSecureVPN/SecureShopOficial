import { CardTitle, BodyText } from "../../../components/Typography";
import { motion } from "framer-motion";

interface PlanSelectorProps {
  diasDisponibles: number[];
  diasSeleccionados: number;
  setDiasSeleccionados: (d: number) => void;
  dispositivosDisponibles: number[];
  dispositivosSeleccionados: number;
  setDispositivosSeleccionados: (n: number) => void;
}

export default function PlanSelector({
  diasDisponibles,
  diasSeleccionados,
  setDiasSeleccionados,
  dispositivosDisponibles,
  dispositivosSeleccionados,
  setDispositivosSeleccionados,
}: PlanSelectorProps) {
  return (
    <div className="space-y-5">
      {/* Duración del plan */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl p-6 lg:p-7 bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/80 transition-colors duration-300"
      >
        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/8 text-indigo-400/90 mb-3">
            Paso 1
          </span>
          <CardTitle as="h3" className="text-lg sm:text-xl text-white/95 mb-1">
            Duración del plan
          </CardTitle>
          <BodyText className="text-[13px] text-zinc-400/80">
            Define cuántos días necesitas conexión segura.
          </BodyText>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {diasDisponibles.map((dias) => (
            <button
              key={dias}
              onClick={() => setDiasSeleccionados(dias)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                diasSeleccionados === dias
                  ? 'border-indigo-500/60 bg-indigo-500/8 text-indigo-300 shadow-sm shadow-indigo-500/5'
                  : 'border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50'
              }`}
            >
              {dias} días
            </button>
          ))}
        </div>
      </motion.div>

      {/* Dispositivos simultáneos */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="rounded-xl p-6 lg:p-7 bg-zinc-900/40 border border-zinc-800/60 hover:border-zinc-700/80 transition-colors duration-300"
      >
        <div className="mb-5">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-indigo-500/8 text-indigo-400/90 mb-3">
            Paso 2
          </span>
          <CardTitle as="h3" className="text-lg sm:text-xl text-white/95 mb-1">
            Dispositivos simultáneos
          </CardTitle>
          <BodyText className="text-[13px] text-zinc-400/80">
            Cambia la cantidad cuando quieras añadir más conexiones.
          </BodyText>
        </div>
        
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {dispositivosDisponibles.map((dispositivos) => (
            <button
              key={dispositivos}
              onClick={() => setDispositivosSeleccionados(dispositivos)}
              className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
                dispositivosSeleccionados === dispositivos
                  ? 'border-indigo-500/60 bg-indigo-500/8 text-indigo-300 shadow-sm shadow-indigo-500/5'
                  : 'border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50'
              }`}
            >
              {dispositivos} {dispositivos === 1 ? "dispositivo" : "dispositivos"}
            </button>
          ))}
        </div>
        
        <BodyText className="mt-4 text-[13px] text-zinc-500/90 leading-relaxed">
          ¿Necesitas más conexiones? Podemos armar planes especiales para equipos o revendedores.
        </BodyText>
      </motion.div>
    </div>
  );
}