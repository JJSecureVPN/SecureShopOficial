import {
  AlertCircle,
  Calendar,
  CheckCircle,
  CreditCard,
  Loader2,
  Mail,
  Search,
  User,
} from "lucide-react";
import CuponInput from "../../../components/CuponInput";
import { RefineButton } from "../../../components/RefineButton";
import StickyLayout from "../../../components/StickyLayout";
import StepCard from "../../../components/StepCard";
import SummaryPanel, { PriceBreakdownRow } from "../../../components/SummaryPanel";
import type { ValidacionCupon } from "../../../services/api.service";
import type { PlanRevendedor } from "../../../types";
import PlanSlider from "../../PlanesPage/components/PlanSlider";
import type { PasoRenovacion, RevendedorEncontrado } from "../types";

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
  const hayDescuento = descuentoAplicado > 0;
  const fechaExpiracion = revendedor?.datos.expiration_date
    ? new Date(revendedor.datos.expiration_date)
    : null;

  const opcionesCreditos = planesCredit
    .map((plan) => plan.max_users)
    .filter((value, index, all) => all.indexOf(value) === index)
    .sort((a, b) => a - b);

  const precioPorUnidad = Math.round(
    precioRenovacion / Math.max(cantidadSeleccionada || 1, 1)
  );

  return (
    <div className="space-y-8">
      {error && (
        <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-2xl p-4 md:p-5 lg:p-5 xl:p-6 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 md:w-5 md:h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs md:text-sm text-red-300">{error}</p>
        </div>
      )}

      {pasoRenovacion === "buscar" && (
        <StepCard
          label="Paso 1"
          title="Busca tu cuenta"
          subtitle="Ingresa tu nombre de usuario para continuar con la renovación."
          accent="indigo"
          delay={0.05}
        >
          <div className="space-y-4">
            <label className="block text-sm font-semibold text-white">Usuario registrado</label>
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
              <input
                type="text"
                value={busqueda}
                onChange={(event) => onBusquedaChange(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !buscando) {
                    onBuscar();
                  }
                }}
                placeholder="tu_usuario"
                className="w-full rounded-xl border border-zinc-700 bg-zinc-800 py-3 pl-11 pr-4 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                disabled={buscando}
              />
            </div>

            <RefineButton
              onClick={onBuscar}
              disabled={buscando || !busqueda.trim()}
              variant="primary"
              className={`w-full ${buscando || !busqueda.trim() ? "opacity-50 cursor-not-allowed" : ""}`}
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
        </StepCard>
      )}

      {pasoRenovacion === "configurar" && revendedor && (
        <StickyLayout
          aside={
            <SummaryPanel
              badgeText="Resumen de renovacion"
              accent="indigo"
              title={`${diasRenovacion} dias`}
              subtitle={
                tipoSeleccionado === "credit"
                  ? `${cantidadSeleccionada} creditos para mantener tu panel activo.`
                  : `${cantidadSeleccionada} usuarios en tu plan de validez mensual.`
              }
              priceLabel="Total a pagar"
              price={`$${precioFinal.toLocaleString("es-AR")}`}
              unitLabel="Precio por unidad"
              unitValue={`$${precioPorUnidad.toLocaleString("es-AR")}/${
                tipoSeleccionado === "credit" ? "credito" : "usuario"
              }`}
              priceBreakdown={
                hayDescuento
                  ? ([
                      { label: "Subtotal", value: `$${precioRenovacion.toLocaleString("es-AR")}` },
                      {
                        label: `Descuento ${cuponActual?.codigo ? `(${cuponActual.codigo})` : ""}`,
                        value: `-$${descuentoAplicado.toLocaleString("es-AR")}`,
                        isDiscount: true,
                      },
                    ] as PriceBreakdownRow[])
                  : undefined
              }
              benefits={[
                `Renovacion de ${diasRenovacion} dias acumulativos`,
                tipoSeleccionado === "credit"
                  ? "Proceso por creditos habilitado"
                  : "Renovacion sobre tu plan de validez",
                "Pago seguro con Mercado Pago",
              ]}
              ctaLabel="Continuar al pago"
              onCtaClick={onProcesar}
              ctaDisabled={!puedeProcesar || procesando || precioFinal <= 0}
              ctaLoading={procesando}
              ctaLoadingLabel="Procesando..."
              secondaryLabel="Buscar otra cuenta"
              onSecondaryClick={onVolverBuscar}
            />
          }
        >
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-900/20 p-4 md:p-5 xl:p-6">
            <div className="flex items-start gap-4">
              <CheckCircle className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0 mt-1 text-emerald-400" />
              <div className="space-y-1">
                <p className="font-semibold text-emerald-300">Cuenta encontrada</p>
                <p className="text-sm text-emerald-400">
                  Revendedor • <span className="font-medium">{revendedor.datos.servex_username}</span>
                </p>
                <p className="text-xs text-emerald-400/90 mt-2">
                  Sistema: <span className="font-medium">{tipoActual === "credit" ? "Creditos" : "Validez"}</span>
                </p>
                {fechaExpiracion && (
                  <p className="text-xs text-emerald-400/90">
                    Vence el <span className="font-medium">{fechaExpiracion.toLocaleDateString("es-AR")}</span>
                  </p>
                )}
              </div>
            </div>
          </div>

          <StepCard
            label="Paso 2"
            title="Sistema de renovacion"
            subtitle="Tu cuenta solo permite renovar en su sistema actual."
            accent="indigo"
            delay={0.1}
          >
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => tipoActual === "validity" && onTipoChange("validity")}
                disabled={tipoActual !== "validity"}
                className={`group p-4 rounded-xl border-2 transition-all text-left ${
                  tipoActual !== "validity"
                    ? "border-zinc-700/40 bg-zinc-800/40 cursor-not-allowed opacity-50"
                    : tipoSeleccionado === "validity"
                    ? "border-indigo-500 bg-indigo-500/20"
                    : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                <Calendar
                  className={`w-5 h-5 mb-2 ${
                    tipoSeleccionado === "validity" ? "text-indigo-400" : "text-zinc-400 group-hover:text-indigo-400"
                  }`}
                />
                <p className="text-sm font-semibold text-white">Validez</p>
                <p className="text-xs text-zinc-400 mt-1">Dias de acceso</p>
              </button>

              <button
                onClick={() => tipoActual === "credit" && onTipoChange("credit")}
                disabled={tipoActual !== "credit"}
                className={`group p-4 rounded-xl border-2 transition-all text-left ${
                  tipoActual !== "credit"
                    ? "border-zinc-700/40 bg-zinc-800/40 cursor-not-allowed opacity-50"
                    : tipoSeleccionado === "credit"
                    ? "border-indigo-500 bg-indigo-500/20"
                    : "border-zinc-700 bg-zinc-800 hover:bg-zinc-700"
                }`}
              >
                <CreditCard
                  className={`w-5 h-5 mb-2 ${
                    tipoSeleccionado === "credit" ? "text-indigo-400" : "text-zinc-400 group-hover:text-indigo-400"
                  }`}
                />
                <p className="text-sm font-semibold text-white">Creditos</p>
                <p className="text-xs text-zinc-400 mt-1">Mas creditos</p>
              </button>
            </div>
          </StepCard>

          {tipoSeleccionado === "credit" ? (
            <StepCard
              label="Paso 3"
              title="Cantidad de creditos"
              subtitle="Desliza para definir cuantos creditos deseas renovar."
              accent="indigo"
              delay={0.2}
            >
              <PlanSlider
                options={opcionesCreditos.length > 0 ? opcionesCreditos : [cantidadSeleccionada || 1]}
                value={cantidadSeleccionada || (opcionesCreditos[0] ?? 1)}
                onChange={onCantidadChange}
                unit="creditos"
              />
            </StepCard>
          ) : (
            <StepCard
              label="Paso 3"
              title="Renovacion por validez"
              subtitle="Se mantiene tu plan actual y se agregan dias de forma acumulativa."
              accent="indigo"
              delay={0.2}
            >
              <div className="rounded-xl border border-zinc-700 bg-zinc-800/50 p-4 space-y-2">
                <p className="text-sm text-zinc-300">Usuarios actuales: <span className="text-white font-semibold">{cantidadSeleccionada}</span></p>
                <p className="text-sm text-zinc-300">Duracion base: <span className="text-white font-semibold">{diasRenovacion} dias</span></p>
                <p className="text-xs text-zinc-500">Planes de validez disponibles: {planesValidity.length}</p>
              </div>
            </StepCard>
          )}

          <StepCard
            label={`Paso ${tipoSeleccionado === "credit" ? "4" : "4"}`}
            title="Informacion de contacto"
            accent="indigo"
            delay={0.3}
          >
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="text"
                  value={nombre}
                  onChange={(event) => onNombreChange(event.target.value)}
                  placeholder="Nombre del responsable"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  placeholder="tu@email.com"
                  className="w-full pl-11 pr-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </StepCard>

          <StepCard
            label="Paso 5"
            title="Codigo de descuento"
            subtitle="Opcional"
            accent="indigo"
            delay={0.35}
          >
            <CuponInput
              planId={planSeleccionado?.id}
              precioPlan={precioRenovacion}
              clienteEmail={email.trim()}
              cuponActual={cuponActual || undefined}
              descuentoActual={descuentoAplicado}
              onCuponValidado={onCuponValidado}
              onCuponRemovido={onCuponRemovido}
            />
          </StepCard>
        </StickyLayout>
      )}
    </div>
  );
}
