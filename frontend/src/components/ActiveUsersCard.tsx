import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useActiveUsers } from "../hooks/useActiveUsers";

export default function ActiveUsersCard() {
  const { totalUsers, loading, error } = useActiveUsers();

  // Si hay error o no tenemos datos, no mostrar nada
  if (error && totalUsers === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="inline-flex items-center gap-2 px-3 py-2 w-max mx-auto rounded-full border border-purple-200/70 bg-white/70 text-gray-800 shadow-sm shadow-purple-200/30 backdrop-blur"
      role="status"
      aria-live="polite"
      aria-label={loading ? "Cargando usuarios en línea" : `${totalUsers} usuarios en línea`}
    >
      {/* Punto pulsante + Icono pequeño */}
      <div className="flex items-center gap-1.5">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.6, 1, 0.6],
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-1.5 h-1.5 rounded-full bg-emerald-500"
        />
        <Users className="w-3.5 h-3.5 text-purple-700/90" />
      </div>

      {/* Contenido minimalista */}
      <div className="flex items-baseline gap-1">
        {loading ? (
          <span className="text-xs text-gray-500">...</span>
        ) : (
          <>
            <span className="text-sm font-semibold text-gray-900">
              {totalUsers}
            </span>
            <span className="text-xs text-gray-600">en línea</span>
          </>
        )}
      </div>
    </motion.div>
  );
}
