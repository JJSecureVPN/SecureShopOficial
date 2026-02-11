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
    <div className="flex items-center justify-between text-xs uppercase tracking-wide text-zinc-500/80">
      <span>{label}</span>
      {hint && <span className="text-zinc-400/70 tracking-normal normal-case">{hint}</span>}
    </div>
    <div className="flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-4 py-3">
      <span className={`font-mono text-sm text-white/90 ${!value ? "opacity-50" : ""}`}>
        {value || (obfuscated ? "••••••••" : "Generando...")}
      </span>
      <button
        type="button"
        disabled={!value}
        onClick={() => value && onCopy(value, fieldKey)}
        className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-3 py-1 text-xs font-medium text-white/90 hover:bg-zinc-800 disabled:opacity-40 transition-colors"
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
  <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-4 space-y-2">
    <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-zinc-500/80">
      {icon}
      <span>{label}</span>
    </div>
    <div className="text-lg font-semibold text-white/95">{value}</div>
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
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-zinc-950 text-zinc-400 pt-16 md:pt-14">
        <Clock className="h-16 w-16 text-indigo-500/80 animate-pulse" />
        <Loader2 className="h-10 w-10 animate-spin text-orange-500/80" />
        <p className="text-sm text-zinc-500">{loadingMessage}</p>
      </div>
    );
  }

  if (error || !pago) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 pt-16 md:pt-14">
        <div className="w-full max-w-md rounded-lg border border-red-500/20 bg-red-900/10 p-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-900/20">
            <AlertCircle className="h-8 w-8 text-red-400/90" />
          </div>
          <h2 className="text-2xl font-semibold text-white/95">Verificando pago</h2>
          <p className="mt-2 text-zinc-400/90">{error || "No se encontró información del pago."}</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/50 px-6 py-3 text-sm font-medium text-white/90 hover:bg-zinc-800 transition-colors"
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
    { label: "Servidor", value: pago.servex_categoria || "N/A", icon: <Shield className="h-4 w-4 text-zinc-500/60" /> },
    { label: quantityLabel, value: quantityValue, icon: <MonitorSmartphone className="h-4 w-4 text-zinc-500/60" /> },
    { label: "Válido hasta", value: expiryText, icon: <Clock className="h-4 w-4 text-zinc-500/60" /> },
    { label: "Referencia", value: <span className="font-mono text-sm">{pago.id}</span>, icon: <Repeat className="h-4 w-4 text-zinc-500/60" /> },
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
    <div className="min-h-screen bg-zinc-950 text-white pt-16 md:pt-14">
      <div className="relative isolate">
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" aria-hidden>
          <div className="absolute -left-16 top-10 h-48 w-48 rounded-full bg-indigo-500 blur-3xl" />
          <div className="absolute right-0 bottom-0 h-64 w-64 rounded-full bg-orange-500 blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-12 space-y-8">
          <header className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-6 md:p-8">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-400/90">
                  {renovacionParam === "true" ? "Renovación" : "Nuevo acceso"}
                </div>
                <h1 className="mt-4 text-3xl md:text-4xl font-semibold text-white/95">¡Pago completado!</h1>
                <p className="mt-2 text-sm md:text-base text-zinc-400/80 max-w-2xl leading-relaxed">
                  {renovacionParam === "true"
                    ? "Tu renovación está activa y los días extra ya figuran en Secure Panel."
                    : "Tu acceso VPN premium está listo para usar con los datos que ves abajo."}
                </p>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-5 py-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500/80">Estado</p>
                  <p className="text-emerald-400/90 text-lg font-semibold">Aprobado</p>
                </div>
                <div className="relative h-20 w-20">
                  {thumbsAnimation ? (
                    <Lottie animationData={thumbsAnimation} loop autoplay className="absolute inset-0" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center rounded-full border border-emerald-500/20 bg-emerald-500/8">
                      <CheckCircle className="h-8 w-8 text-emerald-400/90" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
            <section className="space-y-5 rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-zinc-500/80">Credenciales</p>
                  <h2 className="text-xl md:text-2xl font-semibold text-white/95">Panel Servex</h2>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAll}
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-white/90 hover:bg-zinc-800 transition-colors"
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
                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/8 px-4 py-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-emerald-400/90 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-emerald-300/90">
                        {operacionParam === "upgrade" ? "Upgrade aplicado" : "Renovación confirmada"}
                      </p>
                      <p className="text-sm text-emerald-400/80 mt-0.5">
                        Se sumaron {diasParam || "30"} días al usuario {pago.servex_username}.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 px-4 py-3 text-sm text-zinc-400/90">
                <Mail className="mr-2 inline h-4 w-4 text-zinc-500/70" />
                Credenciales enviadas a <span className="font-medium text-white/90">{pago.cliente_email || "correo no especificado"}</span>
              </div>

              <div className="rounded-lg border border-orange-500/20 bg-orange-500/8 px-4 py-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-orange-400/90 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-orange-300/90">Guarda tus credenciales</p>
                    <p className="text-sm text-orange-400/80 mt-0.5">Evita compartirlas o reutilizar contraseñas en otros servicios.</p>
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-2">
                {detailCards.map((card) => (
                  <DetailCard key={card.label} {...card} />
                ))}
              </div>

              {isRevendedor && (
                <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/8 p-5 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg border border-indigo-500/20 bg-indigo-500/10 p-2">
                      <ExternalLink className="h-5 w-5 text-indigo-400/90" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-indigo-400/80">Panel de gestión</p>
                      <h3 className="text-lg md:text-xl font-semibold text-white/95 mt-1">Administra tus cuentas</h3>
                      <p className="text-sm text-zinc-400/80 mt-1">Controla usuarios, aplica upgrades y monitorea consumo en tiempo real.</p>
                    </div>
                  </div>
                  <a
                    href="https://servex.ws"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 rounded-lg bg-indigo-600/90 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-600 transition-colors"
                  >
                    Ir a servex.ws
                    <ExternalLink className="h-4 w-4" />
                  </a>
                  <p className="text-xs text-zinc-500/70">Recomendado usar navegador de escritorio para mejores herramientas.</p>
                </div>
              )}
            </section>
          </div>

          <section className="rounded-xl border border-zinc-800/60 bg-zinc-900/40 p-5 md:p-6">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500/80">{isRevendedor ? "Próximos pasos" : "Cómo conectarte"}</p>
                <h3 className="text-xl md:text-2xl font-semibold text-white/95 mt-1">
                  {isRevendedor ? "Impulsa tu operación" : "Conéctate en tres pasos"}
                </h3>
              </div>
              {!isRevendedor && (
                <button
                  type="button"
                  className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-white/90 hover:bg-zinc-800 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Descargar app
                </button>
              )}
            </div>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step.title} className="rounded-lg border border-zinc-800/60 bg-zinc-900/30 p-4">
                  <div className="flex items-center gap-2.5 text-zinc-400/90">
                    <span className="text-sm font-semibold text-zinc-500/80">{String(index + 1).padStart(2, "0")}</span>
                    <p className="font-medium text-white/90">{step.title}</p>
                  </div>
                  <p className="mt-2 text-sm text-zinc-400/80 leading-relaxed">{step.description}</p>
                </div>
              ))}
            </div>
          </section>

          <div className="grid gap-3 md:grid-cols-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm font-medium text-white/90 hover:bg-zinc-800 transition-colors"
            >
              <Download className="mr-2 inline h-4 w-4" /> Imprimir
            </button>
            <button
              type="button"
              onClick={handleCopyAll}
              className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-sm font-medium text-white/90 hover:bg-zinc-800 transition-colors"
            >
              {copiedField === "all" ? <Check className="mr-2 inline h-4 w-4" /> : <Copy className="mr-2 inline h-4 w-4" />}
              {copiedField === "all" ? "Datos copiados" : "Copiar credenciales"}
            </button>
            <Link
              to="/"
              className="rounded-lg border border-zinc-700 bg-zinc-800/50 px-4 py-3 text-center text-sm font-medium text-white/90 hover:bg-zinc-800 transition-colors"
            >
              <Home className="mr-2 inline h-4 w-4" /> Volver al inicio
            </Link>
          </div>

          <div className="text-center text-sm text-zinc-400/80 flex flex-col items-center gap-2">
            <div className="inline-flex items-center gap-2 rounded-lg border border-zinc-800/60 bg-zinc-900/40 px-4 py-1.5 text-zinc-300/90">
              <MessageSquare className="h-4 w-4" /> ¿Necesitás ayuda?
            </div>
            <p>
              Escribinos a
              <a href="mailto:jjsecurevpn@gmail.com" className="ml-1 text-white/90 font-medium hover:text-indigo-400 transition-colors">
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
