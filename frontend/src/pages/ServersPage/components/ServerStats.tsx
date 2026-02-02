import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Activity, 
  Clock, 
  Cpu, 
  HardDrive, 
  MapPin, 
  TrendingUp,
  Users,
  Wifi
} from "lucide-react";
import { useServerStats } from "../../../hooks/useServerStats";

type Server = ReturnType<typeof useServerStats>["servers"][number];

const getCountryFlag = (location: string) => {
  const loc = location.toLowerCase();
  if (loc.includes("arg")) return "🇦🇷";
  if (loc.includes("bra") || loc.includes("br")) return "🇧🇷";
  if (loc.includes("usa") || loc.includes("us")) return "🇺🇸";
  return "🌍";
};

const getStatusConfig = (value: number) => {
  if (value > 80) return { 
    label: "Alto", 
    color: "text-rose-400", 
    bg: "bg-zinc-800", 
    border: "border-rose-500/20",
    bar: "bg-gradient-to-r from-orange-500 via-rose-500 to-purple-600"
  };
  if (value > 60) return { 
    label: "Moderado", 
    color: "text-amber-400", 
    bg: "bg-zinc-800", 
    border: "border-amber-500/20",
    bar: "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"
  };
  if (value > 40) return { 
    label: "Normal", 
    color: "text-blue-400", 
    bg: "bg-zinc-800", 
    border: "border-blue-500/20",
    bar: "bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500"
  };
  return { 
    label: "Óptimo", 
    color: "text-emerald-400", 
    bg: "bg-zinc-800", 
    border: "border-emerald-500/20",
    bar: "bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500"
  };
};

