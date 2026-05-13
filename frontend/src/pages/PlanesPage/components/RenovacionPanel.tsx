import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Search,
  User,
  Shield,
} from "lucide-react";
import {
  DIAS_RENOVACION,
  DISPOSITIVOS_RENOVACION,
} from "../constants";
import { CuentaRenovacion, PasoRenovacion } from "../types";
import CuponInput from "../../../components/CuponInput";
import type { ValidacionCupon } from "../../../services/api.service";
import PlanSlider from "./PlanSlider";
import StickyLayout from "../../../components/StickyLayout";
import StepCard from "../../../components/StepCard";
import SummaryPanel, { PriceBreakdownRow } from "../../../components/SummaryPanel";
import SaldoReferidoRenovacion from "../../../components/SaldoReferidoRenovacion";

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
  codigoReferido: string | null;
  onReferidoAplicado: (descuento: number, codigo: string) => void;
  onReferidoRemovido: () => void;
  saldoUsado: number;
  onSaldoAplicado: (monto: number) => void;
  onSaldoRemovido: () => void;
  descuentoReferido: number;
  userEmail?: string;
  diasDisponibles?: number[];
  dispositivosDisponibles?: number[];
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
  codigoReferido,
  onReferidoAplicado,
  onReferidoRemovido,
  saldoUsado,
  onSaldoAplicado,
  onSaldoRemovido,
  descuentoReferido,
  userEmail,
  diasDisponibles = [],
  dispositivosDisponibles = [],
}: RenovacionPanelProps) {
  const hasSessionEmail = Boolean(userEmail);
  const handleBuscar = () => {
    if (!buscando) {
      onBuscarCuenta();
    }
  };

  const hayDescuento = descuentoAplicado > 0;

  return (
    <div className="space-y-10 font-title">
      {/* Error State */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex items-start gap-4 animate-in fade-in slide-in-from-top-4 duration-300">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-red-400">Error detectado</p>
            <p className="text-sm text-red-300/80 font-medium">{error}</p>
          </div>
        </div>
      )}

      {/* Step 1: Search */}
      {pasoRenovacion === "buscar" && (
        <StepCard
          label="Paso 01"
          title="Búsqueda de cuenta"
          subtitle="Identifica tu usuario VPN para proceder con la renovación."
          accent="zinc"
          delay={0.05}
        >
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                Nombre de usuario
              </label>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-white transition-colors" />
                <input
                  type="text"
                  value={busqueda}
                  onChange={(event) => onBusquedaChange(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleBuscar();
                    }
                  }}
                  placeholder="Ej. tunombre123"
                  className="w-full pl-12 pr-4 py-4 bg-[#060606] border border-zinc-800/80 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all font-mono text-sm"
                  disabled={buscando}
                />
              </div>
            </div>

            <button
              onClick={handleBuscar}
              disabled={buscando || !busqueda.trim()}
              className="w-full py-4 bg-white text-black font-black rounded-xl hover:bg-zinc-200 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
            >
              {buscando ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  BUSCANDO...
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

      {/* Step 2: Configuration */}
      {pasoRenovacion === "configurar" && cuenta && (
        <StickyLayout
          aside={
            <SummaryPanel
              badgeText="Resumen de renovación"
              accent="zinc"
              title={`${dias} días`}
              subtitle={
                <>
                  {cuenta.tipo === "cliente"
                    ? `Protección para ${connectionDestino} ${connectionDestino === 1 ? "dispositivo" : "dispositivos"} simultáneos.`
                    : "Renovación de cuenta revendedor."}
                  {cuenta.tipo === "cliente" && connectionDestino !== connectionActual && (
                    <span className="block mt-1 text-[#00ffc8] text-[10px] font-bold uppercase tracking-widest">
                      Upgrade: {connectionActual} → {connectionDestino} equipos
                    </span>
                  )}
                </>
              }
              priceLabel="Monto total"
              price={`$${precioTotal.toLocaleString("es-AR")}`}
              unitLabel="Costo diario"
              unitValue={`$${precioPorDia.toLocaleString("es-AR")}/día`}
              priceBreakdown={
                hayDescuento || descuentoReferido > 0 || saldoUsado > 0
                  ? ([
                      { label: "Subtotal", value: `$${precioBase.toLocaleString("es-AR")}` },
                      descuentoAplicado > 0 ? {
                        label: `Cupón ${cuponActual?.codigo ? `(${cuponActual.codigo})` : ""}`,
                        value: `-$${descuentoAplicado.toLocaleString("es-AR")}`,
                        isDiscount: true,
                      } : null,
                      descuentoReferido > 0 ? {
                        label: `Referido (${codigoReferido})`,
                        value: `-$${descuentoReferido.toLocaleString("es-AR")}`,
                        isDiscount: true,
                      } : null,
                      saldoUsado > 0 ? {
                        label: "Saldo usado",
                        value: `-$${saldoUsado.toLocaleString("es-AR")}`,
                        isDiscount: true,
                      } : null,
                    ].filter(Boolean) as PriceBreakdownRow[])
                  : undefined
              }
              benefits={[
                `Extensión de ${dias} días acumulativos`,
                cuenta.tipo === "cliente"
                  ? `${connectionDestino} dispositivos permitidos`
                  : "Cuenta activa ininterrumpidamente",
                "Acceso a servidores de alta velocidad",
              ]}
              ctaLabel="CONFIRMAR Y PAGAR"
              onCtaClick={onProcesar}
              ctaDisabled={!puedeProcesar}
              ctaLoading={procesando}
              ctaLoadingLabel="PROCESANDO..."
              secondaryLabel="CAMBIAR CUENTA"
              onSecondaryClick={onVolverBuscar}
            />
          }
        >
          {/* Account Found Card */}
          <div className="bg-[#1e1f26] border border-zinc-700/50 rounded-2xl p-6 shadow-xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#00ffc8]/5 border border-[#00ffc8]/10 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-[#00ffc8]/60" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-[#00ffc8] uppercase tracking-[0.2em] mb-1">Status: Encontrada</p>
                <h4 className="text-xl font-black text-white truncate uppercase">
                  {cuenta.datos.servex_username}.
                </h4>
                <div className="flex items-center gap-2 mt-3">
                   <Shield className="w-3.5 h-3.5 text-zinc-600" />
                   <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                     {cuenta.tipo === "cliente" ? "Cliente VPN Premium" : "Panel Revendedor"}
                   </span>
                </div>
              </div>
            </div>
          </div>

          <StepCard
            label="Paso 01"
            title="Extensión de tiempo"
            subtitle="Elige cuántos días adicionales quieres sumar a tu cuenta."
            accent="zinc"
            delay={0.1}
          >
            <PlanSlider
              options={diasDisponibles.length > 0 ? diasDisponibles : DIAS_RENOVACION}
              value={dias}
              onChange={onDiasChange}
            />
          </StepCard>

          {cuenta.tipo === "cliente" && (
            <StepCard
              label="Paso 02"
              title="Equipos simultáneos"
              subtitle="Define el límite de dispositivos conectados al mismo tiempo."
              accent="zinc"
              delay={0.2}
            >
              <PlanSlider
                options={dispositivosDisponibles.length > 0 ? dispositivosDisponibles : DISPOSITIVOS_RENOVACION}
                value={dispositivosSeleccionados ?? connectionActual}
                onChange={(v) => onDispositivosChange(v)}
                unit="dispositivos"
              />
            </StepCard>
          )}

          <StepCard
            label={`Paso ${cuenta.tipo === "cliente" ? "03" : "02"}`}
            title="Información de contacto"
            subtitle="Tus datos para la facturación y comprobante de pago."
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

          {cuenta.tipo === "cliente" && (
            <div className="space-y-6">
              <CuponInput
                planId={planId}
                precioPlan={precioBase}
                onCuponValidado={onCuponAplicado}
                onCuponRemovido={onCuponRemovido}
                cuponActual={cuponActual}
                descuentoActual={descuentoAplicado}
                clienteEmail={email}
              />
              <SaldoReferidoRenovacion
                clienteEmail={email}
                precioSubtotal={precioBase - descuentoAplicado}
                onReferidoAplicado={onReferidoAplicado}
                onReferidoRemovido={onReferidoRemovido}
                onSaldoAplicado={onSaldoAplicado}
                onSaldoRemovido={onSaldoRemovido}
                codigoReferidoActual={codigoReferido}
                descuentoReferidoActual={descuentoReferido}
                saldoUsadoActual={saldoUsado}
              />
            </div>
          )}
        </StickyLayout>
      )}
    </div>
  );
}
