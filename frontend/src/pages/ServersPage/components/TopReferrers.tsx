import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Medal, Star, Target, Crown } from "lucide-react";
import { referidosService } from "../../../services/api.service";

export function TopReferrers() {
  const [topUsers, setTopUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopReferrers = async () => {
      try {
        setLoading(true);
        // Traemos más de 5 en caso de que necesitemos ordenar apropiadamente por total_earned
        const data = await referidosService.getUsuariosConSaldo(20);
        
        // Ordenamos por total_earned (descendente) y tomamos el top 5
        const sorted = data.sort((a, b) => (b.total_earned || 0) - (a.total_earned || 0)).slice(0, 5);
        
        setTopUsers(sorted);
      } catch (error) {
        console.error("Error fetching top referrers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTopReferrers();
  }, []);

  const getRankStyle = (index: number) => {
    switch(index) {
      case 0: return { icon: <Crown className="w-6 h-6 text-yellow-400" />, bg: "bg-yellow-500/10", border: "border-yellow-500/30", text: "text-yellow-400", bar: "bg-yellow-400" };
      case 1: return { icon: <Medal className="w-6 h-6 text-zinc-300" />, bg: "bg-zinc-400/10", border: "border-zinc-400/30", text: "text-zinc-300", bar: "bg-zinc-300" };
      case 2: return { icon: <Medal className="w-6 h-6 text-amber-600" />, bg: "bg-amber-600/10", border: "border-amber-600/30", text: "text-amber-500", bar: "bg-amber-600" };
      default: return { icon: <Star className="w-5 h-5 text-indigo-400" />, bg: "bg-indigo-500/5", border: "border-indigo-500/20", text: "text-indigo-400", bar: "bg-indigo-400" };
    }
  };

  const getLevelName = (index: number) => {
    switch(index) {
      case 0: return "Leyenda de la Red";
      case 1: return "Master Conector";
      case 2: return "Ninja Expandor";
      case 3: return "Influencer Élite";
      case 4: return "Embajador Premium";
      default: return "Promotor Activo";
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col">
      {/* Elementos de fondo pueden arruinar el grid, los atenuamos más o quitamos la traslación exagerada */}
      <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-purple-500/5 blur-[80px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-orange-500/5 blur-[80px] rounded-full pointer-events-none" />

      <div className="relative z-10 bg-zinc-900 rounded-2xl lg:rounded-3xl border border-zinc-800 pt-8 sm:pt-10 lg:pt-12 px-5 sm:px-8 lg:px-12 pb-8 sm:pb-10 lg:pb-12 h-full">
        <div className="mb-8 sm:mb-10 text-left">
          <p className="text-xs font-bold tracking-[0.25em] text-purple-400 uppercase mb-2">
            Salón de la Fama
          </p>
          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            TOP Globales
          </h2>
          <p className="text-zinc-500 text-sm mt-3 font-medium">
            Los usuarios más influyentes y comprometidos de nuestra red.
          </p>
        </div>

        <div className="w-full">
          {loading ? (
             <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-28 bg-zinc-900/30 border border-zinc-800/30 rounded-[2rem] animate-pulse" />
                ))}
             </div>
          ) : topUsers.length === 0 ? (
            <div className="bg-zinc-900/30 border border-dashed border-zinc-800/50 rounded-[2.5rem] p-12 text-center backdrop-blur-xl">
              <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6">
                 <Target className="w-8 h-8 text-zinc-600 opacity-50" />
              </div>
              <h3 className="text-2xl font-black text-zinc-300 uppercase tracking-tight mb-3">¡Sé el primero en el Top!</h3>
              <p className="text-sm font-medium text-zinc-500 max-w-sm mx-auto">Aún no hay líderes registrados en el salón de la fama. Empieza a invitar y reclama el primer puesto de la red.</p>
            </div>
          ) : (
            <div className="grid gap-5">
              {topUsers.map((user, index) => {
                const style = getRankStyle(index);
                const nombreMostrar = user.nombre || user.email.split('@')[0];
                
                return (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className={`relative group overflow-hidden bg-zinc-900/30 backdrop-blur-xl border ${style.border} rounded-[2rem] p-5 sm:p-7 transition-all duration-500 hover:scale-[1.02] hover:bg-zinc-800/40 hover:shadow-2xl hover:shadow-black/50`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 z-0" />
                    
                    <div className="flex items-center gap-5 sm:gap-8 relative z-10">
                      {/* Posición y Medalla */}
                      <div className={`w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-[1.5rem] ${style.bg} border ${style.border} flex flex-col items-center justify-center shadow-inner group-hover:-translate-y-1 transition-transform duration-500`}>
                         {style.icon}
                         <span className={`text-[10px] font-black uppercase mt-1 ${style.text} opacity-50 tracking-widest`}>TOP {index + 1}</span>
                      </div>

                      {/* Info de Usuario */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1.5">
                           <span className={`text-2xl sm:text-4xl font-black italic tracking-tighter ${style.text} opacity-30`}>
                             #{index + 1}
                           </span>
                           <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight truncate">
                             {nombreMostrar}
                           </h3>
                        </div>
                        <p className={`inline-flex px-3 py-1 rounded-lg bg-zinc-950/50 border border-zinc-800/50 text-[10px] sm:text-[11px] font-black uppercase tracking-[0.2em] ${style.text}`}>
                          {getLevelName(index)}
                        </p>
                      </div>

                      {/* Stats Encriptados / Badge de Ganador */}
                      <div className="shrink-0 text-right hidden sm:block">
                         <div className="px-5 py-4 rounded-[1.25rem] bg-zinc-950/50 border border-zinc-800/50 shadow-inner">
                           <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 mb-2">Poder de Influencia</p>
                           <div className="flex gap-1.5 justify-end items-end h-4">
                             {Array(5).fill(0).map((_, i) => (
                               <div 
                                  key={i} 
                                  className={`w-1.5 rounded-full transition-all duration-500 ${i <= (4 - index) ? `${style.bar} shadow-[0_0_10px_rgba(255,255,255,0.2)] h-full` : 'bg-zinc-800 h-1/2'}`} 
                               />
                             ))}
                           </div>
                         </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
