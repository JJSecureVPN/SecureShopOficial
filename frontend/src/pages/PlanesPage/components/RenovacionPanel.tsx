import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Search,
} from "lucide-react";
import {
  DIAS_RENOVACION,
  DISPOSITIVOS_RENOVACION,
} from "../constants";
import { CuentaRenovacion, PasoRenovacion } from "../types";
import { RefineButton } from "../../../components/RefineButton";
import CuponInput from "../../../components/CuponInput";
import type { ValidacionCupon } from "../../../services/api.service";
import PlanSlider from "./PlanSlider";
import StickyLayout from "../../../components/StickyLayout";
import StepCard from "../../../components/StepCard";
import SummaryPanel, { PriceBreakdownRow } from "../../../components/SummaryPanel";

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

      {/* Step 2: Configuration — Same layout as purchase section */}
      {pasoRenovacion === "configurar" && cuenta && (
        <StickyLayout
          aside={
            <SummaryPanel
              badgeText="Resumen de renovación"
              accent="indigo"
              title={`${dias} días`}
              subtitle={
                <>
                  {cuenta.tipo === "cliente"
                    ? `Protección para ${connectionDestino} ${connectionDestino === 1 ? "dispositivo" : "dispositivos"} simultáneos.`
                    : "Renovación de cuenta revendedor."}
                  {cuenta.tipo === "cliente" && connectionDestino !== connectionActual && (
                    <span className="block mt-1 text-indigo-400 text-xs">
                      Cambio de {connectionActual} → {connectionDestino} dispositivos
                    </span>
                  )}
                </>
              }
              priceLabel="Total a pagar"
              price={`$${precioTotal.toLocaleString("es-AR")}`}
              unitLabel="Valor equivalente"
              unitValue={`$${precioPorDia.toLocaleString("es-AR")}/día`}
              priceBreakdown={
                hayDescuento
                  ? ([
                      { label: "Subtotal", value: `$${precioBase.toLocaleString("es-AR")}` },
                      {
                        label: `Descuento ${cuponActual?.codigo ? `(${cuponActual.codigo})` : ""}`,
                        value: `-$${descuentoAplicado.toLocaleString("es-AR")}`,
                        isDiscount: true,
                      },
                    ] as PriceBreakdownRow[])
                  : undefined
              }
              benefits={[
                `Renovación de ${dias} días acumulativos`,
                cuenta.tipo === "cliente"
                  ? `${connectionDestino} ${connectionDestino === 1 ? "dispositivo" : "dispositivos"} simultáneos`
                  : "Cuenta de revendedor activa",
                "Pago seguro con Mercado Pago",
              ]}
              ctaLabel="Continuar al pago"
              onCtaClick={onProcesar}
              ctaDisabled={!puedeProcesar}
              ctaLoading={procesando}
              ctaLoadingLabel="Procesando..."
              secondaryLabel="Buscar otra cuenta"
              onSecondaryClick={onVolverBuscar}
            />
          }
        >
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

          {/* Duration Slider */}
          <StepCard
            label="Paso 2"
            title="Duración a agregar"
            subtitle="Desliza para elegir cuántos días deseas renovar tu suscripción."
            accent="indigo"
            delay={0.1}
          >
            <PlanSlider
              options={DIAS_RENOVACION}
              value={dias}
              onChange={onDiasChange}
            />
          </StepCard>

          {/* Devices Slider - Only for clients */}
          {cuenta.tipo === "cliente" && (
            <StepCard
              label="Paso 3"
              title="Dispositivos simultáneos"
              subtitle="Selecciona cuántos equipos quieres proteger al mismo tiempo."
              accent="indigo"
              delay={0.2}
            >
              <PlanSlider
                options={DISPOSITIVOS_RENOVACION}
                value={dispositivosSeleccionados ?? connectionActual}
                onChange={(v) => onDispositivosChange(v)}
                unit="dispositivos"
              />
            </StepCard>
          )}

          {/* Contact Info */}
          <StepCard
            label={`Paso ${cuenta.tipo === "cliente" ? "4" : "3"}`}
            title="Información de contacto"
            accent="indigo"
            delay={0.3}
          >
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
          </StepCard>

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
        </StickyLayout>
      )}
    </div>
  );
}
