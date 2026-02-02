import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertCircle,
  Clock,
  Loader2,
  Mail,
  RefreshCw,
  Shield,
  User,
  Check,
} from "lucide-react";
import { apiService } from "../services/api.service";
import { mercadoPagoService } from "../services/mercadopago.service";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckoutRenovacionPage: React.FC = () => {
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
  const cantidadSeleccionada = parseInt(
    searchParams.get("cantidadSeleccionada") || searchParams.get("cantidad") || "0",
    10
  ) || undefined;
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

  const connectionActual = connectionActualParam || connectionDestino || 1;
  const hayCambioDispositivos =
    tipo === "cliente" && connectionDestino > 0 && connectionDestino !== connectionActual;

  const datosInvalidos = !busqueda || dias <= 0 || precio <= 0;

  useEffect(() => {
    if (datosInvalidos) {
      setError("No pudimos cargar los datos de la renovación. Vuelve a intentarlo.");
    }
  }, [datosInvalidos]);

  const precioPorDia = useMemo(() => {
    if (dias <= 0) {
      return 0;
    }
    return Math.round(precio / dias);
  }, [precio, dias]);

  const precioPorDiaBase = useMemo(() => {
    if (dias <= 0) {
      return 0;
    }
    return Math.round(precioBase / dias);
  }, [precioBase, dias]);

  const hayDescuento = descuentoFinal > 0;

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
      console.error("[CheckoutRenovacion] Error creando preferencia:", err);
      const mensaje = err?.mensaje || err?.message || "Error al generar el enlace de pago";
      setError(mensaje);
      throw err;
    }
  }, [
    busqueda,
    dias,
    email,
    hayCambioDispositivos,
    connectionDestino,
    nombre,
    precio,
    tipo,
    tipoRenovacion,
    cantidadSeleccionada,
    codigoCupon,
    cuponId,
    descuentoFinal,
    hayDescuento,
    planId,
    precioBase,
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
    if (datosInvalidos) {
      return;
    }

    let mounted = true;

    const initMercadoPago = async () => {
      try {
        await mercadoPagoService.initialize();
        await mercadoPagoService.createButton("mp-wallet-container-unique", getPreferenceId);
        if (mounted) {
          setMpFallbackVisible(false);
        }
      } catch (_err) {
        console.error("[CheckoutRenovacion] Error inicializando MercadoPago:", _err);
        if (mounted) {
          setMpFallbackVisible(true);
        }
      }
    };

    initMercadoPago();

    return () => {
      mounted = false;
    };
  }, [datosInvalidos, getPreferenceId]);

  if (datosInvalidos) {
    return (
      <div className="min-h-screen bg-zinc-900 flex flex-col items-center justify-center gap-6 text-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-16 h-16 rounded-2xl bg-rose-100 border border-rose-200 flex items-center justify-center"
        >
          <AlertCircle className="w-8 h-8 text-rose-600" />
        </motion.div>
        <div className="space-y-2">
          <h1 className="text-xl font-serif font-medium text-zinc-100">No pudimos cargar tu renovación</h1>
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
    <div className="min-h-screen bg-zinc-900 pt-20 md:pt-24">
      <main>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            {/* Left Column - Formulario */}
            <div className="space-y-8">
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-700 text-sm font-medium mb-4">
                  <RefreshCw className="w-4 h-4" />
                  Renovación
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-zinc-100 mb-3">
                  Renovar tu cuenta
                </h1>
                <p className="text-base sm:text-lg text-zinc-400">
                  Completa tus datos para finalizar la renovación
                </p>
              </motion.div>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-zinc-800 rounded-2xl border border-zinc-700 shadow-sm p-6 space-y-5"
              >
                {/* Error */}
                <AnimatePresence>
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-start gap-3"
                    >
                      <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-4 h-4 text-rose-600" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-rose-700">Error</p>
                        <p className="text-sm text-rose-600">{error}</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Nombre */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Nombre completo
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-focus-within:bg-orange-500/20 transition-colors">
                      <User className="w-5 h-5 text-orange-500" />
                    </div>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(event) => {
                        setNombre(event.target.value);
                        setError("");
                      }}
                      className="w-full pl-16 pr-4 py-4 bg-zinc-800 border border-zinc-600 rounded-xl text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all hover:border-zinc-500"
                      placeholder="Juan Pérez"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">Email</label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-focus-within:bg-orange-500/20 transition-colors">
                      <Mail className="w-5 h-5 text-orange-500" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      className="w-full pl-16 pr-4 py-4 bg-zinc-800 border border-zinc-600 rounded-xl text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all hover:border-zinc-500"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <p className="text-zinc-400 text-xs mt-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-orange-500" />
                    Te enviaremos la confirmación de la renovación a este correo
                  </p>
                </div>
              </motion.div>

              {/* Resumen de detalles */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="space-y-4"
              >
                <div className="bg-zinc-800 rounded-2xl border border-zinc-700 shadow-sm p-5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-zinc-400 uppercase tracking-wide mb-1">
                        Usuario
                      </p>
                      <p className="text-lg font-semibold text-zinc-100">{username}</p>
                      {planNombre && (
                        <p className="text-xs text-zinc-400 mt-1">Plan actual: {planNombre}</p>
                      )}
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-orange-500" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-zinc-800 rounded-xl border border-zinc-700 shadow-sm p-4">
                    <p className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                      <Clock className="w-3.5 h-3.5" />
                      Días a agregar
                    </p>
                    <p className="text-xl font-semibold text-zinc-100">{dias} días</p>
                  </div>

                  {tipo === "cliente" && (
                    <div className="bg-zinc-800 rounded-xl border border-zinc-700 shadow-sm p-4">
                      <p className="text-xs text-zinc-400 uppercase tracking-wide flex items-center gap-1.5 mb-2">
                        <Shield className="w-3.5 h-3.5" />
                        Dispositivos
                      </p>
                      <p className="text-xl font-semibold text-zinc-100">
                        {connectionDestino || connectionActual}
                      </p>
                      {hayCambioDispositivos && (
                        <p className="text-xs text-orange-400 mt-1 font-medium">
                          Upgrade desde {connectionActual}
                        </p>
                      )}
                    </div>
                  )}

                  {tipo === "revendedor" && (
                    <div className="bg-zinc-800 rounded-xl border border-zinc-700 shadow-sm p-4">
                      <p className="text-xs text-zinc-400 uppercase tracking-wide mb-2">
                        Tipo
                      </p>
                      <p className="text-lg font-semibold text-zinc-100 capitalize">{tipoRenovacion}</p>
                      {cantidadSeleccionada && (
                        <p className="text-xs text-zinc-400 mt-1">
                          Cantidad: {cantidadSeleccionada}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {hayDescuento && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-600" />
                        <div>
                          <p className="text-xs text-emerald-700 uppercase tracking-wide font-medium">Cupón aplicado</p>
                          {codigoCupon && (
                            <p className="text-sm font-semibold text-emerald-800 mt-0.5">{codigoCupon}</p>
                          )}
                        </div>
                      </div>
                      <span className="text-lg font-bold text-emerald-700">
                        - ${descuentoFinal.toLocaleString("es-AR")}
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            </div>

            {/* Right Column - Resumen (Sticky) */}
            <div className="lg:sticky lg:top-28 h-fit space-y-6">
              {/* Plan Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-gradient-to-br from-zinc-800 via-zinc-800 to-zinc-800 rounded-2xl border border-zinc-700 p-6 lg:p-8 space-y-6"
              >
                {/* Info Header */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-medium mb-3">
                    <RefreshCw className="w-3 h-3" />
                    Resumen de renovación
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-medium text-zinc-100 mb-1">
                    Renovación de {dias} días
                  </h2>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-700" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Precio por día</span>
                    {hayDescuento ? (
                      <div className="text-right">
                        <span className="text-zinc-100 font-medium">
                          ${precioPorDia.toLocaleString("es-AR")}
                        </span>
                        <span className="text-xs text-zinc-500 line-through block">
                          ${precioPorDiaBase.toLocaleString("es-AR")}
                        </span>
                      </div>
                    ) : (
                      <span className="text-zinc-100 font-medium">
                        ${precioPorDia.toLocaleString("es-AR")}
                      </span>
                    )}
                  </div>

                  {hayDescuento && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-zinc-400">Precio original</span>
                        <span className="text-zinc-500 line-through">
                          ${precioBase.toLocaleString("es-AR")}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-sm text-emerald-600">
                        <span className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5" />
                          Descuento {codigoCupon ? `(${codigoCupon})` : ""}
                        </span>
                        <span className="font-medium">- ${descuentoFinal.toLocaleString("es-AR")}</span>
                      </div>
                    </>
                  )}

                  <div className="border-t border-zinc-700 pt-4 flex justify-between items-center">
                    <span className="text-zinc-100 font-medium">Total</span>
                    <span className="text-3xl font-bold text-orange-500">
                      ${precio.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-700" />

                {/* Details */}
                <div className="text-sm text-zinc-400 space-y-2">
                  <p className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500" />
                    Al pagar, procesaremos tu renovación automáticamente.
                  </p>
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-emerald-500" />
                    Recibirás un email con la confirmación.
                  </p>
                </div>
              </motion.div>

              {/* MercadoPago Button Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="space-y-4"
              >
                <div id="mp-wallet-container-unique" className="min-h-[56px]" />

                {mpFallbackVisible && (
                  <button
                    onClick={handleFallbackPayment}
                    disabled={processingPayment}
                    className="w-full py-4 px-6 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 disabled:from-gray-300 disabled:to-gray-400 text-white text-base font-semibold rounded-xl transition-all shadow-lg shadow-emerald-200/50 flex items-center justify-center gap-2"
                  >
                    {processingPayment ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Ir a pagar"
                    )}
                  </button>
                )}
              </motion.div>

              {/* Security Badge */}
              <div className="flex items-center gap-3 p-4 bg-zinc-800 border border-zinc-700 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-sm text-zinc-300">
                  Pago 100% seguro con <span className="font-medium">MercadoPago</span>
                </span>
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate(-1)}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl transition-colors border border-zinc-600"
              >
                Volver atrás
              </button>

              {renovacionId && (
                <p className="text-xs text-zinc-500 text-center">
                  ID de renovación: <span className="text-zinc-400 font-mono">{renovacionId}</span>
                </p>
              )}

              {ultimoLinkPago && !mpFallbackVisible && (
                <p className="text-xs text-zinc-500 text-center">
                  Si tienes problemas con el botón, usa la opción "Ir a pagar".
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutRenovacionPage;
