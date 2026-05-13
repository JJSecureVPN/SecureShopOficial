import type { ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  Shield,
  Tag,
  User,
  Users,
  Zap,
} from "lucide-react";
import { DesktopCheckoutSummary } from "../components/DesktopCheckoutSummary";
import { MobileCheckoutSummary } from "../components/MobileCheckoutSummary";

interface CheckoutRenovacionViewProps {
  nombre: string;
  email: string;
  error: string;
  userLoggedIn?: boolean;
  processingPayment: boolean;
  mpFallbackVisible: boolean;
  ultimoLinkPago: string | null;
  renovacionId: number | null;
  mobileSummaryOpen: boolean;
  tipo: "cliente" | "revendedor";
  dias: number;
  precio: number;
  username: string;
  planNombre: string;
  connectionActual: number;
  connectionDestino: number;
  tipoRenovacion: "validity" | "credit";
  cantidadSeleccionada?: number;
  precioBase: number;
  descuentoFinal: number;
  codigoCupon?: string;
  hayCambioDispositivos: boolean;
  hayDescuento: boolean;
  precioPorDia: number;
  precioPorDiaBase: number;
  tituloResumen: string;
  subtituloResumen: string;
  operacion?: "renovacion" | "expansion";
  currentMaxUsers?: number;
  usuariosAAgregar?: number;
  onNombreChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onToggleMobileSummary: () => void;
  onFallbackPayment: () => void;
  onBack: () => void;
  saldoUsado?: number;
  codigoReferido?: string | null;
  descuentoReferido?: number;
  pagoConSaldoCompleto?: boolean;
  onPayWithSaldo?: () => void;
}

