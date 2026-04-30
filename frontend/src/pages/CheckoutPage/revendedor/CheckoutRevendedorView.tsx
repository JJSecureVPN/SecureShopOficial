import type { ReactNode, RefObject } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  Mail,
  Shield,
  ShoppingBag,
  Tag,
  User,
  Users,
  Zap,
} from "lucide-react";
import CuponInput from "../../../components/CuponInput";
import type { PlanRevendedor } from "../../../types";
import type { ValidacionCupon } from "../../../services/api.service";
import { DesktopCheckoutSummary } from "../components/DesktopCheckoutSummary";
import { MobileCheckoutSummary } from "../components/MobileCheckoutSummary";

interface CheckoutRevendedorViewProps {
  plan: PlanRevendedor | null;
  error: string;
  cuponData: ValidacionCupon["cupon"] | null;
  descuentoAplicado: number;
  mpFallbackVisible: boolean;
  processingPayment: boolean;
  mobileSummaryOpen: boolean;
  nombreInputRef: RefObject<HTMLInputElement>;
  emailInputRef: RefObject<HTMLInputElement>;
  onToggleMobileSummary: () => void;
  onFallbackPayment: () => void;
  onBack: () => void;
  onCuponValidado: (descuento: number, cupon: ValidacionCupon["cupon"]) => void;
  onCuponRemovido: () => void;
}

