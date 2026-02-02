import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Plan, CompraResponse } from "../../types";
import { CheckoutFormRef } from "../../components/CheckoutForm";
import { apiService } from "../../services/api.service";
import { mercadoPagoService } from "../../services/mercadopago.service";
import { useAuth } from "../../contexts/AuthContext";
import { HeaderSection } from "./components/HeaderSection";
import { FormSection } from "./components/FormSection";
import { PlanSummary } from "./components/PlanSummary";
import { PaymentSection } from "./components/PaymentSection";
import { SaldoReferidoSection } from "./components/SaldoReferidoSection";
import { SuccessModal } from "./components/SuccessModal";
import { CHECKOUT_MESSAGES } from "./constants";
import { validarEmail, validarNombre } from "./utils";

/**
 * CheckoutPage - Página de checkout elegante e minimalista
 * Estilo similar a Stripe/Vercel pero con colores JJSecure (violet/neutral)
 */
const CheckoutPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const formRef = useRef<CheckoutFormRef>(null);
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [descuentoVisual, setDescuentoVisual] = useState(0);
  const [error, setError] = useState<string>("");
  const [processingPayment, setProcessingPayment] = useState(false);
  
  // Estados para saldo y referidos
  const [saldoUsado, setSaldoUsado] = useState(0);
  const [codigoReferido, setCodigoReferido] = useState<string | null>(null);
  const [descuentoReferido, setDescuentoReferido] = useState(0);
  const [emailCliente, setEmailCliente] = useState<string>("");
  const [pagoConSaldoCompleto, setPagoConSaldoCompleto] = useState(false);

  // Estado para el modal de éxito
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState<CompraResponse | null>(null);

  // Inicializar emailCliente con el email del usuario logueado
  useEffect(() => {
    if (user?.email && !emailCliente) {
      setEmailCliente(user.email);
      console.log('[CheckoutPage] Email inicializado desde usuario logueado:', user.email);
    }
  }, [user?.email, emailCliente]);

  // Refs para acceder a valores actuales desde callbacks (evitar stale closures)
  const codigoReferidoRef = useRef<string | null>(null);
  const saldoUsadoRef = useRef<number>(0);

  // Sincronizar refs con estados
  useEffect(() => {
    codigoReferidoRef.current = codigoReferido;
    console.log('[CheckoutPage] codigoReferidoRef actualizado:', codigoReferido);
  }, [codigoReferido]);

  useEffect(() => {
    saldoUsadoRef.current = saldoUsado;
    console.log('[CheckoutPage] saldoUsadoRef actualizado:', saldoUsado);
  }, [saldoUsado]);

  const planId = parseInt(searchParams.get("planId") || "0");

  // Cargar el plan al montar
  useEffect(() => {
    const loadPlan = async () => {
      try {
        const planes = await apiService.obtenerPlanes();
        const foundPlan = planes.find((p) => p.id === planId);
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          navigate("/planes");
        }
      } catch (error) {
        console.error("[CheckoutPage] Error cargando plan:", error);
        navigate("/planes");
      }
    };

    if (planId > 0) {
      loadPlan();
    }
  }, [planId, navigate]);

  const handleCuponChange = (descuento: number) => {
    setDescuentoVisual(descuento);
  };

  // Handlers para saldo y referido
  const handleSaldoChange = useCallback((saldo: number, monto: number) => {
    setSaldoUsado(saldo);
    setPagoConSaldoCompleto(monto === 0 && saldo > 0);
  }, []);

  const handleReferidoChange = useCallback((codigo: string | null, descuento: number) => {
    setCodigoReferido(codigo);
    setDescuentoReferido(descuento);
  }, []);

  // Actualizar email del cliente cuando cambie en el form
  const handleEmailChange = useCallback((email: string) => {
    setEmailCliente(email);
  }, []);

  // Función que MercadoPago va a llamar para obtener el preferenceId
  const getPreferenceIdForPayment = async (): Promise<string> => {
    console.log('[CheckoutPage] getPreferenceIdForPayment llamado');
    
    // IMPORTANTE: Usar refs para obtener valores actuales (evitar stale closures)
    const currentCodigoReferido = codigoReferidoRef.current;
    const currentSaldoUsado = saldoUsadoRef.current;
    
    console.log('[CheckoutPage] Valores actuales desde refs:');
    console.log('[CheckoutPage] - codigoReferido:', currentCodigoReferido);
    console.log('[CheckoutPage] - saldoUsado:', currentSaldoUsado);
    
    setError("");

    if (!plan || !formRef.current) {
      const errorMsg = CHECKOUT_MESSAGES.ERROR_PROCESSING_PAYMENT;
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    const nombre = formRef.current.getNombre();
    const email = formRef.current.getEmail();

    if (!validarNombre(nombre)) {
      const errorMsg = CHECKOUT_MESSAGES.ERROR_MISSING_NAME;
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    if (!validarEmail(email)) {
      const errorMsg = CHECKOUT_MESSAGES.ERROR_INVALID_EMAIL;
      setError(errorMsg);
      throw new Error(errorMsg);
    }

    try {
      console.log('[CheckoutPage] Enviando datos de compra...');
      console.log('[CheckoutPage] codigoReferido (desde ref):', currentCodigoReferido);
      console.log('[CheckoutPage] saldoUsado (desde ref):', currentSaldoUsado);

      const compraData = {
        planId: plan.id,
        clienteNombre: nombre,
        clienteEmail: email,
        codigoCupon: formRef.current.getCuponData()?.codigo,
        // Incluir datos de referido y saldo - USAR VALORES DESDE REFS
        codigoReferido: currentCodigoReferido || undefined,
        saldoUsado: currentSaldoUsado > 0 ? currentSaldoUsado : undefined,
      };

      console.log('[CheckoutPage] compraData:', JSON.stringify(compraData));

      const response = await apiService.comprarPlan(compraData);
      console.log('[CheckoutPage] Respuesta del servidor:', response);

      // El servidor retorna linkPago con pref_id en la URL
      const linkPago = response.linkPago;
      if (!linkPago) {
        console.error('[CheckoutPage] Response completo:', JSON.stringify(response, null, 2));
        throw new Error(CHECKOUT_MESSAGES.ERROR_NO_LINK_PAGO);
      }

      // Extraer pref_id de la URL
      const urlParams = new URL(linkPago).searchParams;
      const prefId = urlParams.get('pref_id');

      if (!prefId) {
        console.error('[CheckoutPage] No se pudo extraer pref_id de:', linkPago);
        throw new Error(CHECKOUT_MESSAGES.ERROR_NO_PREFERENCE_ID);
      }

      console.log('[CheckoutPage] Preference ID extraído:', prefId);
      return prefId;
    } catch (err: any) {
      console.error("[CheckoutPage] Error obteniendo preferenceId:", err);
      const errorMsg = err?.message || CHECKOUT_MESSAGES.ERROR_PROCESSING_PAYMENT;
      setError(errorMsg);
      throw err;
    }
  };

  // Manejador del pago con saldo completo
  const handlePayWithSaldo = async () => {
    console.log('[CheckoutPage] Iniciando pago con saldo completo...');
    setError("");
    setProcessingPayment(true);

    // IMPORTANTE: Usar refs para obtener valores actuales (evitar stale closures)
    const currentCodigoReferido = codigoReferidoRef.current;
    const currentSaldoUsado = saldoUsadoRef.current;

    if (!plan || !formRef.current) {
      setError(CHECKOUT_MESSAGES.ERROR_PROCESSING_PAYMENT);
      setProcessingPayment(false);
      return;
    }

    const nombre = formRef.current.getNombre();
    const email = formRef.current.getEmail();

    if (!validarNombre(nombre)) {
      setError(CHECKOUT_MESSAGES.ERROR_MISSING_NAME);
      setProcessingPayment(false);
      return;
    }

    if (!validarEmail(email)) {
      setError(CHECKOUT_MESSAGES.ERROR_INVALID_EMAIL);
      setProcessingPayment(false);
      return;
    }

    try {
      console.log('[CheckoutPage] Enviando pago con saldo...');
      console.log('[CheckoutPage] - saldoUsado:', currentSaldoUsado);
      console.log('[CheckoutPage] - codigoReferido:', currentCodigoReferido);

      const compraData = {
        planId: plan.id,
        clienteNombre: nombre,
        clienteEmail: email,
        codigoCupon: formRef.current.getCuponData()?.codigo,
        codigoReferido: currentCodigoReferido || undefined,
        saldoUsado: currentSaldoUsado,
      };

      const response = await apiService.comprarPlan(compraData);
      console.log('[CheckoutPage] Respuesta del servidor:', response);

      // Si el pago fue exitoso con saldo completo, mostrar modal
      if (response.pagoConSaldoCompleto && response.cuentaVPN) {
        console.log('[CheckoutPage] ✅ Pago con saldo exitoso!');
        setCompraExitosa(response);
        setShowSuccessModal(true);
      } else {
        // No debería llegar aquí si pagoConSaldoCompleto es true
        console.error('[CheckoutPage] Respuesta inesperada:', response);
        setError('Respuesta inesperada del servidor');
      }

      setProcessingPayment(false);
    } catch (err: any) {
      console.error("[CheckoutPage] Error en pago con saldo:", err);
      setError(err?.mensaje || err?.message || CHECKOUT_MESSAGES.ERROR_PROCESSING_PAYMENT);
      setProcessingPayment(false);
    }
  };

  // Manejador del botón de pago (fallback para MercadoPago)
  const handlePaymentButtonClick = async () => {
    // Si el pago es con saldo completo, usar el manejador especial
    if (pagoConSaldoCompleto) {
      return handlePayWithSaldo();
    }

    setError("");
    setProcessingPayment(true);

    try {
      const preferenceId = await getPreferenceIdForPayment();
      console.log('[CheckoutPage] Preferencia obtenida, creando botón...');

      await mercadoPagoService.createButtonWithPreference(
        'mp-wallet-container-unique',
        preferenceId
      );

      setProcessingPayment(false);
    } catch (err: any) {
      console.error("[CheckoutPage] Error en handlePaymentButtonClick:", err);
      setProcessingPayment(false);
    }
  };

  // Handler para cerrar modal y navegar
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate('/perfil'); // Redirigir al perfil del usuario
  };

  // Inicializar MercadoPago y crear botón cuando la página carga
  useEffect(() => {
    const init = async () => {
      try {
        console.log('[CheckoutPage] Inicializando MercadoPago...');
        await mercadoPagoService.initialize();
        console.log('[CheckoutPage] MercadoPago inicializado exitosamente');

        if (plan) {
          console.log('[CheckoutPage] Plan disponible, creando botón de MercadoPago...');

          // Crear el botón con getPreferenceIdForPayment como callback
          await mercadoPagoService.createButton(
            'mp-wallet-container-unique',
            getPreferenceIdForPayment
          );
          console.log('[CheckoutPage] ✅ Botón de MercadoPago creado');
        }
      } catch (error) {
        console.error('[CheckoutPage] Error inicializando MercadoPago:', error);
        // Mostrar el botón fallback si hay error
        const fallbackBtn = document.getElementById('fallback-payment-button');
        if (fallbackBtn) {
          fallbackBtn.classList.remove('hidden');
        }
      }
    };

    init();
  }, [plan]);

  if (!plan) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="text-zinc-400">{CHECKOUT_MESSAGES.LOADING}</div>
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
              <HeaderSection />

              <FormSection
                error={error}
                formRef={formRef}
                planId={plan.id}
                planPrecio={plan.precio}
                onCuponChange={handleCuponChange}
                onEmailChange={handleEmailChange}
                userEmail={user?.email}
              />
            </div>

            {/* Right Column - Resumen (Sticky) */}
            <div className="lg:sticky lg:top-28 h-fit space-y-6">
              <PlanSummary 
                plan={plan} 
                descuentoVisual={descuentoVisual + descuentoReferido} 
                saldoUsado={saldoUsado}
              />

              {/* Sección de Saldo y Código de Referido */}
              <SaldoReferidoSection
                userEmail={emailCliente}
                precioTotal={plan.precio - descuentoVisual}
                onSaldoChange={handleSaldoChange}
                onReferidoChange={handleReferidoChange}
              />

              <PaymentSection
                processingPayment={processingPayment}
                onPaymentButtonClick={handlePaymentButtonClick}
                pagoConSaldoCompleto={pagoConSaldoCompleto}
              />

              {/* Security Badge */}
              <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 flex items-center justify-center">
                  <svg
                    className="w-5 h-5 text-orange-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <span className="text-sm text-zinc-300">{CHECKOUT_MESSAGES.SECURITY_BADGE}</span>
              </div>

              {/* Back Button */}
              <button
                onClick={() => navigate("/planes")}
                className="w-full py-3 px-4 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm font-medium rounded-xl transition-colors border border-zinc-700"
              >
                {CHECKOUT_MESSAGES.BACK_BUTTON_TEXT}
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modal de éxito para pago con saldo */}
      {showSuccessModal && compraExitosa?.cuentaVPN && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleCloseSuccessModal}
          cuentaVPN={compraExitosa.cuentaVPN}
          saldoUsado={compraExitosa.saldoUsado || 0}
          codigoReferidoUsado={compraExitosa.codigoReferidoUsado}
        />
      )}
    </div>
  );
};

export default CheckoutPage;