import { motion } from "framer-motion";
import { Users } from "lucide-react";
import { useActiveUsers } from "../hooks/useActiveUsers";
import { useState } from "react";

export default function ActiveUsersCard() {
  const { totalUsers, loading, error } = useActiveUsers();
  const [isHovered, setIsHovered] = useState(false);

  // Si hay error o no tenemos datos, no mostrar nada
  if (error && totalUsers === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      role="status"
      aria-live="polite"
      aria-label={loading ? "Cargando usuarios en línea" : `${totalUsers} usuarios en línea`}
      className="relative"
    >
      <div
        className="relative rounded-xl p-4 bg-zinc-900/50 backdrop-blur-xl border border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow layer (appears on hover) */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-xl opacity-0 pointer-events-none"
          animate={{ opacity: [0, 0.8, 0] }}
          transition={{ duration: 2, repeat: 0 }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 p-2.5 bg-indigo-600/10 rounded-lg border border-indigo-500/20">
              <Users className="w-5 h-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Visitantes</p>
              <p className="text-2xl font-bold text-white">{loading ? '...' : totalUsers}</p>
            </div>
          </div>

          <motion.div
            animate={
              loading
                ? { rotate: [0, 360] }
                : isHovered
                ? { rotate: 360 }
                : { rotate: 0 }
            }
            transition={
              loading
                ? { duration: 1.2, repeat: Infinity, ease: 'linear' }
                : { duration: 0.6, ease: 'easeInOut' }
            }
            className="text-emerald-400/20"
          >
            <Users className="w-6 h-6" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
