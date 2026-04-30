import { Cupon } from "../../../types";

interface OverviewSectionProps {
  cupones: Cupon[];
  loadingCupones: boolean;
  isRefreshingCupones: boolean;
  numberFormatter: Intl.NumberFormat;
  onRefreshCupones: () => void;
}

export function OverviewSection({
  cupones,
  loadingCupones,
  isRefreshingCupones,
  numberFormatter,
  onRefreshCupones,
}: OverviewSectionProps) {
  const activeCoupons = cupones.filter((c) => c.activo).length;
  const totalUses = cupones.reduce((acc, cupon) => acc + (cupon.usos_actuales ?? 0), 0);

  return (
    <section id="section-overview" className="space-y-6">
      <div className="relative overflow-hidden border border-zinc-800/50 rounded-3xl bg-zinc-900/40 backdrop-blur-md p-8 shadow-xl shadow-black/20">
        {/* Decorative element */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full -mr-16 -mt-16" />
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white tracking-tight">Panel Interno</h1>
            <p className="text-zinc-500 text-sm mt-1.5 flex items-center gap-2 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              Ruta segura /155908348 • Gestión administrativa avanzada
            </p>
          </div>
          <button
            onClick={onRefreshCupones}
            disabled={loadingCupones || isRefreshingCupones}
            className="group flex items-center gap-2 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 px-6 py-3 text-sm font-bold text-zinc-300 transition-all hover:bg-zinc-700 hover:border-orange-500/50 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-black/30"
          >
            <div className={`w-2 h-2 rounded-full ${isRefreshingCupones ? 'bg-orange-500 animate-ping' : 'bg-zinc-500 group-hover:bg-orange-500'}`} />
            {isRefreshingCupones ? "Sincronizando..." : "Actualizar datos"}
          </button>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-3">
          <div className="group relative overflow-hidden border border-zinc-800/50 rounded-2xl bg-zinc-950/40 p-6 transition-all hover:border-orange-500/30 hover:translate-y-[-2px]">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">
              Cupones Activos
            </div>
            <div className="flex items-baseline gap-2">
              <div className="text-4xl font-black text-white lining-nums">{activeCoupons}</div>
              <div className="text-sm font-bold text-zinc-600">/ {cupones.length}</div>
            </div>
            <div className="mt-4 h-1 w-full bg-zinc-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-orange-600 to-orange-400 transition-all duration-1000" 
                style={{ width: `${(activeCoupons / cupones.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="group relative overflow-hidden border border-zinc-800/50 rounded-2xl bg-zinc-950/40 p-6 transition-all hover:border-orange-500/30 hover:translate-y-[-2px]">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">
              Usos Acumulados
            </div>
            <div className="text-4xl font-black text-white lining-nums">
              {numberFormatter.format(totalUses).replace('COP', '').trim()}
            </div>
            <div className="text-[11px] font-bold text-zinc-600 mt-2 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-green-500" />
              Sincronizado con DB
            </div>
          </div>

          <div className="group relative overflow-hidden border border-zinc-800/50 rounded-2xl bg-zinc-950/40 p-6 transition-all hover:border-orange-500/30 hover:translate-y-[-2px]">
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-3">
              Estado Avisos
            </div>
            <div className="text-4xl font-black text-white">Activos</div>
            <div className="text-[11px] font-bold text-zinc-600 mt-2">
              Configuración en tiempo real
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
