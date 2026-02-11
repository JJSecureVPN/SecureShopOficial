import { Sparkles, Shield } from "lucide-react";
import { RefineButton } from "../../../components/RefineButton";
import { CardTitle, BodyText, SmallText } from "../../../components/Typography";
import { motion } from "framer-motion";
import { Plan } from "../../../types";

interface PlanSummaryProps {
  planSeleccionado?: Plan;
  precioPorDiaPlan: string | number;
  onCheckout: () => void;
  onOpenDemo: () => void;
}

export default function PlanSummary({ planSeleccionado, precioPorDiaPlan, onCheckout, onOpenDemo }: PlanSummaryProps) {
  return (
    <motion.aside
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      className="rounded-xl p-6 lg:p-7 bg-zinc-900/40 border border-zinc-800/60 sm:fixed sm:right-4 sm:top-24 sm:w-[360px] md:sm:w-[420px] sm:z-50 lg:static lg:sticky lg:top-24 lg:self-start lg:w-[420px]"
    >
      <div className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-medium uppercase tracking-wide bg-indigo-500/10 text-indigo-400/90 mb-5">
        <Sparkles className="h-3 w-3" />
        <span>Tu selección</span>
      </div>

      <div className="space-y-1.5 mb-6">
        <CardTitle as="h3" className="text-xl sm:text-2xl text-white/95">
          {planSeleccionado ? `${planSeleccionado.dias} días` : "Elige tu combinación"}
        </CardTitle>
        <BodyText className="text-[13px] sm:text-sm text-zinc-400/80 leading-relaxed">
          {planSeleccionado
            ? `Protección para ${planSeleccionado.connection_limit} ${
                planSeleccionado.connection_limit === 1 ? "dispositivo" : "dispositivos"
              } con velocidad ilimitada.`
            : "Primero selecciona duración y dispositivos para ver el detalle completo."}
        </BodyText>
      </div>

      {planSeleccionado ? (
        <div className="space-y-5">
          {/* Precio */}
          <div className="rounded-lg p-5 bg-zinc-800/40 border border-zinc-800/60 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs text-zinc-500/80 mb-1">Pago único</p>
              <p className="text-3xl sm:text-4xl font-bold text-orange-500/95">
                ${planSeleccionado.precio}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-zinc-500/70 mb-1">Equivale a</p>
              <p className="text-lg sm:text-xl font-semibold text-orange-400/90">
                ${precioPorDiaPlan}/día
              </p>
            </div>
          </div>

          {/* Beneficios */}
          <ul className="space-y-2.5 text-[13px] text-zinc-300/90">
            <li className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500/80" />
              Servidores premium en más de 15 países
            </li>
            <li className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500/80" />
              Cambio ilimitado de ubicaciones
            </li>
            <li className="flex items-center gap-2.5">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-500/80" />
              Soporte humano 24/7 en español
            </li>
          </ul>

          {/* Botones */}
          <div className="space-y-2.5 pt-1">
            <RefineButton onClick={onCheckout} variant="primary" className="w-full">
              Continuar al pago
            </RefineButton>
            <RefineButton onClick={onOpenDemo} variant="secondary" className="w-full">
              Ver demo en vivo
            </RefineButton>
          </div>

          {/* Footer */}
          <SmallText as="p" className="text-[11px] text-zinc-500/70 text-center leading-relaxed pt-1">
            Pago seguro con Mercado Pago, tarjetas internacionales o criptomonedas.
          </SmallText>
        </div>
      ) : (
        <div className="rounded-lg border border-dashed border-zinc-800/70 p-6 text-center bg-zinc-900/20">
          <Shield className="w-7 h-7 text-zinc-600/60 mx-auto mb-3" />
          <p className="text-[13px] text-zinc-500/80 leading-relaxed">
            Te mostraremos aquí el resumen con precio y beneficios cuando elijas una combinación.
          </p>
        </div>
      )}
    </motion.aside>
  );
}