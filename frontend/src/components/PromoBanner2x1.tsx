import { motion } from "framer-motion";
import { Zap, Gift, ShieldCheck } from "lucide-react";

export function PromoBanner2x1() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-2xl p-6 mb-8 group"
    >
      {/* Background with Glassmorphism and Animated Gradient */}
      <div className="absolute inset-0 bg-zinc-900/40 backdrop-blur-md border border-purple-500/30 rounded-2xl" />
      <div className="absolute -inset-[100%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(168,85,247,0.1)_180deg,transparent_360deg)] animate-[spin_8s_linear_infinite] pointer-events-none" />
      
      {/* Decorative Glows */}
      <div className="absolute -top-12 -right-12 w-32 h-32 bg-purple-600/20 blur-[40px] rounded-full" />
      <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-indigo-600/20 blur-[40px] rounded-full" />

      <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative shrink-0">
            <div className="absolute inset-0 bg-purple-500 blur-lg opacity-40 animate-pulse" />
            <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Zap className="text-white w-8 h-8 fill-white/20" />
            </div>
            <motion.div 
              animate={{ rotate: 360 }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-1 -right-1"
            >
              <Gift className="text-amber-400 w-5 h-5 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
            </motion.div>
          </div>

          <div className="text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
              <span className="px-2 py-0.5 rounded-full bg-purple-500 text-[10px] font-bold text-white tracking-wider uppercase">
                Promo Activa
              </span>
              <span className="text-purple-300 text-xs font-mono font-medium tracking-tight flex items-center gap-1">
                <ShieldCheck size={12} />
                Beneficio Verificado
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-none mb-2">
              Oferta <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-300">2x1</span> Especial
            </h3>
            <p className="text-zinc-400 text-sm sm:text-base font-light max-w-md">
              Por cada dispositivo que elijas, <span className="text-white font-medium italic underline decoration-purple-500/50 underline-offset-4">te regalamos otro</span> completamente gratis.
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center md:items-end gap-1">
          <div className="flex -space-x-3">
             {[...Array(3)].map((_, i) => (
                <div 
                  key={i} 
                  className={`w-10 h-10 rounded-full border-2 border-zinc-900 bg-zinc-800 flex items-center justify-center shadow-lg transform transition-transform group-hover:translate-x-${i*2}`}
                >
                  <span className="text-zinc-400 text-[10px]">💻</span>
                </div>
             ))}
             <div className="w-10 h-10 rounded-full border-2 border-purple-500 bg-purple-900/50 flex items-center justify-center shadow-[0_0_15px_rgba(168,85,247,0.4)] z-10 scale-110">
                <span className="text-purple-300 font-bold text-xs">+1</span>
             </div>
          </div>
          <p className="text-[10px] font-mono text-purple-400 mt-2 tracking-widest uppercase">
            Dispositivos Duplicados
          </p>
        </div>
      </div>
    </motion.div>
  );
}
