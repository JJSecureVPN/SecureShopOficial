// ServerDashboard.tsx — Rediseño mobile-first
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  Clock,
  Cpu,
  Crown,
  HardDrive,
  MapPin,
  RefreshCw,
  Server,
  TrendingUp,
  Users,
  Wifi,
  ChevronRight,
} from "lucide-react";
import { useServerStats } from "../../../hooks/useServerStats";

const numberFormatter = new Intl.NumberFormat("es-AR", {
  notation: "compact",
  maximumFractionDigits: 1,
});

const getCountryFlag = (location: string) => {
  const loc = location.toLowerCase();
  if (loc.includes("arg")) return "🇦🇷";
  if (loc.includes("bra") || loc.includes("br")) return "🇧🇷";
  if (loc.includes("usa") || loc.includes("us")) return "🇺🇸";
  return "🌍";
};

// Retorna color + etiqueta según valor
const getLevel = (value: number) => {
  if (value > 80) return { label: "Crítico", color: "#f43f5e", bg: "bg-rose-500/10", text: "text-rose-400", border: "border-rose-500/25" };
  if (value > 60) return { label: "Alto",    color: "#f59e0b", bg: "bg-amber-500/10", text: "text-amber-400", border: "border-amber-500/25" };
  if (value > 40) return { label: "Normal",  color: "#60a5fa", bg: "bg-blue-500/10",  text: "text-blue-400",  border: "border-blue-500/25"  };
  return             { label: "Óptimo",  color: "#34d399", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/25" };
};

// Barra fina horizontal
function StatBar({ value, color }: { value: number; color: string }) {
  return (
    <div className="h-[3px] bg-zinc-800 rounded-full overflow-hidden w-full">
      <div
        style={{ width: `${Math.min(value, 100)}%`, background: color, transition: "width 0.8s ease-out" }}
        className="h-full rounded-full"
      />
    </div>
  );
}

// Bloque de métrica con número grande
function MetricBlock({
  label, value, unit, icon: Icon, level,
}: {
  label: string; value: number; unit?: string; icon: React.ElementType; level: ReturnType<typeof getLevel>;
}) {
  return (
    <div className={`flex-1 rounded-2xl border p-4 ${level.bg} ${level.border}`}>
      <div className="flex items-center gap-1.5 mb-2">
        <Icon className={`w-3.5 h-3.5 ${level.text}`} />
        <span className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wide">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-3xl font-black tabular-nums leading-none ${level.text}`}>{value.toFixed(0)}</span>
        {unit && <span className="text-sm text-zinc-500 font-medium">{unit}</span>}
      </div>
      <p className="text-[10px] text-zinc-600 mt-1 font-medium">{level.label}</p>
    </div>
  );
}

export function ServerDashboard() {
  const { servers, totalUsers, onlineServers, loading } = useServerStats(6000);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    setActiveIdx((current) => Math.min(current, Math.max(servers.length - 1, 0)));
  }, [servers.length]);

  const summary = useMemo(() => {
    let premium = 0;
    servers.forEach((s) => { premium += s.status === "online" ? (s.connectedUsers ?? 0) : (s.totalUsuarios ?? 0); });
    return { premium };
  }, [servers]);

  const totalCap = servers.reduce((a, s) => a + (s.totalUsuarios ?? 0), 0);
  const capacityPct = totalCap > 0 ? Math.min(((summary.premium || totalUsers || 0) / totalCap) * 100, 100) : 0;
  const allOnline = onlineServers === servers.length && servers.length > 0;

  const active = servers[activeIdx];
  const cpu = active?.cpuUsage ?? 0;
  const ram = active?.memoryUsage ?? 0;
  const avg = (cpu + ram) / 2;
  const cpuLevel = getLevel(cpu);
  const ramLevel = getLevel(ram);
  const avgLevel = getLevel(avg);
  const isOnline = active?.status === "online";

  return (
    <section className="pt-6 sm:pt-8 lg:pt-10 relative z-10 lg:-mt-[41px]">
      <div className="w-full">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="mx-auto bg-zinc-900 rounded-2xl lg:rounded-3xl border border-zinc-800 pt-8 sm:pt-10 lg:pt-12 px-5 sm:px-8 lg:px-12 pb-8 sm:pb-10 lg:pb-12">

            {/* ── Header ── */}
            <div className="mb-8 sm:mb-10">
              <p className="text-xs font-bold tracking-[0.25em] text-orange-400 uppercase mb-2">
                Panel de control
              </p>
              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Infraestructura
              </h2>
            </div>

            {/* ── KPIs globales ── */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {/* Servidores */}
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-800/50 p-5 overflow-hidden">
                {/* línea de acento superior */}
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0" />
                <div className="flex items-center gap-2 mb-3">
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Servidores</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-5xl font-black text-emerald-400 tabular-nums leading-none">{onlineServers ?? 0}</span>
                  <span className="text-xl font-semibold text-zinc-600">/{servers.length}</span>
                </div>
                {allOnline && (
                  <div className="flex items-center gap-1.5 mt-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[11px] font-semibold text-emerald-400">Todos online</span>
                  </div>
                )}
              </div>

              {/* Usuarios */}
              <div className="relative rounded-2xl border border-zinc-800 bg-zinc-800/50 p-5 overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0" />
                <div className="flex items-center gap-2 mb-3">
                  <Crown className="w-4 h-4 text-orange-400" />
                  <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">Conectados</span>
                </div>
                <div className="flex items-baseline gap-0.5 mb-1">
                  <span className="text-5xl font-black text-orange-400 tabular-nums leading-none">
                    {numberFormatter.format(summary.premium || totalUsers || 0)}
                  </span>
                </div>
                {totalCap > 0 && (
                  <div className="mt-2">
                    <div className="h-[3px] bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                        style={{ width: `${capacityPct}%` }}
                      />
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1 block">{capacityPct.toFixed(0)}% de capacidad</span>
                  </div>
                )}
              </div>
            </div>

            {/* ── Divider con título ── */}
            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[11px] font-bold tracking-[0.2em] text-zinc-600 uppercase">Por servidor</span>
              <div className="flex-1 h-px bg-zinc-800" />
            </div>

            {loading && !servers.length ? (
              <div className="flex items-center justify-center gap-3 text-zinc-600 py-12">
                <RefreshCw className="w-4 h-4" />
                <span className="text-sm font-medium">Cargando…</span>
              </div>
            ) : (
              <>
                {/* ── Server chips — scroll horizontal en mobile, wrap en desktop ── */}
                <div className="flex gap-2 overflow-x-auto hide-scrollbar mb-5 -mx-1 px-1">
                  {servers.map((s, i) => {
                    const sAvg = ((s.cpuUsage ?? 0) + (s.memoryUsage ?? 0)) / 2;
                    const lvl = getLevel(sAvg);
                    const active = activeIdx === i;
                    return (
                      <button
                        key={s.serverName}
                        onClick={() => setActiveIdx(i)}
                        className={`flex-shrink-0 flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border text-sm font-semibold transition-colors duration-150 focus:outline-none ${
                          active
                            ? `${lvl.bg} ${lvl.border} ${lvl.text}`
                            : "bg-zinc-800/60 border-zinc-700/50 text-zinc-500 hover:text-zinc-300 hover:border-zinc-600"
                        }`}
                      >
                        <span className={`w-2 h-2 rounded-full flex-shrink-0 ${s.status === "online" ? "bg-emerald-400" : "bg-zinc-600"}`}
                        />
                        <span>{getCountryFlag(s.location)}</span>
                        <span className="whitespace-nowrap">{s.serverName}</span>
                        {active && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
                      </button>
                    );
                  })}
                </div>

                {/* ── Panel de detalle del servidor activo ── */}
                <div className="rounded-2xl border border-zinc-800 bg-zinc-800/30 overflow-hidden">
                    {/* Header del servidor */}
                    <div className="px-5 pt-5 pb-4 border-b border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{getCountryFlag(active?.location ?? "")}</span>
                        <div>
                          <h3 className="text-lg font-black text-white leading-tight">{active?.serverName}</h3>
                          <p className="text-xs text-zinc-500 flex items-center gap-1 mt-0.5">
                            <MapPin className="w-3 h-3" />
                            {active?.location}
                          </p>
                        </div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        isOnline ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25" : "bg-zinc-700 text-zinc-500 border-zinc-600"
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isOnline ? "bg-emerald-400" : "bg-zinc-500"}`} />
                        {isOnline ? "Online" : "Offline"}
                      </div>
                    </div>

                    {/* Métricas principales */}
                    <div className="p-5">
                      {/* Score global grande */}
                      <div className={`rounded-xl border p-4 mb-4 flex items-center justify-between ${avgLevel.bg} ${avgLevel.border}`}>
                        <div>
                          <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide mb-1">Carga promedio</p>
                          <div className="flex items-baseline gap-1">
                            <span className={`text-5xl font-black tabular-nums ${avgLevel.text}`}>{avg.toFixed(0)}</span>
                            <span className="text-lg text-zinc-500">%</span>
                          </div>
                        </div>
                        <div className={`w-16 h-16 rounded-full border-2 flex items-center justify-center ${avgLevel.border}`}>
                          <span className={`text-xs font-black ${avgLevel.text}`}>{avgLevel.label}</span>
                        </div>
                      </div>

                      {/* CPU + RAM */}
                      <div className="flex gap-3 mb-5">
                        <MetricBlock label="CPU" value={cpu} unit="%" icon={Cpu} level={cpuLevel} />
                        <MetricBlock label="RAM" value={ram} unit="%" icon={HardDrive} level={ramLevel} />
                      </div>

                      {/* Barras delgadas */}
                      <div className="space-y-3 mb-5">
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">CPU — {active?.cpuCores} cores</span>
                            <span className={`text-xs font-bold ${cpuLevel.text}`}>{cpu.toFixed(1)}%</span>
                          </div>
                          <StatBar value={cpu} color={cpuLevel.color} />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">RAM — {active?.totalMemoryGb} GB</span>
                            <span className={`text-xs font-bold ${ramLevel.text}`}>{ram.toFixed(1)}%</span>
                          </div>
                          <StatBar value={ram} color={ramLevel.color} />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-1.5">
                            <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                              <Users className="w-3 h-3" />
                              Usuarios — {active?.connectedUsers}/{active?.totalUsuarios}
                            </span>
                            <span className="text-xs font-bold text-orange-400">
                              {((active?.connectedUsers ?? 0) / Math.max(active?.totalUsuarios ?? 1, 1) * 100).toFixed(0)}%
                            </span>
                          </div>
                          <StatBar
                            value={(active?.connectedUsers ?? 0) / Math.max(active?.totalUsuarios ?? 1, 1) * 100}
                            color="#f97316"
                          />
                        </div>
                      </div>

                      {/* Metadata grid 2x2 */}
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { label: "Salida", value: `${(active?.netSentMbps ?? 0).toFixed(1)} Mbps`, icon: TrendingUp, color: "text-emerald-400" },
                          { label: "Entrada", value: `${(active?.netRecvMbps ?? 0).toFixed(1)} Mbps`, icon: Wifi, color: "text-sky-400" },
                          { label: "Estado", value: isOnline ? "Operativo" : "Inactivo", icon: Activity, color: isOnline ? "text-emerald-400" : "text-zinc-500" },
                          {
                            label: "Sync",
                            value: new Date(active?.lastUpdate).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
                            icon: Clock,
                            color: "text-zinc-400",
                          },
                        ].map((item) => (
                          <div key={item.label} className="bg-zinc-900/70 rounded-xl p-3 border border-zinc-800">
                            <div className="flex items-center gap-1.5 mb-1">
                              <item.icon className={`w-3 h-3 ${item.color}`} />
                              <span className="text-[10px] text-zinc-600 font-semibold uppercase tracking-wide">{item.label}</span>
                            </div>
                            <p className={`text-sm font-bold ${item.color}`}>{item.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Alerta */}
                      {(cpu > 70 || ram > 70) && (
                        <div className="mt-4 flex items-center gap-2 px-4 py-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
                          <Activity className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          <span className="text-sm font-bold text-rose-400">
                            Alto consumo — considera balancear carga
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
              </>
            )}

            <p className="mt-6 text-center text-[11px] text-zinc-700 font-medium">
              Actualización automática cada 6 segundos
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}