export const CheckoutRenovacionView = ({
  nombre,
  email,
  error,
  userLoggedIn = false,
  processingPayment,
  mpFallbackVisible,
  ultimoLinkPago,
  renovacionId,
  mobileSummaryOpen,
  tipo,
  dias,
  precio,
  username,
  planNombre,
  connectionActual,
  connectionDestino,
  tipoRenovacion,
  cantidadSeleccionada,
  precioBase,
  descuentoFinal,
  codigoCupon,
  hayCambioDispositivos,
  hayDescuento,
  precioPorDia,
  precioPorDiaBase,
  tituloResumen,
  subtituloResumen,
  operacion = "renovacion",
  currentMaxUsers = 0,
  usuariosAAgregar = 0,
  onNombreChange,
  onEmailChange,
  onToggleMobileSummary,
  onFallbackPayment,
  onBack,
  saldoUsado = 0,
  codigoReferido = null,
  descuentoReferido = 0,
  pagoConSaldoCompleto = false,
  onPayWithSaldo,
}: CheckoutRenovacionViewProps) => {
  const esExpansion = operacion === "expansion";

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
        totalLabel={`$${precio.toLocaleString("es-AR")}`}
        icon={<RefreshCw className="w-3.5 h-3.5 text-orange-400" />}
        onToggle={onToggleMobileSummary}
      >
        <MobilePlanCard
          title={tituloResumen}
          subtitle={`${dias} días · ${subtituloResumen}`}
          total={precio}
          subtotal={precioBase}
          discount={hayDescuento ? descuentoFinal : 0}
          codigoCupon={codigoCupon}
          saldoUsado={saldoUsado}
          codigoReferido={codigoReferido}
          descuentoReferido={descuentoReferido}
        />
      </MobileCheckoutSummary>

      <div className="lg:hidden h-[52px]" />

      {/* ── Form column (left side, scrollable) ── */}
      <div className="relative z-10 lg:w-[62%] xl:w-[65%] px-4 sm:px-6 lg:px-12 xl:px-20 pt-20 pb-8 lg:py-14">
        <div className="max-w-[600px] mx-auto lg:mx-0 lg:ml-auto">

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold tracking-widest uppercase">
                <RefreshCw className="w-3 h-3" />
                {esExpansion ? "Expansión" : "Renovación"}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 leading-tight">
              Completa tus datos
            </h1>
            <p className="text-sm text-zinc-500 leading-relaxed">
              {esExpansion
                ? "Confirmaremos la expansión de usuarios y te enviaremos el detalle al instante por email."
                : "Confirmaremos la renovación y te enviaremos el detalle final al instante por email."}
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

              {userLoggedIn ? (
                <div className="rounded-2xl bg-zinc-900/80 border border-white/[0.07] px-5 py-4">
                  <p className="text-sm text-zinc-200">Usaremos tu correo de sesión para enviarte la confirmación de la renovación.</p>
                </div>
              ) : (
                <FieldWrapper label="Correo electrónico">
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-900/80 border border-white/[0.07] text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 hover:border-white/[0.12] transition-all duration-200"
                      placeholder="tu@email.com"
                    />
                  </div>
                </FieldWrapper>
              )}
            </div>

            <div className="px-6 py-5 border-t border-white/[0.05]">
              <SectionLabel icon={<Clock className="w-3.5 h-3.5" />} label={esExpansion ? "Detalles de la expansión" : "Detalles de la renovación"} step="2" />
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3 mt-4">
                <DetailCard label="Usuario" value={username} helper={planNombre ? `Plan actual: ${planNombre}` : undefined} />
                {esExpansion && (
                  <DetailCard label="Cupos actuales" value={`${currentMaxUsers} cupos`} />
                )}
                {esExpansion ? (
                  <DetailCard label="Cupos a agregar" value={`+${usuariosAAgregar} cupos`} helper={`Total final: ${cantidadSeleccionada ?? 0} cupos`} />
                ) : (
                  <DetailCard label="Duración" value={`${dias} días`} helper={`${precioPorDia.toLocaleString("es-AR")} por día`} />
                )}
                {tipo === "cliente" ? (
                  <DetailCard label="Dispositivos" value={`${connectionDestino || connectionActual}`} helper={hayCambioDispositivos ? `Upgrade desde ${connectionActual}` : "Sin cambios"} />
                ) : (
                  <DetailCard label={esExpansion ? "Operación" : "Tipo"} value={esExpansion ? "Expansión de usuarios" : (tipoRenovacion === "credit" ? "Créditos" : "Validez")} helper={cantidadSeleccionada ? (esExpansion ? `${cantidadSeleccionada} cupos totales` : `Cantidad: ${cantidadSeleccionada}`) : undefined} />
                )}
              </div>

              {hayDescuento && (
                <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Tag className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-300">Descuento aplicado</p>
                      <p className="text-xs text-emerald-400/90">{codigoCupon ? `Cupón ${codigoCupon}` : "Precio promocional"}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">−${descuentoFinal.toLocaleString("es-AR")}</span>
                </div>
              )}

              {descuentoReferido > 0 && (
                <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-indigo-500/[0.07] border border-indigo-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center">
                      <Users className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-indigo-300">Descuento de referido</p>
                      <p className="text-xs text-indigo-400/90">Código: {codigoReferido}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-indigo-400 tabular-nums">−${descuentoReferido.toLocaleString("es-AR")}</span>
                </div>
              )}

              {saldoUsado > 0 && (
                <div className="flex items-center justify-between gap-3 px-4 py-3.5 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/20">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-emerald-300">Saldo utilizado</p>
                      <p className="text-xs text-emerald-400/90">Débito de tu wallet</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">−${saldoUsado.toLocaleString("es-AR")}</span>
                </div>
              )}
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

            {/* Mobile-only payment section */}
            <div className="lg:hidden border-t border-white/[0.05]">
              <div className="px-6 py-5 border-b border-white/[0.05]">
                <SectionLabel icon={<Shield className="w-3.5 h-3.5" />} label="Método de pago" step="3" />
              </div>
              <div className="px-6 py-6 space-y-4">
                <PaymentContent
                  pagoConSaldoCompleto={pagoConSaldoCompleto}
                  processingPayment={processingPayment}
                  mpFallbackVisible={mpFallbackVisible}
                  onPayWithSaldo={onPayWithSaldo}
                  onFallbackPayment={onFallbackPayment}
                  containerId="wallet_container_renovacion_mobile"
                />
              </div>
            </div>
          </motion.div>

          <div className="mt-8">
            <button
              onClick={onBack}
              className="inline-flex items-center gap-2 py-2.5 px-5 text-zinc-400 hover:text-zinc-200 text-sm font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver atrás
            </button>
          </div>
        </div>
      </div>

      {/* ── Desktop summary column (right side, fixed full-height) ── */}
      <DesktopCheckoutSummary>
        <div className="w-full space-y-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-bold uppercase tracking-widest mb-6">
              <RefreshCw className="w-3 h-3" />
              Resumen
            </span>
            <h2 className="text-4xl font-bold text-white tracking-tight mb-2">
              {tituloResumen}
            </h2>
            <p className="text-sm text-zinc-500 font-medium leading-relaxed">
              {subtituloResumen}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Total a pagar</p>
            <div className="flex items-baseline gap-2">
              <span className="text-6xl font-black text-white tracking-tighter">${precio.toLocaleString("es-AR")}</span>
              <span className="text-xs font-bold text-zinc-600 tracking-widest uppercase">ARS</span>
            </div>
          </div>

          <div className="space-y-4 py-8 border-y border-white/[0.05]">
            <BenefitItem text="Conservas tu configuración actual" />
            <BenefitItem text="Activación al instante tras el pago" />
            <BenefitItem text="Soporte humano garantizado" />
          </div>

          <div className="space-y-4 pt-2">
            <PaymentContent
              pagoConSaldoCompleto={pagoConSaldoCompleto}
              processingPayment={processingPayment}
              mpFallbackVisible={mpFallbackVisible}
              onPayWithSaldo={onPayWithSaldo}
              onFallbackPayment={onFallbackPayment}
              containerId="wallet_container_renovacion"
            />
            {renovacionId && <p className="text-[10px] text-zinc-600 text-center tracking-widest uppercase mt-4">ID: {renovacionId}</p>}
            {/* Use unused props in hidden div to satisfy TS */}
            <div className="hidden">{ultimoLinkPago}{precioPorDiaBase}</div>
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

const DetailCard = ({ label, value, helper }: { label: string; value: string; helper?: string }) => (
  <div className="rounded-xl bg-zinc-900/70 border border-white/[0.06] p-4">
    <p className="text-[11px] font-medium tracking-wide uppercase text-zinc-500 mb-1.5">{label}</p>
    <p className="text-sm font-semibold text-zinc-100 break-words">{value}</p>
    {helper && <p className="text-xs text-zinc-500 mt-1">{helper}</p>}
  </div>
);

const PaymentContent = ({
  pagoConSaldoCompleto,
  processingPayment,
  mpFallbackVisible,
  onPayWithSaldo,
  onFallbackPayment,
  containerId
}: {
  pagoConSaldoCompleto: boolean;
  processingPayment: boolean;
  mpFallbackVisible: boolean;
  onPayWithSaldo?: () => void;
  onFallbackPayment: () => void;
  containerId: string;
}) => (
  <div className="w-full space-y-4">
    {pagoConSaldoCompleto ? (
      <button
        onClick={onPayWithSaldo}
        disabled={processingPayment}
        className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl"
      >
        {processingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
        Confirmar con saldo
      </button>
    ) : (
      <>
        <div id={containerId} className="min-h-[54px]" />
        {mpFallbackVisible && (
          <button
            onClick={onFallbackPayment}
            disabled={processingPayment}
            className="w-full py-4 bg-white hover:bg-zinc-200 text-black font-bold text-sm rounded-xl transition-all flex items-center justify-center gap-2 uppercase tracking-widest shadow-xl"
          >
            {processingPayment ? <Loader2 className="w-4 h-4 animate-spin" /> : "Continuar al pago"}
          </button>
        )}
      </>
    )}
    <SecurityBadge />
  </div>
);

const MobilePlanCard = ({
  title,
  subtitle,
  total,
  subtotal,
  discount,
  codigoCupon,
  saldoUsado,
  codigoReferido,
  descuentoReferido,
}: {
  title: string;
  subtitle: string;
  total: number;
  subtotal: number;
  discount: number;
  codigoCupon?: string;
  saldoUsado?: number;
  codigoReferido?: string | null;
  descuentoReferido?: number;
}) => (
  <div className="space-y-3 pt-4">
    <div className="flex justify-between items-start gap-4">
      <div>
        <p className="font-semibold text-white text-base">{title}</p>
        <p className="text-xs text-zinc-500 mt-0.5">{subtitle}</p>
      </div>
      <div className="text-right">
        <p className="text-2xl font-black text-orange-400 tabular-nums">${total.toLocaleString("es-AR")}</p>
        {discount > 0 && <p className="text-xs text-zinc-500 line-through tabular-nums">${subtotal.toLocaleString("es-AR")}</p>}
      </div>
    </div>
    <div className="space-y-2">
      {discount > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Tag className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">
            {codigoCupon ? `Cupón ${codigoCupon}` : "Descuento"} · −${discount.toLocaleString("es-AR")}
          </span>
        </div>
      )}
      {descuentoReferido && descuentoReferido > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
          <Users className="w-3 h-3 text-indigo-400" />
          <span className="text-xs text-indigo-400 font-medium">
            Amigo: {codigoReferido} · −${descuentoReferido.toLocaleString("es-AR")}
          </span>
        </div>
      )}
      {saldoUsado && saldoUsado > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
          <Check className="w-3 h-3 text-emerald-400" />
          <span className="text-xs text-emerald-400 font-medium">
            Saldo Wallet · −${saldoUsado.toLocaleString("es-AR")}
          </span>
        </div>
      )}
    </div>
    <div className="flex items-center gap-4 text-[11px] text-zinc-600">
      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-orange-500/60" /> Aplicación inmediata</span>
    </div>
  </div>
);

const SecurityBadge = () => (
  <div className="flex items-center justify-center gap-2 pt-2">
    <Shield className="w-3.5 h-3.5 text-zinc-600" />
    <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Pago cifrado y seguro</span>
  </div>
);