import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import SegmentedControl from "../../components/SegmentedControl";
import CompactHeroControl from "../../components/CompactHeroControl";
import { motion } from "framer-motion";
import DemoModal from "../../components/DemoModal";
import { BodyText } from "../../components/Typography";
import { Plan } from "../../types";
import PlanSlider from "./components/PlanSlider";
import StickyLayout from "../../components/StickyLayout";
import StepCard from "../../components/StepCard";
import SummaryPanel from "../../components/SummaryPanel";
import { apiService } from "../../services/api.service";
import type { ValidacionCupon } from "../../services/api.service";
import { useServerStats } from "../../hooks/useServerStats";
import { RenovacionPanel } from "./components/RenovacionPanel";
import {
  calcularPrecioDiario,
  calcularPrecioRenovacion,
  calcularPrecioRenovacionPorDia,
  crearParametrosRenovacion,
  encontrarPlan,
  obtenerConnectionActual,
  obtenerDiasDisponibles,
  obtenerDispositivosDisponibles,
  puedeProcesarRenovacion,
} from "./utils";
import { CuentaRenovacion, ModoSeleccion, PasoRenovacion, PlanesPageProps } from "./types";
import { PromoBanner2x1 } from "../../components/PromoBanner2x1";
// import AdBanner from "../../components/AdBanner";
export type { PlanesPageProps } from "./types";

