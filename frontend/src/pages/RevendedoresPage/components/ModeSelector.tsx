import SegmentedControl from "../../../components/SegmentedControl";
import { motion } from "framer-motion";
import { ModoSeleccion } from "../types";

type ModeSelectorProps = {
  mode: ModoSeleccion;
  onSelectCompra: () => void;
  onSelectRenovacion: () => void;
  onSelectExpansion: () => void;
};

export function ModeSelector({ mode, onSelectCompra, onSelectRenovacion, onSelectExpansion }: ModeSelectorProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-4 sm:space-y-6"
    >
      <SegmentedControl
        value={mode}
        onChange={(v) => {
          if (v === "compra") onSelectCompra();
          else if (v === "renovacion") onSelectRenovacion();
          else onSelectExpansion();
        }}
        descriptions={{
          compra: "Crea una cuenta de acceso al Secure Panel para gestionar clientes y ventas.",
          renovacion: "Renueva el acceso al Secure Panel y conserva permisos y reportes.",
          expansion: "Aumenta la capacidad de usuarios de tu cuenta actual de forma inmediata.",
        }}
      />
    </motion.div>
  );
}
