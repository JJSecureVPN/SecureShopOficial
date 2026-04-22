import { PromoConfig, HeroPromoConfig } from "../types";

type PromoScope = "todos" | "solo_nuevos" | "solo_renovaciones";

interface PromoPanelProps {
  titulo: string;
  icono: string;
  subtitulo: string;
  promoConfig: PromoConfig | null;
  heroPromo: HeroPromoConfig | null;
  durationInput: string;
  discountPercentageInput: string;
  isSaving: boolean;
  onDurationChange: (value: string) => void;
  onDiscountPercentageChange: (value: string) => void;
  promoScope: PromoScope;
  onSetPromoScope: (value: PromoScope) => void;
  onActivate: () => void;
  onDeactivate: () => void;
  onTextoChange: (value: string) => void;
  onGuardarTexto: () => void;
}

export function PromoPanel({
  titulo,
  icono,
  subtitulo,
  promoConfig,
  heroPromo,
  durationInput,
  discountPercentageInput,
  isSaving,
  onDurationChange,
  onDiscountPercentageChange,
  promoScope,
  onSetPromoScope,
  onActivate,
  onDeactivate,
  onTextoChange,
  onGuardarTexto,
}: PromoPanelProps) {
  
  const getActiveScopeLabel = () => {
    if (promoConfig?.solo_nuevos) return "Nuevos Usuarios";
    if (promoConfig?.solo_renovaciones) return "Renovaciones";
    return "Universal";
  };
  
  return (
    <div className="relative group overflow-hidden rounded-[2.5rem] bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 p-8 transition-all duration-500 hover:border-orange-500/20 shadow-2xl">
      <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[50px] rounded-full -translate-y-1/2 translate-x-1/2 group-hover:bg-orange-500/10 transition-all pointer-events-none" />
      
      <div className="relative z-10 flex items-start gap-4 mb-8">
        <div className="w-14 h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 flex items-center justify-center text-2xl shadow-inner group-hover:scale-110 transition-transform">
          {icono}
        </div>
        <div>
          <h3 className="text-lg font-black text-white tracking-tight uppercase group-hover:text-orange-400 transition-colors">
            {titulo}
          </h3>
          <p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mt-1 italic">{subtitulo}</p>
        </div>
      </div>

      {/* Status Bar */}
      <div className="relative overflow-hidden p-4 rounded-2xl border border-zinc-800/50 bg-zinc-950/30 backdrop-blur-md mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-2.5 h-2.5 rounded-full ${promoConfig?.activa ? 'bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.5)]' : 'bg-zinc-700'}`} />
            <span className={`text-[11px] font-black uppercase tracking-widest ${promoConfig?.activa ? 'text-orange-500' : 'text-zinc-500'}`}>
              {promoConfig?.activa ? 'Campaña en curso' : 'Protocolo Inactivo'}
            </span>
          </div>
          {promoConfig?.activa && promoConfig?.duracion_horas && (
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20">
               <span className="text-[9px] font-black text-orange-500 uppercase">{promoConfig.duracion_horas}H RESTANTES</span>
            </div>
          )}
        </div>
      </div>

      {/* Scope Selector */}
      <div className="space-y-4 mb-8">
        <div className="flex items-center justify-between px-1">
          <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Alcance Estratégico</span>
          {promoConfig?.activa && (
            <span className="text-[9px] font-black text-orange-500 uppercase italic">Activo: {getActiveScopeLabel()}</span>
          )}
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          {(["todos", "solo_nuevos", "solo_renovaciones"] as const).map((sc) => (
            <button
              key={sc}
              type="button"
              disabled={isSaving || promoConfig?.activa}
              onClick={() => onSetPromoScope(sc)}
              className={`relative flex items-center justify-between px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                promoScope === sc
                  ? "bg-zinc-800 text-white border-zinc-700 shadow-xl"
                  : "bg-transparent text-zinc-600 border border-transparent hover:text-zinc-400"
              } ${promoConfig?.activa ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
            >
              <span>
                {sc === "todos" && "Universal (Global)"}
                {sc === "solo_nuevos" && "Filtrar: Nuevos Usuarios"}
                {sc === "solo_renovaciones" && "Filtrar: Renovaciones"}
              </span>
              {promoScope === sc && <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />}
            </button>
          ))}
        </div>
      </div>

      {promoConfig?.activa ? (
        <button
          onClick={onDeactivate}
          disabled={isSaving}
          className="group w-full relative h-[52px] rounded-2xl bg-red-500/10 border border-red-500/20 text-[11px] font-black uppercase tracking-widest text-red-500 transition-all hover:bg-red-500 hover:text-white disabled:opacity-40 overflow-hidden shadow-xl"
        >
          <span className="relative z-10">{isSaving ? "Abortando..." : "Terminar Promoción"}</span>
          <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1">Descuento %</label>
              <input
                type="number"
                min="1"
                max="100"
                className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-white placeholder-zinc-800 focus:outline-none focus:border-orange-500/50 transition-all font-bold"
                value={discountPercentageInput}
                onChange={(e) => onDiscountPercentageChange(e.target.value)}
                placeholder="20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1">Plazo (H)</label>
              <input
                type="number"
                min="1"
                max="720"
                className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 text-sm text-white placeholder-zinc-800 focus:outline-none focus:border-orange-500/50 transition-all font-bold"
                value={durationInput}
                onChange={(e) => onDurationChange(e.target.value)}
                placeholder="24"
              />
            </div>
          </div>
          <button
            onClick={onActivate}
            disabled={isSaving || !discountPercentageInput}
            className="group relative w-full h-[52px] rounded-2xl bg-orange-500 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-orange-400 hover:shadow-2xl hover:shadow-orange-500/20 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed overflow-hidden"
          >
            <span className="relative z-10">{isSaving ? "Iniciando..." : `Lanzar ${discountPercentageInput || "0"}% OFF`}</span>
          </button>
        </div>
      )}

      {/* Hero Text Customization */}
      <div className="mt-8 pt-6 border-t border-zinc-800/50">
        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 px-1 mb-3 block">Configuración Visual (Banner)</label>
        <div className="space-y-4">
          <input
            type="text"
            className="w-full h-12 rounded-xl border border-zinc-800 bg-zinc-950/50 px-4 text-xs font-bold text-white placeholder-zinc-800 focus:outline-none focus:border-orange-500/50 transition-all"
            value={heroPromo?.texto || ""}
            onChange={(e) => onTextoChange(e.target.value)}
            placeholder="EJ: SUPER OFERTA 30% OFF"
          />
          
          {heroPromo?.texto && (
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/10 group/preview transition-all duration-500">
               <p className="text-[11px] font-black uppercase tracking-widest text-zinc-400 leading-relaxed">
                {heroPromo.texto.split(/(\d+%)/g).map((part, idx) => {
                  if (part.match(/\d+%/)) {
                    return (
                      <span key={idx} className="bg-orange-500 text-white px-2 py-0.5 rounded shadow-[0_0_10px_rgba(249,115,22,0.4)] mx-1">
                        {part}
                      </span>
                    );
                  }
                  return part;
                })}
              </p>
            </div>
          )}
          
          <button
            onClick={onGuardarTexto}
            disabled={isSaving}
            className="w-full h-10 rounded-xl bg-zinc-950/50 border border-zinc-800/80 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:border-zinc-700 transition-all disabled:opacity-40"
          >
            {isSaving ? "Guardando..." : "Sincronizar Arte"}
          </button>
        </div>
      </div>
    </div>
  );
}
