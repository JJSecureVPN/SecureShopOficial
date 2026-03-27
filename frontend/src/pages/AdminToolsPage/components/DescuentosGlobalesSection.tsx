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
    <section id="section-descuentos-globales" className="space-y-4 pb-10">
      <div className="border border-neutral-800 rounded-2xl bg-neutral-900/50 p-6">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-2xl font-bold">Descuentos globales</h2>
            <p className="text-gray-400 text-sm mb-6">
              Controla las promociones globales de forma independiente para cada categoría.
            </p>
            
            {/* Oferta 2x1 Section */}
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-purple-300 font-bold flex items-center gap-2">
                    <Zap size={18} className="text-purple-400" />
                    Oferta 2x1 (Doble Dispositivos)
                  </h4>
                  <p className="text-xs text-purple-200/70 mt-1">
                    Al activar esta opción, todos los planes VPN otorgarán el doble de conexiones (dispositivos) permitidos por el mismo precio.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${is2x1Active ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-400'}`}>
                    {is2x1Active ? 'ACTIVO' : 'INACTIVO'}
                  </span>
                  <button
                    onClick={onToggle2x1}
                    disabled={isSavingPromo}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                      is2x1Active ? "bg-purple-600" : "bg-gray-700"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        is2x1Active ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* Botones de configuración 2x1 */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-purple-500/20 pt-4">
                <div>
                   <label className="text-[10px] text-purple-300 uppercase font-bold mb-1 block">Duración (horas)</label>
                   <input
                     type="number"
                     value={durationInput2x1}
                     onChange={(e) => onSetDurationInput2x1(e.target.value)}
                     className="w-full bg-purple-900/30 border border-purple-500/30 rounded-md px-2 py-1 text-sm text-white focus:outline-none focus:border-purple-500"
                     placeholder="24"
                   />
                </div>
                <div className="flex flex-col justify-end">
                   <div className="flex items-center justify-between bg-purple-900/30 border border-purple-500/30 rounded-md px-2 py-1 h-[34px]">
                      <span className="text-[10px] text-purple-300 uppercase font-bold">Auto-desactivar</span>
                      <button
                        onClick={() => onSetAutoDesactivar2x1(!autoDesactivar2x1)}
                        className={`relative inline-flex h-4 w-8 items-center rounded-full transition-colors focus:outline-none ${
                          autoDesactivar2x1 ? "bg-purple-500" : "bg-gray-600"
                        }`}
                      >
                        <span
                          className={`inline-block h-2 w-2 transform rounded-full bg-white transition-transform ${
                            autoDesactivar2x1 ? "translate-x-5" : "translate-x-1"
                          }`}
                        />
                      </button>
                   </div>
                </div>
              </div>
            </div>
          </div>

          {(promoSuccess || promoError) && (
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${
                promoSuccess ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"
              }`}
            >
              {promoSuccess ?? promoError}
            </span>
          )}
        </div>

        {isLoadingPromo ? (
          <div className="text-center py-8 text-neutral-400">Cargando configuración...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {/* Planes normales */}
            <PromoPanel
              titulo="Planes normales"
              icono="📊"
              subtitulo="Descuentos para clientes directos"
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

            {/* Planes de revendedores */}
            <PromoPanel
              titulo="Planes de revendedores"
              icono="💼"
              subtitulo="Descuentos para revendedores"
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

        {/* Información */}
        <div className="mt-6 p-4 rounded-lg bg-neutral-800/30 border border-neutral-700">
          <div className="text-xs text-neutral-400 space-y-2">
            <p><span className="font-semibold">📋 Información:</span></p>
            <ul className="list-disc list-inside space-y-1 ml-1">
              <li>Controla <strong>planes normales</strong> y <strong>planes de revendedores</strong> de forma independiente</li>
              <li>Cada categoría define el alcance: <strong>Todos</strong>, <strong>Solo nuevas cuentas</strong> o <strong>Solo renovaciones</strong></li>
              <li>Los precios con descuento están precargados en las configuraciones</li>
              <li>El banner de promoción se muestra automáticamente en el sitio</li>
              <li>Se desactiva automáticamente después de la duración especificada si está configurado</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
