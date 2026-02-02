import { motion } from "framer-motion";
import { Crown, Cpu, Gauge, Server, Users, Wifi } from "lucide-react";
import { useMemo } from "react";
import { useServerStats } from "../../../hooks/useServerStats";

const numberFormatter = new Intl.NumberFormat("es-AR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const percentageFormatter = (value: number) => `${value.toFixed(0)}%`;

const FREE_SERVER_IDS = new Set([557]);
const FREE_TIER_PATTERN = /free|gratuito|gratis|demo|test|beta|trial/i;

const isFreeTierServer = (server?: {
  serverId?: number;
  serverName?: string;
  location?: string;
}) => {
  if (!server) return false;

  if (server.serverId && FREE_SERVER_IDS.has(server.serverId)) {
    return true;
  }

  if (server.serverName && FREE_TIER_PATTERN.test(server.serverName)) {
    return true;
  }

  if (server.location && /free|gratis|gratuito|demo|test|global/i.test(server.location)) {
    return true;
  }

  return false;
};

export function ServerGlobalSummary() {
  const { servers, totalUsers, onlineServers } = useServerStats(9000);

  const summary = useMemo(() => {
    if (!servers.length) {
      return {
        premiumUsers: 0,
        freeUsers: 0,
        globalCpu: 0,
        globalRam: 0,
      };
    }

    let premiumUsers = 0;
    let freeUsers = 0;
    let cpuAccumulator = 0;
    let memoryAccumulator = 0;
    let cpuSamples = 0;
    let memorySamples = 0;

    servers.forEach((server) => {
      const realTimeUsers = server.connectedUsers ?? 0;
      const fallbackUsers = server.totalUsuarios ?? realTimeUsers;
      const usersToCount = server.status === "online" ? realTimeUsers : fallbackUsers;

      if (isFreeTierServer(server)) {
        freeUsers += usersToCount;
      } else {
        premiumUsers += usersToCount;
      }

      if (typeof server.cpuUsage === "number") {
        cpuAccumulator += server.cpuUsage;
        cpuSamples += 1;
      }

      if (typeof server.memoryUsage === "number") {
        memoryAccumulator += server.memoryUsage;
        memorySamples += 1;
      }
    });

    return {
      premiumUsers,
      freeUsers,
      globalCpu: cpuSamples ? cpuAccumulator / cpuSamples : 0,
      globalRam: memorySamples ? memoryAccumulator / memorySamples : 0,
    };
  }, [servers]);

  const stats = [
    {
      label: "Servidores activos",
      value: onlineServers || 0,
      suffix: `/${servers.length}`,
      icon: Server,
      color: "text-emerald-400",
      bgColor: "bg-zinc-800",
      borderColor: "border-emerald-500/20",
      accentBorder: "border-t-emerald-500/30",
      note: "estado continuo",
    },
    {
      label: "Usuarios premium",
      value: numberFormatter.format(summary.premiumUsers || totalUsers || 0),
      icon: Crown,
      color: "text-amber-400",
      bgColor: "bg-zinc-800",
      borderColor: "border-amber-500/20",
      accentBorder: "border-t-amber-500/30",
      note: "sesiones activas",
    },
    {
      label: "Usuarios gratuitos",
      value: numberFormatter.format(summary.freeUsers),
      icon: Users,
      color: "text-sky-400",
      bgColor: "bg-zinc-800",
      borderColor: "border-sky-500/20",
      accentBorder: "border-t-sky-500/30",
      note: "tier free/demo",
    },
    {
      label: "CPU promedio",
      value: percentageFormatter(summary.globalCpu),
      icon: Cpu,
      color: "text-purple-400",
      bgColor: "bg-zinc-800",
      borderColor: "border-purple-500/20",
      accentBorder: "border-t-purple-500/30",
      note: "promedio 5m",
    },
    {
      label: "RAM promedio",
      value: percentageFormatter(summary.globalRam),
      icon: Gauge,
      color: "text-indigo-400",
      bgColor: "bg-zinc-800",
      borderColor: "border-indigo-500/20",
      accentBorder: "border-t-indigo-500/30",
      note: "promedio 5m",
    },
    {
      label: "Conexiones totales",
      value: numberFormatter.format(summary.premiumUsers + summary.freeUsers),
      icon: Wifi,
      color: "text-teal-400",
      bgColor: "bg-zinc-800",
      borderColor: "border-teal-500/20",
      accentBorder: "border-t-teal-500/30",
      note: "usuarios online",
    },
  ];

  return (
    <section className="pt-6 sm:pt-8 lg:pt-10">
      <div className="w-full px-4 sm:px-0">
        <div className="mx-auto bg-zinc-800/30 rounded-[12px] lg:rounded-[20px] border border-zinc-700/50 pt-8 sm:pt-10 lg:pt-12 px-6 sm:px-8 lg:px-12 pb-8 sm:pb-10 lg:pb-12">
          {/* Header */}
          <motion.div 
            className="text-center mb-8 sm:mb-10"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <p className="text-xs font-semibold tracking-[0.2em] text-orange-400 uppercase mb-2">
              Panel de control
            </p>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
              Resumen global
            </h2>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-5">
            {stats.map((stat, index) => {
              const isPrimary = index < 3;

              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  className={`relative overflow-hidden rounded-2xl border ${stat.borderColor} ${stat.bgColor} p-4 sm:p-5 transition-all duration-300 hover:border-zinc-600 ${isPrimary ? "lg:pt-6" : ""} border-t-4 ${stat.accentBorder}`}
                >
                  {/* Icon */}
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl ${stat.bgColor} border ${stat.borderColor} flex items-center justify-center mb-3`}>
                    <stat.icon className={`w-4 h-4 sm:w-5 sm:h-5 ${stat.color}`} />
                  </div>
                  
                  {/* Value */}
                  <div className="flex items-baseline gap-1">
                    <span className={`${isPrimary ? "text-2xl sm:text-3xl lg:text-4xl" : "text-xl sm:text-2xl lg:text-3xl"} font-bold ${stat.color}`}>
                      {stat.value}
                    </span>
                    {stat.suffix && (
                      <span className="text-sm text-zinc-400 font-medium">{stat.suffix}</span>
                    )}
                  </div>
                  
                  {/* Label */}
                  <p className={`text-xs sm:text-sm text-zinc-300 mt-1 font-medium ${isPrimary ? "lg:mt-2" : ""}`}>
                    {stat.label}
                  </p>

                  {/* Note */}
                  <p className="text-[11px] sm:text-xs text-zinc-500 mt-1 font-medium">
                    {stat.note}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
