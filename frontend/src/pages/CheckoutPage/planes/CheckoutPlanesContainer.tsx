import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { CompraRequest, CompraResponse, Plan } from "../../../types";
import { apiService, type ValidacionCupon } from "../../../services/api.service";
import { mercadoPagoService } from "../../../services/mercadopago.service";
import { useAuth } from "../../../contexts/AuthContext";
import { SuccessModal } from "../components/SuccessModal";
import { CHECKOUT_MESSAGES } from "../constants";
import { CheckoutPlanesView } from "./CheckoutPlanesView";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CheckoutPlanesContainer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [plan, setPlan] = useState<Plan | null>(null);
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [processingPayment, setProcessingPayment] = useState(false);
  const [mpFallbackVisible, setMpFallbackVisible] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);
  const [cuponData, setCuponData] = useState<ValidacionCupon["cupon"] | null>(null);
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [saldoUsado, setSaldoUsado] = useState(0);
  const [codigoReferido, setCodigoReferido] = useState<string | null>(null);
  const [descuentoReferido, setDescuentoReferido] = useState(0);
  const [pagoConSaldoCompleto, setPagoConSaldoCompleto] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [compraExitosa, setCompraExitosa] = useState<CompraResponse | null>(null);

  const planRef = useRef<Plan | null>(null);
  const nombreRef = useRef("");
  const emailRef = useRef("");
  const cuponDataRef = useRef<ValidacionCupon["cupon"] | null>(null);
  const saldoUsadoRef = useRef(0);
  const codigoReferidoRef = useRef<string | null>(null);

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
    planRef.current = plan;
  }, [plan]);

  useEffect(() => {
    nombreRef.current = nombre;
  }, [nombre]);

  useEffect(() => {
    emailRef.current = email;
  }, [email]);

  useEffect(() => {
    cuponDataRef.current = cuponData;
  }, [cuponData]);

  useEffect(() => {
    saldoUsadoRef.current = saldoUsado;
  }, [saldoUsado]);

  useEffect(() => {
    codigoReferidoRef.current = codigoReferido;
  }, [codigoReferido]);

  useEffect(() => {
    if (user?.email && !emailRef.current) {
      setEmail(user.email);
      emailRef.current = user.email;
    }
  }, [user?.email]);

  const planId = parseInt(searchParams.get("planId") || "0", 10);

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const planes = await apiService.obtenerPlanes();
        const foundPlan = planes.find((item) => item.id === planId);
        if (foundPlan) {
          setPlan(foundPlan);
        } else {
          navigate("/planes");
        }
      } catch {
        navigate("/planes");
      }
    };

    if (planId > 0) {
      void loadPlan();
    }
  }, [navigate, planId]);

  const buildCompraRequest = (): CompraRequest => {
    const currentPlan = planRef.current;
    const currentNombre = nombreRef.current.trim();
    const currentEmail = emailRef.current.trim();

    if (!currentPlan) {
      const message = CHECKOUT_MESSAGES.ERROR_PROCESSING_PAYMENT;
      setError(message);
      throw new Error(message);
    }

    if (!currentNombre) {
      const message = CHECKOUT_MESSAGES.ERROR_MISSING_NAME;
      setError(message);
      throw new Error(message);
    }

    if (!currentEmail || !emailRegex.test(currentEmail)) {
      const message = CHECKOUT_MESSAGES.ERROR_INVALID_EMAIL;
      setError(message);
      throw new Error(message);
    }

    return {
      planId: currentPlan.id,
      clienteNombre: currentNombre,
      clienteEmail: currentEmail,
      codigoCupon: cuponDataRef.current?.codigo,
      codigoReferido: codigoReferidoRef.current || undefined,
      saldoUsado: saldoUsadoRef.current > 0 ? saldoUsadoRef.current : undefined,
    };
  };

  const createCompra = useCallback(async (): Promise<CompraResponse> => {
    setError("");

    try {
      const payload = buildCompraRequest();
      return await apiService.comprarPlan(payload);
    } catch (err: any) {
      const message = err?.mensaje || err?.message || CHECKOUT_MESSAGES.ERROR_PROCESSING_PAYMENT;
      setError(message);
      throw err;
    }
  }, []);

  const getPreferenceIdForPayment = useCallback(async (): Promise<string> => {
    const response = await createCompra();
    const linkPago = response.linkPago;

    if (!linkPago) {
      const message = CHECKOUT_MESSAGES.ERROR_NO_LINK_PAGO;
      setError(message);
      throw new Error(message);
    }

    const prefId = new URL(linkPago).searchParams.get("pref_id");
    if (!prefId) {
      const message = CHECKOUT_MESSAGES.ERROR_NO_PREFERENCE_ID;
      setError(message);
      throw new Error(message);
    }

    return prefId;
  }, [createCompra]);

  const handlePayWithSaldo = useCallback(async () => {
    setError("");
    setProcessingPayment(true);

    try {
      const response = await createCompra();

      if (response.pagoConSaldoCompleto && response.cuentaVPN) {
        setCompraExitosa(response);
        setShowSuccessModal(true);
      } else {
        setError("Respuesta inesperada del servidor");
      }
    } catch {
      // El error ya se maneja en createCompra
    } finally {
      setProcessingPayment(false);
    }
  }, [createCompra]);

  const handleFallbackPayment = useCallback(async () => {
    if (pagoConSaldoCompleto) {
      await handlePayWithSaldo();
      return;
    }

    setProcessingPayment(true);
    try {
      const response = await createCompra();
      if (!response.linkPago) {
        throw new Error(CHECKOUT_MESSAGES.ERROR_NO_LINK_PAGO);
      }
      window.location.href = response.linkPago;
    } catch {
      // El error ya se maneja en createCompra
    } finally {
      setProcessingPayment(false);
    }
  }, [createCompra, handlePayWithSaldo, pagoConSaldoCompleto]);

  useEffect(() => {
    if (!plan) return;

    let mounted = true;

    const initMercadoPago = async () => {
      try {
        await mercadoPagoService.initialize();
        await mercadoPagoService.createButton("wallet_container_planes", getPreferenceIdForPayment);
        try {
          await mercadoPagoService.createButton("wallet_container_planes_mobile", getPreferenceIdForPayment);
        } catch {
          // ignore if mobile container is not mounted yet
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
  }, [getPreferenceIdForPayment, plan]);

  return (
    <>
      <CheckoutPlanesView
        plan={plan}
        nombre={nombre}
        email={email}
        userEmailLocked={Boolean(user?.email)}
        error={error}
        processingPayment={processingPayment}
        mpFallbackVisible={mpFallbackVisible}
        mobileSummaryOpen={mobileSummaryOpen}
        cuponData={cuponData}
        descuentoAplicado={descuentoAplicado}
        saldoUsado={saldoUsado}
        codigoReferido={codigoReferido}
        descuentoReferido={descuentoReferido}
        pagoConSaldoCompleto={pagoConSaldoCompleto}
        onNombreChange={setNombre}
        onEmailChange={setEmail}
        onToggleMobileSummary={() => setMobileSummaryOpen((value) => !value)}
        onFallbackPayment={handleFallbackPayment}
        onBack={() => navigate("/planes")}
        onCuponValidado={(descuento, cupon) => {
          setCuponData(cupon);
          setDescuentoAplicado(descuento);
        }}
        onCuponRemovido={() => {
          setCuponData(null);
          setDescuentoAplicado(0);
        }}
        onSaldoChange={(saldo, monto) => {
          setSaldoUsado(saldo);
          setPagoConSaldoCompleto(monto === 0 && saldo > 0);
        }}
        onReferidoChange={(codigo, descuento) => {
          setCodigoReferido(codigo);
          setDescuentoReferido(descuento);
        }}
      />

      {showSuccessModal && compraExitosa?.cuentaVPN && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={() => {
            setShowSuccessModal(false);
            navigate("/perfil");
          }}
          cuentaVPN={compraExitosa.cuentaVPN}
          saldoUsado={compraExitosa.saldoUsado || 0}
          codigoReferidoUsado={compraExitosa.codigoReferidoUsado}
        />
      )}
    </>
  );
};

export default CheckoutPlanesContainer;