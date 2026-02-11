import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import DemoModal from "../../components/DemoModal";
import { useServerStats } from "../../hooks/useServerStats";
import { RenovacionPanel } from "./components/RenovacionPanel";
import PlansHeader from "./components/PlansHeader";
import PlanSelector from "./components/PlanSelector";
import PlanSummary from "./components/PlanSummary";
import { usePlanes } from "./hooks/usePlanes";
import { useRenovacion } from "./hooks/useRenovacion";
import { ModoSeleccion, PlanesPageProps } from "./types";
export type { PlanesPageProps } from "./types";

// eslint-disable-next-line no-empty-pattern
export default function PlanesPage({ }: PlanesPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [modoSeleccion, setModoSeleccion] = useState<ModoSeleccion>("compra");
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  const {
    diasDisponibles,
    dispositivosDisponibles,
    diasSeleccionados,
    setDiasSeleccionados,
    dispositivosSeleccionados,
    setDispositivosSeleccionados,
    planSeleccionado,
    precioPorDiaPlan,
    planesParaRenovacion,
  } = usePlanes();

  const {
    pasoRenovacion,
    busquedaCuenta,
    setBusquedaCuenta,
    buscandoCuenta,
    errorRenovacion,
    cuentaRenovacion,
    diasRenovacion,
    setDiasRenovacion,
    dispositivosRenovacion,
    setDispositivosRenovacion,
    nombreRenovacion,
    setNombreRenovacion,
    emailRenovacion,
    setEmailRenovacion,
    procesandoRenovacion,
    cuponRenovacion,
    descuentoRenovacion,
    buscarCuentaDesdeUrl,
    buscarCuentaRenovacion,
    resetRenovacion,
    volverABuscarCuenta,
    handleCuponRenovacionValidado,
    handleCuponRenovacionRemovido,
    puedeProcesar,
    connectionActual,
    connectionDestino,
    precioRenovacionBase,
    precioRenovacionPorDiaBase,
    precioRenovacionFinal,
    precioRenovacionPorDia,
    getParametrosRenovacion,
    setProcesandoRenovacion,
    planRenovacionSeleccionado,
  } = useRenovacion(planesParaRenovacion);

  useServerStats(10000);

  // Manejar parámetro 'cuenta' de la URL para renovación directa
  useEffect(() => {
    const cuentaParam = searchParams.get("cuenta");
    if (cuentaParam) {
      setModoSeleccion("renovacion");
      // Limpiar el parámetro de la URL
      setSearchParams({}, { replace: true });
      // Buscar la cuenta automáticamente
      buscarCuentaDesdeUrl(cuentaParam);
    }
  }, [searchParams, setSearchParams, buscarCuentaDesdeUrl]);

  // Removed planesDestacados — feature 'Planes populares' disabled per request

  const activarModoCompra = () => {
    setModoSeleccion("compra");
    resetRenovacion();
  };

  const activarModoRenovacion = () => {
    if (modoSeleccion !== "renovacion") {
      resetRenovacion();
    }
    setModoSeleccion("renovacion");
  };

  const procesarRenovacion = () => {
    const params = getParametrosRenovacion();
    if (!params) return;
    setProcesandoRenovacion(true);
    navigate(`/checkout-renovacion?${params.toString()}`);
  };

  return (
    <div className="bg-refine-dark text-zinc-100">
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      <main>
        {/* Hero eliminado - iniciamos directamente la sección de planes */}

        {/* Plans Section */}
        <section className="relative py-12 sm:py-16 lg:py-20 bg-refine-dark">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tabs Compra / Renovación (moved from Hero) */}
            <PlansHeader
              modoSeleccion={modoSeleccion}
              onActivarModoCompra={activarModoCompra}
              onActivarModoRenovacion={activarModoRenovacion}
            />            <div className="w-full">
            {modoSeleccion === "compra" && (
              <div className="space-y-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid gap-10 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]"
                >
                  <PlanSelector
                    diasDisponibles={diasDisponibles}
                    diasSeleccionados={diasSeleccionados}
                    setDiasSeleccionados={setDiasSeleccionados}
                    dispositivosDisponibles={dispositivosDisponibles}
                    dispositivosSeleccionados={dispositivosSeleccionados}
                    setDispositivosSeleccionados={setDispositivosSeleccionados}
                  />

                  <PlanSummary
                    planSeleccionado={planSeleccionado}
                    precioPorDiaPlan={precioPorDiaPlan}
                    onCheckout={() => planSeleccionado && navigate(`/checkout?planId=${planSeleccionado.id}`)}
                    onOpenDemo={() => setIsDemoOpen(true)}
                  />
                </motion.div>

                {/* 'Planes populares' eliminado */}
              </div>
            )}

            {modoSeleccion === "renovacion" && (
              <RenovacionPanel
                pasoRenovacion={pasoRenovacion}
                busqueda={busquedaCuenta}
                onBusquedaChange={setBusquedaCuenta}
                onBuscarCuenta={buscarCuentaRenovacion}
                buscando={buscandoCuenta}
                error={errorRenovacion}
                cuenta={cuentaRenovacion}
                dias={diasRenovacion}
                onDiasChange={setDiasRenovacion}
                dispositivosSeleccionados={dispositivosRenovacion}
                onDispositivosChange={setDispositivosRenovacion}
                nombre={nombreRenovacion}
                onNombreChange={setNombreRenovacion}
                email={emailRenovacion}
                onEmailChange={setEmailRenovacion}
                puedeProcesar={puedeProcesar}
                procesando={procesandoRenovacion}
                onProcesar={procesarRenovacion}
                onCancelar={activarModoCompra}
                onVolverBuscar={volverABuscarCuenta}
                connectionActual={connectionActual}
                connectionDestino={connectionDestino}
                precioBase={precioRenovacionBase}
                precioTotal={precioRenovacionFinal}
                precioPorDia={precioRenovacionPorDia}
                precioPorDiaBase={precioRenovacionPorDiaBase}
                descuentoAplicado={descuentoRenovacion}
                cuponActual={cuponRenovacion}
                onCuponAplicado={handleCuponRenovacionValidado}
                onCuponRemovido={handleCuponRenovacionRemovido}
                planId={planRenovacionSeleccionado?.id}
              />
            )}
          </div>
        </div>
        </section>
      </main>
    </div>
  );
}
