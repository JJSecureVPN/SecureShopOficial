import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { BarChart3 } from "lucide-react";
import { motion } from 'framer-motion';
import { PlanRevendedor } from "../../types";
import { apiService, ValidacionCupon } from "../../services/api.service";
import SegmentedControl from "../../components/SegmentedControl";
import CompactHeroControl from "../../components/CompactHeroControl";
import { RenovacionPanel } from "./components/RenovacionPanel";
import ResellerPlanSelector from "./components/ResellerPlanSelector";
import { SupportSection } from "./components/SupportSection";
import { ShowcaseGallery } from "./components/ShowcaseGallery";
// import AdBanner from "../../components/AdBanner";
import { DIAS_POR_CREDITOS, EMAIL_REGEX } from "./constants";
import {
  ModoSeleccion,
  PasoRenovacion,
  PlanGroup,
  RevendedorEncontrado,
} from "./types";

type CuponAplicado = NonNullable<ValidacionCupon["cupon"]>;

export default function RevendedoresPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [planes, setPlanes] = useState<PlanRevendedor[]>([]);
  const [planesRenovacion, setPlanesRenovacion] = useState<PlanRevendedor[]>([]);
  const [modoSeleccion, setModoSeleccion] = useState<ModoSeleccion>("compra");

  const [pasoRenovacion, setPasoRenovacion] = useState<PasoRenovacion>("buscar");
  const [busquedaRenovacion, setBusquedaRenovacion] = useState("");
  const [buscandoRenovacion, setBuscandoRenovacion] = useState(false);
  const [errorRenovacion, setErrorRenovacion] = useState("");
  const [revendedorRenovacion, setRevendedorRenovacion] = useState<RevendedorEncontrado | null>(null);
  const [tipoRenovacionSeleccionado, setTipoRenovacionSeleccionado] = useState<"validity" | "credit">("validity");
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState<number>(0);
  const [nombreRenovacion, setNombreRenovacion] = useState("");
  const [emailRenovacion, setEmailRenovacion] = useState("");
  const [procesandoRenovacion, setProcesandoRenovacion] = useState(false);
  const { user } = useAuth();
  const [cuponRenovacion, setCuponRenovacion] = useState<CuponAplicado | null>(null);
  const [descuentoRenovacion, setDescuentoRenovacion] = useState(0);
  const [cuentaDesdeUrl, setCuentaDesdeUrl] = useState<string | null>(null);
  const [operacionRenovacionSeleccionada, setOperacionRenovacionSeleccionada] = useState<"renovacion" | "expansion">("renovacion");
  const [cantidadBaseRevendedor, setCantidadBaseRevendedor] = useState<number>(0);

  const planesValidity = useMemo(
    () =>
      planes
        .filter((plan) => plan.account_type === "validity")
        .sort((a, b) => a.max_users - b.max_users),
    [planes]
  );

  const planesCreditRenovacion = useMemo(
    () =>
      planesRenovacion
        .filter((plan) => plan.account_type === "credit")
        .sort((a, b) => a.max_users - b.max_users),
    [planesRenovacion]
  );

  const planesValidityRenovacion = useMemo(
    () =>
      planesRenovacion
        .filter((plan) => plan.account_type === "validity")
        .sort((a, b) => a.max_users - b.max_users),
    [planesRenovacion]
  );

  const planSeleccionado = useMemo(() => {
    if (!revendedorRenovacion) {
      return null;
    }

    const planesFuente =
      tipoRenovacionSeleccionado === "credit"
        ? planesCreditRenovacion
        : planesValidityRenovacion;

    // Primero intentar encontrar un plan exacto
    const planCoincidente = planesFuente.find((plan) => plan.max_users === cantidadSeleccionada);
    if (planCoincidente) {
      return planCoincidente;
    }

    // Si no hay plan exacto, calcular precio mediante descomposición (Greedy)
    if (planesFuente.length === 0) {
      return null;
    }

    // Algoritmo Greedy de Descomposición (Espejo de billing.utils.ts)
    const planesOrdenados = [...planesFuente].sort((a, b) => b.max_users - a.max_users);
    let restante = cantidadSeleccionada;
    let precioTotal = 0;
    let iter = 0;

    while (restante > 0 && iter < 100) {
      iter++;
      const p = planesOrdenados.find(x => x.max_users <= restante);
      if (p) {
        precioTotal += p.precio;
        restante -= p.max_users;
      } else {
        const pMin = planesOrdenados[planesOrdenados.length - 1];
        precioTotal += (restante / pMin.max_users) * pMin.precio;
        restante = 0;
      }
    }

    return {
      id: 0,
      nombre: `Plan Personalizado (${cantidadSeleccionada} ${tipoRenovacionSeleccionado === 'credit' ? 'créditos' : 'usuarios'})`,
      max_users: cantidadSeleccionada,
      precio: Math.round(precioTotal),
      calculado: true,
      account_type: tipoRenovacionSeleccionado
    } as any;
  }, [
    planesCreditRenovacion,
    planesValidityRenovacion,
    tipoRenovacionSeleccionado,
    cantidadSeleccionada,
    revendedorRenovacion,
    operacionRenovacionSeleccionada,
    cantidadBaseRevendedor
  ]);

  // Helper para calcular días restantes
  const diasRestantes = useMemo(() => {
    if (!revendedorRenovacion?.datos.expiration_date) return 30;
    const now = new Date();
    const today = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
    const expirationDate = new Date(revendedorRenovacion.datos.expiration_date);
    const diffTime = expirationDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  }, [revendedorRenovacion?.datos.expiration_date]);

  // Cálculo del precio final de la operación (Renovación vs Expansión)
  const precioRenovacion = useMemo(() => {
    if (!planSeleccionado || !revendedorRenovacion) return 0;

    if (operacionRenovacionSeleccionada === "expansion" && tipoRenovacionSeleccionado === "validity") {
      const usuariosAAgregar = cantidadSeleccionada - cantidadBaseRevendedor;
      if (usuariosAAgregar <= 0) return 0;

      // Calcular precio base (30 días) para los usuarios ADICIONALES usando decomposición Greedy
      const planesFuente = planesValidityRenovacion;
      const planesOrdenados = [...planesFuente].sort((a, b) => b.max_users - a.max_users);

      let restante = usuariosAAgregar;
      let precioBaseExtra = 0;
      let iter = 0;

      while (restante > 0 && iter < 100) {
        iter++;
        const p = planesOrdenados.find(x => x.max_users <= restante);
        if (p) {
          precioBaseExtra += p.precio;
          restante -= p.max_users;
        } else if (planesOrdenados.length > 0) {
          const pMin = planesOrdenados[planesOrdenados.length - 1];
          precioBaseExtra += (restante / pMin.max_users) * pMin.precio;
          restante = 0;
        } else {
          break;
        }
      }

      const diasCalculo = Math.min(30, Math.max(1, diasRestantes));
      return Math.round((precioBaseExtra / 30) * diasCalculo);
    }

    return Math.round(planSeleccionado.precio);
  }, [planSeleccionado, operacionRenovacionSeleccionada, tipoRenovacionSeleccionado, cantidadSeleccionada, cantidadBaseRevendedor, diasRestantes, planesValidityRenovacion, revendedorRenovacion]);

  const diasRenovacion = useMemo(() => {
    if (planSeleccionado?.dias && planSeleccionado.dias > 0) {
      return planSeleccionado.dias;
    }

    return tipoRenovacionSeleccionado === "credit"
      ? DIAS_POR_CREDITOS[cantidadSeleccionada] ?? 30
      : 30;
  }, [planSeleccionado, tipoRenovacionSeleccionado, cantidadSeleccionada]);

  const precioFinalRenovacion = Math.max(0, precioRenovacion - descuentoRenovacion);

  const puedeProcesarRenovacion =
    pasoRenovacion === "configurar" &&
    !!revendedorRenovacion &&
    nombreRenovacion.trim().length > 0 &&
    EMAIL_REGEX.test(emailRenovacion.trim()) &&
    cantidadSeleccionada > 0 &&
    !!planSeleccionado &&
    precioFinalRenovacion > 0;

  // Función para buscar revendedor desde la URL (declarada antes del useEffect)
  const buscarRevendedorDesdeUrl = useCallback(async (username: string) => {
    setBusquedaRenovacion(username);
    setBuscandoRenovacion(true);
    setErrorRenovacion("");

    try {
      const response = await fetch("/api/renovacion/buscar?tipo=revendedor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al buscar el revendedor");
      }

      if (!data?.encontrado || data.tipo !== "revendedor") {
        setErrorRenovacion("No se encontró ninguna cuenta de revendedor con ese username");
        return;
      }

      const info = data as RevendedorEncontrado;

      // Bloquear renovaciones de cuentas del sistema de créditos
      if (info?.datos?.servex_account_type === "credit") {
        setRevendedorRenovacion(null);
        setPasoRenovacion("buscar");
        setTipoRenovacionSeleccionado("validity");
        setCantidadSeleccionada(0);
        setNombreRenovacion("");
        setEmailRenovacion("");
        setCuponRenovacion(null);
        setDescuentoRenovacion(0);
        setErrorRenovacion(
          "Esta cuenta pertenece al sistema de Créditos. Las renovaciones por créditos están deshabilitadas."
        );
        return;
      }

      setRevendedorRenovacion(info);
      setTipoRenovacionSeleccionado(info.datos.servex_account_type);
      setCuponRenovacion(null);
      setDescuentoRenovacion(0);

      // Para renovaciones, SIEMPRE usar los usuarios actuales del revendedor
      // El backend calculará el precio proporcionalmente si no hay plan exacto
      setCantidadSeleccionada(info.datos.max_users);
      setCantidadBaseRevendedor(info.datos.max_users);
      setOperacionRenovacionSeleccionada("renovacion");

      setNombreRenovacion(info.datos.cliente_nombre || "");
      setEmailRenovacion(user?.email || info.datos.cliente_email || "");
      setPasoRenovacion("configurar");
    } catch (error: any) {
      setErrorRenovacion(error?.message || "Error al buscar el revendedor");
    } finally {
      setBuscandoRenovacion(false);
    }
  }, [planesCreditRenovacion, planesValidityRenovacion]);

  // Manejar parámetro 'cuenta' de la URL para renovación directa
  useEffect(() => {
    const cuentaParam = searchParams.get("cuenta");
    if (cuentaParam && cuentaParam !== cuentaDesdeUrl && planesRenovacion.length > 0) {
      setCuentaDesdeUrl(cuentaParam);
      setModoSeleccion("renovacion");
      // Limpiar el parámetro de la URL
      setSearchParams({}, { replace: true });
      // Buscar el revendedor automáticamente
      buscarRevendedorDesdeUrl(cuentaParam);
    }
  }, [searchParams, cuentaDesdeUrl, setSearchParams, buscarRevendedorDesdeUrl, planesRenovacion.length]);

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        const [planosCompra, planosRenovacion] = await Promise.all([
          apiService.obtenerPlanesRevendedores(true, "compra"),
          apiService.obtenerPlanesRevendedores(true, "renovacion"),
        ]);
        setPlanes(planosCompra);
        setPlanesRenovacion(planosRenovacion);
      } catch (error) {
        console.error("Error cargando planes de revendedor:", error);
        setPlanes([]);
        setPlanesRenovacion([]);
      }
    };

    cargarPlanes();
  }, []);

  useEffect(() => {
    if (!revendedorRenovacion) {
      return;
    }

    // Para renovaciones, SIEMPRE mantener los usuarios actuales del revendedor
    // No buscar planes coincidentes, el backend calculará el precio
    const usuariosActuales = revendedorRenovacion.datos.max_users;

    if (cantidadSeleccionada !== usuariosActuales && operacionRenovacionSeleccionada === "renovacion") {
      setCantidadSeleccionada(usuariosActuales);
    }
    setCantidadBaseRevendedor(usuariosActuales);
  }, [
    revendedorRenovacion,
    tipoRenovacionSeleccionado,
  ]);

  useEffect(() => {
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
  }, [planSeleccionado?.id, tipoRenovacionSeleccionado, precioRenovacion]);

  const resetRenovacion = () => {
    setPasoRenovacion("buscar");
    setBusquedaRenovacion("");
    setBuscandoRenovacion(false);
    setErrorRenovacion("");
    setRevendedorRenovacion(null);
    setTipoRenovacionSeleccionado("validity");
    setCantidadSeleccionada(0);
    setCantidadBaseRevendedor(0);
    setNombreRenovacion("");
    setEmailRenovacion("");
    setProcesandoRenovacion(false);
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
    const initialOp = modoSeleccion === "expansion" ? "expansion" : "renovacion"; setOperacionRenovacionSeleccionada(initialOp);
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
    setOperacionRenovacionSeleccionada("renovacion");
  };

  const activarModoExpansion = () => {
    if (modoSeleccion !== "expansion") {
      resetRenovacion();
    }
    setModoSeleccion("expansion");
    setOperacionRenovacionSeleccionada("expansion");
  };

  const volverABuscarRevendedor = () => {
    setPasoRenovacion("buscar");
    setRevendedorRenovacion(null);
    setErrorRenovacion("");
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
  };

  const buscarRevendedor = async () => {
    if (!busquedaRenovacion.trim()) {
      setErrorRenovacion("Ingresa un email o username");
      return;
    }

    setBuscandoRenovacion(true);
    setErrorRenovacion("");

    try {
      const response = await fetch("/api/renovacion/buscar?tipo=revendedor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: busquedaRenovacion.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al buscar el revendedor");
      }

      if (!data?.encontrado || data.tipo !== "revendedor") {
        setErrorRenovacion("No se encontró ninguna cuenta de revendedor con ese email o username");
        return;
      }

      const info = data as RevendedorEncontrado;

      // Bloquear renovaciones de cuentas del sistema de créditos
      if (info?.datos?.servex_account_type === "credit") {
        setRevendedorRenovacion(null);
        setPasoRenovacion("buscar");
        setTipoRenovacionSeleccionado("validity");
        setCantidadSeleccionada(0);
        setNombreRenovacion("");
        setEmailRenovacion("");
        setCuponRenovacion(null);
        setDescuentoRenovacion(0);
        setErrorRenovacion(
          "Esta cuenta pertenece al sistema de Créditos. Las renovaciones por créditos están deshabilitadas."
        );
        return;
      }

      setRevendedorRenovacion(info);
      setTipoRenovacionSeleccionado(info.datos.servex_account_type);
      setCuponRenovacion(null);
      setDescuentoRenovacion(0);

      // Para renovaciones, SIEMPRE usar los usuarios actuales del revendedor
      // El backend calculará el precio proporcionalmente si no hay plan exacto
      setCantidadSeleccionada(info.datos.max_users);
      setCantidadBaseRevendedor(info.datos.max_users);
      const initialOp = modoSeleccion === "expansion" ? "expansion" : "renovacion"; setOperacionRenovacionSeleccionada(initialOp);

      setNombreRenovacion(info.datos.cliente_nombre || "");
      setEmailRenovacion(user?.email || info.datos.cliente_email || "");
      setPasoRenovacion("configurar");
    } catch (error: any) {
      setErrorRenovacion(error?.message || "Error al buscar el revendedor");
    } finally {
      setBuscandoRenovacion(false);
    }
  };

  const manejarCuponValidado = (descuento: number, cupon: CuponAplicado) => {
    const subtotal = precioRenovacion;
    const descuentoNormalizado = Math.min(
      Math.max(0, Math.round(descuento)),
      Math.max(0, Math.round(subtotal))
    );

    setDescuentoRenovacion(descuentoNormalizado);
    setCuponRenovacion(cupon);
  };

  const manejarCuponRemovido = () => {
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
  };

  const procesarRenovacion = () => {
    if (!puedeProcesarRenovacion || !revendedorRenovacion || !planSeleccionado) {
      if (!EMAIL_REGEX.test(emailRenovacion.trim())) {
        setErrorRenovacion("Ingresa un email válido");
      }
      if (!planSeleccionado) {
        setErrorRenovacion("Selecciona un plan disponible para continuar");
      }
      return;
    }

    setProcesandoRenovacion(true);

    const params = new URLSearchParams({
      tipo: "revendedor",
      busqueda: busquedaRenovacion.trim(),
      dias: diasRenovacion.toString(),
      precio: precioFinalRenovacion.toString(),
      nombre: nombreRenovacion.trim(),
      email: emailRenovacion.trim(),
      tipoRenovacion: tipoRenovacionSeleccionado,
      cantidadSeleccionada: cantidadSeleccionada.toString(),
      precioOriginal: precioRenovacion.toString(),
      operacion: operacionRenovacionSeleccionada,
    });

    if (planSeleccionado?.id) {
      params.set("planId", planSeleccionado.id.toString());
    }

    if (descuentoRenovacion > 0 && cuponRenovacion) {
      params.set("descuento", descuentoRenovacion.toString());
      params.set("codigoCupon", cuponRenovacion.codigo);
      if (cuponRenovacion.id) {
        params.set("cuponId", cuponRenovacion.id.toString());
      }
    }

    const username = revendedorRenovacion.datos.servex_username;
    if (username) {
      params.set("username", username);
    }

    const maxUsers = revendedorRenovacion.datos.max_users;
    if (typeof maxUsers === "number") {
      params.set("maxUsers", maxUsers.toString());
    }

    navigate(`/checkout-renovacion?${params.toString()}`);
  };

  const groupedPlans: PlanGroup[] = useMemo(
    () => [
      {
        id: "validez",
        title: "Sistema de Validez",
        subtitle: "Suscripción con reutilización automática de cupos",
        accent: "bg-white/5 border-white/10",
        accentText: "text-zinc-400",
        icon: <BarChart3 className="w-5 h-5" />,
        mainDescription:
          "Suscripción mensual renovable con reutilización de cupos. Crea múltiples cuentas dentro del rango de usuarios durante ese mes. Los usuarios están vinculados a tu suscripción: si esta vence, todos los usuarios expiran también.",
        shortDescription: "0/N usuarios → Vinculados a tu suscripción mensual",
        keyFeatures: [
          {
            icon: "refresh-cw",
            title: "Vinculado a Suscripción",
            description: "Los usuarios están ligados a tu suscripción mensual.",
          },
          {
            icon: "users",
            title: "Reutilización Total",
            description: "Crea cuentas de cualquier duración dentro del mismo mes.",
          },
          {
            icon: "dollar-sign",
            title: "Sin Costo Extra",
            description: "No consumes créditos, solo cupos reutilizables.",
          },
          {
            icon: "maximize",
            title: "Máxima Rentabilidad",
            description: "Optimiza tu inventario con diferentes duraciones.",
          },
        ],
        useCases: [
          "Vender cuentas dentro del mes (30, 20, 15 días)",
          "Combinar duraciones (1×30 días, 2×15 días, etc.) en el mismo mes",
          "Maximizar la utilización de cupos mensuales",
          "Mantener rentabilidad sin costo adicional durante el mes",
        ],
        bestFor:
          "Revendedores que buscan eficiencia: vender cuentas premium personalizadas reutilizando cupos sin gastar créditos.",
        items: planesValidity,
      },
    ],
    [planesValidity]
  );

  const handleConfirmarCompra = (plan: PlanRevendedor) => {
    navigate(`/checkout-revendedor?planId=${plan.id}&maxUsers=${plan.max_users}`);
  };

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

  return (
    <div className="text-zinc-100 min-h-screen relative overflow-x-hidden">
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

        {/* Lines 3: Flowing through Gallery (Refined Position) */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.4, x: 0 }}
          transition={{ duration: 3, delay: 1 }}
          className="absolute top-[61%] -left-[2%] w-[700px] md:w-[1000px] h-auto opacity-40"
        >
          <img src="/lines-3-4541e35a1939230404d773f7eeddcc9b.svg" alt="" className="w-full h-auto" />
        </motion.div>

        {/* Lines 4: Bottom Left */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 3.5, delay: 1.5 }}
          className="absolute bottom-0 -left-[10%] w-[500px] md:w-[800px] h-auto opacity-30"
        >
          <img src="/lines-4-4ea88270d73b7f6eaaa69e91aed97ddf.svg" alt="" className="w-full h-auto" />
        </motion.div>
      </div>

      <main className="relative z-10">
        <section id="planes-section" className="relative pt-4 sm:pt-8 lg:pt-12 pb-12 sm:pb-16 lg:pb-20 z-10">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* keep hero controls outside the scrolling .w-full so transforms don't leak */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-6 mb-12"
            >
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="lg:hidden flex justify-center">
                  <div className="w-full max-w-[720px]">
                    <SegmentedControl
                      value={modoSeleccion}
                      onChange={(v) => {
                        if (v === 'compra') activarModoCompra();
                        else if (v === 'renovacion') activarModoRenovacion();
                        else activarModoExpansion();
                      }}
                      showExpansion={true}
                      descriptions={{
                        compra: 'Adquiere una nueva suscripción de revendedor con sistema de validez.',
                        renovacion: 'Extiende la duración de tu suscripción actual manteniendo tus cupos.',
                        expansion: 'Aumenta la capacidad de usuarios de tu cuenta de forma inmediata.'
                      }}
                    />
                  </div>
                </div>
                <div className="hidden lg:block">
                  <CompactHeroControl
                    value={modoSeleccion}
                    onChange={(v) => {
                      if (v === 'compra') activarModoCompra();
                      else if (v === 'renovacion') activarModoRenovacion();
                      else activarModoExpansion();
                    }}
                    showExpansion={true}
                  />
                </div>
              </div>
            </motion.div>

            <div className="w-full">
              {/* Sponsorship Banner Post-Controls */}
              <div className="mb-12">
                {/* <AdBanner variant="horizontal" /> */}
              </div>

              {(modoSeleccion === "renovacion" || modoSeleccion === "expansion") && (
                <RenovacionPanel
                  pasoRenovacion={pasoRenovacion}
                  busqueda={busquedaRenovacion}
                  onBusquedaChange={setBusquedaRenovacion}
                  onBuscar={buscarRevendedor}
                  buscando={buscandoRenovacion}
                  error={errorRenovacion}
                  revendedor={revendedorRenovacion}
                  tipoSeleccionado={tipoRenovacionSeleccionado}
                  cantidadSeleccionada={cantidadSeleccionada}
                  onCantidadChange={setCantidadSeleccionada}
                  nombre={nombreRenovacion}
                  onNombreChange={setNombreRenovacion}
                  email={emailRenovacion}
                  onEmailChange={setEmailRenovacion}
                  procesando={procesandoRenovacion}
                  puedeProcesar={puedeProcesarRenovacion}
                  diasRenovacion={diasRenovacion}
                  precioRenovacion={precioRenovacion}
                  precioFinal={precioFinalRenovacion}
                  planesCredit={planesCreditRenovacion}
                  onVerPlanes={activarModoCompra}
                  onVolverBuscar={volverABuscarRevendedor}
                  onProcesar={procesarRenovacion}
                  planSeleccionado={planSeleccionado}
                  cuponActual={cuponRenovacion}
                  descuentoAplicado={descuentoRenovacion}
                  onCuponValidado={manejarCuponValidado}
                  onCuponRemovido={manejarCuponRemovido}
                  operacionSeleccionada={operacionRenovacionSeleccionada}
                  cantidadBase={cantidadBaseRevendedor}
                  diasRestantes={diasRestantes}
                  userEmail={user?.email}
                />
              )}

              {modoSeleccion === "compra" && groupedPlans.length > 0 && (
                <div className="pb-28 lg:pb-0">
                  <ResellerPlanSelector
                    plans={planesValidity}
                    groupData={groupedPlans[0]}
                    onConfirmarCompra={handleConfirmarCompra}
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Closing Sponsorship Banner */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
          {/* <AdBanner variant="horizontal" /> */}
        </div>
        
        <ShowcaseGallery />

        <SupportSection />
      </main>
    </div>
  );
}

