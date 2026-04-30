import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Search,
  User,
  Clock,
  Shield,
} from "lucide-react";
import CuponInput from "../../../components/CuponInput";
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
  onVerPlanes: () => void;
  onVolverBuscar: () => void;
  onProcesar: () => void;
  planSeleccionado: PlanRevendedor | null;
  cuponActual: CuponAplicado | null;
  descuentoAplicado: number;
  onCuponValidado: (descuento: number, cupon: CuponAplicado) => void;
  onCuponRemovido: () => void;
  operacionSeleccionada: "renovacion" | "expansion";
  cantidadBase: number;
  diasRestantes: number;
  userEmail?: string;
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
  onVolverBuscar,
  onProcesar,
  planSeleccionado,
  cuponActual,
  descuentoAplicado,
  onCuponValidado,
  onCuponRemovido,
  operacionSeleccionada,
  cantidadBase,
  diasRestantes,
  userEmail,
}: RenovacionPanelProps) {
  const tipoActual = revendedor?.datos.servex_account_type;
  const hasSessionEmail = Boolean(userEmail);
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

  const esExpansion = operacionSeleccionada === "expansion";
  const usuariosAAgregar = cantidadSeleccionada - cantidadBase;

  return (
    <div className="space-y-10 font-title">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-red-400">Error detectado</p>
            <p className="text-sm text-red-300/80 font-medium">{error}</p>
          </div>
        </div>
      )}

      {pasoRenovacion === "buscar" && (
        <StepCard
          label="Paso 01"
          title="Gestión de cuenta"
          subtitle="Identifica tu panel de revendedor para proceder."
          accent="zinc"
          delay={0.05}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Usuario de revendedor
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(event) => onBusquedaChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !buscando) {
                      onBuscar();
                    }
                  }}
                  placeholder="Ej. reseller_admin"
                  className="w-full pl-12 pr-4 py-4 bg-[#060606] border border-zinc-800/80 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all font-mono text-sm"
                  disabled={buscando}
                />
              </div>
            </div>

            <button
              onClick={onBuscar}
              disabled={buscando || !busqueda.trim()}
              className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
            >
              {buscando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  VERIFICANDO...
                </>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  BUSCAR CUENTA
                </>
              )}
            </button>
          </div>
        </StepCard>
      )}

      {pasoRenovacion === "configurar" && revendedor && (
        <StickyLayout
          aside={
            <SummaryPanel
              badgeText={esExpansion ? "Upgrade" : "Renovación"}
              accent="zinc"
              title={esExpansion ? `${usuariosAAgregar} cupos` : `${diasRenovacion} días`}
              subtitle={
                esExpansion
                  ? `Expandiendo tu capacidad de revendedor con ${usuariosAAgregar} usuarios.`
                  : `Extendiendo tu acceso al panel por un periodo de ${diasRenovacion} días.`
              }
              priceLabel="Monto total"
              price={`$${precioFinal.toLocaleString("es-AR")}`}
              unitLabel={esExpansion ? "Prorrateo" : "Valor / Unidad"}
              unitValue={esExpansion
                ? `$${precioFinal.toLocaleString("es-AR")} (${diasRestantes} días)`
                : `$${precioPorUnidad.toLocaleString("es-AR")}/${tipoSeleccionado === "credit" ? "crédito" : "cupo"}`
              }
              priceBreakdown={
                hayDescuento
                  ? ([
                    { label: "Subtotal", value: `$${precioRenovacion.toLocaleString("es-AR")}` },
                    {
                      label: `Cupón ${cuponActual?.codigo ? `(${cuponActual.codigo})` : ""}`,
                      value: `-$${descuentoAplicado.toLocaleString("es-AR")}`,
                      isDiscount: true,
                    },
                  ] as PriceBreakdownRow[])
                  : undefined
              }
              benefits={[
                esExpansion ? "Actualización de cupos instantánea" : "Renovación acumulativa",
                esExpansion ? `Vence el ${fechaExpiracion?.toLocaleDateString("es-AR")}` : "Acceso ininterrumpido",
                "Soporte técnico dedicado",
              ]}
              ctaLabel="CONFIRMAR Y PAGAR"
              onCtaClick={onProcesar}
              ctaDisabled={!puedeProcesar || procesando || precioFinal <= 0 || (esExpansion && usuariosAAgregar <= 0)}
              ctaLoading={procesando}
              ctaLoadingLabel="PROCESANDO..."
              secondaryLabel="CAMBIAR CUENTA"
              onSecondaryClick={onVolverBuscar}
            />
          }
        >
          {/* Status Box */}
          <div className="bg-[#1e1f26] border border-zinc-700/50 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00ffc8]/5 border border-[#00ffc8]/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[#00ffc8]/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#00ffc8] uppercase tracking-[0.2em] mb-1">Status: Vinculado</p>
                <h4 className="text-xl font-black text-white truncate uppercase">
                  {revendedor.datos.servex_username}.
                </h4>
                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-3">
                   <div className="flex items-center gap-2">
                     <Shield className="w-3.5 h-3.5 text-zinc-600" />
                     <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{tipoActual === "credit" ? "Sistema Créditos" : "Sistema Validez"}</span>
                   </div>
                   {fechaExpiracion && (
                     <div className="flex items-center gap-2">
                       <Clock className="w-3.5 h-3.5 text-zinc-600" />
                       <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Expira: {fechaExpiracion.toLocaleDateString("es-AR")}</span>
                     </div>
                   )}
                </div>
              </div>
            </div>
          </div>

          {tipoSeleccionado === "credit" ? (
            <StepCard
              label="Paso 01"
              title="Volumen de créditos"
              subtitle="Define la cantidad de créditos para tu panel."
              accent="zinc"
              delay={0.2}
            >
              <PlanSlider
                options={opcionesCreditos.length > 0 ? opcionesCreditos : [cantidadSeleccionada || 1]}
                value={cantidadSeleccionada || (opcionesCreditos[0] ?? 1)}
                onChange={onCantidadChange}
                unit="créditos"
              />
            </StepCard>
          ) : esExpansion ? (
            <StepCard
              label="Paso 01"
              title="Escalabilidad de cupos"
              subtitle={`Elige los usuarios adicionales. Costo prorrateado por ${diasRestantes} días.`}
              accent="zinc"
              delay={0.2}
            >
              <PlanSlider
                options={[10, 20, 30, 40, 50, 60, 70, 80, 90, 100]}
                value={usuariosAAgregar}
                onChange={(val) => onCantidadChange(cantidadBase + val)}
                unit="usuarios extra"
              />
              <div className="mt-6 p-6 bg-[#060606] border border-zinc-800/80 rounded-2xl grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Base Actual</span>
                  <p className="text-lg font-black text-white">{cantidadBase}</p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-[#00ffc8] uppercase tracking-widest">Nueva Base</span>
                  <p className="text-lg font-black text-white">{cantidadSeleccionada}</p>
                </div>
              </div>
            </StepCard>
          ) : (
            <StepCard
              label="Paso 01"
              title="Extensión de validez"
              subtitle="Tu plan actual se extenderá manteniendo todos tus cupos."
              accent="zinc"
              delay={0.2}
            >
              <div className="p-6 bg-[#060606] border border-zinc-800/80 rounded-2xl flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Capacidad Actual</p>
                  <p className="text-xl font-black text-white">{cantidadSeleccionada} Cupos</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-1">Nueva Duración</p>
                  <p className="text-xl font-black text-white">+{diasRenovacion} Días</p>
                </div>
              </div>
            </StepCard>
          )}

          <StepCard
            label="Paso 02"
            title="Datos de facturación"
            subtitle="Información para procesar el pago y comprobante."
            accent="zinc"
            delay={0.3}
          >
            <div className="grid sm:grid-cols-2 gap-5">
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Nombre Completo</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    value={nombre}
                    onChange={(event) => onNombreChange(event.target.value)}
                    placeholder="Ej. Juan Pérez"
                    className="w-full pl-12 pr-4 py-3.5 bg-[#060606] border border-zinc-800/80 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all font-mono text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">Email de contacto</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                  {hasSessionEmail ? (
                    <div className="w-full pl-12 pr-4 py-3.5 bg-[#1e1f26] border border-zinc-800/50 rounded-xl text-zinc-400 font-mono text-sm">
                      {userEmail}
                    </div>
                  ) : (
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => onEmailChange(event.target.value)}
                      placeholder="tu@email.com"
                      className="w-full pl-12 pr-4 py-3.5 bg-[#060606] border border-zinc-800/80 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all font-mono text-sm"
                    />
                  )}
                </div>
              </div>
            </div>
          </StepCard>

          <StepCard
            label="Paso 03"
            title="Código promocional"
            subtitle="Si tienes un cupón de descuento, aplícalo aquí."
            accent="zinc"
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
