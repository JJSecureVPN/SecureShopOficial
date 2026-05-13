import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Check,
  Gift,
  Loader2,
  Mail,
  Shield,
  ShoppingBag,
  Tag,
  User,
  Wallet,
  X,
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
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0c]">
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
    <div className="min-h-screen text-zinc-100 relative bg-[#111114]" style={{ fontFamily: "'Geist', system-ui, sans-serif" }}>

      {/* Subtle decorative SVGs (left column only) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0 lg:w-[62%] xl:w-[65%]">
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.3, x: 0 }}
          transition={{ duration: 2 }}
          className="absolute top-0 right-[2%] w-[250px] md:w-[400px] h-auto"
        >
          <img src="/lines-1-6ac7ba4c47562c61c5018028fd2b7a0e.svg" alt="" className="w-full h-auto opacity-50" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.2, y: 0 }}
          transition={{ duration: 3, delay: 0.5 }}
          className="absolute bottom-0 -left-[5%] w-[400px] md:w-[600px] h-auto"
        >
          <img src="/lines-4-4ea88270d73b7f6eaaa69e91aed97ddf.svg" alt="" className="w-full h-auto opacity-40" />
        </motion.div>
      </div>

      {/* ── Mobile summary bar ── */}
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

      {/* ── Form column (left, scrollable) ── */}
      <div className="relative z-10 lg:w-[62%] xl:w-[65%] px-4 sm:px-6 lg:px-12 xl:px-20 pt-20 pb-8 lg:py-14">
        <div className="max-w-[600px] mx-auto">

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold tracking-widest uppercase">
                <ShoppingBag className="w-3 h-3" />
                Plan VPN
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
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
            className="rounded-2xl border border-[#323644] bg-[#1e1f26] shadow-xl overflow-hidden"
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
                    className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900/80 border border-white/[0.07] text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 hover:border-white/[0.12] transition-all duration-200"
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
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border border-white/[0.07] text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 hover:border-white/[0.12] transition-all duration-200 ${
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
                    <p className="text-sm font-medium text-rose-300">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile-only payment */}
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

          <div className="mt-12 pt-8 border-t border-[#323644]/30">
            <button
              onClick={onBack}
              className="w-full py-4 px-6 bg-[#1e1f26] hover:bg-[#2a2b35] border border-[#323644] text-zinc-400 hover:text-zinc-100 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-[0.2em]"
            >
              <X className="w-4 h-4" />
              Cancelar y volver
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop summary (right, fixed full-height) ── */}
      <DesktopCheckoutSummary>
        <div className="w-full space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <ShoppingBag className="w-3 h-3" />
              Resumen
            </span>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-2">{plan.dias} días</h2>
            <p className="text-sm text-zinc-500 font-medium">
              Protección para {plan.connection_limit} {plan.connection_limit === 1 ? "dispositivo" : "dispositivos"} simultáneos.
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Pago único</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-white tracking-tighter">${totalFinal.toLocaleString("es-AR")}</span>
              <span className="text-xs font-bold text-zinc-600 tracking-widest uppercase">ARS</span>
            </div>
            {precioPorDia > 0 && (
              <p className="text-sm font-medium text-emerald-400 mt-2">
                Valor equivalente <span className="ml-1">${precioPorDia.toLocaleString("es-AR")}/día</span>
              </p>
            )}
          </div>

          <div className="space-y-4 py-8 border-y border-white/[0.05]">
            <BenefitItem text="Servidores premium en +15 países" />
            <BenefitItem text="Cambio de ubicaciones sin límites" />
            <BenefitItem text="Soporte humano 24/7" />
          </div>

          <div className="space-y-4 pt-2">
            <PaymentBlock
              containerId="wallet_container_planes"
              mpFallbackVisible={mpFallbackVisible}
              processingPayment={processingPayment}
              pagoConSaldoCompleto={pagoConSaldoCompleto}
              onFallbackPayment={onFallbackPayment}
            />
          </div>
        </div>
      </DesktopCheckoutSummary>
    </div>
  );
};

/* ── Helper components ── */

const BenefitItem = ({ text }: { text: string }) => (
  <div className="flex items-center gap-3">
    <div className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
    <span className="text-sm text-zinc-400">{text}</span>
  </div>
);

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

const PaymentBlock = ({ containerId, mpFallbackVisible, processingPayment, pagoConSaldoCompleto, onFallbackPayment }: { containerId: string; mpFallbackVisible: boolean; processingPayment: boolean; pagoConSaldoCompleto: boolean; onFallbackPayment: () => void }) => (
  <div className="w-full space-y-4">
    <div className={pagoConSaldoCompleto ? "hidden" : "block space-y-4"}>
      <div id={containerId} className="min-h-[54px]" />
      {mpFallbackVisible && (
        <button
          onClick={onFallbackPayment}
          disabled={processingPayment}
          className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl"
        >
          {processingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continuar al pago"}
          {!processingPayment && <X className="w-4 h-4 rotate-45" />} {/* Arrow replacement if needed, using X rotated */}
        </button>
      )}
    </div>
    
    {pagoConSaldoCompleto && (
      <button
        onClick={onFallbackPayment}
        disabled={processingPayment}
        className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl"
      >
        {processingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : "Pagar con mi saldo"}
        {!processingPayment && <X className="w-4 h-4 rotate-45" />}
      </button>
    )}

    <div className="flex items-center justify-center gap-2 pt-4">
      <Shield className="w-3.5 h-3.5 text-zinc-600" />
      <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Pago cifrado y seguro</span>
    </div>
  </div>
);

const MobilePlanCard = ({ plan, totalFinal, subtotal, descuentoAplicado, descuentoReferido, saldoUsado, cuponData, codigoReferido }: { plan: Plan; totalFinal: number; subtotal: number; descuentoAplicado: number; descuentoReferido: number; saldoUsado: number; cuponData: ValidacionCupon["cupon"] | null; codigoReferido: string | null }) => (
  <div className="space-y-3 pt-4">
    <div className="flex justify-between items-start gap-4">
      <div>
        <p className="font-semibold text-white text-base">{plan.nombre}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{plan.dias} días · {plan.connection_limit} dispositivos</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-orange-400 tabular-nums">${totalFinal.toLocaleString("es-AR")}</p>
        {(descuentoAplicado > 0 || descuentoReferido > 0 || saldoUsado > 0) && (
          <p className="text-xs text-zinc-500 line-through tabular-nums">${subtotal.toLocaleString("es-AR")}</p>
        )}
      </div>
    </div>
    {descuentoAplicado > 0 && <DiscountBadge icon={<Tag className="w-3 h-3 text-emerald-400" />} text={`Cupón ${cuponData?.codigo || "aplicado"} · −$${descuentoAplicado.toLocaleString("es-AR")}`} />}
    {descuentoReferido > 0 && <DiscountBadge icon={<Gift className="w-3 h-3 text-emerald-400" />} text={`${codigoReferido ? `Referido ${codigoReferido}` : "Descuento referido"} · −$${descuentoReferido.toLocaleString("es-AR")}`} />}
    {saldoUsado > 0 && <DiscountBadge icon={<Wallet className="w-3 h-3 text-emerald-400" />} text={`Saldo aplicado · −$${saldoUsado.toLocaleString("es-AR")}`} />}
  </div>
);

const DiscountBadge = ({ icon, text }: { icon: ReactNode; text: string }) => (
  <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
    {icon}
    <span className="text-xs text-emerald-400 font-medium">{text}</span>
  </div>
);