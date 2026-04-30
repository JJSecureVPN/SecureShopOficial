import { Zap } from "lucide-react";
import { PromoConfig, HeroPromoConfig } from "../types";
import { PromoPanel } from "./PromoPanel";

type PromoScope = "todos" | "solo_nuevos" | "solo_renovaciones";

interface DescuentosGlobalesSectionProps {
  promoConfigPlanes: PromoConfig | null;
  promoConfigRevendedores: PromoConfig | null;
  heroPromoPlanes: HeroPromoConfig | null;
  heroPromoRevendedores: HeroPromoConfig | null;
  promoSuccess: string | null;
  promoError: string | null;
  isLoadingPromo: boolean;
  isSavingPromo: boolean;
  durationInputPlanes: string;
  durationInputRevendedores: string;
  discountPercentagePlanes: string;
  discountPercentageRevendedores: string;
  onSetDurationInputPlanes: (value: string) => void;
  onSetDurationInputRevendedores: (value: string) => void;
  onSetDiscountPercentagePlanes: (value: string) => void;
  onSetDiscountPercentageRevendedores: (value: string) => void;
  promoScopePlanes: PromoScope;
  promoScopeRevendedores: PromoScope;
  onSetPromoScopePlanes: (value: PromoScope) => void;
  onSetPromoScopeRevendedores: (value: PromoScope) => void;
  onActivatePromo: (tipo: "planes" | "revendedores") => void;
  onDeactivatePromo: (tipo: "planes" | "revendedores") => void;
  onSetHeroPromoPlanes: (config: HeroPromoConfig | null) => void;
  onSetHeroPromoRevendedores: (config: HeroPromoConfig | null) => void;
  onGuardarTextoHero: (tipo: "planes" | "revendedores") => Promise<void>;
  is2x1Active: boolean;
  onToggle2x1: () => Promise<void>;
  durationInput2x1: string;
  onSetDurationInput2x1: (value: string) => void;
  autoDesactivar2x1: boolean;
  onSetAutoDesactivar2x1: (value: boolean) => void;
}

