import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PlanRevendedor, CompraRevendedorRequest } from "../types";
import { Clock, Check, AlertCircle, ShoppingBag, Users, Shield, User, Mail, Loader2 } from "lucide-react";
import CuponInput from "../components/CuponInput";
import { apiService, ValidacionCupon } from "../services/api.service";
import { mercadoPagoService } from "../services/mercadopago.service";

/**
 * CheckoutRevendedorPage - Página de checkout elegante para revendedores
 */
const CheckoutRevendedorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState<PlanRevendedor | null>(null);
  const [error, setError] = useState<string>("");
  const [cuponData, setCuponData] = useState<ValidacionCupon["cupon"] | null>(
    null
  );
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [mpFallbackVisible, setMpFallbackVisible] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);

  const planId = parseInt(searchParams.get("planId") || "0");

  // Cargar el plan al montar
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const planes = await apiService.obtenerPlanesRevendedores();
        const foundPlan = planes.find((p) => p.id === planId);
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          navigate("/revendedores");
        }
      } catch (error) {
        console.error("[CheckoutRevendedorPage] Error cargando plan:", error);
        navigate("/revendedores");
      }
    };

    if (planId > 0) {
      loadPlan();
    }
  }, [planId, navigate]);

  const handleCuponValidado = (
    descuento: number,
    cupon: ValidacionCupon["cupon"]
  ) => {
    setCuponData(cupon);
    setDescuentoAplicado(descuento);
  };

  const handleCuponRemovido = () => {
    setCuponData(null);
    setDescuentoAplicado(0);
  };

  // Función que MercadoPago va a llamar para obtener el preferenceId
  // Usamos useCallback para que siempre tenga acceso al estado actual de cuponData
  const getPreferenceIdForPayment = useCallback(async (): Promise<string> => {
    setError("");

    if (!plan) {
      const errorMsg = "Error al procesar el pago";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    const nombre = nombreInputRef.current?.value || "";
    const email = emailInputRef.current?.value || "";

    if (!nombre.trim()) {
      const errorMsg = "Por favor ingresa tu nombre";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      const errorMsg = "Email inválido";
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      const compraData: CompraRevendedorRequest = {
        planRevendedorId: plan.id,
        clienteNombre: nombre,
        clienteEmail: email,
        codigoCupon: cuponData?.codigo,
      };

      const response = await apiService.comprarPlanRevendedor(compraData);

      // El servidor retorna linkPago con pref_id en la URL
      const linkPago = response.linkPago;
      if (!linkPago) {
        throw new Error("No se obtuvo linkPago del servidor");
      }

      // Extraer pref_id de la URL
      const urlParams = new URL(linkPago).searchParams;
      const prefId = urlParams.get("pref_id");

      if (!prefId) {
        throw new Error("No se pudo extraer pref_id del linkPago");
      }

      return prefId;
    } catch (err: any) {
      console.error("[CheckoutRevendedorPage] Error:", err);
      const errorMsg =
        err.message || "Error al procesar el pago. Intenta nuevamente.";
      setError(errorMsg);
      throw err;
    }
  }, [cuponData, plan]);

  const handleFallbackPayment = async () => {
    setProcessingPayment(true);
    try {
      const prefId = await getPreferenceIdForPayment();
      if (prefId) {
        // Redirigir a MercadoPago
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${prefId}`;
      }
    } catch (err) {
      console.error("[CheckoutRevendedorPage] Error en pago fallback:", err);
      // El error ya se muestra en setError
    } finally {
      setProcessingPayment(false);
    }
  };

  // Inicializar MercadoPago y crear botón cuando la página carga
  useEffect(() => {
    const init = async () => {
      try {
        console.log("[CheckoutRevendedorPage] Inicializando MercadoPago...");
        await mercadoPagoService.initialize();
        console.log(
          "[CheckoutRevendedorPage] MercadoPago inicializado exitosamente"
        );

        if (plan) {
          console.log(
            "[CheckoutRevendedorPage] Plan disponible, creando botón de MercadoPago..."
          );

          try {
            // Crear el botón con getPreferenceIdForPayment como callback
            await mercadoPagoService.createButton(
              "wallet_container_revendedor",
              getPreferenceIdForPayment
            );
            console.log("[CheckoutRevendedorPage] ✅ Botón de MercadoPago creado");
            setMpFallbackVisible(false);
          } catch (buttonError) {
            console.error("[CheckoutRevendedorPage] Error creando botón MercadoPago:", buttonError);
            console.log("[CheckoutRevendedorPage] Mostrando botón fallback...");
            setMpFallbackVisible(true);
            setError("Usando método de pago alternativo. Por favor, continúa con el pago.");
          }
        }
      } catch (error) {
        console.error(
          "[CheckoutRevendedorPage] Error inicializando MercadoPago:",
          error
        );
        console.log("[CheckoutRevendedorPage] Mostrando botón fallback (init error)...");
        setMpFallbackVisible(true);
        setError("Error de conexión. Utilizando método alternativo.");
      }
    };

    if (plan) {
      init();
    }
  }, [plan, getPreferenceIdForPayment]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-zinc-900 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <ShoppingBag className="w-6 h-6 text-orange-500" />
          </div>
          <p className="text-zinc-400">Cargando plan...</p>
        </div>
      </div>
    );
  }

  const precioFinal = plan.precio - descuentoAplicado;

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
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 text-orange-400 text-sm font-medium mb-4">
                  <Users className="w-4 h-4" />
                  Plan Revendedor
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-zinc-100 mb-3">
                  Información Personal
                </h1>
                <p className="text-base sm:text-lg text-zinc-400">
                  Completa tus datos para finalizar la compra
                </p>
              </motion.div>

              {/* Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="bg-zinc-800 rounded-2xl border border-zinc-700 shadow-sm p-6 space-y-5"
              >
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
                      ref={nombreInputRef}
                      type="text"
                      defaultValue=""
                      className="w-full pl-16 pr-4 py-4 bg-zinc-800 border border-zinc-600 rounded-xl text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all hover:border-zinc-500"
                      placeholder="Juan Pérez"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Email
                  </label>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-focus-within:bg-orange-500/20 transition-colors">
                      <Mail className="w-5 h-5 text-orange-500" />
                    </div>
                    <input
                      ref={emailInputRef}
                      type="email"
                      defaultValue=""
                      className="w-full pl-16 pr-4 py-4 bg-zinc-800 border border-zinc-600 rounded-xl text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all hover:border-zinc-500"
                      placeholder="tu@email.com"
                    />
                  </div>
                  <p className="text-zinc-400 text-xs mt-2 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-orange-500" />
                    Recibirás tus credenciales de revendedor en este email
                  </p>
                </div>

                {/* Cupón */}
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-3">
                    Código de descuento (opcional)
                  </label>
                  <CuponInput
                    planId={plan.id}
                    precioPlan={plan.precio}
                    onCuponValidado={handleCuponValidado}
                    onCuponRemovido={handleCuponRemovido}
                    cuponActual={cuponData}
                    descuentoActual={descuentoAplicado}
                  />
                </div>

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
                {/* Plan Info */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/10 text-orange-400 text-xs font-medium mb-3">
                    <Check className="w-3 h-3" />
                    Plan seleccionado
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-serif font-medium text-zinc-100 mb-1">
                    {plan.nombre}
                  </h2>
                  <p className="text-zinc-400 flex items-center gap-1.5">
                    <Users className="w-4 h-4" />
                    {plan.account_type === "credit"
                      ? `${plan.max_users} créditos`
                      : `${plan.max_users} usuarios`}
                  </p>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-700" />

                {/* Price Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Subtotal</span>
                    <span className="text-zinc-100 font-medium">
                      ${plan.precio.toLocaleString("es-AR")}
                    </span>
                  </div>

                  {descuentoAplicado > 0 && (
                    <div className="flex justify-between items-center text-sm text-emerald-600">
                      <span className="flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5" />
                        Descuento ({cuponData?.codigo})
                      </span>
                      <span className="font-medium">-${descuentoAplicado.toLocaleString("es-AR")}</span>
                    </div>
                  )}

                  <div className="border-t border-zinc-700 pt-4 flex justify-between items-center">
                    <span className="text-zinc-100 font-medium">Total</span>
                    <span className="text-3xl font-bold text-orange-500">
                      ${precioFinal.toLocaleString("es-AR")}
                    </span>
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-zinc-700" />

                {/* Plan Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
                      <Users className="w-5 h-5 text-orange-500" />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-100 text-sm">
                        {plan.account_type === "credit"
                          ? `${plan.max_users} créditos`
                          : `${plan.max_users} usuarios`}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {plan.account_type === "credit"
                          ? "Créditos de acceso"
                          : "30 días de validez"}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <div className="font-medium text-zinc-100 text-sm">
                        Acceso inmediato
                      </div>
                      <div className="text-xs text-zinc-400">
                        Recibirás tus credenciales en el email
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* MercadoPago Button Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="space-y-4"
              >
                <div id="wallet_container_revendedor" className="min-h-[56px]" />

                {mpFallbackVisible && (
                  <button
                    onClick={handleFallbackPayment}
                    disabled={processingPayment}
                    className="w-full py-4 px-6 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-zinc-600 disabled:to-zinc-700 text-white text-base font-semibold rounded-xl transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
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
                onClick={() => navigate("/revendedores")}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-sm font-medium rounded-xl transition-colors border border-zinc-600"
              >
                Volver a planes
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CheckoutRevendedorPage;