export const CheckoutRevendedorView = ({
  plan,
  error,
  cuponData,
  descuentoAplicado,
  mpFallbackVisible,
  processingPayment,
  mobileSummaryOpen,
  nombreInputRef,
  emailInputRef,
  onToggleMobileSummary,
  onFallbackPayment,
  onBack,
  onCuponValidado,
  onCuponRemovido,
}: CheckoutRevendedorViewProps) => {
  if (!plan) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/10 flex items-center justify-center mx-auto">
            <ShoppingBag className="w-5 h-5 text-orange-500 animate-pulse" />
          </div>
          <p className="text-sm text-zinc-500 tracking-wide">Cargando plan…</p>
        </div>
      </div>
    );
  }

  const precioFinal = plan.precio - descuentoAplicado;
  const isCredit = plan.account_type === "credit";

  return (
    <div className="min-h-screen pt-16 text-zinc-100" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <MobileCheckoutSummary
        isOpen={mobileSummaryOpen}
        totalLabel={`$${precioFinal.toLocaleString("es-AR")}`}
        icon={<ShoppingBag className="w-3.5 h-3.5 text-orange-400" />}
        onToggle={onToggleMobileSummary}
      >
        <MobilePlanCard
          plan={plan}
          precioFinal={precioFinal}
          descuentoAplicado={descuentoAplicado}
          cuponData={cuponData}
        />
      </MobileCheckoutSummary>

      {/* Spacer for fixed mobile summary bar */}
      <div className="lg:hidden h-[52px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-0 lg:min-h-screen lg:flex lg:items-start mt-4 lg:mt-0">
        <div className="lg:flex-1 lg:pr-8 xl:pr-16 lg:pt-12 lg:pb-40 lg:max-w-[58%]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold tracking-widest uppercase">
                <Users className="w-3 h-3" />
                Plan Revendedor
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 leading-none">
              Completa tus datos
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Recibirás las credenciales de acceso en tu email al instante tras el pago.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.08 }}
            className="rounded-2xl border border-white/[0.07] bg-white/[0.03] overflow-hidden"
          >
            <div className="px-6 py-5 border-b border-white/[0.05]">
              <SectionLabel icon={<User className="w-3.5 h-3.5" />} label="Información de contacto" step="1" />
            </div>

            <div className="px-6 py-6 space-y-5">
              <FieldWrapper label="Nombre completo">
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    ref={nombreInputRef}
                    type="text"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.07] text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 hover:border-white/[0.12] transition-all duration-200"
                    placeholder="Juan Pérez"
                  />
                </div>
              </FieldWrapper>

              <FieldWrapper label="Correo electrónico">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    ref={emailInputRef}
                    type="email"
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.07] text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 hover:border-white/[0.12] transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                </div>
                <p className="flex items-center gap-1.5 text-[11px] text-zinc-600 mt-2">
                  <Shield className="w-3 h-3 text-emerald-500/70" />
                  Activación automática · menos de 60 segundos
                </p>
              </FieldWrapper>
            </div>

            <div className="px-6 py-5 border-t border-white/[0.05]">
              <SectionLabel icon={<Tag className="w-3.5 h-3.5" />} label="Código de descuento" step="2" optional />
            </div>
            <div className="px-6 pb-6">
              <CuponInput
                planId={plan.id}
                precioPlan={plan.precio}
                onCuponValidado={onCuponValidado}
                onCuponRemovido={onCuponRemovido}
                cuponActual={cuponData}
                descuentoActual={descuentoAplicado}
              />
            </div>

            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mx-6 mb-6"
                >
                  <div className="flex items-start gap-3 px-4 py-3.5 rounded-xl bg-rose-500/[0.07] border border-rose-500/20">
                    <AlertCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-rose-300">{error}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="lg:hidden border-t border-white/[0.05]">
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <SectionLabel icon={<Shield className="w-3.5 h-3.5" />} label="Método de pago" step="3" />
              </div>
              <div className="px-6 py-6 space-y-4">
                <div id="wallet_container_revendedor_mobile" className="min-h-[54px]" />
                {mpFallbackVisible && <FallbackButton loading={processingPayment} onClick={onFallbackPayment} />}
                <SecurityBadge />
              </div>
            </div>
          </motion.div>

          <div className="mt-6 lg:mt-10">
            <button
              onClick={onBack}
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 bg-zinc-700 hover:bg-zinc-600 text-zinc-100 text-sm font-semibold rounded-xl transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver a planes
            </button>
          </div>
        </div>

        <DesktopCheckoutSummary>
            <div className="space-y-4">
              <p className="text-[11px] font-semibold tracking-widest text-zinc-600 uppercase">Resumen del pedido</p>

              <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold tracking-wide uppercase">
                        <Check className="w-2.5 h-2.5" />
                        Revendedor
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight leading-tight">{plan.nombre}</h2>
                    <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {isCredit ? `${plan.max_users} créditos` : `${plan.max_users} usuarios`}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-orange-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/[0.05]">
                  <FeaturePill icon={<Zap className="w-3 h-3" />} text="Aplicación inmediata" color="orange" />
                  <FeaturePill icon={<Shield className="w-3 h-3" />} text="Pago seguro SSL" color="emerald" />
                  <FeaturePill icon={<Clock className="w-3 h-3" />} text={isCredit ? "Sin vencimiento" : "30 días de acceso"} color="blue" />
                  <FeaturePill icon={<Check className="w-3 h-3" />} text="Proceso revendedor" color="violet" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-300 font-medium tabular-nums">${plan.precio.toLocaleString("es-AR")}</span>
              </div>

              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Tipo</span>
                <span className="text-zinc-300 font-medium">{isCredit ? "Créditos" : "Usuarios"}</span>
              </div>

              <AnimatePresence>
                {descuentoAplicado > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <Tag className="w-3 h-3" />
                        {cuponData?.codigo}
                      </span>
                      <span className="text-emerald-400 font-medium tabular-nums">−${descuentoAplicado.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/15 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400">Ahorro total</span>
                      <span className="text-[11px] font-bold text-emerald-400 tabular-nums">${descuentoAplicado.toLocaleString("es-AR")}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center pt-3 border-t border-white/[0.06]">
                <span className="text-sm font-semibold text-zinc-200">Total</span>
                <motion.span
                  key={precioFinal}
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="text-4xl font-black text-orange-400 tabular-nums tracking-tight"
                >
                  ${precioFinal.toLocaleString("es-AR")}
                </motion.span>
              </div>
            </div>

            <div className="space-y-3">
              <div id="wallet_container_revendedor" className="min-h-[54px]" />
              {mpFallbackVisible && <FallbackButton loading={processingPayment} onClick={onFallbackPayment} />}
              <SecurityBadge />
            </div>
        </DesktopCheckoutSummary>
      </div>
    </div>
  );
};