export function DescuentosGlobalesSection({
  promoConfigPlanes,
  promoConfigRevendedores,
  heroPromoPlanes,
  heroPromoRevendedores,
  promoSuccess,
  promoError,
  isLoadingPromo,
  isSavingPromo,
  durationInputPlanes,
  durationInputRevendedores,
  discountPercentagePlanes,
  discountPercentageRevendedores,
  onSetDurationInputPlanes,
  onSetDurationInputRevendedores,
  onSetDiscountPercentagePlanes,
  onSetDiscountPercentageRevendedores,
  promoScopePlanes,
  promoScopeRevendedores,
  onSetPromoScopePlanes,
  onSetPromoScopeRevendedores,
  onActivatePromo,
  onDeactivatePromo,
  onSetHeroPromoPlanes,
  onSetHeroPromoRevendedores,
  onGuardarTextoHero,
  is2x1Active,
  onToggle2x1,
  durationInput2x1,
  onSetDurationInput2x1,
  autoDesactivar2x1,
  onSetAutoDesactivar2x1,
}: DescuentosGlobalesSectionProps) {
  return (
    <section id="section-descuentos-globales" className="space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-6 duration-1000">
      <div className="relative overflow-hidden rounded-[3rem] border border-zinc-800/50 bg-zinc-900/20 backdrop-blur-3xl p-8 md:p-12 shadow-[0_20px_50px_rgba(0,0,0,0.3)]">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 relative z-10">
          <div className="max-w-2xl">
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Ingeniería de Descuentos</h2>
            <p className="text-zinc-500 font-medium mt-2 text-sm leading-relaxed">
              Consola de mando para la activación de algoritmos de precios y campañas de marketing global. Control total sobre la percepción de valor del producto.
            </p>
          </div>

          {(promoSuccess || promoError) && (
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border animate-bounce ${
              promoSuccess ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-400"
            }`}>
              <div className={`w-2 h-2 rounded-full ${promoSuccess ? "bg-emerald-500" : "bg-red-500"}`} />
              <span className="text-xs font-black uppercase tracking-widest">{promoSuccess ?? promoError}</span>
            </div>
          )}
        </div>

        {/* Oferta 2x1 Premium Section */}
        <div className="relative group mb-12 overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-orange-500/10 via-zinc-900/40 to-zinc-950/60 border border-orange-500/20 p-8 transition-all duration-500 hover:border-orange-500/40 shadow-2xl">
          <div className="absolute top-0 right-0 p-6">
            <Zap size={32} className={`transition-all duration-700 ${is2x1Active ? "text-orange-500 scale-125 drop-shadow-[0_0_15px_rgba(249,115,22,0.6)]" : "text-zinc-800"}`} />
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all ${
                  is2x1Active ? "bg-orange-500 text-white border-orange-400 animate-pulse" : "bg-zinc-800 text-zinc-500 border-zinc-700"
                }`}>
                  {is2x1Active ? "Protocolo Activo" : "En Espera"}
                </div>
                <h4 className="text-xl font-black text-white uppercase tracking-tight">Evento 2x1: Conexión Ilimitada</h4>
              </div>
              <p className="text-sm text-zinc-400 font-medium leading-relaxed max-w-xl">
                Al activar este módulo, todos los activos VPN configurados duplicarán instantáneamente su capacidad de conexión. <span className="text-orange-500/80 font-bold">Doble dispositivos al mismo precio.</span>
              </p>
            </div>

            <div className="flex flex-col items-center gap-6 bg-zinc-950/40 p-6 rounded-[2rem] border border-zinc-800/50 min-w-[280px]">
              <div className="flex items-center gap-4">
                 <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${is2x1Active ? 'text-orange-500' : 'text-zinc-600'}`}>
                   Interruptor Maestro
                 </span>
                 <button
                  onClick={onToggle2x1}
                  disabled={isSavingPromo}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-500 focus:outline-none shadow-inner ${
                    is2x1Active ? "bg-orange-500 shadow-orange-500/40" : "bg-zinc-800"
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-xl transition-transform duration-500 ${
                      is2x1Active ? "translate-x-7" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full border-t border-zinc-800/50 pt-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block px-1">Duración (H)</label>
                  <input
                    type="number"
                    value={durationInput2x1}
                    onChange={(e) => onSetDurationInput2x1(e.target.value)}
                    className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-orange-500/50 transition-all text-center"
                    placeholder="24"
                  />
                </div>
                <div className="space-y-1">
                   <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest block px-1 text-center">Auto-Off</label>
                   <div className="flex justify-center pt-1">
                    <button
                      onClick={() => onSetAutoDesactivar2x1(!autoDesactivar2x1)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${
                        autoDesactivar2x1 ? "bg-emerald-500" : "bg-zinc-700"
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          autoDesactivar2x1 ? "translate-x-6" : "translate-x-1"
                        }`}
                      />
                    </button>
                   </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {isLoadingPromo ? (
          <div className="py-24 text-center">
            <div className="w-12 h-12 border-4 border-orange-500/20 border-t-orange-500 rounded-full animate-spin mx-auto mb-6" />
            <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest">Sincronizando con el Núcleo</p>
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-2 relative z-10">
            <PromoPanel
              titulo="Planes Estándar"
              icono="📊"
              subtitulo="Arquitectura de precios B2C"
              promoConfig={promoConfigPlanes}
              heroPromo={heroPromoPlanes}
              durationInput={durationInputPlanes}
              discountPercentageInput={discountPercentagePlanes}
              isSaving={isSavingPromo}
              onDurationChange={onSetDurationInputPlanes}
              onDiscountPercentageChange={onSetDiscountPercentagePlanes}
              promoScope={promoScopePlanes}
              onSetPromoScope={onSetPromoScopePlanes}
              onActivate={() => onActivatePromo("planes")}
              onDeactivate={() => onDeactivatePromo("planes")}
              onTextoChange={(e) => onSetHeroPromoPlanes({ 
                habilitada: true, 
                texto: e,
                textColor: heroPromoPlanes?.textColor,
                bgColor: heroPromoPlanes?.bgColor,
                borderColor: heroPromoPlanes?.borderColor,
                iconColor: heroPromoPlanes?.iconColor,
                shadowColor: heroPromoPlanes?.shadowColor,
              })}
              onGuardarTexto={() => onGuardarTextoHero("planes")}
            />

            <PromoPanel
              titulo="Planes Corporativos"
              icono="💼"
              subtitulo="Gestión de márgenes B2B"
              promoConfig={promoConfigRevendedores}
              heroPromo={heroPromoRevendedores}
              durationInput={durationInputRevendedores}
              discountPercentageInput={discountPercentageRevendedores}
              isSaving={isSavingPromo}
              onDurationChange={onSetDurationInputRevendedores}
              onDiscountPercentageChange={onSetDiscountPercentageRevendedores}
              promoScope={promoScopeRevendedores}
              onSetPromoScope={onSetPromoScopeRevendedores}
              onActivate={() => onActivatePromo("revendedores")}
              onDeactivate={() => onDeactivatePromo("revendedores")}
              onTextoChange={(e) => onSetHeroPromoRevendedores({ 
                habilitada: true, 
                texto: e,
                textColor: heroPromoRevendedores?.textColor,
                bgColor: heroPromoRevendedores?.bgColor,
                borderColor: heroPromoRevendedores?.borderColor,
                iconColor: heroPromoRevendedores?.iconColor,
                shadowColor: heroPromoRevendedores?.shadowColor,
              })}
              onGuardarTexto={() => onGuardarTextoHero("revendedores")}
            />
          </div>
        )}

        {/* Info Legend */}
        <div className="mt-12 p-8 rounded-[2rem] bg-zinc-950/40 border border-zinc-800/50 backdrop-blur-md relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-orange-500 uppercase tracking-widest">Glosario de Operaciones</h5>
              <div className="space-y-3">
                <div className="flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
                   <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                     <span className="text-zinc-200 font-bold block mb-0.5">Control de Segmentación:</span>
                     Define si el beneficio se aplica de forma universal o se restringe a nuevos registros o renovaciones manuales.
                   </p>
                </div>
                <div className="flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
                   <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                     <span className="text-zinc-200 font-bold block mb-0.5">Automatización de Caducidad:</span>
                     Las campañas se desactivan por software una vez expirado el plazo configurado en el temporizador.
                   </p>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Efectos Visuales</h5>
              <div className="space-y-3">
                <div className="flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
                   <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                     <span className="text-zinc-200 font-bold block mb-0.5">Banner Dinámico:</span>
                     El sistema inyectará el arte promocional en el Hero de la web pública de forma sincronizada con la base de datos.
                   </p>
                </div>
                <div className="flex gap-3">
                   <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 mt-1.5 shrink-0" />
                   <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">
                     <span className="text-zinc-200 font-bold block mb-0.5">Cálculo en Tiempo Real:</span>
                     Los precios se recalculan en la pasarela de pagos al detectar una campaña activa para el plan seleccionado.
                   </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
