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
}

export const CheckoutRenovacionView = ({
  nombre,
  email,
  error,
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
}: CheckoutRenovacionViewProps) => {
  const esExpansion = operacion === "expansion";
  return (
    <div className="min-h-screen pt-16 text-zinc-100" style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}>
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
        />
      </MobileCheckoutSummary>

      {/* Spacer for fixed mobile summary bar */}
      <div className="lg:hidden h-[52px]" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 lg:py-0 lg:min-h-screen lg:flex lg:items-start mt-4 lg:mt-0">
        <div className="lg:flex-1 lg:pr-8 xl:pr-16 lg:pt-12 lg:pb-40 lg:max-w-[58%]">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-semibold tracking-widest uppercase">
                <RefreshCw className="w-3 h-3" />
                {esExpansion ? "Expansión" : "Renovación"}
              </span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold tracking-tight text-white mb-2 leading-none">
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
                    onChange={(event) => onEmailChange(event.target.value)}
                    className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-zinc-900/80 border border-white/[0.07] text-[15px] text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 hover:border-white/[0.12] transition-all duration-200"
                    placeholder="tu@email.com"
                  />
                </div>
                <p className="flex items-center gap-1.5 text-[11px] text-zinc-600 mt-2">
                  <Shield className="w-3 h-3 text-emerald-500/70" />
                  Te enviaremos la confirmación de la renovación a este correo.
                </p>
              </FieldWrapper>
            </div>

            <div className="px-6 py-5 border-t border-white/[0.05]">
              <SectionLabel icon={<Clock className="w-3.5 h-3.5" />} label={esExpansion ? "Detalles de la expansión" : "Detalles de la renovación"} step="2" />
            </div>

            <div className="px-6 pb-6 space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                <DetailCard label="Usuario" value={username} helper={planNombre ? `Plan actual: ${planNombre}` : undefined} />
                {esExpansion && (
                  <DetailCard
                    label="Cupos actuales"
                    value={`${currentMaxUsers} cupos`}
                  />
                )}
                {esExpansion ? (
                  <DetailCard
                    label="Cupos a agregar"
                    value={`+${usuariosAAgregar} cupos`}
                    helper={`Total final: ${cantidadSeleccionada ?? 0} cupos`}
                  />
                ) : (
                  <DetailCard label="Duración" value={`${dias} días`} helper={`${precioPorDia.toLocaleString("es-AR")} por día`} />
                )}
                {tipo === "cliente" ? (
                  <DetailCard
                    label="Dispositivos"
                    value={`${connectionDestino || connectionActual}`}
                    helper={hayCambioDispositivos ? `Upgrade desde ${connectionActual}` : "Sin cambios"}
                  />
                ) : (
                  <DetailCard
                    label={esExpansion ? "Operación" : "Tipo"}
                    value={esExpansion ? "Expansión de usuarios" : (tipoRenovacion === "credit" ? "Créditos" : "Validez")}
                    helper={cantidadSeleccionada ? (esExpansion ? `${cantidadSeleccionada} cupos totales` : `Cantidad: ${cantidadSeleccionada}`) : undefined}
                  />
                )}
                {!esExpansion && (
                  <DetailCard label="Operación" value={tipo === "revendedor" ? "Revendedor" : "Cliente"} helper={subtituloResumen} />
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
                      <p className="text-xs text-emerald-400/90">
                        {codigoCupon ? `Cupón ${codigoCupon}` : "Precio promocional"}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-emerald-400 tabular-nums">
                    −${descuentoFinal.toLocaleString("es-AR")}
                  </span>
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
                <div id="wallet_container_renovacion_mobile" className="min-h-[54px]" />
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
              Volver atrás
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
                        {esExpansion ? "Expansión" : "Renovación"}
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-white tracking-tight leading-tight">{tituloResumen}</h2>
                    <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {subtituloResumen}
                    </p>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                    <RefreshCw className="w-5 h-5 text-orange-400" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-white/[0.05]">
                  <FeaturePill icon={<Zap className="w-3 h-3" />} text="Aplicación inmediata" color="orange" />
                  <FeaturePill icon={<Shield className="w-3 h-3" />} text="Pago seguro SSL" color="emerald" />
                  {esExpansion ? (
                    <FeaturePill icon={<Users className="w-3 h-3" />} text="Sin tocar vencimiento" color="blue" />
                  ) : (
                    <FeaturePill icon={<Clock className="w-3 h-3" />} text={`${dias} días extra`} color="blue" />
                  )}
                  <FeaturePill
                    icon={<Check className="w-3 h-3" />}
                    text={tipo === "revendedor" ? "Proceso revendedor" : "Soporte incluido"}
                    color="violet"
                  />
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-white/[0.03] border border-white/[0.07] p-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500">Subtotal</span>
                <span className="text-zinc-300 font-medium tabular-nums">${precioBase.toLocaleString("es-AR")}</span>
              </div>

              {!esExpansion && (
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-500">Precio por día</span>
                  <div className="text-right">
                    <span className="text-zinc-300 font-medium tabular-nums">${precioPorDia.toLocaleString("es-AR")}</span>
                    {hayDescuento && (
                      <p className="text-[11px] text-zinc-500 line-through tabular-nums">${precioPorDiaBase.toLocaleString("es-AR")}</p>
                    )}
                  </div>
                </div>
              )}

              <AnimatePresence>
                {hayDescuento && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-emerald-400 flex items-center gap-1.5">
                        <Tag className="w-3 h-3" />
                        {codigoCupon || "Descuento"}
                      </span>
                      <span className="text-emerald-400 font-medium tabular-nums">−${descuentoFinal.toLocaleString("es-AR")}</span>
                    </div>
                    <div className="px-3 py-2 rounded-xl bg-emerald-500/[0.07] border border-emerald-500/15 flex items-center justify-between">
                      <span className="text-[11px] text-emerald-400">Ahorro total</span>
                      <span className="text-[11px] font-bold text-emerald-400 tabular-nums">${descuentoFinal.toLocaleString("es-AR")}</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex justify-between items-center pt-3 border-t border-white/[0.06]">
                <span className="text-sm font-semibold text-zinc-200">Total</span>
                <motion.span
                  key={precio}
                  initial={{ scale: 0.94, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  className="text-4xl font-black text-orange-400 tabular-nums tracking-tight"
                >
                  ${precio.toLocaleString("es-AR")}
                </motion.span>
              </div>
            </div>

            <div className="space-y-3">
              <div id="wallet_container_renovacion" className="min-h-[54px]" />
              {mpFallbackVisible && <FallbackButton loading={processingPayment} onClick={onFallbackPayment} />}
              <SecurityBadge />
              {renovacionId && <p className="text-[11px] text-zinc-600 text-center">ID de renovación: {renovacionId}</p>}
              {ultimoLinkPago && !mpFallbackVisible && (
                <p className="text-[11px] text-zinc-600 text-center">
                  Si el botón no responde, recarga la página o usa el método alternativo.
                </p>
              )}
            </div>
        </DesktopCheckoutSummary>
      </div>
    </div>
  );
};

const SectionLabel = ({ icon, label, step }: { icon: ReactNode; label: string; step: string }) => (
  <div className="flex items-center gap-2.5">
    <span className="w-5 h-5 rounded-full bg-orange-500/20 text-orange-400 text-[10px] font-bold flex items-center justify-center">{step}</span>
    <div className="flex items-center gap-1.5 text-zinc-300 text-sm font-medium">
      {icon}
      {label}
    </div>
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
  title,
  subtitle,
  total,
  subtotal,
  discount,
  codigoCupon,
}: {
  title: string;
  subtitle: string;
  total: number;
  subtotal: number;
  discount: number;
  codigoCupon?: string;
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
    {discount > 0 && (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
        <Tag className="w-3 h-3 text-emerald-400" />
        <span className="text-xs text-emerald-400 font-medium">
          {codigoCupon ? `Cupón ${codigoCupon}` : "Descuento"} · −${discount.toLocaleString("es-AR")}
        </span>
      </div>
    )}
    <div className="flex items-center gap-4 text-[11px] text-zinc-600">
      <span className="flex items-center gap-1"><Zap className="w-3 h-3 text-orange-500/60" /> Aplicación inmediata</span>
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
    {loading ? (
      <>
        <Loader2 className="w-4 h-4 animate-spin" />
        Procesando…
      </>
    ) : (
      "Pagar con Mercado Pago"
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