export function ServerStats() {
  const { servers } = useServerStats(6000);
  const [activeServerIndex, setActiveServerIndex] = useState(0);
  const [displayServers, setDisplayServers] = useState<Server[]>([]);
  const displayServersRef = useRef<Server[]>([]);
  const animationRef = useRef<number>();

  useEffect(() => {
    displayServersRef.current = displayServers;
  }, [displayServers]);

  useEffect(() => {
    if (!servers.length) {
      setDisplayServers([]);
      return;
    }

    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    const startSnapshot = displayServersRef.current.length ? displayServersRef.current : servers;
    const startMap = new Map(startSnapshot.map((s) => [s.serverName, s]));
    const startTime = performance.now();
    const duration = 650;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = easeOutCubic(Math.min(elapsed / duration, 1));

      const next = servers.map((server) => {
        const baseline = startMap.get(server.serverName) ?? server;
        return {
          ...server,
          cpuUsage: (baseline.cpuUsage ?? 0) + ((server.cpuUsage ?? 0) - (baseline.cpuUsage ?? 0)) * progress,
          memoryUsage:
            (baseline.memoryUsage ?? 0) +
            ((server.memoryUsage ?? 0) - (baseline.memoryUsage ?? 0)) * progress,
        };
      });

      setDisplayServers(next);

      if (progress < 1) {
        animationRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayServers(servers);
      }
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationRef.current!);
  }, [servers]);

  // Si no hay servidores, mostrar placeholder
  if (!displayServers.length) {
    return (
      <section className="py-8 sm:py-12 lg:py-16 bg-zinc-900">
        <div className="w-full">
          <div className="mx-auto">
            <div className="bg-zinc-800 flex flex-col w-full rounded-2xl relative group/showcase lg:overflow-hidden p-6 sm:p-8 lg:p-10">
              <div className="text-center text-zinc-400">
                <p className="text-lg">Cargando información de servidores...</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const activeServer = displayServers[activeServerIndex];
  const utilization = ((activeServer?.cpuUsage ?? 0) + (activeServer?.memoryUsage ?? 0)) / 2;
  const status = getStatusConfig(utilization);
  const isOnline = activeServer?.status === "online";
  const userPercentage = (activeServer?.totalUsuarios ?? 0) > 0 
    ? ((activeServer?.connectedUsers ?? 0) / (activeServer?.totalUsuarios ?? 1)) * 100 
    : 0;

  return (
    <section className="py-8 sm:py-12 lg:py-16 bg-zinc-900">
      <div className="w-full px-4 sm:px-0">
        <div className="mx-auto px-0">
          <div className="bg-zinc-800 flex flex-col w-full rounded-2xl relative group/showcase lg:overflow-hidden">
            {/* Tabs */}
            <div className="flex w-full gap-2">
              <div className="rounded-t-2xl overflow-y-auto flex w-full gap-2 scrollbar-hidden snap snap-x snap-mandatory bg-zinc-800 p-2.5">
                <div className="flex w-auto lg:w-full items-center justify-start gap-2 relative bg-zinc-900 rounded-lg p-1">
                  {/* Sliding indicator */}
                  <div
                    className="hidden sm:block flex-1 absolute left-1 top-1 transition-transform duration-150 ease-out bg-zinc-700 rounded-md shadow-[inset_0_1px_0_0_rgb(82_82_91)]"
                    style={{
                      width: `calc(${100 / displayServers.length}% - 8px)`,
                      height: 'calc(100% - 8px)',
                      minWidth: '244px',
                      transform: `translateX(calc(${activeServerIndex * 100}% + ${activeServerIndex * 8}px)) translateZ(0px)`
                    }}
                  />
                  
                  {/* Server tabs */}
                  {displayServers.map((server, index) => (
                    <button
                      key={server.serverName}
                      type="button"
                      onClick={() => setActiveServerIndex(index)}
                      className={`cursor-pointer z-[1] snap-start appearance-none focus:outline-none border-none flex-1 break-keep whitespace-nowrap sm:min-w-[244px] py-2.5 px-4 transition-colors ease-in-out duration-150 text-xs sm:text-sm ${
                        activeServerIndex === index
                          ? 'bg-zinc-800 text-white sm:bg-transparent'
                          : 'bg-transparent text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {getCountryFlag(server.location)} {server.serverName}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Server content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeServerIndex}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden relative"
              >
                <div className="p-6 sm:p-8 lg:p-10">
                  {/* Header with status */}
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl sm:text-3xl font-bold text-white">
                          {activeServer.serverName}
                        </h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.color} ${status.border} border`}>
                          {status.label}
                        </span>
                      </div>
                      <p className="text-sm text-zinc-400 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {activeServer.location}
                      </p>
                    </div>
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${isOnline ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-zinc-700 text-zinc-400 border border-zinc-600'}`}>
                      <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-gray-500'}`} />
                      {isOnline ? 'En línea' : 'Desconectado'}
                    </div>
                  </div>

                  {/* Utilization bar */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-zinc-400">Utilización promedio</span>
                      <span className={`text-2xl font-bold ${status.color}`}>{utilization.toFixed(0)}%</span>
                    </div>
                    <div className="h-3 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full ${status.bar} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${utilization}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: "CPU", value: `${(activeServer.cpuUsage ?? 0).toFixed(0)}%`, icon: Cpu, color: "text-blue-400" },
                      { label: "RAM", value: `${(activeServer.memoryUsage ?? 0).toFixed(0)}%`, icon: HardDrive, color: "text-purple-400" },
                      { label: "Usuarios", value: `${activeServer.connectedUsers ?? 0}/${activeServer.totalUsuarios}`, icon: Users, color: "text-orange-400" },
                      { label: "Tráfico", value: `${(activeServer.netSentMbps ?? 0).toFixed(1)} Mbps`, icon: TrendingUp, color: "text-green-400" },
                    ].map((stat) => (
                      <div key={stat.label} className="bg-zinc-900 rounded-xl p-4 border border-zinc-700">
                        <div className="flex items-center gap-2 mb-2">
                          <stat.icon className={`w-4 h-4 ${stat.color}`} />
                          <span className="text-xs text-zinc-500">{stat.label}</span>
                        </div>
                        <p className="text-lg font-semibold text-white">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* User capacity */}
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-zinc-400 flex items-center gap-1.5">
                        <Wifi className="w-4 h-4" />
                        Capacidad de usuarios
                      </span>
                      <span className="text-sm font-semibold text-white">
                        {activeServer.connectedUsers}/{activeServer.totalUsuarios}
                      </span>
                    </div>
                    <div className="h-2.5 bg-zinc-900 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-orange-400 to-orange-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${userPercentage}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                      />
                    </div>
                  </div>

                  {/* Additional details */}
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { 
                        label: "Última actualización", 
                        value: new Date(activeServer.lastUpdate).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" }),
                        icon: Clock
                      },
                      { 
                        label: "Núcleos CPU", 
                        value: `${activeServer.cpuCores} cores`,
                        icon: Cpu
                      },
                      { 
                        label: "Memoria total", 
                        value: `${activeServer.totalMemoryGb} GB`,
                        icon: HardDrive
                      },
                      { 
                        label: "Estado", 
                        value: isOnline ? "Operativo" : "Inactivo",
                        icon: Activity
                      },
                    ].map((item) => (
                      <div key={item.label} className="bg-zinc-900 rounded-xl p-3 border border-zinc-700">
                        <div className="flex items-center gap-1.5 text-zinc-500 mb-1">
                          <item.icon className="w-3.5 h-3.5" />
                          <span className="text-xs">{item.label}</span>
                        </div>
                        <p className="text-sm font-semibold text-white">{item.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* High usage warning */}
                  {((activeServer.cpuUsage ?? 0) > 70 || (activeServer.memoryUsage ?? 0) > 70) && (
                    <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span className="text-sm font-semibold text-amber-400">Alto consumo detectado</span>
                    </div>
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Footer note */}
          <motion.div 
            className="mt-8 text-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <p className="text-xs text-zinc-500 font-medium">
              Los datos se actualizan automáticamente cada 6 segundos
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
