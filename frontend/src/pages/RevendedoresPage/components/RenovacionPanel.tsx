import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CreditCard,
  Loader2,
  Mail,
  Search,
  User,
  ChevronRight,
} from "lucide-react";
import CuponInput from "../../../components/CuponInput";
import { Button } from "../../../components/Button";
import { SmallText } from "../../../components/Typography";
import { ValidacionCupon } from "../../../services/api.service";
import { PlanRevendedor } from "../../../types";
import { DIAS_POR_CREDITOS } from "../constants";
import { PasoRenovacion, RevendedorEncontrado } from "../types";

type CuponAplicado = NonNullable<ValidacionCupon["cupon"]>;

type RenovacionPanelProps = {
  pasoRenovacion: PasoRenovacion;
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  onBuscar: () => void;
  buscando: boolean;
  error: string;
  revendedor: RevendedorEncontrado | null;
  tipoSeleccionado: "validity" | "credit";
  onTipoChange: (value: "validity" | "credit") => void;
  cantidadSeleccionada: number;
  onCantidadChange: (value: number) => void;
  nombre: string;
  onNombreChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  procesando: boolean;
  puedeProcesar: boolean;
  diasRenovacion: number;
  precioRenovacion: number;
  precioFinal: number;
  planesCredit: PlanRevendedor[];
  planesValidity: PlanRevendedor[];
  onVerPlanes: () => void;
  onVolverBuscar: () => void;
  onProcesar: () => void;
  planSeleccionado: PlanRevendedor | null;
  cuponActual: CuponAplicado | null;
  descuentoAplicado: number;
  onCuponValidado: (descuento: number, cupon: CuponAplicado) => void;
  onCuponRemovido: () => void;
};