// eslint-disable-next-line no-empty-pattern
export default function PlanesPage({ }: PlanesPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planesRenovacion, setPlanesRenovacion] = useState<Plan[]>([]);
  const [modoSeleccion, setModoSeleccion] = useState<ModoSeleccion>("compra");
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [diasSeleccionados, setDiasSeleccionados] = useState(30);
  const [dispositivosSeleccionados, setDispositivosSeleccionados] = useState(1);

  const [pasoRenovacion, setPasoRenovacion] = useState<PasoRenovacion>("buscar");
  const [busquedaCuenta, setBusquedaCuenta] = useState("");
  const [buscandoCuenta, setBuscandoCuenta] = useState(false);
  const [errorRenovacion, setErrorRenovacion] = useState("");
  const [cuentaRenovacion, setCuentaRenovacion] = useState<CuentaRenovacion | null>(null);
  const [diasRenovacion, setDiasRenovacion] = useState(7);
  const [dispositivosRenovacion, setDispositivosRenovacion] = useState<number | null>(null);
  const [nombreRenovacion, setNombreRenovacion] = useState("");
  const [emailRenovacion, setEmailRenovacion] = useState("");
  const [procesandoRenovacion, setProcesandoRenovacion] = useState(false);
  const { user } = useAuth();
  const [cuponRenovacion, setCuponRenovacion] = useState<ValidacionCupon["cupon"] | null>(null);
  const [descuentoRenovacion, setDescuentoRenovacion] = useState(0);
  const [cuentaDesdeUrl, setCuentaDesdeUrl] = useState<string | null>(null);
  
  const [codigoReferidoRenovacion, setCodigoReferidoRenovacion] = useState<string | null>(null);
  const [descuentoReferidoRenovacion, setDescuentoReferidoRenovacion] = useState(0);
  const [saldoUsadoRenovacion, setSaldoUsadoRenovacion] = useState(0);

  useServerStats(10000);

  // Función para buscar cuenta (declarada antes del useEffect)
  const buscarCuentaDesdeUrl = useCallback(async (username: string) => {
    setBusquedaCuenta(username);
    setBuscandoCuenta(true);
    setErrorRenovacion("");

    try {
      const response = await fetch("/api/renovacion/buscar?tipo=cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al buscar la cuenta");
      }

      if (!data?.encontrado) {
        setErrorRenovacion("No se encontró ninguna cuenta con ese username");
        return;
      }

      const cuenta: CuentaRenovacion = {
        tipo: data.tipo,
        datos: data.datos,
      };

      setCuentaRenovacion(cuenta);
      setNombreRenovacion(data.datos?.cliente_nombre || "");
      setEmailRenovacion(user?.email || data.datos?.cliente_email || "");
      setDiasRenovacion(7);
      setDispositivosRenovacion(null);
      setPasoRenovacion("configurar");
    } catch (error: any) {
      setErrorRenovacion(error?.message || "Error al buscar la cuenta");
    } finally {
      setBuscandoCuenta(false);
    }
  }, []);

  // Manejar parámetro 'cuenta' de la URL para renovación directa
  useEffect(() => {
    const cuentaParam = searchParams.get("cuenta");
    if (cuentaParam && cuentaParam !== cuentaDesdeUrl) {
      setCuentaDesdeUrl(cuentaParam);
      setModoSeleccion("renovacion");
      // Limpiar el parámetro de la URL
      setSearchParams({}, { replace: true });
      // Buscar la cuenta automáticamente
      buscarCuentaDesdeUrl(cuentaParam);
    }
  }, [searchParams, cuentaDesdeUrl, setSearchParams, buscarCuentaDesdeUrl]);

  useEffect(() => {
    if (user?.email) {
      setEmailRenovacion(user.email);
    }
  }, [user?.email]);

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        const [planesObtenidos, planesRenovacionObtenidos] = await Promise.all([
          apiService.obtenerPlanes(true, "compra"),
          apiService.obtenerPlanes(true, "renovacion"),
        ]);
        setPlanes(planesObtenidos);
        setPlanesRenovacion(planesRenovacionObtenidos);
      } catch (error) {
        console.error("Error cargando planes:", error);
        setPlanes([]);
        setPlanesRenovacion([]);
      }
    };

    cargarPlanes();
  }, []);

  // Forzar header fijo mientras esta página esté montada (evita que otros contenedores
  // con transform rompan el comportamiento sticky del header global)
  useEffect(() => {
    const headerEl = document.querySelector('header');
    if (!headerEl) return;

    const prev = {
      position: headerEl.style.position || '',
      top: headerEl.style.top || '',
      left: headerEl.style.left || '',
      right: headerEl.style.right || '',
      zIndex: headerEl.style.zIndex || '',
    };

    headerEl.style.position = 'fixed';
    headerEl.style.top = '0';
    headerEl.style.left = '0';
    headerEl.style.right = '0';
    headerEl.style.zIndex = '10001';

    return () => {
      headerEl.style.position = prev.position;
      headerEl.style.top = prev.top;
      headerEl.style.left = prev.left;
      headerEl.style.right = prev.right;
      headerEl.style.zIndex = prev.zIndex;
    };
  }, []);

  const diasDisponibles = useMemo(() => obtenerDiasDisponibles(planes), [planes]);
  const dispositivosDisponibles = useMemo(() => obtenerDispositivosDisponibles(planes), [planes]);

  const planSeleccionado = useMemo(
    () => encontrarPlan(planes, diasSeleccionados, dispositivosSeleccionados),
    [planes, diasSeleccionados, dispositivosSeleccionados]
  );

  const precioPorDiaPlan = useMemo(() => calcularPrecioDiario(planSeleccionado), [planSeleccionado]);

  const connectionActual = obtenerConnectionActual(cuentaRenovacion);
  const connectionDestino = dispositivosRenovacion ?? connectionActual;

  const planesParaRenovacion = useMemo(
    () => (planesRenovacion.length ? planesRenovacion : planes),
    [planesRenovacion, planes]
  );

  const planRenovacionSeleccionado = useMemo(
    () => encontrarPlan(planesParaRenovacion, diasRenovacion, connectionDestino),
    [planesParaRenovacion, diasRenovacion, connectionDestino]
  );

  const precioRenovacionBase = useMemo(
    () =>
      calcularPrecioRenovacion(
        planesParaRenovacion,
        cuentaRenovacion,
        diasRenovacion,
        connectionDestino
      ),
    [planesParaRenovacion, cuentaRenovacion, diasRenovacion, connectionDestino]
  );

  const precioRenovacionPorDiaBase = useMemo(
    () =>
      calcularPrecioRenovacionPorDia(
        planesParaRenovacion,
        cuentaRenovacion,
        diasRenovacion,
        connectionDestino
      ),
    [planesParaRenovacion, cuentaRenovacion, diasRenovacion, connectionDestino]
  );

  const precioRenovacionFinal = useMemo(
    () => Math.max(0, Math.round(precioRenovacionBase - descuentoRenovacion - descuentoReferidoRenovacion - saldoUsadoRenovacion)),
    [precioRenovacionBase, descuentoRenovacion, descuentoReferidoRenovacion, saldoUsadoRenovacion]
  );

  const precioRenovacionPorDia = useMemo(() => {
    if (diasRenovacion <= 0) {
      return 0;
    }
    return Math.max(0, Math.round(precioRenovacionFinal / diasRenovacion));
  }, [precioRenovacionFinal, diasRenovacion]);

  const puedeProcesar = useMemo(
    () => puedeProcesarRenovacion(pasoRenovacion, cuentaRenovacion, nombreRenovacion, emailRenovacion),
    [pasoRenovacion, cuentaRenovacion, nombreRenovacion, emailRenovacion]
  );

  const is2x1Global = useMemo(() => planes.some(p => p.en_oferta_2x1), [planes]);

  // Removed planesDestacados — feature 'Planes populares' disabled per request

  const resetRenovacion = () => {
    setPasoRenovacion("buscar");
    setBusquedaCuenta("");
    setBuscandoCuenta(false);
    setErrorRenovacion("");
    setCuentaRenovacion(null);
    setDiasRenovacion(7);
    setDispositivosRenovacion(null);
    setNombreRenovacion("");
    setEmailRenovacion("");
    setProcesandoRenovacion(false);
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
    setCodigoReferidoRenovacion(null);
    setDescuentoReferidoRenovacion(0);
    setSaldoUsadoRenovacion(0);
  };

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

  const buscarCuentaRenovacion = async () => {
    if (!busquedaCuenta.trim()) {
      setErrorRenovacion("Ingresa un email o username");
      return;
    }

    setBuscandoCuenta(true);
    setErrorRenovacion("");

    try {
      const response = await fetch("/api/renovacion/buscar?tipo=cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: busquedaCuenta.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al buscar la cuenta");
      }

      if (!data?.encontrado) {
        setErrorRenovacion("No se encontró ninguna cuenta con ese email o username");
        return;
      }

      const cuenta: CuentaRenovacion = {
        tipo: data.tipo,
        datos: data.datos,
      };

      setCuentaRenovacion(cuenta);
      setNombreRenovacion(data.datos?.cliente_nombre || "");
      setEmailRenovacion(user?.email || data.datos?.cliente_email || "");
      setDiasRenovacion(7);
      setDispositivosRenovacion(null);
      setPasoRenovacion("configurar");
    } catch (error: any) {
      setErrorRenovacion(error?.message || "Error al buscar la cuenta");
    } finally {
      setBuscandoCuenta(false);
    }
  };

  const volverABuscarCuenta = () => {
    setPasoRenovacion("buscar");
    setCuentaRenovacion(null);
    setDispositivosRenovacion(null);
    setErrorRenovacion("");
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
    setCodigoReferidoRenovacion(null);
    setDescuentoReferidoRenovacion(0);
    setSaldoUsadoRenovacion(0);
  };

  useEffect(() => {
    if (cuponRenovacion || codigoReferidoRenovacion || saldoUsadoRenovacion > 0) {
      setCuponRenovacion(null);
      setDescuentoRenovacion(0);
      setCodigoReferidoRenovacion(null);
      setDescuentoReferidoRenovacion(0);
      setSaldoUsadoRenovacion(0);
    }
  }, [diasRenovacion, connectionDestino, cuentaRenovacion]);

  const handleCuponRenovacionValidado = (descuento: number, cuponData: ValidacionCupon["cupon"]) => {
    const descuentoNormalizado = Number.isFinite(descuento) ? Math.round(descuento) : 0;
    setDescuentoRenovacion(descuentoNormalizado);
    setCuponRenovacion(cuponData || null);
  };

  const handleCuponRenovacionRemovido = () => {
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
  };

  const handleReferidoValidado = (descuento: number, codigo: string) => {
    setDescuentoReferidoRenovacion(descuento);
    setCodigoReferidoRenovacion(codigo);
  };

  const handleReferidoRemovido = () => {
    setCodigoReferidoRenovacion(null);
    setDescuentoReferidoRenovacion(0);
  };

  const handleSaldoAplicado = (monto: number) => {
    setSaldoUsadoRenovacion(monto);
  };

  const handleSaldoRemovido = () => {
    setSaldoUsadoRenovacion(0);
  };

  const procesarRenovacion = () => {
    if (!puedeProcesar || !cuentaRenovacion) {
      return;
    }

    setProcesandoRenovacion(true);
    setErrorRenovacion("");

    const params = crearParametrosRenovacion({
      cuenta: cuentaRenovacion,
      busqueda: busquedaCuenta,
      dias: diasRenovacion,
      precio: precioRenovacionFinal,
      nombre: nombreRenovacion,
      email: emailRenovacion,
      dispositivos: {
        actual: connectionActual,
        destino: connectionDestino,
      },
      precioOriginal: precioRenovacionBase,
      descuentoAplicado: descuentoRenovacion,
      cupon: cuponRenovacion
        ? { codigo: cuponRenovacion.codigo, id: cuponRenovacion.id }
        : null,
      planId: planRenovacionSeleccionado?.id,
      codigoReferido: codigoReferidoRenovacion,
      saldoUsado: saldoUsadoRenovacion,
    });

    navigate(`/checkout-renovacion?${params.toString()}`);
  };

  return (
    <div className="text-zinc-100 min-h-screen relative overflow-x-hidden">
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      {/* Decorative Background Elements - Positioned behind content */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Lines 2: Right Middle */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.5, x: 0 }}
          transition={{ duration: 2.5, delay: 0.5 }}
          className="absolute top-[20%] -right-[10%] w-[600px] md:w-[900px] h-auto opacity-30"
        >
          <img src="/lines-2-4e66616a5ef291c3566a7ddfe1ffaaa8.svg" alt="" className="w-full h-auto" />
        </motion.div>

        {/* Lines 3: Flowing through Middle */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.4, x: 0 }}
          transition={{ duration: 3, delay: 1 }}
          className="absolute top-[55%] -left-[2%] w-[700px] md:w-[1000px] h-auto opacity-40"
        >
          <img src="/lines-3-4541e35a1939230404d773f7eeddcc9b.svg" alt="" className="w-full h-auto" />
        </motion.div>
      </div>

      <main className="relative z-10">
        {/* Plans Section */}
        <section className="relative py-4 sm:py-8 lg:py-12 z-10">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Tabs Compra / Renovación — mobile */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex justify-center mt-4 mb-8 md:hidden"
            >
              <div className="w-full max-w-[720px]">
                <SegmentedControl
                  value={modoSeleccion}
                  onChange={(v) => (v === 'compra' ? activarModoCompra() : activarModoRenovacion())}
                  descriptions={{
                    compra: 'Crea una cuenta VPN con acceso ilimitado a servidores y cambio de ubicación.',
                    renovacion: 'Renueva tu suscripción VPN y conserva tu configuración y dispositivos.'
                  }}
                  showExpansion={false}
                />
              </div>
            </motion.div>
            {/* Desktop hero compact */}
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="hidden md:block mt-6 mb-10"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <CompactHeroControl
                  value={modoSeleccion}
                  onChange={(v) => (v === 'compra' ? activarModoCompra() : activarModoRenovacion())}
                  showExpansion={false}
                />
              </div>
            </motion.div>

            <div className="w-full">
            {modoSeleccion === "compra" && (
              <div className="space-y-16 pb-28 lg:pb-0">
                <StickyLayout
                  aside={
                    <SummaryPanel
                      className="hidden lg:block"
                      badgeText="Resumen"
                      accent="zinc"
                      title={planSeleccionado ? `${planSeleccionado.dias} días` : "Tu selección"}
                      subtitle={
                        planSeleccionado ? (
                          <>
                            Protección para {planSeleccionado.connection_limit}{" "}
                            {planSeleccionado.connection_limit === 1
                              ? "dispositivo"
                              : "dispositivos"}{" "}
                            simultáneos.
                          </>
                        ) : (
                          "Selecciona un plan para ver los beneficios y continuar."
                        )
                      }
                      hasSelection={!!planSeleccionado}
                      priceLabel="Pago único"
                      price={planSeleccionado ? `$${planSeleccionado.precio}` : ""}
                      unitLabel="Valor equivalente"
                      unitValue={planSeleccionado ? `$${precioPorDiaPlan}/día` : undefined}
                      benefits={[
                        "Servidores premium en +15 países",
                        "Cambio de ubicaciones sin límites",
                        "Soporte humano 24/7",
                      ]}
                      ctaLabel="Continuar al pago"
                      onCtaClick={() => planSeleccionado && navigate(`/checkout?planId=${planSeleccionado.id}`)}
                      secondaryLabel="Ver demo rápida"
                      onSecondaryClick={() => setIsDemoOpen(true)}
                      is2x1={planSeleccionado?.en_oferta_2x1}
                    />
                  }
                >
                  {/* Selector de días */}
                  <StepCard
                    label="Paso 1"
                    title="Duración del plan"
                    subtitle="Desliza para elegir cuántos días necesitas conexión segura."
                    accent="zinc"
                    delay={0.1}
                  >
                    <PlanSlider
                      options={diasDisponibles}
                      value={diasSeleccionados}
                      onChange={setDiasSeleccionados}
                    />
                  </StepCard>

                  {/* Selector de dispositivos */}
                  <StepCard
                    label="Paso 2"
                    title="Dispositivos simultáneos"
                    subtitle="Selecciona cuántos equipos quieres proteger al mismo tiempo."
                    accent="zinc"
                    delay={0.2}
                  >
                    {is2x1Global && <PromoBanner2x1 />}
                    
                    <PlanSlider
                      options={dispositivosDisponibles}
                      value={dispositivosSeleccionados}
                      onChange={setDispositivosSeleccionados}
                      unit="dispositivos"
                      is2x1={is2x1Global}
                    />
                    <BodyText className="mt-5 text-sm text-zinc-500">
                      ¿Necesitas más conexiones? Podemos armar planes especiales para equipos o revendedores.
                    </BodyText>
                  </StepCard>

                  {/* Mobile Summary: visible only on small screens, between Step 2 and Banner */}
                  <div className="lg:hidden">
                    <SummaryPanel
                      badgeText="Resumen"
                      accent="zinc"
                      title={planSeleccionado ? `${planSeleccionado.dias} días` : "Tu selección"}
                      subtitle={
                        planSeleccionado ? (
                          <>
                            Protección para {planSeleccionado.connection_limit}{" "}
                            {planSeleccionado.connection_limit === 1
                              ? "dispositivo"
                              : "dispositivos"}{" "}
                            simultáneos.
                          </>
                        ) : (
                          "Selecciona un plan para ver los beneficios y continuar."
                        )
                      }
                      hasSelection={!!planSeleccionado}
                      priceLabel="Pago único"
                      price={planSeleccionado ? `$${planSeleccionado.precio}` : ""}
                      unitLabel="Valor equivalente"
                      unitValue={planSeleccionado ? `$${precioPorDiaPlan}/día` : undefined}
                      benefits={[
                        "Servidores premium en +15 países",
                        "Cambio de ubicaciones sin límites",
                        "Soporte humano 24/7",
                      ]}
                      ctaLabel="Continuar al pago"
                      onCtaClick={() => planSeleccionado && navigate(`/checkout?planId=${planSeleccionado.id}`)}
                      secondaryLabel="Ver demo rápida"
                      onSecondaryClick={() => setIsDemoOpen(true)}
                      is2x1={planSeleccionado?.en_oferta_2x1}
                    />
                  </div>

                  {/* Sponsorship Banner */}
                  <div className="pt-8">
                    {/* <AdBanner variant="horizontal" /> */}
                  </div>
                </StickyLayout>
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
                codigoReferido={codigoReferidoRenovacion}
                onReferidoAplicado={handleReferidoValidado}
                onReferidoRemovido={handleReferidoRemovido}
                saldoUsado={saldoUsadoRenovacion}
                onSaldoAplicado={handleSaldoAplicado}
                onSaldoRemovido={handleSaldoRemovido}
                descuentoReferido={descuentoReferidoRenovacion}
                userEmail={user?.email}
              />
            )}
          </div>
        </div>
        </section>
      </main>
    </div>
  );
}
