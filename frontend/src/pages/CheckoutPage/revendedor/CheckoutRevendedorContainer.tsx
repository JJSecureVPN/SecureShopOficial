import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import type { PlanRevendedor, CompraRevendedorRequest } from "../../../types";
import { apiService, type ValidacionCupon } from "../../../services/api.service";
import { mercadoPagoService } from "../../../services/mercadopago.service";
import { CheckoutRevendedorView } from "./CheckoutRevendedorView";

const CheckoutRevendedorContainer: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const nombreInputRef = useRef<HTMLInputElement>(null);
  const emailInputRef = useRef<HTMLInputElement>(null);
  const [plan, setPlan] = useState<PlanRevendedor | null>(null);
  const [error, setError] = useState<string>("");
  const [cuponData, setCuponData] = useState<ValidacionCupon["cupon"] | null>(null);
  const [descuentoAplicado, setDescuentoAplicado] = useState(0);
  const [mpFallbackVisible, setMpFallbackVisible] = useState(false);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

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

  const planId = parseInt(searchParams.get("planId") || "0");

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const planes = await apiService.obtenerPlanesRevendedores();
        const foundPlan = planes.find((item) => item.id === planId);
        if (foundPlan) setPlan(foundPlan);
        else navigate("/revendedores");
      } catch {
        navigate("/revendedores");
      }
    };

    if (planId > 0) {
      void loadPlan();
    }
  }, [planId, navigate]);

  const handleCuponValidado = (descuento: number, cupon: ValidacionCupon["cupon"]) => {
    setCuponData(cupon);
    setDescuentoAplicado(descuento);
  };

  const handleCuponRemovido = () => {
    setCuponData(null);
    setDescuentoAplicado(0);
  };

  const getPreferenceIdForPayment = useCallback(async (): Promise<string> => {
    setError("");

    if (!plan) {
      const message = "Error al procesar el pago";
      setError(message);
      throw new Error(message);
    }

    const nombre = nombreInputRef.current?.value || "";
    const email = emailInputRef.current?.value || "";

    if (!nombre.trim()) {
      const message = "Por favor ingresa tu nombre";
      setError(message);
      throw new Error(message);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      const message = "Email inválido";
      setError(message);
      throw new Error(message);
    }

    try {
      const compraData: CompraRevendedorRequest = {
        planRevendedorId: plan.id,
        clienteNombre: nombre,
        clienteEmail: email,
        codigoCupon: cuponData?.codigo,
      };

      const response = await apiService.comprarPlanRevendedor(compraData);
      const linkPago = response.linkPago;
      if (!linkPago) throw new Error("No se obtuvo linkPago del servidor");

      const prefId = new URL(linkPago).searchParams.get("pref_id");
      if (!prefId) throw new Error("No se pudo extraer pref_id del linkPago");

      return prefId;
    } catch (err: any) {
      const message = err.message || "Error al procesar el pago. Intenta nuevamente.";
      setError(message);
      throw err;
    }
  }, [cuponData, plan]);

  const handleFallbackPayment = async () => {
    setProcessingPayment(true);
    try {
      const prefId = await getPreferenceIdForPayment();
      if (prefId) {
        window.location.href = `https://www.mercadopago.com.ar/checkout/v1/redirect?pref_id=${prefId}`;
      }
    } catch {
      // noop
    } finally {
      setProcessingPayment(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await mercadoPagoService.initialize();
        if (plan) {
          await mercadoPagoService.createButton("wallet_container_revendedor", getPreferenceIdForPayment);
          try {
            await mercadoPagoService.createButton("wallet_container_revendedor_mobile", getPreferenceIdForPayment);
          } catch {
            // ignore if mobile container is missing
          }
          setMpFallbackVisible(false);
        }
      } catch {
        setMpFallbackVisible(true);
        setError("Error de conexión con MercadoPago. Usando método alternativo.");
      }
    };

    if (plan) {
      void init();
    }
  }, [plan, getPreferenceIdForPayment]);

  return (
    <CheckoutRevendedorView
      plan={plan}
      error={error}
      cuponData={cuponData}
      descuentoAplicado={descuentoAplicado}
      mpFallbackVisible={mpFallbackVisible}
      processingPayment={processingPayment}
      mobileSummaryOpen={mobileSummaryOpen}
      nombreInputRef={nombreInputRef}
      emailInputRef={emailInputRef}
      onToggleMobileSummary={() => setMobileSummaryOpen((value) => !value)}
      onFallbackPayment={handleFallbackPayment}
      onBack={() => navigate("/revendedores")}
      onCuponValidado={handleCuponValidado}
      onCuponRemovido={handleCuponRemovido}
    />
  );
};

export default CheckoutRevendedorContainer;