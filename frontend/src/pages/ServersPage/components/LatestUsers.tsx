import { motion } from "framer-motion";
import { Sparkles, User, Users } from "lucide-react";
import { useLatestUsers } from "../../../hooks/useLatestUsers";

export function LatestUsers() {
  const { usuarios, loading } = useLatestUsers(20, 30000);

  // Duplicar usuarios para scroll infinito (o usar placeholders si está vacío)
  const displayUsers = usuarios.length > 0 ? usuarios : Array(6).fill(null).map((_, i) => ({
    id: i,
    username: `Usuario ${i + 1}`,
    connection_limit: 0
  }));

  const infiniteUsers = [
    ...displayUsers, ...displayUsers, ...displayUsers, ...displayUsers,
    ...displayUsers, ...displayUsers
  ];

  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-zinc-900 overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="max-w-7xl mx-auto">
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes scroll-up {
              0% {
                transform: translateY(0);
              }
              100% {
                transform: translateY(-50%);
              }
            }

            .animate-scroll-up {
              animation: scroll-up 120s linear infinite;
            }

            .users-mask {
              -webkit-mask-image: linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent);
              mask-image: linear-gradient(180deg, transparent, #000 10%, #000 90%, transparent);
            }
          `
          }} />

          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left side - Information */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-orange-500/10 border border-orange-500/20 rounded-full mb-6">
                <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                <span className="text-xs font-semibold text-orange-400 uppercase tracking-wide">
                  Comunidad activa
                </span>
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 leading-tight">
                Usuarios conectándose en tiempo real
              </h2>

              <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                Nuestra red crece cada día con nuevos miembros activos. 
                Únete a miles de usuarios que confían en nuestra infraestructura 
                para mantenerse conectados de forma segura.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <div className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <Users className="w-5 h-5 text-emerald-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">
                      {loading ? "..." : usuarios.length > 0 ? `${usuarios.length}+` : "0"}
                    </span>
                  </div>
                  <p className="text-sm text-zinc-400 font-medium">Usuarios recientes</p>
                </div>

                <div className="flex-1 bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-5">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                      <Sparkles className="w-5 h-5 text-orange-400" />
                    </div>
                    <span className="text-2xl font-bold text-white">24/7</span>
                  </div>
                  <p className="text-sm text-zinc-400 font-medium">Soporte activo</p>
                </div>
              </div>


            </motion.div>

            {/* Right side - Carousel */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative"
            >
              <div className="users-mask relative h-[600px] overflow-hidden">
                <div className="animate-scroll-up absolute w-full">
                  {infiniteUsers.map((usuario, index) => (
                    <div
                      key={`${usuario.id}-${index}`}
                      className="mb-4 px-2"
                    >
                      <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-5 hover:border-zinc-600 transition-all duration-300">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/10 border border-orange-500/20 flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-orange-400" strokeWidth={1.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-white font-semibold text-base truncate ${loading || usuarios.length === 0 ? 'opacity-40' : ''}`}>
                              {usuario.username}
                            </p>
                            <p className="text-xs text-zinc-500">
                              {loading ? "Cargando..." : usuarios.length === 0 ? "Sin conexión" : "Miembro activo"}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className={`text-2xl font-bold text-orange-400 ${loading || usuarios.length === 0 ? 'opacity-40' : ''}`}>
                              {usuario.connection_limit || "—"}
                            </p>
                            <p className="text-xs text-zinc-500">conexiones</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