const SectionLabel = ({ icon, label, step, optional }: { icon: ReactNode; label: string; step: string; optional?: boolean }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold flex items-center justify-center">{step}</span>
      <div className="flex items-center gap-1.5 text-zinc-300 text-sm font-medium">
        {icon}
        {label}
      </div>
    </div>
    {optional && <span className="text-[11px] text-zinc-600 bg-zinc-800 px-2 py-0.5 rounded-full">Opcional</span>}
  </div>
);

const FieldWrapper = ({ label, children }: { label: string; children: ReactNode }) => (
  <div>
    <label className="block text-xs font-medium text-zinc-500 mb-2 tracking-wide">{label}</label>
    {children}
  </div>
);

const FeaturePill = ({ icon, text, color }: { icon: ReactNode; text: string; color: "orange" | "emerald" | "blue" | "violet" }) => {
  const colors = {
    orange: "text-orange-400 bg-orange-500/10",
    emerald: "text-emerald-400 bg-emerald-500/10",
    blue: "text-blue-400 bg-blue-500/10",
    violet: "text-violet-400 bg-violet-500/10",
  };

  return (
    <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg ${colors[color]} text-[11px] font-medium`}>
      {icon}
      <span>{text}</span>
    </div>
  );
};

const MobilePlanCard = ({
  plan,
  precioFinal,
  descuentoAplicado,
  cuponData,
}: {
  plan: PlanRevendedor;
  precioFinal: number;
  descuentoAplicado: number;
  cuponData: ValidacionCupon["cupon"] | null;
}) => (
  <div className="space-y-3 pt-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="font-semibold text-white text-base">{plan.nombre}</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {plan.account_type === "credit" ? `${plan.max_users} créditos` : `${plan.max_users} usuarios · 30 días`}
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-orange-400 tabular-nums">${precioFinal.toLocaleString("es-AR")}</p>
        {descuentoAplicado > 0 && (
          <p className="text-xs text-zinc-500 line-through tabular-nums">${plan.precio.toLocaleString("es-AR")}</p>
        )}
      </div>
    </div>
    {descuentoAplicado > 0 && (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <Tag className="w-3 h-3 text-emerald-400" />
        <span className="text-xs text-emerald-400 font-medium">Cupón {cuponData?.codigo} · −${descuentoAplicado.toLocaleString("es-AR")}</span>
      </div>
    )}
    <div className="flex items-center gap-4 text-[11px] text-zinc-600">
      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-orange-500/60" /> Activación inmediata</span>
      <span className="flex items-center gap-1"><Shield className="w-3 h-3 text-emerald-500/60" /> Pago seguro</span>
    </div>
  </div>
);

const FallbackButton = ({ loading, onClick }: { loading: boolean; onClick: () => void }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full py-3.5 bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 text-white disabled:text-zinc-500 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20"
  >
    {loading ? <><Loader2 className="w-4 h-4 animate-spin" />Procesando…</> : "Pagar con Mercado Pago"}
  </button>
);

const SecurityBadge = () => (
  <div className="flex items-center gap-3 py-3 px-4 rounded-xl border border-white/[0.05] bg-white/[0.02]">
    <Shield className="w-4 h-4 text-zinc-600 flex-shrink-0" />
    <p className="text-[11px] text-zinc-600 leading-tight">
      <span className="text-zinc-500 font-medium">Pago 100% seguro</span> · Procesado por Mercado Pago · SSL encriptado
    </p>
  </div>
);