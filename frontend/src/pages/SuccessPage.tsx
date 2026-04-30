import React, { useEffect, useState } from "react";
import Lottie from "lottie-react";
import { Link, useSearchParams } from "react-router-dom";
import {
  AlertCircle,
  Check,
  CheckCircle,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Home,
  Loader2,
  Mail,
  MessageSquare,
  MonitorSmartphone,
  Repeat,
  Shield,
} from "lucide-react";
import { apiService } from "../services/api.service";
import { Pago } from "../types";

const selectSanitizedParam = (params: URLSearchParams, key: string): string | null => {
  const allValues = params.getAll(key).filter(Boolean);
  const rawValue = allValues.length > 0 ? allValues[0] : params.get(key);
  if (!rawValue) return null;
  const [firstSegment] = rawValue.split(",");
  const normalized = firstSegment?.trim();
  return normalized || null;
};

const formatExpiryDate = (value?: string | null) => {
  if (!value || value === "N/A") return "N/A";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "N/A";
  return parsed.toLocaleDateString("es-ES", { month: "short", day: "numeric", year: "2-digit" });
};

interface CredentialFieldProps {
  label: string;
  value?: string | null;
  fieldKey: string;
  hint?: string;
  obfuscated?: boolean;
  copiedField: string | null;
  onCopy: (value: string, field: string) => void;
}

const CredentialField = ({ label, value, fieldKey, hint, obfuscated, copiedField, onCopy }: CredentialFieldProps) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between text-xs uppercase tracking-[0.35em] text-gray-600">
      <span>{label}</span>
      {hint && <span className="text-gray-500 tracking-normal normal-case">{hint}</span>}
    </div>
    <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
      <span className={`font-mono text-sm text-gray-900 ${!value ? "opacity-70" : ""}`}>
        {value || (obfuscated ? "••••••••" : "Generando...")}
      </span>
      <button
        type="button"
        disabled={!value}
        onClick={() => value && onCopy(value, fieldKey)}
        className="rounded-lg border border-gray-300 px-3 py-1 text-xs font-semibold text-gray-900 hover:bg-white disabled:opacity-50"
      >
        {copiedField === fieldKey ? "Copiado" : "Copiar"}
      </button>
    </div>
  </div>
);

interface DetailCardProps {
  label: string;
  value: React.ReactNode;
  icon: React.ReactNode;
}

const DetailCard = ({ label, value, icon }: DetailCardProps) => (
  <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 space-y-2">
    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.35em] text-gray-600">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-lg font-semibold text-gray-900">{value}</div>
  </div>
);

const SuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [pago, setPago] = useState<Pago | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [reintentos, setReintentos] = useState(0);
  const [thumbsAnimation, setThumbsAnimation] = useState<object | null>(null);

  const pagoIdParam = selectSanitizedParam(searchParams, "pago_id");
  const tipoParamRaw = selectSanitizedParam(searchParams, "tipo");
  const tipoParam = (tipoParamRaw || "cliente").trim();
  const renovacionParam = selectSanitizedParam(searchParams, "renovacion");
  const operacionParam = selectSanitizedParam(searchParams, "operacion");
  const montoParam = selectSanitizedParam(searchParams, "monto");
  const usernameParam = selectSanitizedParam(searchParams, "username");
  const connectionLimitParam = selectSanitizedParam(searchParams, "connection_limit");
  const creditosParam = selectSanitizedParam(searchParams, "creditos");
  const expiracionParam = selectSanitizedParam(searchParams, "fecha_expiracion");
  const emailParam = selectSanitizedParam(searchParams, "email");
  const diasParam = selectSanitizedParam(searchParams, "dias");

  useEffect(() => {
    if (!pagoIdParam) {
      setError("ID de pago no encontrado");
      setLoading(false);
      return;
    }

    const normalized = pagoIdParam.trim();
    if (!normalized) {
      setError("ID de pago inválido");
      setLoading(false);
      return;
    }

    if (renovacionParam === "true") {
      void cargarRenovacion(normalized);
    } else {
      void cargarPago(normalized, tipoParam);
    }
  }, [pagoIdParam, tipoParam, renovacionParam, reintentos]);

  useEffect(() => {
    let isMounted = true;

    fetch("/lottie/thumbs%20up.json")
      .then((response) => (response.ok ? response.json() : null))
      .then((data) => {
        if (isMounted && data) {
          setThumbsAnimation(data);
        }
      })
      .catch(() => null);

    return () => {
      isMounted = false;
    };
  }, []);

  const cargarRenovacion = async (renovacionId: string) => {
    try {
      setLoading(true);
      setError(null);

      const monto = montoParam ? parseFloat(montoParam) : 0;
      const connectionLimit = connectionLimitParam ? parseInt(connectionLimitParam, 10) : undefined;
      const creditos = creditosParam ? parseInt(creditosParam, 10) : undefined;

      const renovacionData = {
        id: renovacionId,
        plan_id: 0,
        monto,
        estado: "aprobado",
        metodo_pago: "mercadopago",
        cliente_email: emailParam || "",
        cliente_nombre: "",
        servex_username: usernameParam || "",
        servex_password: "",
        servex_categoria:
          operacionParam === "upgrade"
            ? "Upgrade aplicado"
            : tipoParam === "revendedor"
            ? creditos !== undefined
              ? "Créditos"
              : "Usuarios"
            : "Renovación aplicada",
        servex_connection_limit: creditos !== undefined ? undefined : connectionLimit,
        servex_creditos: creditos,
        servex_expiracion: expiracionParam || "",
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
      };

      setPago(renovacionData as any);
    } catch (err: any) {
      setError(err.message || "Error al cargar la información de la renovación");
    } finally {
      setLoading(false);
    }
  };

  const cargarPago = async (pagoId: string, tipo = "cliente") => {
    try {
      setLoading(true);
      setError(null);
      const data =
        tipo === "revendedor"
          ? await apiService.obtenerPagoRevendedor(pagoId)
          : await apiService.obtenerPago(pagoId);
      setPago(data);

      const datosIncompletos = !data.servex_username || !data.servex_password;
      if (data.estado !== "aprobado" || datosIncompletos) {
        if (reintentos < 30) {
          const delay = reintentos < 5 ? 500 : reintentos < 10 ? 1000 : 2000;
          setTimeout(() => setReintentos((prev) => prev + 1), delay);
        } else {
          setError("El pago aún no se procesó. Verifica tu email o contacta soporte.");
        }
      }
    } catch (err: any) {
      if (reintentos < 30) {
        const delay = reintentos < 5 ? 500 : reintentos < 10 ? 1000 : 2000;
        setTimeout(() => setReintentos((prev) => prev + 1), delay);
      } else {
        setError(err.message || "Error al cargar la información del pago. Verifica tu email.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    const loadingMessage = reintentos > 0 ? `Procesando tu pago... (${reintentos}/30)` : "Verificando tu compra...";
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white text-gray-600 pt-16 md:pt-14">
        <Clock className="h-16 w-16 text-indigo-600 animate-pulse" />
        <Loader2 className="h-10 w-10 animate-spin text-orange-600" />
        <p className="text-sm">{loadingMessage}</p>
      </div>
    );
  }

  if (error || !pago) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 pt-16 md:pt-14">
        <div className="w-full max-w-md rounded-lg border border-rose-200 bg-rose-50 p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-rose-300 bg-rose-100">
            <AlertCircle className="h-8 w-8 text-rose-700" />
          </div>
          <h2 className="text-2xl font-serif font-medium text-gray-900">Verificando pago</h2>
          <p className="mt-2 text-gray-600">{error || "No se encontró información del pago."}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const isRevendedor = tipoParam === "revendedor";
  const quantityLabel = isRevendedor ? (pago.servex_creditos !== undefined ? "Créditos" : "Usuarios") : "Dispositivos";
  const quantityValue = isRevendedor
    ? pago.servex_creditos !== undefined
      ? pago.servex_creditos
      : pago.servex_connection_limit || "N/A"
    : pago.servex_connection_limit || "N/A";
  const expiryText = formatExpiryDate(pago.servex_expiracion);

  const detailCards: DetailCardProps[] = [
    { label: "Servidor", value: pago.servex_categoria || "N/A", icon: <Shield className="h-4 w-4 text-white/40" /> },
    { label: quantityLabel, value: quantityValue, icon: <MonitorSmartphone className="h-4 w-4 text-white/40" /> },
    { label: "Válido hasta", value: expiryText, icon: <Clock className="h-4 w-4 text-white/40" /> },
    { label: "Referencia", value: <span className="font-mono text-sm">{pago.id}</span>, icon: <Repeat className="h-4 w-4 text-white/40" /> },
  ];

  const steps = isRevendedor
    ? [
        { title: "Ingresa a Servex", description: "Gestiona tus cuentas en https://servex.ws" },
        { title: "Configura tus planes", description: "Consulta credenciales y crea accesos personalizados" },
        { title: "Entrega accesos", description: "Comparte usuarios y monitorea el consumo" },
      ]
    : [
        { title: "Descarga JJSecure VPN", description: "Disponible en iOS y Android" },
        { title: "Ingresa tus credenciales", description: "Utiliza el usuario y contraseña de arriba" },
        { title: "Conéctate", description: "Elige un servidor y activa la VPN" },
      ];

  const handleCopyAll = () => {
    copyToClipboard(`${pago.servex_username ?? ""}\n${pago.servex_password ?? ""}`, "all");
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pt-16 md:pt-14">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 opacity-5" aria-hidden>
          <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-indigo-600 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-emerald-600 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-16 space-y-10">
          <header className="rounded-lg border border-gray-200 bg-white p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-4 py-1 text-xs font-semibold uppercase tracking-[0.4em] text-emerald-700">
                  {renovacionParam === "true" ? "Renovación" : "Nuevo acceso"}
                </div>
                <h1 className="mt-4 text-4xl font-serif font-medium text-gray-900">¡Pago completado!</h1>
                <p className="mt-3 text-gray-600 max-w-2xl">
                  {renovacionParam === "true"
                    ? "Tu renovación está activa y los días extra ya figuran en Secure Panel."
                    : "Tu acceso VPN premium está listo para usar con los datos que ves abajo."}
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-gray-600">Estado</p>
                  <p className="text-emerald-600 text-lg font-semibold">Aprobado</p>
                </div>
                <div className="relative h-24 w-24">
                  {thumbsAnimation ? (
                    <Lottie animationData={thumbsAnimation} loop autoplay className="absolute inset-0" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full border border-emerald-300 bg-emerald-50">
                      <CheckCircle className="h-8 w-8 text-emerald-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1.1fr,0.9fr]">
            <section className="space-y-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm shadow-gray-100">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-gray-600">Credenciales</p>
                  <h2 className="text-2xl font-serif font-medium text-gray-900">Panel Servex</h2>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  {copiedField === "all" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copiedField === "all" ? "Copiado" : "Copiar todo"}
                </button>
              </div>

              <div className="space-y-4">
                <CredentialField
                  label="Usuario"
                  value={pago.servex_username}
                  fieldKey="username"
                  hint="Necesario para ingresar"
                  copiedField={copiedField}
                  onCopy={copyToClipboard}
                />
                {pago.servex_password && (
                  <CredentialField
                    label="Contraseña"
                    value={pago.servex_password}
                    fieldKey="password"
                    hint="Temporal"
                    obfuscated
                    copiedField={copiedField}
                    onCopy={copyToClipboard}
                  />
                )}
              </div>

              {renovacionParam === "true" && (
                <div className="rounded-lg border border-emerald-300 bg-emerald-50 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="text-sm font-semibold text-emerald-900">
                        {operacionParam === "upgrade" ? "Upgrade aplicado" : "Renovación confirmada"}
                      </p>
                      <p className="text-sm text-emerald-800">
                        Se sumaron {diasParam || "30"} días al usuario {pago.servex_username}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-700">
                <Mail className="mr-3 inline h-4 w-4 text-gray-600" />
                Credenciales enviadas a <span className="font-semibold text-gray-900">{pago.cliente_email || "correo no especificado"}</span>
              </div>

              <div className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-700" />
                  <div>
                    <p className="text-sm font-semibold text-amber-900">Guarda tus credenciales</p>
                    <p className="text-sm text-amber-800">Evita compartirlas o reutilizar contraseñas en otros servicios.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                {detailCards.map((card) => (
                  <DetailCard key={card.label} {...card} />
                ))}
              </div>

              {isRevendedor && (
                <div className="rounded-lg border border-indigo-300 bg-indigo-50 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border border-indigo-200 bg-indigo-100 p-2">
                      <ExternalLink className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.35em] text-indigo-700">Panel de gestión</p>
                      <h3 className="text-xl font-serif font-medium text-gray-900">Administra tus cuentas</h3>
                      <p className="text-sm text-gray-700 mt-1">Controla usuarios, aplica upgrades y monitorea consumo en tiempo real.</p>
                    </div>
                  </div>
                  <a
                    href="https://servex.ws"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    Ir a servex.ws
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <p className="text-xs text-gray-600">Recomendado usar navegador de escritorio para mejores herramientas.</p>
                </div>
              )}
            </section>
          </div>

          <section className="rounded-lg border border-gray-200 bg-white p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-gray-600">{isRevendedor ? "Próximos pasos" : "Cómo conectarte"}</p>
                <h3 className="text-2xl font-serif font-medium text-gray-900 mt-1">
                  {isRevendedor ? "Impulsa tu operación" : "Conéctate en tres pasos"}
                </h3>
              </div>
              {!isRevendedor && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50"
                >
                  <Download className="h-4 w-4" />
                  Descargar app
                </button>
              )}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                  <div className="flex items-center gap-3 text-gray-600">
                    <span className="text-sm font-semibold text-gray-700">{String(index + 1).padStart(2, "0")}</span>
                    <p className="font-semibold text-gray-900">{step.title}</p>
                  </div>
                  <p className="mt-3 text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-4 md:grid-cols-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              <Download className="mr-2 inline h-4 w-4" /> Imprimir
            </button>
            <button
              type="button"
              onClick={handleCopyAll}
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              {copiedField === "all" ? <Check className="mr-2 inline h-4 w-4" /> : <Copy className="mr-2 inline h-4 w-4" />}
              {copiedField === "all" ? "Datos copiados" : "Copiar credenciales"}
            </button>
            <Link
              to="/"
              className="rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-sm font-semibold text-gray-900 hover:bg-gray-50"
            >
              <Home className="mr-2 inline h-4 w-4" /> Volver al inicio
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 px-4 py-1 text-gray-700">
              <MessageSquare className="h-4 w-4" /> ¿Necesitás ayuda?
            </div>
            <p>
              Escribinos a
              <a href="mailto:jjsecurevpn@gmail.com" className="ml-1 text-gray-900 font-medium hover:text-indigo-600">
                jjsecurevpn@gmail.com
              </a>
              o hablá al WhatsApp oficial.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage;
