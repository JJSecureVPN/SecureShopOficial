import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Loader2,
  Search,
  Sparkles,
} from "lucide-react";
import {
  DIAS_RENOVACION,
  DISPOSITIVOS_RENOVACION,
  PRECIOS_POR_DIA,
} from "../constants";
import { CuentaRenovacion, PasoRenovacion } from "../types";
import { RefineButton } from "../../../components/RefineButton";
import CuponInput from "../../../components/CuponInput";
import type { ValidacionCupon } from "../../../services/api.service";

interface RenovacionPanelProps {
  pasoRenovacion: PasoRenovacion;
  busqueda: string;
  onBusquedaChange: (value: string) => void;
  onBuscarCuenta: () => void;
  buscando: boolean;
  error: string;
  cuenta: CuentaRenovacion | null;
  dias: number;
  onDiasChange: (value: number) => void;
  dispositivosSeleccionados: number | null;
  onDispositivosChange: (value: number | null) => void;
  nombre: string;
  onNombreChange: (value: string) => void;
  email: string;
  onEmailChange: (value: string) => void;
  puedeProcesar: boolean;
  procesando: boolean;
  onProcesar: () => void;
  onCancelar: () => void;
  onVolverBuscar: () => void;
  connectionActual: number;
  connectionDestino: number;
  precioBase: number;
  precioTotal: number;
  precioPorDia: number;
  precioPorDiaBase: number;
  descuentoAplicado: number;
  cuponActual: ValidacionCupon["cupon"] | null;
  onCuponAplicado: (descuento: number, cuponData: ValidacionCupon["cupon"]) => void;
  onCuponRemovido: () => void;
  planId?: number;
}

