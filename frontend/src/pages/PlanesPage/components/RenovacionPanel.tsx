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
    <div className="space-y-8">
      {/* Error State */}
      {error && (
        <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-2xl p-4 md:p-5 lg:p-5 xl:p-6 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-red-300">{error}</p>
        </div>
      )}

      {/* Step 1: Search */}
      {pasoRenovacion === "buscar" && (
        <div className="space-y-6 mt-8">
          <div>
              <div className="mb-6">
              <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-1">Paso 1</p>
              <h3 className="text-lg md:text-xl xl:text-2xl font-semibold text-white">Busca tu cuenta</h3>
              <p className="text-sm text-zinc-400 mt-1">Ingresa tu nombre de usuario para continuar</p>
            </div>

            <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 md:p-5 xl:p-6 shadow-sm">
              <label className="block text-sm font-semibold text-white mb-4">
                Usuario registrado
              </label>
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
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
                  className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
        <div className="space-y-12">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
            <div className="space-y-6">
              {/* Account Info Card */}
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-4 md:p-5 xl:p-6">
                <div className="flex items-start gap-4">
                  <CheckCircle className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0 mt-1 text-emerald-400" />
                  <div className="space-y-1">
                    <p className="font-semibold text-emerald-300">Cuenta encontrada</p>
                    <p className="text-sm text-emerald-400">
                      {cuenta.tipo === "cliente" ? "Cliente VPN" : "Revendedor"} • <span className="font-medium">{cuenta.datos.servex_username}</span>
                    </p>
                    {cuenta.datos.plan_nombre && (
                      <p className="text-xs text-emerald-400 mt-2">
                        Plan actual: <span className="font-medium">{cuenta.datos.plan_nombre}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Duration Selection */}
              <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 md:p-5 xl:p-6">
                  <div className="mb-6">
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-1">Paso 2</p>
                  <h3 className="text-base md:text-lg xl:text-xl font-semibold text-white">Duración a agregar</h3>
                  <p className="text-sm text-zinc-400 mt-1">Elige cuántos días deseas renovar tu suscripción</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {DIAS_RENOVACION.map((opcionDias) => (
                    <button
                      key={opcionDias}
                      onClick={() => onDiasChange(opcionDias)}
                      className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all ${
                        dias === opcionDias
                          ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                          : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-indigo-500/30 hover:bg-zinc-800'
                      }`}
                    >
                      {opcionDias} días
                    </button>
                  ))}
                </div>
              </div>

              {/* Devices Selection - Only for clients */}
              {cuenta.tipo === "cliente" && (
                <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 md:p-5 xl:p-6">
                  <div className="mb-6">
                    <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-1">Paso 3</p>
                    <h3 className="text-base md:text-lg xl:text-xl font-semibold text-white">Dispositivos simultáneos</h3>
                    <p className="text-sm text-zinc-400 mt-1">Cambia la cantidad si necesitas más protección</p>
                  </div>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {DISPOSITIVOS_RENOVACION.map((dispositivos) => {
                      const esActual = dispositivos === connectionActual;
                      const esSeleccionado = dispositivosSeleccionados === dispositivos;
                      return (
                        <button
                          key={dispositivos}
                          onClick={() => onDispositivosChange(dispositivos)}
                          className={`relative rounded-xl border-2 p-4 text-center transition-all ${
                            esSeleccionado
                              ? 'border-indigo-500 bg-indigo-500/10'
                              : esActual
                              ? 'border-zinc-600 bg-zinc-800/50'
                              : 'border-zinc-700 bg-zinc-800/50 hover:border-indigo-500/30 hover:bg-zinc-800'
                          }`}
                        >
                          <p className={`text-base md:text-lg font-bold ${esSeleccionado ? 'text-indigo-400' : 'text-white'}`}>
                            {dispositivos}
                          </p>
                          <p className="text-xs text-zinc-400 mt-1">
                            ${PRECIOS_POR_DIA[dispositivos] ?? PRECIOS_POR_DIA[1]}/día
                          </p>
                          {esActual && !esSeleccionado && (
                            <span className="absolute -top-2 -right-2 text-white text-[10px] px-2 py-1 rounded-full font-medium bg-zinc-600">
                              Actual
                            </span>
                          )}
                          {esSeleccionado && (
                            <span className="absolute -top-2 -right-2 text-white text-[10px] px-2 py-1 rounded-full font-medium bg-orange-500">
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
              <div className="rounded-2xl border border-zinc-700 bg-zinc-900/50 p-4 md:p-5 xl:p-6">
                  <div className="mb-6">
                  <p className="text-xs md:text-sm font-semibold uppercase tracking-[0.2em] text-indigo-400 mb-1">Paso 4</p>
                  <h3 className="text-base md:text-lg xl:text-xl font-semibold text-white">Información de contacto</h3>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(event) => onNombreChange(event.target.value)}
                      placeholder="Tu nombre"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-white mb-2">
                      Email de contacto
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      placeholder="tu@email.com"
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-800 px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
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
            <aside className="rounded-2xl p-5 md:p-6 xl:p-8 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-800 border border-zinc-700 shadow-lg lg:sticky lg:top-24 lg:self-start">
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] bg-indigo-600 text-white mb-6">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Resumen de renovación</span>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Tu renovación</p>
                  <p className="text-xl md:text-2xl xl:text-3xl font-bold text-white">
                    {dias} días {cuenta.tipo === "cliente" ? `• ${connectionDestino} dispositivos` : ""}
                  </p>
                  <p className="text-sm text-zinc-400 mt-2">
                    {cuenta.tipo === "cliente"
                      ? connectionDestino !== connectionActual
                        ? `Cambio de ${connectionActual} a ${connectionDestino} dispositivos`
                        : "Sin cambios en dispositivos"
                      : "Renovación de revendedor"}
                  </p>
                </div>

                <div className="h-px bg-zinc-700" />

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <p className="text-zinc-400">Precio base</p>
                    <p className="text-base md:text-lg font-semibold text-white">
                      ${precioBase.toLocaleString("es-AR")}
                    </p>
                  </div>

                  {hayDescuento && (
                    <div className="flex justify-between items-center text-emerald-400">
                      <p>
                        Descuento
                        {cuponActual?.codigo ? ` (${cuponActual.codigo})` : ""}
                      </p>
                      <p className="font-semibold">
                        - ${descuentoAplicado.toLocaleString("es-AR")}
                      </p>
                    </div>
                  )}

                  <div className="h-px bg-zinc-700" />

                    <div className="flex justify-between items-center pt-2">
                    <p className="text-zinc-400">Total a pagar</p>
                    <p className="text-3xl md:text-4xl xl:text-5xl font-bold text-indigo-500">
                      ${precioTotal.toLocaleString("es-AR")}
                    </p>
                  </div>

                  <p className="text-xs text-zinc-500">
                    ${precioPorDia.toLocaleString("es-AR")}/día
                  </p>
                </div>

                <div className="h-px bg-zinc-700" />

                <div className="space-y-3">
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

                <p className="text-xs text-zinc-500 text-center">
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
