import { useState, useMemo, useEffect, useRef } from "react";
import {
  Check,
  Zap,
  RefreshCw,
  Users,
  Clock3,
  DollarSign,
  Maximize,
  Sparkles,
  Shield,
  ChevronRight,
} from "lucide-react";
import { PlanRevendedor } from "../../../types";
import { PlanGroup } from "../types";
import PlanSlider from "../../PlanesPage/components/PlanSlider";

const getFeatureIcon = (iconName: string) => {
  switch (iconName) {
    case "zap":
      return <Zap className="w-4 h-4" />;
    case "refresh-cw":
      return <RefreshCw className="w-4 h-4" />;
    case "users":
      return <Users className="w-4 h-4" />;
    case "clock":
      return <Clock3 className="w-4 h-4" />;
    case "dollar-sign":
      return <DollarSign className="w-4 h-4" />;
    case "maximize":
      return <Maximize className="w-4 h-4" />;
    default:
      return <Check className="w-4 h-4" />;
  }
};

interface ResellerPlanSelectorProps {
  plans: PlanRevendedor[];
  groupData: PlanGroup;
  onConfirmarCompra: (plan: PlanRevendedor) => void;
}

export default function ResellerPlanSelector({
  plans,
  groupData,
  onConfirmarCompra,
}: ResellerPlanSelectorProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const leftContentRef = useRef<HTMLDivElement>(null);
  const placeholderRef = useRef<HTMLDivElement>(null);
  const desktopPanelRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastRectRef = useRef<{ left: number; width: number; top: number } | null>(null);
  const [desktopTopOffset, setDesktopTopOffset] = useState<number>(96);
  const [desktopRect, setDesktopRect] = useState<{
    left: number;
    width: number;
    top: number;
  } | null>(null);

  const userOptions = useMemo(
    () => [...new Set(plans.map((p) => p.max_users))].sort((a, b) => a - b),
    [plans]
  );

  const [selectedUsers, setSelectedUsers] = useState<number>(5);

  useEffect(() => {
    if (userOptions.length > 0 && !userOptions.includes(selectedUsers)) {
      setSelectedUsers(userOptions.includes(5) ? 5 : userOptions[0]);
    }
  }, [userOptions]);

  const selectedPlan = useMemo(
    () => plans.find((p) => p.max_users === selectedUsers) ?? null,
    [plans, selectedUsers]
  );

  const unitPrice =
    selectedPlan && selectedPlan.max_users > 0
      ? Math.round(selectedPlan.precio / selectedPlan.max_users)
      : null;

  const diasLabel =
    selectedPlan?.dias && selectedPlan.dias > 0
      ? `${selectedPlan.dias} días`
      : "30 días";

  const features = groupData.keyFeatures ?? [];

  useEffect(() => {
    const updateDesktopRect = () => {
      if (!placeholderRef.current || !gridRef.current || !leftContentRef.current) return;

      const r = placeholderRef.current.getBoundingClientRect();
      const leftRect = leftContentRef.current.getBoundingClientRect();

      const headerEl = document.querySelector("header") as HTMLElement | null;
      const headerHeight = headerEl ? headerEl.getBoundingClientRect().height : 80;
      const topOffset = Math.round(headerHeight + 16); // gap para que no quede pegado al header

      if (desktopTopOffset !== topOffset) {
        setDesktopTopOffset(topOffset);
      }

      const measuredPanelHeight = desktopPanelRef.current
        ? desktopPanelRef.current.getBoundingClientRect().height
        : 0;
      // Fallback inicial para evitar dependencia circular antes del primer render del panel.
      const panelHeight = measuredPanelHeight > 0 ? measuredPanelHeight : Math.max(window.innerHeight * 0.62, 420);

      // Arranca alineado arriba con el bloque izquierdo, se fija al topOffset,
      // y termina alineado abajo al final del bloque izquierdo.
      const maxTop = leftRect.bottom - panelHeight;
      const dynamicTop = Math.min(Math.max(leftRect.top, topOffset), maxTop);

      const nextRect = {
        left: Math.round(r.left),
        width: Math.round(r.width),
        top: Math.round(dynamicTop),
      };

      const prevRect = lastRectRef.current;
      const changed =
        !prevRect ||
        prevRect.left !== nextRect.left ||
        prevRect.width !== nextRect.width ||
        prevRect.top !== nextRect.top;

      if (changed) {
        lastRectRef.current = nextRect;
        setDesktopRect(nextRect);
      }
    };

    const scheduleUpdate = () => {
      if (rafRef.current != null) return;
      rafRef.current = window.requestAnimationFrame(() => {
        rafRef.current = null;
        updateDesktopRect();
      });
    };

    updateDesktopRect();
    window.addEventListener("resize", scheduleUpdate);
    window.addEventListener("scroll", scheduleUpdate, { passive: true });

    const observer = new ResizeObserver(scheduleUpdate);
    if (placeholderRef.current) observer.observe(placeholderRef.current);
    if (gridRef.current) observer.observe(gridRef.current);
    if (leftContentRef.current) observer.observe(leftContentRef.current);

    return () => {
      window.removeEventListener("resize", scheduleUpdate);
      window.removeEventListener("scroll", scheduleUpdate);
      if (rafRef.current != null) {
        window.cancelAnimationFrame(rafRef.current);
      }
      observer.disconnect();
    };
  }, []);

  const SummaryContent = () => (
    <>
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-orange-500/10 rounded-full blur-[80px]" />
      </div>

      <div className="relative">
        <div className="inline-flex items-center gap-2 rounded px-3 py-1 text-[10px] font-mono uppercase tracking-widest bg-zinc-900 border border-zinc-800 text-orange-400 mb-8">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Resumen</span>
        </div>

        {selectedPlan ? (
          <>
            <div className="space-y-2 mb-8">
              <h3 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                {selectedPlan.max_users} cupos
              </h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                {selectedPlan.nombre} - reutilización automática durante {diasLabel}.
              </p>
            </div>

            <div className="space-y-8 z-10">
              <div className="relative">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">
                    Pago mensual
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl lg:text-6xl font-medium text-white tracking-tight">
                      ${selectedPlan.precio.toLocaleString("es-AR")}
                    </span>
                    <span className="text-sm text-zinc-500 font-mono">ARS</span>
                  </div>
                </div>

                {unitPrice != null && (
                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-zinc-800 pt-3">
                    <span className="text-xs text-zinc-500">Valor equivalente</span>
                    <span className="text-sm font-mono text-orange-400">
                      ${unitPrice.toLocaleString("es-AR")}/cupo
                    </span>
                  </div>
                )}
              </div>

              <ul className="space-y-4">
                {[
                  `${selectedPlan.max_users} cupos mensuales reutilizables`,
                  `Duración de suscripción: ${diasLabel}`,
                  "Reutilización automática de cupos",
                ].map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 shrink-0 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
                    <span className="text-sm text-zinc-300 font-light">{benefit}</span>
                  </li>
                ))}
              </ul>

              <div className="space-y-4 pt-4">
                <button
                  onClick={() => onConfirmarCompra(selectedPlan)}
                  className="w-full relative overflow-hidden group rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-zinc-950 font-bold px-4 py-3.5 transition-all active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Continuar al pago
                    <ChevronRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5 text-zinc-600" />
                <p className="text-[10px] font-mono tracking-wider text-zinc-600 uppercase text-center">
                  Pago cifrado y seguro
                </p>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/20">
            <Shield className="w-6 h-6 text-zinc-700 mx-auto mb-4" />
            <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest leading-relaxed">
              Esperando
              <br />
              selección
            </p>
          </div>
        )}
      </div>
    </>
  );

  return (
    <section className="py-10 sm:py-12">
      <div className="mx-auto max-w-6xl">
        {/* Header fuera del grid para que el resumen se alinee con los sliders */}
        <div className="mb-6">
          <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-orange-400 mb-3">
            Cupos mensuales
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight leading-tight mb-3">
            {groupData.title}
          </h1>
          <p className="text-sm text-zinc-400 leading-relaxed max-w-md">
            {groupData.mainDescription}
          </p>
        </div>

        <div
          ref={gridRef}
          className="grid gap-10 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px] items-start"
        >
          <div ref={leftContentRef} className="space-y-6">
            {/* Slider */}
            <div className="rounded-2xl p-5 sm:p-6 lg:p-8 bg-zinc-900/50 border border-zinc-700 shadow-sm hover:shadow-lg hover:border-zinc-600 transition-all">
              <div className="mb-6">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 mb-3">
                  Paso 1
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Cantidad de usuarios
                </h3>
                <p className="text-sm mt-1 text-zinc-400">
                  Desliza para seleccionar cuántos cupos mensuales necesitas para revender.
                </p>
              </div>
              <PlanSlider
                options={userOptions}
                value={selectedUsers}
                onChange={setSelectedUsers}
                formatLabel={(v) => `${v}`}
                unit="usuarios"
              />
            </div>

            {/* Key Features */}
            {features.length > 0 && (
              <div className="rounded-2xl p-5 sm:p-6 lg:p-8 bg-zinc-900/50 border border-zinc-700 shadow-sm hover:shadow-lg hover:border-zinc-600 transition-all">
                <div className="mb-6">
                  <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-orange-500/10 text-orange-400 mb-3">
                    Beneficios
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    ¿Qué incluye tu plan?
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {features.slice(0, 4).map((feature, idx) => (
                    <div
                      key={`feature-${idx}`}
                      className="rounded-2xl bg-zinc-900/50 border border-orange-500/15 hover:border-orange-500/25 p-4 transition-colors duration-200"
                    >
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-xl border shrink-0 bg-orange-500/10 border-orange-500/15 text-orange-300">
                          {getFeatureIcon(feature.icon)}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white leading-snug">
                            {feature.title}
                          </p>
                          <p className="mt-1 text-xs text-zinc-500 leading-snug">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Summary mobile */}
            <aside className="relative rounded-2xl p-6 sm:p-8 lg:hidden bg-zinc-950 border border-zinc-800 shadow-2xl mt-2">
              <SummaryContent />
            </aside>
          </div>

          {/* Placeholder desktop para conservar el ancho de la columna derecha */}
          <div
            ref={placeholderRef}
            className="hidden lg:block lg:w-[420px]"
            aria-hidden="true"
          />
        </div>

        {/* Panel desktop confinado al bloque de selección */}
        {desktopRect && (
          <div
            className="hidden lg:flex fixed flex-col z-[10000]"
            style={{
              left: desktopRect.left,
              width: desktopRect.width,
              top: desktopRect.top,
            }}
          >
            <div
              ref={desktopPanelRef}
              className="relative rounded-2xl p-6 sm:p-8 lg:p-10 bg-zinc-950 border border-zinc-800 shadow-2xl overflow-y-auto"
              style={{ maxHeight: `calc(100vh - ${desktopTopOffset}px)` }}
            >
              <SummaryContent />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
