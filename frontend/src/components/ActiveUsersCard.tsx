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
        className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-5 border border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow effect on hover (matches StatCard) */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-xl opacity-0 pointer-events-none"
          animate={{ opacity: isHovered ? [0.5, 0.8, 0.5] : 0 }}
          transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
        />

        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Users className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">Visitantes</p>
            </div>

            <motion.p 
              className="text-2xl font-bold text-white"
              animate={{ scale: isHovered ? 1.05 : 1 }}
              transition={{ duration: 0.2 }}
            >
              {loading ? '...' : totalUsers}
            </motion.p>
          </div>

          <motion.div
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.6 }}
            className="text-emerald-400/20"
          >
            <Users className="w-6 h-6" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
