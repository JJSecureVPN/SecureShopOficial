import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { apiService } from "../../../services/api.service";
import { mercadoPagoService } from "../../../services/mercadopago.service";
import { CheckoutRenovacionView } from "./CheckoutRenovacionView";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckoutRenovacionContainer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const tipo = (searchParams.get("tipo") as "cliente" | "revendedor") || "cliente";
  const dias = parseInt(searchParams.get("dias") || "0", 10);
  const precio = parseInt(searchParams.get("precio") || "0", 10);
  const busqueda = searchParams.get("busqueda") || "";
  const username = searchParams.get("username") || busqueda;
  const planNombre = searchParams.get("planNombre") || "";
  const connectionActualParam = parseInt(searchParams.get("connectionActual") || "0", 10);
  const nuevoConnectionLimitParam = searchParams.get("nuevoConnectionLimit");
  const connectionDestino = nuevoConnectionLimitParam
    ? parseInt(nuevoConnectionLimitParam, 10)
    : connectionActualParam;
  const tipoRenovacionParam = searchParams.get("tipoRenovacion");
  const tipoRenovacion: "validity" | "credit" =
    tipoRenovacionParam === "credit" || tipoRenovacionParam === "validity"
      ? tipoRenovacionParam
      : "validity";
  const cantidadSeleccionada =
    parseInt(searchParams.get("cantidadSeleccionada") || searchParams.get("cantidad") || "0", 10) ||
    undefined;
  const precioOriginalParam =
    searchParams.get("precioOriginal") ||
    searchParams.get("precioBase") ||
    searchParams.get("precioSinDescuento");
  const descuentoParam = searchParams.get("descuento") || searchParams.get("descuentoAplicado");
  const codigoCupon = searchParams.get("codigoCupon") || undefined;
  const cuponIdParam = searchParams.get("cuponId");
  const cuponId = cuponIdParam ? parseInt(cuponIdParam, 10) : undefined;
  const planIdParam = searchParams.get("planId");
  const planId = planIdParam ? parseInt(planIdParam, 10) : undefined;
  const precioOriginal = parseInt(precioOriginalParam || "0", 10);
  const precioBase = precioOriginal > 0 ? precioOriginal : precio;
  const descuentoInicial = parseInt(descuentoParam || "0", 10);
  const descuentoFinal = descuentoInicial > 0 ? descuentoInicial : Math.max(0, precioBase - precio);

  const [nombre, setNombre] = useState(searchParams.get("nombre") || "");
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [mpFallbackVisible, setMpFallbackVisible] = useState(false);
  const [ultimoLinkPago, setUltimoLinkPago] = useState<string | null>(null);
  const [renovacionId, setRenovacionId] = useState<number | null>(null);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const connectionActual = connectionActualParam || connectionDestino || 1;
  const hayCambioDispositivos =
    tipo === "cliente" && connectionDestino > 0 && connectionDestino !== connectionActual;
  const datosInvalidos = !busqueda || dias <= 0 || precio <= 0;
  const hayDescuento = descuentoFinal > 0;

  useEffect(() => {
    const headerEl = document.querySelector("header");
    if (!headerEl) return;

    const prev = {
      position: headerEl.style.position || "",
      top: headerEl.style.top || "",
      left: headerEl.style.left || "",
      right: headerEl.style.right || "",
      zIndex: headerEl.style.zIndex || "",
    };

    headerEl.style.position = "fixed";
    headerEl.style.top = "0";
    headerEl.style.left = "0";
    headerEl.style.right = "0";
    headerEl.style.zIndex = "10001";

    return () => {
      headerEl.style.position = prev.position;
      headerEl.style.top = prev.top;
      headerEl.style.left = prev.left;
      headerEl.style.right = prev.right;
      headerEl.style.zIndex = prev.zIndex;
    };
  }, []);

  useEffect(() => {
    if (datosInvalidos) {
      setError("No pudimos cargar los datos de la renovación. Vuelve a intentarlo.");
    }
  }, [datosInvalidos]);

  const precioPorDia = useMemo(() => {
    if (dias <= 0) return 0;
    return Math.round(precio / dias);
  }, [precio, dias]);

  const precioPorDiaBase = useMemo(() => {
    if (dias <= 0) return 0;
    return Math.round(precioBase / dias);
  }, [precioBase, dias]);

  const tituloResumen = planNombre || username || "Renovación";
  const subtituloResumen =
    tipo === "revendedor"
      ? cantidadSeleccionada
        ? `${cantidadSeleccionada} ${tipoRenovacion === "credit" ? "créditos" : "cupos"}`
        : `Renovación ${tipoRenovacion}`
      : hayCambioDispositivos
        ? `Upgrade a ${connectionDestino} dispositivos`
        : `${connectionActual} dispositivo${connectionActual > 1 ? "s" : ""}`;

  const createPreference = useCallback(async () => {
    setError("");
    const nombreTrim = nombre.trim();
    const emailTrim = email.trim();

    if (!nombreTrim) {
      const message = "Ingresa tu nombre";
      setError(message);
      throw new Error(message);
    }

    if (!emailTrim || !emailRegex.test(emailTrim)) {
      const message = "Ingresa un email válido";
      setError(message);
      throw new Error(message);
    }

    const basePayload = {
      busqueda,
      dias,
      clienteNombre: nombreTrim,
      clienteEmail: emailTrim,
    };

    try {
      const response =
        tipo === "revendedor"
          ? await apiService.procesarRenovacionRevendedor({
              ...basePayload,
              tipoRenovacion,
              cantidadSeleccionada,
              precio,
              precioOriginal: precioBase > 0 ? precioBase : undefined,
              codigoCupon,
              cuponId,
              descuentoAplicado: hayDescuento ? descuentoFinal : undefined,
              planId,
            })
          : await apiService.procesarRenovacionCliente({
              ...basePayload,
              precio,
              nuevoConnectionLimit: hayCambioDispositivos ? connectionDestino : undefined,
              precioOriginal: precioBase > 0 ? precioBase : undefined,
              codigoCupon,
              cuponId,
              descuentoAplicado: hayDescuento ? descuentoFinal : undefined,
              planId,
            });

      if (!response?.linkPago) {
        throw new Error("No se recibió el enlace de pago");
      }

      setUltimoLinkPago(response.linkPago);
      if (response.renovacion?.id) {
        setRenovacionId(response.renovacion.id);
      }

      const prefId = new URL(response.linkPago).searchParams.get("pref_id");
      if (!prefId) {
        throw new Error("No se pudo generar el identificador de pago");
      }

      return { prefId, linkPago: response.linkPago };
    } catch (err: any) {
      const mensaje = err?.mensaje || err?.message || "Error al generar el enlace de pago";
      setError(mensaje);
      throw err;
    }
  }, [
    busqueda,
    cantidadSeleccionada,
    codigoCupon,
    connectionDestino,
    cuponId,
    dias,
    descuentoFinal,
    email,
    hayCambioDispositivos,
    hayDescuento,
    nombre,
    planId,
    precio,
    precioBase,
    tipo,
    tipoRenovacion,
  ]);

  const getPreferenceId = useCallback(async () => {
    const { prefId } = await createPreference();
    return prefId;
  }, [createPreference]);

  const handleFallbackPayment = async () => {
    setProcessingPayment(true);
    try {
      const { linkPago } = await createPreference();
      window.location.href = linkPago;
    } catch {
      // El error ya se maneja en createPreference
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    if (datosInvalidos) return;

    let mounted = true;

    const initMercadoPago = async () => {
      try {
        await mercadoPagoService.initialize();
        await mercadoPagoService.createButton("wallet_container_renovacion", getPreferenceId);
        try {
          await mercadoPagoService.createButton("wallet_container_renovacion_mobile", getPreferenceId);
        } catch {
          // ignore if mobile container is missing
        }
        if (mounted) {
          setMpFallbackVisible(false);
        }
      } catch {
        if (mounted) {
          setMpFallbackVisible(true);
        }
      }
    };

    void initMercadoPago();

    return () => {
      mounted = false;
    };
  }, [datosInvalidos, getPreferenceId]);

  if (datosInvalidos) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center"
        >
          <AlertCircle className="w-8 h-8 text-rose-400" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-zinc-100">No pudimos cargar tu renovación</h1>
          <p className="text-sm text-zinc-400 max-w-sm">
            Vuelve a la página de planes e inicia nuevamente el proceso de renovación.
          </p>
        </div>
        <button
          onClick={() => navigate("/planes")}
          className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-xl transition-colors"
        >
          Volver a planes
        </button>
      </div>
    );
  }

  return (
    <CheckoutRenovacionView
      nombre={nombre}
      email={email}
      error={error}
      processingPayment={processingPayment}
      mpFallbackVisible={mpFallbackVisible}
      ultimoLinkPago={ultimoLinkPago}
      renovacionId={renovacionId}
      mobileSummaryOpen={mobileSummaryOpen}
      tipo={tipo}
      dias={dias}
      precio={precio}
      username={username}
      planNombre={planNombre}
      connectionActual={connectionActual}
      connectionDestino={connectionDestino}
      tipoRenovacion={tipoRenovacion}
      cantidadSeleccionada={cantidadSeleccionada}
      precioBase={precioBase}
      descuentoFinal={descuentoFinal}
      codigoCupon={codigoCupon}
      hayCambioDispositivos={hayCambioDispositivos}
      hayDescuento={hayDescuento}
      precioPorDia={precioPorDia}
      precioPorDiaBase={precioPorDiaBase}
      tituloResumen={tituloResumen}
      subtituloResumen={subtituloResumen}
      onNombreChange={(value) => {
        setNombre(value);
        setError("");
      }}
      onEmailChange={(value) => {
        setEmail(value);
        setError("");
      }}
      onToggleMobileSummary={() => setMobileSummaryOpen((value) => !value)}
      onFallbackPayment={handleFallbackPayment}
      onBack={() => navigate(-1)}
    />
  );
};

export default CheckoutRenovacionContainer;