export function RenovacionPanel({
  pasoRenovacion,
  busqueda,
  onBusquedaChange,
  onBuscar,
  buscando,
  error,
  revendedor,
  tipoSeleccionado,
  onTipoChange,
  cantidadSeleccionada,
  onCantidadChange,
  nombre,
  onNombreChange,
  email,
  onEmailChange,
  procesando,
  puedeProcesar,
  diasRenovacion,
  precioRenovacion,
  precioFinal,
  planesCredit,
  planesValidity,
  onVolverBuscar,
  onProcesar,
  planSeleccionado,
  cuponActual,
  descuentoAplicado,
  onCuponValidado,
  onCuponRemovido,
}: RenovacionPanelProps) {
  const tipoActual = revendedor?.datos.servex_account_type;
  const planesDisponibles = tipoSeleccionado === "credit" ? planesCredit : planesValidity;
  const fechaExpiracion = revendedor?.datos.expiration_date
    ? new Date(revendedor.datos.expiration_date)
    : null;
  const hayDescuento = Boolean(descuentoAplicado && descuentoAplicado > 0);

  return (
    <div className="space-y-4 md:space-y-6 xl:space-y-8">


      {/* Main Container */}
      <div className={`mx-auto w-full ${pasoRenovacion === "configurar" && revendedor ? "max-w-6xl" : "max-w-2xl"}`}>
        {/* Two Column Layout for Desktop when configuring */}
        <div className={`${pasoRenovacion === "configurar" && revendedor ? "lg:flex lg:gap-8 lg:items-start" : ""}`}>
          {/* Left Column: Form */}
          <div className={`space-y-4 md:space-y-5 xl:space-y-6 ${pasoRenovacion === "configurar" && revendedor ? "lg:flex-1 lg:min-w-0" : ""}`}>
          {/* Error State */}
          {error && (
            <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-2xl p-3 sm:p-4 lg:p-5 xl:p-6 flex items-start gap-3">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-red-300">{error}</p>
            </div>
          )}

          {/* Step 1: Search */}
          {pasoRenovacion === "buscar" && (
            <div className="mt-8 rounded-2xl bg-zinc-900/50 p-4 sm:p-5 lg:p-6 border border-zinc-700">
              <h3 className="text-xs sm:text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-4 sm:mb-5">
                Buscar tu cuenta
              </h3>

              <div className="space-y-3 sm:space-y-4 lg:space-y-5">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-white mb-2">
                    Nombre de usuario
                  </label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-zinc-400" />
                    <input
                      type="text"
                      value={busqueda}
                      onChange={(event) => onBusquedaChange(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          onBuscar();
                        }
                      }}
                      placeholder="Tu nombre de usuario"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 bg-zinc-800 border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg text-white placeholder-zinc-500 transition-colors outline-none"
                      disabled={buscando}
                    />
                  </div>
                  <SmallText as="p" className="text-[10px] sm:text-xs lg:text-sm xl:text-base mt-1 sm:mt-2 lg:mt-3 xl:mt-4">
                    Ingresa el nombre de usuario de tu cuenta de revendedor.
                  </SmallText>
                </div>

                <Button
                  variant="primary"
                  size="md"
                  onClick={onBuscar}
                  disabled={buscando || !busqueda.trim()}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {buscando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Buscando...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Buscar cuenta
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}          {/* Step 2: Configuration */}
          {pasoRenovacion === "configurar" && revendedor && (
            <>
              {/* Account Info Card */}
              <div className="bg-green-900/20 border-2 border-green-500/30 rounded-2xl p-4 sm:p-5 lg:p-6 xl:p-7">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 text-green-400 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-xs sm:text-sm">
                    <p className="font-semibold text-white">✓ Cuenta encontrada</p>
                    <p className="text-zinc-400">
                      {revendedor.datos.servex_username} • {tipoActual === "credit" ? "Créditos" : "Validez"}
                    </p>
                    {fechaExpiracion && (
                      <SmallText as="p" className="text-[10px] sm:text-xs lg:text-sm xl:text-base mt-2">
                        Vence el {fechaExpiracion.toLocaleDateString("es-AR")}
                      </SmallText>
                    )}
                  </div>
                </div>
              </div>

              {/* Renewal Type Selection */}
              <div className="rounded-2xl bg-zinc-900/50 p-5 sm:p-6 lg:p-8 xl:p-10 border border-zinc-700">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
                  Sistema de renovación
                </h3>
                <div className="grid grid-cols-2 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
                  <button
                    onClick={() => tipoActual === "validity" && onTipoChange("validity")}
                    disabled={tipoActual !== "validity"}
                    className={`group p-3 sm:p-4 lg:p-5 xl:p-6 rounded-lg border-2 transition-all ${
                      tipoActual !== "validity"
                        ? "border-zinc-700/40 bg-zinc-800/40 cursor-not-allowed opacity-50"
                        : tipoSeleccionado === "validity"
                        ? "border-orange-500 bg-orange-500/20"
                        : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    <Calendar
                      className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 mb-2 ${
                        tipoSeleccionado === "validity" ? "text-orange-400" : "text-zinc-400 group-hover:text-orange-400"
                      }`}
                    />
                    <p className="text-xs sm:text-sm font-semibold text-white">Validez</p>
                    <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-zinc-400 mt-0.5 sm:mt-1 lg:mt-1.5 xl:mt-2">Días de acceso</p>
                  </button>
                  <button
                    onClick={() => tipoActual === "credit" && onTipoChange("credit")}
                    disabled={tipoActual !== "credit"}
                    className={`group p-3 sm:p-4 lg:p-5 xl:p-6 rounded-lg border-2 transition-all ${
                      tipoActual !== "credit"
                        ? "border-zinc-700/40 bg-zinc-800/40 cursor-not-allowed opacity-50"
                        : tipoSeleccionado === "credit"
                        ? "border-orange-500 bg-orange-500/20"
                        : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                    }`}
                  >
                    <CreditCard
                      className={`w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 xl:w-7 xl:h-7 mb-2 ${
                        tipoSeleccionado === "credit" ? "text-orange-400" : "text-zinc-400 group-hover:text-orange-400"
                      }`}
                    />
                    <p className="text-xs sm:text-sm font-semibold text-white">Créditos</p>
                    <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-zinc-400 mt-0.5 sm:mt-1 lg:mt-1.5 xl:mt-2">Más créditos</p>
                  </button>
                </div>
              </div>

              {/* Plans Selection - Solo para Credit */}
              {tipoSeleccionado === "credit" ? (
                <div className="rounded-2xl bg-zinc-900/50 p-5 sm:p-6 lg:p-8 xl:p-10 border border-zinc-700">
                  <h3 className="text-xs sm:text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
                    Selecciona cantidad de créditos
                  </h3>
                  {planesDisponibles.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 xl:gap-5">
                      {planesDisponibles.map((plan) => {
                        const diasPlan = DIAS_POR_CREDITOS[plan.max_users] ?? 30;
                        const esSeleccionado = cantidadSeleccionada === plan.max_users;

                        return (
                          <button
                            key={plan.id}
                            onClick={() => onCantidadChange(plan.max_users)}
                            className={`p-3 sm:p-4 lg:p-5 xl:p-6 rounded-lg border-2 transition-all text-left ${
                              esSeleccionado
                                ? "border-orange-500 bg-orange-500/20"
                                : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700 hover:border-zinc-600"
                            }`}
                          >
                            <p className="text-base sm:text-lg lg:text-xl xl:text-2xl font-bold text-white">{plan.max_users}</p>
                            <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-zinc-400 mt-0.5 sm:mt-1 lg:mt-1.5 xl:mt-2">
                              créditos
                            </p>
                            <p className="text-[10px] sm:text-xs lg:text-sm xl:text-base text-zinc-400 mt-0.5 sm:mt-1 lg:mt-1.5 xl:mt-2">
                              ≈ {diasPlan} días
                            </p>
                            <div className="mt-2 sm:mt-3 lg:mt-4 xl:mt-5 pt-2 sm:pt-3 lg:pt-4 xl:pt-5 border-t border-zinc-700/50">
                              <p className="text-xs sm:text-sm font-semibold text-white">
                                ${plan.precio.toLocaleString("es-AR")}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 sm:p-4 lg:p-5 xl:p-6 text-center text-xs sm:text-sm text-zinc-400">
                      No hay planes disponibles
                    </div>
                  )}
                </div>
              ) : (
                /* VALIDITY - Sin selección de planes, solo el actual */
                <div className="rounded-2xl bg-zinc-900/50 p-5 sm:p-6 lg:p-8 xl:p-10 border border-zinc-700">
                  <div className="space-y-4 sm:space-y-5">
                    <div>
                      <h3 className="text-xs sm:text-sm font-semibold text-orange-400 uppercase tracking-wider mb-2 sm:mb-3">
                        ℹ️ Cuenta de Validez Mensual
                      </h3>
                      <div className="bg-zinc-800/70 rounded-lg p-3 sm:p-4 border border-zinc-700/50">
                        <ul className="text-xs sm:text-sm text-zinc-300 space-y-2 sm:space-y-2.5">
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-orange-400" />
                            <span>Solo renovación: Se mantiene tu plan actual</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-orange-400" />
                            <span>Ciclo mensual: 30 días fijos de validez</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0 mt-0.5 text-orange-400" />
                            <span>Precio justo: Prorrateo según días restantes</span>
                          </li>
                        </ul>
                      </div>
                    </div>

                    <a
                      href="https://wa.me/5493812531123?text=Hola%20SecureShop%2C%20Quisiera%20agregar%20m%C3%A1s%20usuarios%20a%20mi%20cuenta%20de%20validez."
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 sm:py-3 bg-green-500 hover:bg-green-600 text-white font-semibold text-xs sm:text-sm rounded-lg transition-colors"
                    >
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378c-3.055 2.01-5.009 5.017-5.009 8.221 0 1.331.266 2.622.77 3.82L2.070 19.91l4.104-1.278c1.14.587 2.417.9 3.757.9h.004c5.071 0 9.186-4.122 9.186-9.181 0-2.44-.959-4.779-2.7-6.512-1.742-1.733-4.063-2.688-6.517-2.688" />
                      </svg>
                      Contactar soporte por WhatsApp
                    </a>
                  </div>
                </div>
              )}

              {/* Contact Information */}
              <div className="rounded-2xl bg-zinc-900/50 p-5 sm:p-6 lg:p-8 xl:p-10 border border-zinc-700">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
                  Información de contacto
                </h3>
                <div className="grid sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-5 xl:gap-6">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-zinc-400" />
                    <input
                      type="text"
                      value={nombre}
                      onChange={(event) => onNombreChange(event.target.value)}
                      placeholder="Nombre del responsable"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 bg-zinc-800 border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg text-white placeholder-zinc-500 transition-colors outline-none"
                    />
                  </div>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 xl:w-6 xl:h-6 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      placeholder="tu@email.com"
                      className="w-full pl-11 pr-4 py-2.5 sm:py-3 lg:py-4 xl:py-5 bg-zinc-800 border border-zinc-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 rounded-lg text-white placeholder-zinc-500 transition-colors outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Coupon Code */}
              <div className="rounded-2xl bg-zinc-900/50 p-5 sm:p-6 lg:p-8 xl:p-10 border border-zinc-700">
                <h3 className="text-xs sm:text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3 sm:mb-4 lg:mb-5 xl:mb-6">
                  Código de descuento
                </h3>
                <CuponInput
                  planId={planSeleccionado?.id}
                  precioPlan={precioRenovacion}
                  clienteEmail={email.trim()}
                  cuponActual={cuponActual || undefined}
                  descuentoActual={descuentoAplicado}
                  onCuponValidado={onCuponValidado}
                  onCuponRemovido={onCuponRemovido}
                />
              </div>

              {/* Action Buttons - Mobile Only */}
              <div className="lg:hidden flex flex-col gap-2 sm:gap-3">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onVolverBuscar}
                  fullWidthMobile
                >
                  Buscar otro
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={onProcesar}
                  disabled={!puedeProcesar || procesando || precioFinal <= 0}
                  className="flex items-center justify-center gap-2"
                  fullWidthMobile
                >
                  {procesando ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Procesando...
                    </>
                  ) : (
                    <>
                      Continuar al pago
                      <ChevronRight className="w-4 h-4" />
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>

        {/* Right Column: Renewal Summary - Sticky on Desktop */}
        {pasoRenovacion === "configurar" && revendedor && (
          <div className="hidden lg:block lg:w-96 lg:flex-shrink-0 lg:sticky lg:top-24 lg:self-start mt-6 lg:mt-0">
            {/* Renewal Summary */}
            <div className="rounded-2xl bg-zinc-900/50 p-5 sm:p-6 lg:p-8 border border-zinc-700">
                <h3 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider mb-5 sm:mb-6">
                  Resumen de renovación
                </h3>

                <div className="space-y-5 sm:space-y-6">
                  {/* Plan Details */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-zinc-400">
                        {tipoSeleccionado === "credit" ? "Créditos" : "Usuarios"}
                      </span>
                      <span className="font-semibold text-white">{cantidadSeleccionada}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-zinc-400">Duración</span>
                      <span className="font-semibold text-white">{diasRenovacion} días</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-zinc-400">Precio por unidad</span>
                      <span className="font-semibold text-white">
                        ${Math.round(precioRenovacion / Math.max(cantidadSeleccionada || 1, 1))}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-zinc-700" />

                  {/* Pricing */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-zinc-400">Subtotal</span>
                      <span className="text-white">${precioRenovacion.toLocaleString("es-AR")}</span>
                    </div>

                    {hayDescuento && (
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-green-400">
                          Descuento {cuponActual?.codigo ? `(${cuponActual.codigo})` : ""}
                        </span>
                        <span className="text-green-400 font-medium">
                          -${descuentoAplicado.toLocaleString("es-AR")}
                        </span>
                      </div>
                    )}

                    <div className="h-px bg-zinc-700" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-zinc-300 font-medium">Monto final</span>
                      <span className="text-2xl sm:text-3xl font-bold text-orange-400">
                        ${precioFinal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>

                  <div className="pt-3 sm:pt-4 flex flex-col gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      onClick={onProcesar}
                      disabled={!puedeProcesar || procesando || precioFinal <= 0}
                      className="w-full flex items-center justify-center gap-2"
                    >
                      {procesando ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Procesando...
                        </>
                      ) : (
                        <>
                          Ir al pago
                          <ChevronRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={onVolverBuscar}
                      className="w-full"
                    >
                      Buscar otro
                    </Button>
                  </div>
                </div>

                {/* Security Info */}
                <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-zinc-700">
                  <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed">
                    🔒 <span className="text-zinc-300 font-medium">Seguro y privado.</span> Procesado con MercadoPago encriptado.
                  </p>
                </div>
              </div>
          </div>
        )}

        {/* Mobile Summary - Below Form */}
        {pasoRenovacion === "configurar" && revendedor && (
          <div className="lg:hidden mt-4 md:mt-5">
            {/* Renewal Summary */}
            <div className="rounded-2xl bg-zinc-900/50 p-5 sm:p-6 border border-zinc-700">
                <h3 className="text-xs sm:text-sm font-semibold text-white uppercase tracking-wider mb-5 sm:mb-6">
                  Resumen de renovación
                </h3>

                <div className="space-y-5 sm:space-y-6">
                  {/* Plan Details */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-zinc-400">
                        {tipoSeleccionado === "credit" ? "Créditos" : "Usuarios"}
                      </span>
                      <span className="font-semibold text-white">{cantidadSeleccionada}</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-zinc-400">Duración</span>
                      <span className="font-semibold text-white">{diasRenovacion} días</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-zinc-400">Precio por unidad</span>
                      <span className="font-semibold text-white">
                        ${Math.round(precioRenovacion / Math.max(cantidadSeleccionada || 1, 1))}
                      </span>
                    </div>
                  </div>

                  <div className="h-px bg-zinc-700" />

                  {/* Pricing */}
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex justify-between">
                      <span className="text-xs sm:text-sm text-zinc-400">Subtotal</span>
                      <span className="text-white">${precioRenovacion.toLocaleString("es-AR")}</span>
                    </div>

                    {hayDescuento && (
                      <div className="flex justify-between">
                        <span className="text-xs sm:text-sm text-green-400">
                          Descuento {cuponActual?.codigo ? `(${cuponActual.codigo})` : ""}
                        </span>
                        <span className="text-green-400 font-medium">
                          -${descuentoAplicado.toLocaleString("es-AR")}
                        </span>
                      </div>
                    )}

                    <div className="h-px bg-zinc-700" />

                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base text-zinc-300 font-medium">Monto final</span>
                      <span className="text-2xl sm:text-3xl font-bold text-orange-400">
                        ${precioFinal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Security Info */}
                <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-zinc-700">
                  <p className="text-[10px] sm:text-xs text-zinc-400 leading-relaxed">
                    🔒 <span className="text-zinc-300 font-medium">Seguro y privado.</span> Procesado con MercadoPago encriptado.
                  </p>
                </div>
              </div>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
