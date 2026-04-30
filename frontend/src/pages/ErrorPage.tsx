import React, { useState, useEffect, useMemo } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import {
  AlertCircle,
  Home,
  Mail,
  Copy,
  Check,
  RefreshCw,
  AlertTriangle,
} from "lucide-react";

const ErrorPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<string | null>(null);
  const [autoVerifyTriggered, setAutoVerifyTriggered] = useState(false);
  const navigate = useNavigate();

  const sanitizeParam = (paramKey: string, fallback: string | null = null) => {
    const allValues = searchParams.getAll(paramKey).filter(Boolean);
    const rawValue = allValues.length > 0 ? allValues[0] : searchParams.get(paramKey);
    if (!rawValue) {
      return fallback;
    }
    const [firstSegment] = rawValue.split(",");
    return firstSegment?.trim() || fallback;
  };

  const errorCode = sanitizeParam("code", "UNKNOWN") || "UNKNOWN";
  const errorMessage =
    sanitizeParam("message") ||
    "Ha ocurrido un error inesperado. Por favor, intenta de nuevo.";
  const pagoId = sanitizeParam("pago_id");
  const email = sanitizeParam("email");
  const operacion = sanitizeParam("operacion", "compra") || "compra";
  const tipo = sanitizeParam("tipo", "cliente") || "cliente";

  const sanitizedPagoId = useMemo(() => pagoId ?? null, [pagoId]);

  const handleCopy = (text: string, field: string) => {
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleVerifyPayment = async () => {
    if (!sanitizedPagoId) {
      setVerificationResult("error: ID de pago no disponible");
      return;
    }

    setIsVerifying(true);
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/pago/${sanitizedPagoId}/verificar-ahora`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        
        // Si el pago está aprobado, redirigir a success
        if (data.data?.estado === "aprobado" || data.data?.status === "approved") {
          setVerificationResult("success: Pago verificado! Redirigiendo...");
          setTimeout(() => {
            navigate(`/success?status=approved&pago_id=${sanitizedPagoId}&tipo=${tipo}`);
          }, 1500);
        } else {
          if (data.meta?.mercadoPagoStatus === "approved" && data.data?.estado !== "aprobado") {
            setVerificationResult(
              "info: Pago aprobado en MercadoPago, estamos generando tus credenciales. Reintenta en unos segundos."
            );
          } else {
            setVerificationResult(
              `info: Estado del pago: ${data.data?.estado || data.data?.status || data.meta?.mercadoPagoStatus || "desconocido"}`
            );
          }
        }
      } else {
        setVerificationResult("error: No se pudo verificar el pago. Intenta de nuevo.");
      }
    } catch (error) {
      console.error("Error verificando pago:", error);
      setVerificationResult("error: Error al conectar con el servidor. Intenta de nuevo.");
    } finally {
      setIsVerifying(false);
    }
  };

  useEffect(() => {
    if (errorCode === "PAYMENT_PENDING" && sanitizedPagoId && !autoVerifyTriggered) {
      setAutoVerifyTriggered(true);

      const timeoutId = window.setTimeout(() => {
        // Intentamos verificar automáticamente unos segundos después
        void handleVerifyPayment();
      }, 1200);

      return () => {
        window.clearTimeout(timeoutId);
      };
    }

    return undefined;
  }, [errorCode, sanitizedPagoId, autoVerifyTriggered]);

  // Map error codes to user-friendly messages
  const getErrorDetails = () => {
    const errorMap: Record<
      string,
      { title: string; description: string; suggestions: string[] }
    > = {
      PAYMENT_PENDING: {
        title: "Pago Aún Pendiente",
        description:
          "Tu pago se está procesando. Por favor, aguarda unos minutos antes de intentar nuevamente.",
        suggestions: [
          "Espera 5-10 minutos y recarga la página",
          "Verifica tu correo por actualizaciones",
          "Si el problema persiste, contacta a soporte",
        ],
      },
      PAYMENT_REJECTED: {
        title: "Pago Rechazado",
        description:
          "Tu pago fue rechazado por MercadoPago. Verifica los datos e intenta de nuevo.",
        suggestions: [
          "Revisa tu método de pago",
          "Verifica que tengas saldo disponible",
          "Intenta con otro método de pago",
          "Contacta a MercadoPago si el problema persiste",
        ],
      },
      PAYMENT_CANCELLED: {
        title: "Pago Cancelado",
        description: "Tu pago fue cancelado. Puedes intentar nuevamente en cualquier momento.",
        suggestions: [
          "Regresa a la tienda para reintentar",
          "Verifica tus datos de pago",
          "Contacta a soporte si necesitas ayuda",
        ],
      },
      PAYMENT_ERROR: {
        title: "Error en el Pago",
        description:
          "Ocurrió un error al procesar tu pago. Por favor, intenta nuevamente.",
        suggestions: [
          "Recarga la página y reinicia el proceso",
          "Verifica tu conexión a internet",
          "Intenta con otro navegador",
          "Contacta a soporte si el problema persiste",
        ],
      },
      REVENDEDOR_CREATION_FAILED: {
        title: "Error al Crear Revendedor",
        description:
          "No pudimos crear tu cuenta de revendedor. Por favor, contacta a soporte.",
        suggestions: [
          "Tu pago fue registrado correctamente",
          "Nuestro equipo revisará tu solicitud",
          "Te notificaremos por correo cuando se resuelva",
          "Contacta a soporte si tienes urgencia",
        ],
      },
      API_ERROR: {
        title: "Error de Servidor",
        description:
          "Hubo un problema con nuestro servidor. Por favor, intenta de nuevo más tarde.",
        suggestions: [
          "Recarga la página en unos minutos",
          "Verifica tu conexión a internet",
          "Contacta a soporte si el problema persiste",
        ],
      },
      INVALID_REQUEST: {
        title: "Solicitud Inválida",
        description: "La solicitud contiene datos inválidos o incompletos.",
        suggestions: [
          "Verifica los datos de tu solicitud",
          "Intenta nuevamente desde el principio",
          "Contacta a soporte si ves este error repetidamente",
        ],
      },
      UNKNOWN: {
        title: "Error Desconocido",
        description:
          "Ha ocurrido un error inesperado. Por favor, intenta de nuevo.",
        suggestions: [
          "Recarga la página",
          "Borra el caché del navegador",
          "Intenta con otro navegador",
          "Contacta a soporte si el problema persiste",
        ],
      },
    };

    return errorMap[errorCode] || errorMap["UNKNOWN"];
  };

  const errorDetails = getErrorDetails();

  return (
    <div className="min-h-screen pt-16 pb-8 px-4 bg-white md:pt-14">
      <div className="max-w-2xl mx-auto">
        {/* Error Header */}
        <div className="mb-8">
          <div className="grid lg:grid-cols-[1.2fr,0.8fr] gap-8 items-center">
            <div className="text-center lg:text-left">
              <div className="w-16 h-16 mx-auto lg:mx-0 mb-6 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-rose-700" />
              </div>
              <h1 className="text-3xl font-serif font-medium text-gray-900 mb-2">
                {errorDetails.title}
              </h1>
              <p className="text-gray-600 max-w-xl mx-auto lg:mx-0">
                {errorDetails.description}
              </p>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="flex items-center justify-center">
                <AlertTriangle className="w-20 h-20 text-rose-600 animate-float" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6 shadow-sm shadow-gray-100">
          {/* Error Code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-900 mb-2">
              Código de Error
            </label>
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-4 py-3">
              <code className="text-rose-700 font-mono text-sm">{errorCode}</code>
            </div>
          </div>

          {/* Message */}
          {errorMessage && errorMessage !== "Ha ocurrido un error inesperado. Por favor, intenta de nuevo." && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-300 rounded-lg">
              <p className="text-sm text-rose-800">{errorMessage}</p>
            </div>
          )}

          {/* Pago ID (if available) */}
          {sanitizedPagoId && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                ID de {operacion === "renovacion" ? "Renovación" : "Pago"}
              </label>
              <div
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleCopy(sanitizedPagoId, "pagoId")}
              >
                <code className="text-gray-900 font-mono text-sm break-all pr-4">
                  {sanitizedPagoId}
                </code>
                {copiedField === "pagoId" ? (
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </div>
          )}

          {/* Email (if available) */}
          {email && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Correo Registrado
              </label>
              <div
                className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => handleCopy(email, "email")}
              >
                <span className="text-gray-900 text-sm break-all pr-4">{email}</span>
                {copiedField === "email" ? (
                  <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <Copy className="w-5 h-5 text-gray-400 flex-shrink-0" />
                )}
              </div>
            </div>
          )}

          {/* Suggestions */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">
              Qué Puedes Hacer
            </h3>
            <ul className="space-y-2">
              {errorDetails.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-3 text-sm">
                  <span className="text-emerald-600 flex-shrink-0 mt-1">•</span>
                  <span className="text-gray-700">{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Info */}
          <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-gray-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  ¿Necesitas Ayuda?
                </p>
                <p className="text-xs text-gray-600">
                  Si el problema persiste, contacta a nuestro equipo de soporte con tu ID de{" "}
                  {operacion === "renovacion" ? "renovación" : "pago"}.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold py-3 rounded-lg transition-colors border border-gray-300"
          >
            <Home className="w-4 h-4" />
            Volver al Inicio
          </Link>
          
          {errorCode === "PAYMENT_PENDING" && sanitizedPagoId && (
            <button
              onClick={handleVerifyPayment}
              disabled={isVerifying}
              className="flex-1 flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors border border-indigo-700"
            >
              <RefreshCw className={`w-4 h-4 ${isVerifying ? "animate-spin" : ""}`} />
              {isVerifying ? "Verificando..." : "Verificar Pago Ahora"}
            </button>
          )}

          <a
            href="https://wa.me/5493812531123?text=Hola%20necesito%20ayuda%20con%20un%20error%20en%20mi%20compra.%20Código%20de%20error:%20"
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-lg transition-colors border border-emerald-700"
          >
            <Mail className="w-4 h-4" />
            WhatsApp Soporte
          </a>
        </div>

        {/* Verification Result */}
        {verificationResult && (
          <div className={`mt-4 p-4 rounded-lg border ${
            verificationResult.startsWith("success")
              ? "bg-emerald-50 border-emerald-300 text-emerald-800"
              : verificationResult.startsWith("error")
              ? "bg-rose-50 border-rose-300 text-rose-800"
              : "bg-indigo-50 border-indigo-300 text-indigo-800"
          }`}>
            <p className="text-sm">
              {verificationResult.split(": ").slice(1).join(": ")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorPage;
