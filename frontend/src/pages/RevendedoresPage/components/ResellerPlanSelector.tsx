import { useState, useMemo } from "react";
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
import StickyLayout from "../../../components/StickyLayout";

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
  const userOptions = useMemo(() => {
    // Generar opciones de 10 en 10 hasta 100
    const baseOptions = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    const dbOptions = plans.map((p) => p.max_users);
    return [...new Set([...baseOptions, ...dbOptions])].sort((a, b) => a - b);
  }, [plans]);

  const [selectedUsers, setSelectedUsers] = useState<number>(5);

  const selectedPlan = useMemo((): PlanRevendedor | null => {
    const exactPlan = plans.find((p) => p.max_users === selectedUsers);
    if (exactPlan) return exactPlan;

    const calculatePrice = (users: number): number | null => {
      const pExact = plans.find((p) => p.max_users === users);
      if (pExact) return pExact.precio;

      if (users > 100) {
        const p100 = plans.find((p) => p.max_users === 100);
        if (!p100) return null;
        const subPrice = calculatePrice(users - 100);
        return subPrice ? p100.precio + subPrice : null;
      }

      const smaller = plans
        .filter((p) => p.max_users < users)
        .sort((a, b) => b.max_users - a.max_users);
      if (smaller.length > 0) {
        const base = smaller[0];
        const subPrice = calculatePrice(users - base.max_users);
        return subPrice ? base.precio + subPrice : null;
      }
      return null;
    };

    const calculatedPrice = calculatePrice(selectedUsers);
    if (calculatedPrice !== null) {
      return {
        id: 0,
        nombre: `Plan Personalizado ${selectedUsers} usuarios`,
        descripcion: `${selectedUsers} cupos mensuales reutilizables`,
        precio: calculatedPrice,
        max_users: selectedUsers,
        account_type: "validity",
        dias: 30,
        activo: true,
      };
    }

    return null;
  }, [plans, selectedUsers]);

  const unitPrice =
    selectedPlan && selectedPlan.max_users > 0
      ? Math.round(selectedPlan.precio / selectedPlan.max_users)
      : null;

  const diasLabel =
    selectedPlan?.dias && selectedPlan.dias > 0 ? `${selectedPlan.dias} días` : "30 días";

  const features = groupData.keyFeatures ?? [];

  const SummaryContent = () => (
    <div className="relative font-title h-full flex flex-col p-8 sm:p-10 bg-[#060606] border border-zinc-800 rounded-3xl shadow-2xl">
      <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full w-fit mb-8">
        <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
          Resumen de plan
        </span>
      </div>

      {selectedPlan ? (
        <div className="flex-1 flex flex-col">
          <div className="mb-10">
            <h3 className="text-4xl lg:text-5xl font-black text-white tracking-tight mb-2">
              {selectedPlan.max_users} cupos.
            </h3>
            <p className="text-sm font-bold text-zinc-500 uppercase tracking-widest">
              {selectedPlan.nombre.split(' ')[0]} • {diasLabel}
            </p>
          </div>

          <div className="space-y-8 flex-1">
            <div className="p-6 bg-[#131417] border border-zinc-800/80 rounded-2xl">
              <div className="space-y-1 mb-4">
                <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Inversión Mensual</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-white tracking-tighter">
                    ${selectedPlan.precio.toLocaleString("es-AR")}
                  </span>
                  <span className="text-xs font-bold text-zinc-600 uppercase">ARS</span>
                </div>
              </div>

              {unitPrice != null && (
                <div className="pt-4 border-t border-zinc-800/50 flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Valor / Cupo</span>
                  <span className="text-sm font-mono font-bold text-[#00ffc8]">
                    ${unitPrice.toLocaleString("es-AR")}
                  </span>
                </div>
              )}
            </div>

            <ul className="space-y-4">
              {[
                "Reutilización automática de cupos",
                "Panel de control avanzado",
                "Soporte prioritario 24/7",
              ].map((benefit, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-tighter">{benefit}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-10 space-y-4">
            <button
              onClick={() => onConfirmarCompra(selectedPlan)}
              className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
            >
              CONTINUAR AL PAGO
              <ChevronRight className="w-4 h-4" />
            </button>
            
            <div className="flex items-center justify-center gap-2">
              <Shield className="w-3.5 h-3.5 text-zinc-700" />
              <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-widest">
                Seguridad de grado militar
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800/50 rounded-3xl p-12 text-center">
          <Shield className="w-8 h-8 text-zinc-800 mb-4" />
          <p className="text-xs font-bold text-zinc-700 uppercase tracking-[0.2em] leading-relaxed">
            Selecciona una<br />configuración
          </p>
        </div>
      )}
    </div>
  );

  return (
    <section className="py-12 font-title">
      <div className="mx-auto max-w-6xl px-4">
        {/* Header */}
        <div className="mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00ffc8]" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Business Intelligence
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            {groupData.title}.
          </h2>
          <p className="text-base text-zinc-500 font-medium leading-relaxed max-w-xl">
            {groupData.mainDescription}
          </p>
        </div>

        <StickyLayout
          aside={<div className="hidden lg:block h-full"><SummaryContent /></div>}
        >
          <div className="space-y-8">
            {/* Step 1: Selector */}
              <div className="p-8 md:p-10 bg-[#1e1f26] border border-[#323644] rounded-3xl shadow-xl">
              <div className="mb-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                    <Users className="w-4 h-4 text-zinc-500" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Paso 01</span>
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                  Cantidad de usuarios.
                </h3>
                <p className="text-sm font-medium text-zinc-500">
                  Desliza para definir tu inventario de cupos.
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
            
            {/* Mobile Summary: visible only on small screens, between Step 1 and Benefits */}
            <div className="lg:hidden">
              <SummaryContent />
            </div>

            {/* Step 2: Benefits */}
            {features.length > 0 && (
              <div className="p-8 md:p-10 bg-[#1e1f26] border border-[#323644] rounded-3xl shadow-xl">
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center">
                      <Sparkles className="w-4 h-4 text-zinc-500" />
                    </div>
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Beneficios</span>
                  </div>
                  <h3 className="text-2xl font-black text-white tracking-tight mb-2">
                    Potencia tu negocio.
                  </h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {features.slice(0, 4).map((feature, idx) => (
                    <div
                      key={`feature-${idx}`}
                      className="group p-6 bg-[#0d0d0f] border border-zinc-800/50 hover:border-zinc-700 rounded-2xl transition-all duration-300 shadow-sm"
                    >
                      <div className="flex items-start gap-4">
                        <div className="p-2.5 rounded-xl border bg-white/5 border-white/10 text-zinc-500 group-hover:text-[#00ffc8] transition-colors">
                          {getFeatureIcon(feature.icon)}
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase tracking-tight">
                            {feature.title}
                          </p>
                          <p className="mt-1 text-[11px] font-bold text-zinc-600 uppercase tracking-widest leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </StickyLayout>
      </div>
    </section>
  );
}
