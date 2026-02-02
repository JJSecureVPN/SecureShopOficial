import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Sparkles, Shield } from "lucide-react";
import { motion } from "framer-motion";
import DemoModal from "../../components/DemoModal";
import { RefineButton } from "../../components/RefineButton";
import { CardTitle, BodyText, SmallText } from "../../components/Typography";
import { Plan } from "../../types";
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
  const [cuponRenovacion, setCuponRenovacion] = useState<ValidacionCupon["cupon"] | null>(null);
  const [descuentoRenovacion, setDescuentoRenovacion] = useState(0);
  const [cuentaDesdeUrl, setCuentaDesdeUrl] = useState<string | null>(null);

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
      setEmailRenovacion(data.datos?.cliente_email || "");
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
    () => Math.max(0, Math.round(precioRenovacionBase - descuentoRenovacion)),
    [precioRenovacionBase, descuentoRenovacion]
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
      setEmailRenovacion(data.datos?.cliente_email || "");
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
  };

  useEffect(() => {
    if (cuponRenovacion) {
      setCuponRenovacion(null);
      setDescuentoRenovacion(0);
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
    });

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
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45 }}
              className="flex justify-center mb-8"
            >
              <div className="inline-flex items-center gap-1 rounded-full p-1.5 bg-zinc-800/80 backdrop-blur-sm border border-zinc-700">
                <button
                  onClick={activarModoCompra}
                  className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                    modoSeleccion === "compra"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800"
                  }`}
                >
                  Nueva cuenta
                </button>
                <button
                  onClick={activarModoRenovacion}
                  className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                    modoSeleccion === "renovacion"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-zinc-400 hover:text-indigo-400 hover:bg-zinc-800"
                  }`}
                >
                  Renovar cuenta
                </button>
              </div>
            </motion.div>
            <div className="w-full">
            {modoSeleccion === "compra" && (
              <div className="space-y-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="grid gap-10 grid-cols-1 lg:grid-cols-[minmax(0,1fr)_420px]"
                >
                  <div className="space-y-6">
                    {/* Selector de días */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.1 }}
                      className="rounded-2xl p-5 sm:p-6 lg:p-8 bg-zinc-900/50 border border-zinc-700 shadow-sm hover:shadow-lg hover:border-zinc-600 transition-all"
                    >
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 mb-3">
                            Paso 1
                          </span>
                          <CardTitle as="h3" className="text-xl sm:text-2xl text-white">
                            Duración del plan
                          </CardTitle>
                          <BodyText className="text-sm mt-1 text-zinc-400">Define cuántos días necesitas conexión segura.</BodyText>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {diasDisponibles.map((dias) => (
                          <button
                            key={dias}
                            onClick={() => setDiasSeleccionados(dias)}
                            className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                              diasSeleccionados === dias
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-orange-500/30 hover:bg-zinc-800'
                            }`}
                          >
                            {dias} días
                          </button>
                        ))}
                      </div>
                    </motion.div>

                    {/* Selector de dispositivos */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: 0.2 }}
                      className="rounded-2xl p-5 sm:p-6 lg:p-8 bg-zinc-900/50 border border-zinc-700 shadow-sm hover:shadow-lg hover:border-zinc-600 transition-all"
                    >
                      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 mb-3">
                            Paso 2
                          </span>
                          <CardTitle as="h3" className="text-xl sm:text-2xl text-white">
                            Dispositivos simultáneos
                          </CardTitle>
                          <BodyText className="text-sm mt-1 text-zinc-400">Cambia la cantidad cuando quieras añadir más conexiones.</BodyText>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {dispositivosDisponibles.map((dispositivos) => (
                          <button
                            key={dispositivos}
                            onClick={() => setDispositivosSeleccionados(dispositivos)}
                            className={`rounded-xl border-2 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
                              dispositivosSeleccionados === dispositivos
                                ? 'border-indigo-500 bg-indigo-500/10 text-indigo-400'
                                : 'border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-orange-500/30 hover:bg-zinc-800'
                            }`}
                          >
                            {dispositivos} {dispositivos === 1 ? "dispositivo" : "dispositivos"}
                          </button>
                        ))}
                      </div>
                      <BodyText className="mt-4 text-sm text-zinc-400">
                        ¿Necesitas más conexiones? Podemos armar planes especiales para equipos o revendedores.
                      </BodyText>
                    </motion.div>
                  </div>

                  {/* Resumen del plan - Sidebar */}
                  <motion.aside
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="rounded-2xl p-5 sm:p-6 lg:p-8 bg-gradient-to-br from-zinc-900 via-zinc-900/90 to-zinc-800 border border-zinc-700 shadow-lg sm:fixed sm:right-4 sm:top-24 sm:w-[360px] md:sm:w-[420px] sm:z-50 lg:static lg:sticky lg:top-24 lg:self-start lg:w-[420px]"
                  >
                    <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.15em] bg-indigo-600 text-white mb-6">
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Tu selección</span>
                    </div>

                    <div className="space-y-2 mb-6">
                      <CardTitle as="h3" className="text-2xl sm:text-3xl text-white">
                        {planSeleccionado ? `${planSeleccionado.dias} días` : "Elige tu combinación"}
                      </CardTitle>
                      <BodyText className="text-sm sm:text-base text-zinc-400">
                        {planSeleccionado
                          ? `Protección para ${planSeleccionado.connection_limit} ${
                              planSeleccionado.connection_limit === 1 ? "dispositivo" : "dispositivos"
                            } con velocidad ilimitada.`
                          : "Primero selecciona duración y dispositivos para ver el detalle completo."}
                      </BodyText>
                    </div>

                    {planSeleccionado ? (
                      <div className="space-y-6">
                        <div className="rounded-xl p-4 sm:p-5 lg:p-6 bg-zinc-800/50 backdrop-blur-sm border border-zinc-700 flex flex-wrap items-center justify-between gap-4">
                          <div>
                            <p className="text-sm text-zinc-500">Pago único</p>
                            <p className="text-3xl sm:text-4xl lg:text-5xl font-bold text-orange-500">${planSeleccionado.precio}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs uppercase text-zinc-500">Equivale a</p>
                            <p className="text-lg sm:text-xl font-semibold text-orange-400">${precioPorDiaPlan}/día</p>
                          </div>
                        </div>

                        <ul className="space-y-3 text-sm text-zinc-300">
                          <li className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                            Servidores premium en más de 15 países
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                            Cambio ilimitado de ubicaciones
                          </li>
                          <li className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-orange-500" />
                            Soporte humano 24/7 en español
                          </li>
                        </ul>

                        <div className="space-y-3">
                          <RefineButton
                            onClick={() => planSeleccionado && navigate(`/checkout?planId=${planSeleccionado.id}`)}
                            variant="primary"
                            className="w-full"
                          >
                            Continuar al pago
                          </RefineButton>
                          <RefineButton
                            onClick={() => setIsDemoOpen(true)}
                            variant="secondary"
                            className="w-full"
                          >
                            Ver demo en vivo
                          </RefineButton>
                        </div>

                        <SmallText as="p" className="text-xs text-zinc-500 text-center">
                          Pago seguro con Mercado Pago, tarjetas internacionales o criptomonedas.
                        </SmallText>
                      </div>
                    ) : (
                      <div className="rounded-xl border-2 border-dashed border-zinc-700 p-5 sm:p-6 text-sm text-zinc-500 bg-zinc-800/30 text-center">
                        <Shield className="w-8 h-8 text-zinc-600 mx-auto mb-3" />
                        Te mostraremos aquí el resumen con precio y beneficios cuando elijas una combinación.
                      </div>
                    )}
                  </motion.aside>
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
