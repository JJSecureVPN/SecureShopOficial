import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Gift,
  Loader2,
  Mail,
  Shield,
  ShoppingBag,
  Tag,
  User,
  Users,
  Wallet,
  Zap,
} from "lucide-react";
import CuponInput from "../../../components/CuponInput";
import type { Plan } from "../../../types";
import type { ValidacionCupon } from "../../../services/api.service";
import { DesktopCheckoutSummary } from "../components/DesktopCheckoutSummary";
import { MobileCheckoutSummary } from "../components/MobileCheckoutSummary";
import { SaldoReferidoSection } from "../components/SaldoReferidoSection";

interface CheckoutPlanesViewProps {
  plan: Plan | null;
  nombre: string;
  email: string;
  userEmailLocked: boolean;
  error: string;
  processingPayment: boolean;
  mpFallbackVisible: boolean;
  mobileSummaryOpen: boolean;
  cuponData: ValidacionCupon["cupon"] | null;
  descuentoAplicado: number;
  saldoUsado: number;
  codigoReferido: string | null;
  descuentoReferido: number;
  pagoConSaldoCompleto: boolean;
  onNombreChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onToggleMobileSummary: () => void;
  onFallbackPayment: () => void;
  onBack: () => void;
  onCuponValidado: (descuento: number, cupon: ValidacionCupon["cupon"]) => void;
  onCuponRemovido: () => void;
  onSaldoChange: (saldoUsado: number, montoAPagar: number) => void;
  onReferidoChange: (codigo: string | null, descuento: number) => void;
}

