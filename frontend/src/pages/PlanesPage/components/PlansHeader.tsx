import SegmentedControl from "../../../components/SegmentedControl";
import CompactHeroControl from "../../../components/CompactHeroControl";
import { motion } from "framer-motion";

interface PlansHeaderProps {
  modoSeleccion: "compra" | "renovacion";
  onActivarModoCompra: () => void;
  onActivarModoRenovacion: () => void;
}

export default function PlansHeader({ 
  modoSeleccion, 
  onActivarModoCompra, 
  onActivarModoRenovacion 
}: PlansHeaderProps) {
  return (
    <div className="mb-12">
      {/* Mobile: SegmentedControl */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="md:hidden"
      >
        <div className="max-w-2xl mx-auto px-1">
          <SegmentedControl
            value={modoSeleccion}
            onChange={(v) => (v === 'compra' ? onActivarModoCompra() : onActivarModoRenovacion())}
            descriptions={{
              compra: 'Crea una cuenta VPN con acceso ilimitado a servidores y cambio de ubicación.',
              renovacion: 'Renueva tu suscripción VPN y conserva tu configuración y dispositivos.'
            }}
          />
        </div>
      </motion.div>

      {/* Desktop: CompactHeroControl */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="hidden md:block"
      >
        <CompactHeroControl
          value={modoSeleccion}
          onChange={(v) => (v === 'compra' ? onActivarModoCompra() : onActivarModoRenovacion())}
        />
      </motion.div>
    </div>
  );
}