export function RenovacionPanel({
  pasoRenovacion,
  busqueda,
  onBusquedaChange,
  onBuscarCuenta,
  buscando,
  error,
  cuenta,
  dias,
  onDiasChange,
  dispositivosSeleccionados,
  onDispositivosChange,
  nombre,
  onNombreChange,
  email,
  onEmailChange,
  puedeProcesar,
  procesando,
  onProcesar,
  onVolverBuscar,
  connectionActual,
  connectionDestino,
  precioBase,
  precioTotal,
  precioPorDia,
  descuentoAplicado,
  cuponActual,
  onCuponAplicado,
  onCuponRemovido,
  planId,
}: RenovacionPanelProps) {
  const handleBuscar = () => {
    if (!buscando) {
      onBuscarCuenta();
    }
  };

  const hayDescuento = descuentoAplicado > 0;

  return (
    <div className="space-y-6">
      {/* Error State */}
      {error && (
        <div className="bg-red-900/10 border border-red-500/20 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-red-400/90 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300/90">{error}</p>
        </div>
      )}

      {/* Step 1: Search */}
      {pasoRenovacion === "buscar" && (
        <div className="space-y-5">
          <div>
            <div className="mb-5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide bg-indigo-500/8 text-indigo-400/90 mb-2">
                Paso 1
              </span>
              <h3 className="text-lg md:text-xl font-semibold text-white/95 mb-1">
                Busca tu cuenta
              </h3>
              <p className="text-[13px] text-zinc-400/80">
                Ingresa tu nombre de usuario para continuar
              </p>
            </div>

            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6">
              <label className="block text-sm font-medium text-white/90 mb-3">
                Usuario registrado
              </label>
              <div className="relative mb-5">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(event) => onBusquedaChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleBuscar();
                    }
                  }}
                  placeholder="tu_usuario"
                  className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent transition-all"
                  disabled={buscando}
                />
              </div>

              <RefineButton
                onClick={handleBuscar}
                disabled={buscando || !busqueda.trim()}
                variant="primary"
                className={`w-full ${
                  buscando || !busqueda.trim() ? 'opacity-50 cursor-not-allowed' : ''
                }`}
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
              </RefineButton>
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Configuration */}
      {pasoRenovacion === "configurar" && cuenta && (
        <div className="space-y-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-5">
              {/* Account Info Card */}
              <div className="rounded-lg border border-emerald-500/20 bg-emerald-900/10 p-5">
                <div className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 flex-shrink-0 mt-0.5 text-emerald-400/90" />
                  <div className="space-y-1">
                    <p className="font-medium text-emerald-300/90">Cuenta encontrada</p>
                    <p className="text-sm text-emerald-400/80">
                      {cuenta.tipo === "cliente" ? "Cliente VPN" : "Revendedor"} • <span className="font-medium">{cuenta.datos.servex_username}</span>
                    </p>
                    {cuenta.datos.plan_nombre && (
                      <p className="text-xs text-emerald-400/70 mt-1.5">
                        Plan actual: <span className="font-medium">{cuenta.datos.plan_nombre}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6">
                <div className="mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide bg-indigo-500/8 text-indigo-400/90 mb-2">
                    Paso 2
                  </span>
                  <h3 className="text-base md:text-lg font-semibold text-white/95 mb-1">
                    Duración a agregar
                  </h3>
                  <p className="text-[13px] text-zinc-400/80">
                    Elige cuántos días deseas renovar tu suscripción
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                  {DIAS_RENOVACION.map((opcionDias) => (
                    <button
                      key={opcionDias}
                      onClick={() => onDiasChange(opcionDias)}
                      className={`rounded-lg border px-4 py-2.5 text-sm font-medium transition-all ${
                        dias === opcionDias
                          ? 'border-indigo-500/60 bg-indigo-500/8 text-indigo-300 shadow-sm shadow-indigo-500/5'
                          : 'border-zinc-800 bg-zinc-900/30 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800/50'
                      }`}
                    >
                      {opcionDias} días
                    </button>
                  ))}
                </div>
              </div>

              {/* Devices Selection - Only for clients */}
              {cuenta.tipo === "cliente" && (
                <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6">
                  <div className="mb-5">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide bg-indigo-500/8 text-indigo-400/90 mb-2">
                      Paso 3
                    </span>
                    <h3 className="text-base md:text-lg font-semibold text-white/95 mb-1">
                      Dispositivos simultáneos
                    </h3>
                    <p className="text-[13px] text-zinc-400/80">
                      Cambia la cantidad si necesitas más protección
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                    {DISPOSITIVOS_RENOVACION.map((dispositivos) => {
                      const esActual = dispositivos === connectionActual;
                      const esSeleccionado = dispositivosSeleccionados === dispositivos;
                      return (
                        <button
                          key={dispositivos}
                          onClick={() => onDispositivosChange(dispositivos)}
                          className={`relative rounded-lg border p-3.5 text-center transition-all ${
                            esSeleccionado
                              ? 'border-indigo-500/60 bg-indigo-500/8'
                              : esActual
                              ? 'border-zinc-700 bg-zinc-800/40'
                              : 'border-zinc-800 bg-zinc-900/30 hover:border-zinc-700 hover:bg-zinc-800/50'
                          }`}
                        >
                          <p className={`text-base md:text-lg font-semibold ${esSeleccionado ? 'text-indigo-300' : 'text-white/90'}`}>
                            {dispositivos}
                          </p>
                          <p className="text-xs text-zinc-400/80 mt-1">
                            ${PRECIOS_POR_DIA[dispositivos] ?? PRECIOS_POR_DIA[1]}/día
                          </p>
                          {esActual && !esSeleccionado && (
                            <span className="absolute -top-1.5 -right-1.5 text-white text-[9px] px-2 py-0.5 rounded-md font-medium bg-zinc-600/90">
                              Actual
                            </span>
                          )}
                          {esSeleccionado && (
                            <span className="absolute -top-1.5 -right-1.5 text-white text-[9px] px-2 py-0.5 rounded-md font-medium bg-orange-500/90">
                              Nuevo
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Contact Info */}
              <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6">
                <div className="mb-5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[10px] font-medium uppercase tracking-wide bg-indigo-500/8 text-indigo-400/90 mb-2">
                    Paso 4
                  </span>
                  <h3 className="text-base md:text-lg font-semibold text-white/95 mb-1">
                    Información de contacto
                  </h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(event) => onNombreChange(event.target.value)}
                      placeholder="Tu nombre"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-white/90 mb-2">
                      Email de contacto
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      placeholder="tu@email.com"
                      className="w-full rounded-lg border border-zinc-800 bg-zinc-900/60 px-3.5 py-2.5 text-sm text-white placeholder-zinc-500/70 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-transparent transition-all"
                    />
                  </div>
                </div>
              </div>

              {cuenta.tipo === "cliente" && (
                <CuponInput
                  planId={planId}
                  precioPlan={precioBase}
                  onCuponValidado={onCuponAplicado}
                  onCuponRemovido={onCuponRemovido}
                  cuponActual={cuponActual}
                  descuentoActual={descuentoAplicado}
                  clienteEmail={email}
                />
              )}
            </div>

            {/* Summary Card - Sticky Sidebar */}
            <aside className="rounded-xl p-6 lg:p-7 bg-zinc-900/40 border border-zinc-800/60 lg:sticky lg:top-24 lg:self-start">
              <div className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-[10px] font-medium uppercase tracking-wide bg-indigo-500/10 text-indigo-400/90 mb-5">
                <Sparkles className="h-3 w-3" />
                <span>Resumen de renovación</span>
              </div>

              <div className="space-y-5">
                <div>
                  <p className="text-xs text-zinc-500/80 mb-2">Tu renovación</p>
                  <p className="text-xl md:text-2xl font-bold text-white/95">
                    {dias} días {cuenta.tipo === "cliente" ? `• ${connectionDestino} dispositivos` : ""}
                  </p>
                  <p className="text-[13px] text-zinc-400/80 mt-1.5">
                    {cuenta.tipo === "cliente"
                      ? connectionDestino !== connectionActual
                        ? `Cambio de ${connectionActual} a ${connectionDestino} dispositivos`
                        : "Sin cambios en dispositivos"
                      : "Renovación de revendedor"}
                  </p>
                </div>

                <div className="h-px bg-zinc-800/60" />

                <div className="space-y-3.5">
                  <div className="flex justify-between items-center">
                    <p className="text-sm text-zinc-400/80">Precio base</p>
                    <p className="text-base font-semibold text-white/90">
                      ${precioBase.toLocaleString("es-AR")}
                    </p>
                  </div>

                  {hayDescuento && (
                    <div className="flex justify-between items-center text-emerald-400/90">
                      <p className="text-sm">
                        Descuento
                        {cuponActual?.codigo ? ` (${cuponActual.codigo})` : ""}
                      </p>
                      <p className="font-semibold">
                        - ${descuentoAplicado.toLocaleString("es-AR")}
                      </p>
                    </div>
                  )}

                  <div className="h-px bg-zinc-800/60" />

                  <div className="flex justify-between items-center pt-1">
                    <p className="text-sm text-zinc-400/80">Total a pagar</p>
                    <p className="text-3xl md:text-4xl font-bold text-indigo-500/95">
                      ${precioTotal.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-500/70">
                    ${precioPorDia.toLocaleString("es-AR")}/día
                  </p>
                </div>

                <div className="h-px bg-zinc-800/60" />

                <div className="space-y-2.5">
                  <RefineButton
                    onClick={onVolverBuscar}
                    variant="secondary"
                    className="w-full"
                  >
                    Buscar otra cuenta
                  </RefineButton>
                  <RefineButton
                    onClick={onProcesar}
                    disabled={procesando || !puedeProcesar}
                    variant="primary"
                    className={`w-full ${
                      procesando || !puedeProcesar ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
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
                  </RefineButton>
                </div>

                <p className="text-[11px] text-zinc-500/70 text-center leading-relaxed pt-1">
                  Pago seguro con Mercado Pago, tarjetas internacionales o criptomonedas.
                </p>
              </div>
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}