export const CheckoutPlanesView = ({
  plan,
  nombre,
  email,
  userEmailLocked,
  error,
  processingPayment,
  mpFallbackVisible,
  mobileSummaryOpen,
  cuponData,
  descuentoAplicado,
  saldoUsado,
  codigoReferido,
  descuentoReferido,
  pagoConSaldoCompleto,
  onNombreChange,
  onEmailChange,
  onToggleMobileSummary,
  onFallbackPayment,
  onBack,
  onCuponValidado,
  onCuponRemovido,
  onSaldoChange,
  onReferidoChange,
}: CheckoutPlanesViewProps) => {
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

  const subtotal = plan.precio;
  const totalDescuentos = descuentoAplicado + descuentoReferido;
  const subtotalConDescuentos = Math.max(0, subtotal - totalDescuentos);
  const totalFinal = Math.max(0, subtotalConDescuentos - saldoUsado);
  const precioPorDia = plan.dias > 0 ? Math.round(totalFinal / plan.dias) : 0;

  return (
    <div className="min-h-screen pt-16 text-zinc-100" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
      <MobileCheckoutSummary
        isOpen={mobileSummaryOpen}
        totalLabel={`$${totalFinal.toLocaleString("es-AR")}`}
        icon={<ShoppingBag className="w-3.5 h-3.5 text-orange-400" />}
        onToggle={onToggleMobileSummary}
      >
        <MobilePlanCard
          plan={plan}
          totalFinal={totalFinal}
          subtotal={subtotal}
          descuentoAplicado={descuentoAplicado}
          descuentoReferido={descuentoReferido}
          saldoUsado={saldoUsado}
          cuponData={cuponData}
          codigoReferido={codigoReferido}
        />
      </MobileCheckoutSummary>

      {/* Spacer for fixed mobile summary bar */}
      <div className="lg:hidden h-[52px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-0 lg:min-h-screen lg:flex mt-4 lg:mt-0">
        <div className="lg:flex-1 lg:pr-8 xl:pr-16 lg:py-12 lg:max-w-[58%]">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold tracking-widest uppercase">
                <ShoppingBag className="w-3 h-3" />
                Plan VPN
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 leading-none">
              Completa tus datos
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              Confirmamos el pago al instante y enviamos tus credenciales VPN al correo indicado.
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
                    type="text"
                    value={nombre}
                    onChange={(event) => onNombreChange(event.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.07] text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 hover:border-white/[0.12] transition-all duration-200"
                    placeholder="Juan Pérez"
                  />
                </div>
              </FieldWrapper>

              <FieldWrapper label="Correo electrónico">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                  <input
                    type="email"
                    value={email}
                    readOnly={userEmailLocked}
                    onChange={(event) => onEmailChange(event.target.value)}
                    className={`w-full pl-11 pr-11 py-3.5 rounded-xl border border-white/[0.07] text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 hover:border-white/[0.12] transition-all duration-200 ${
                      userEmailLocked ? "bg-zinc-800/90 cursor-not-allowed" : "bg-zinc-900/80"
                    }`}
                    placeholder="tu@email.com"
                  />
                  {userEmailLocked && (
                    <Check className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-400" />
                  )}
                </div>
                <p className="flex items-center gap-1.5 text-[11px] text-zinc-600 mt-2">
                  <Shield className="w-3 h-3 text-emerald-500/70" />
                  Recibirás las credenciales y el detalle del pago en este correo.
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
                clienteEmail={email}
              />
            </div>

            <div className="px-6 py-5 border-t border-white/[0.05]">
              <SectionLabel icon={<Gift className="w-3.5 h-3.5" />} label="Saldo y referido" step="3" optional />
            </div>
            <div className="px-6 pb-6">
              <SaldoReferidoSection
                userEmail={email}
                precioTotal={subtotalConDescuentos}
                onSaldoChange={onSaldoChange}
                onReferidoChange={onReferidoChange}
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
                <SectionLabel icon={<Shield className="w-3.5 h-3.5" />} label="Método de pago" step="4" />
              </div>
              <div className="px-6 py-6 space-y-4">
                <PaymentBlock
                  containerId="wallet_container_planes_mobile"
                  mpFallbackVisible={mpFallbackVisible}
                  processingPayment={processingPayment}
                  pagoConSaldoCompleto={pagoConSaldoCompleto}
                  onFallbackPayment={onFallbackPayment}
                />
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
                        Seleccionado
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight leading-tight">{plan.nombre}</h2>
                    <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {plan.dias} días de acceso
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <ShoppingBag className="w-5 h-5 text-orange-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/[0.05]">
                  <FeaturePill icon={<Users className="w-3 h-3" />} text={`${plan.connection_limit} dispositivos`} color="orange" />
                  <FeaturePill icon={<Zap className="w-3 h-3" />} text="Velocidad alta" color="emerald" />
                  <FeaturePill icon={<Shield className="w-3 h-3" />} text="Pago seguro SSL" color="blue" />
                  <FeaturePill icon={<Check className="w-3 h-3" />} text="Soporte incluido" color="violet" />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5 space-y-3">
              <PriceLine label="Subtotal" value={`$${subtotal.toLocaleString("es-AR")}`} />

              <AnimatePresence>
                {descuentoAplicado > 0 && (
                  <AnimatedLine key="coupon-line">
                    <PriceLine
                      label={cuponData?.codigo ? `Cupón ${cuponData.codigo}` : "Descuento"}
                      value={`−$${descuentoAplicado.toLocaleString("es-AR")}`}
                      accent="emerald"
                      icon={<Tag className="w-3 h-3" />}
                    />
                  </AnimatedLine>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {descuentoReferido > 0 && (
                  <AnimatedLine key="referral-line">
                    <PriceLine
                      label={codigoReferido ? `Referido ${codigoReferido}` : "Descuento referido"}
                      value={`−$${descuentoReferido.toLocaleString("es-AR")}`}
                      accent="emerald"
                      icon={<Gift className="w-3 h-3" />}
                    />
                  </AnimatedLine>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {saldoUsado > 0 && (
                  <AnimatedLine key="balance-line">
                    <PriceLine
                      label="Saldo aplicado"
                      value={`−$${saldoUsado.toLocaleString("es-AR")}`}
                      accent="emerald"
                      icon={<Wallet className="w-3 h-3" />}
                    />
                  </AnimatedLine>
                )}
              </AnimatePresence>

              {totalDescuentos + saldoUsado > 0 && (
                <div className="px-3 py-2 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/15 flex items-center justify-between">
                  <span className="text-[11px] text-emerald-400">Ahorro total</span>
                  <span className="text-[11px] font-bold text-emerald-400 tabular-nums">
                    ${Math.max(0, totalDescuentos + saldoUsado).toLocaleString("es-AR")}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-sm pt-1">
                <span className="text-zinc-500">Precio por día</span>
                <span className="text-zinc-300 font-medium tabular-nums">${precioPorDia.toLocaleString("es-AR")}</span>
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-white/[0.06]">
                <span className="text-sm font-semibold text-zinc-200">Total</span>
                <motion.span
                  key={totalFinal}
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="text-4xl font-black text-orange-400 tabular-nums tracking-tight"
                >
                  ${totalFinal.toLocaleString("es-AR")}
                </motion.span>
              </div>
            </div>

            <div className="space-y-3">
              <PaymentBlock
                containerId="wallet_container_planes"
                mpFallbackVisible={mpFallbackVisible}
                processingPayment={processingPayment}
                pagoConSaldoCompleto={pagoConSaldoCompleto}
                onFallbackPayment={onFallbackPayment}
              />
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

const AnimatedLine = ({ children }: { children: ReactNode }) => (
  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
    {children}
  </motion.div>
);

const PriceLine = ({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: "emerald";
}) => (
  <div className="flex justify-between items-center text-sm gap-3">
    <span className={`flex items-center gap-1.5 ${accent === "emerald" ? "text-emerald-400" : "text-zinc-500"}`}>
      {icon}
      {label}
    </span>
    <span className={`font-medium tabular-nums ${accent === "emerald" ? "text-emerald-400" : "text-zinc-300"}`}>{value}</span>
  </div>
);

const PaymentBlock = ({
  containerId,
  mpFallbackVisible,
  processingPayment,
  pagoConSaldoCompleto,
  onFallbackPayment,
}: {
  containerId: string;
  mpFallbackVisible: boolean;
  processingPayment: boolean;
  pagoConSaldoCompleto: boolean;
  onFallbackPayment: () => void;
}) => (
  <>
    <div className={pagoConSaldoCompleto ? "hidden" : "block space-y-3"}>
      <div id={containerId} className="min-h-[54px]" />
      {mpFallbackVisible && <FallbackButton loading={processingPayment} onClick={onFallbackPayment} label="Pagar con Mercado Pago" />}
    </div>
    {pagoConSaldoCompleto && <FallbackButton loading={processingPayment} onClick={onFallbackPayment} label="Pagar con mi saldo" emerald />}
    <SecurityBadge />
  </>
);

const MobilePlanCard = ({
  plan,
  totalFinal,
  subtotal,
  descuentoAplicado,
  descuentoReferido,
  saldoUsado,
  cuponData,
  codigoReferido,
}: {
  plan: Plan;
  totalFinal: number;
  subtotal: number;
  descuentoAplicado: number;
  descuentoReferido: number;
  saldoUsado: number;
  cuponData: ValidacionCupon["cupon"] | null;
  codigoReferido: string | null;
}) => (
  <div className="space-y-3 pt-4">
    <div className="flex justify-between items-start gap-4">
      <div>
        <p className="font-semibold text-white text-base">{plan.nombre}</p>
        <p className="text-xs text-zinc-500 mt-0.5">
          {plan.dias} días · {plan.connection_limit} dispositivos
        </p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-orange-400 tabular-nums">${totalFinal.toLocaleString("es-AR")}</p>
        {(descuentoAplicado > 0 || descuentoReferido > 0 || saldoUsado > 0) && (
          <p className="text-xs text-zinc-500 line-through tabular-nums">${subtotal.toLocaleString("es-AR")}</p>
        )}
      </div>
    </div>
    {descuentoAplicado > 0 && (
      <DiscountBadge icon={<Tag className="w-3 h-3 text-emerald-400" />} text={`Cupón ${cuponData?.codigo || "aplicado"} · −$${descuentoAplicado.toLocaleString("es-AR")}`} />
    )}
    {descuentoReferido > 0 && (
      <DiscountBadge icon={<Gift className="w-3 h-3 text-emerald-400" />} text={`${codigoReferido ? `Referido ${codigoReferido}` : "Descuento referido"} · −$${descuentoReferido.toLocaleString("es-AR")}`} />
    )}
    {saldoUsado > 0 && (
      <DiscountBadge icon={<Wallet className="w-3 h-3 text-emerald-400" />} text={`Saldo aplicado · −$${saldoUsado.toLocaleString("es-AR")}`} />
    )}
  </div>
);

const DiscountBadge = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
    {icon}
    <span className="text-xs text-emerald-400 font-medium">{text}</span>
  </div>
);

const FallbackButton = ({
  loading,
  onClick,
  label,
  emerald,
}: {
  loading: boolean;
  onClick: () => void;
  label: string;
  emerald?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={loading}
    className={`w-full py-3.5 font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg ${
      emerald
        ? "bg-emerald-500 hover:bg-emerald-400 text-white shadow-emerald-500/20 disabled:bg-zinc-800 disabled:text-zinc-500"
        : "bg-orange-500 hover:bg-orange-400 text-white shadow-orange-500/20 disabled:bg-zinc-800 disabled:text-zinc-500"
    }`}
  >
    {loading ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Procesando…
      </>
    ) : (
      label
    )}
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