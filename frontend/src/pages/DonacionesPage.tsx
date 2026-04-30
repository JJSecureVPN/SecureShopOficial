import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import {
  Loader2,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Info,
  AlertTriangle,
} from "lucide-react";
import Lottie from "lottie-react";
import { apiService } from "../services/api.service";
import { Donacion } from "../types";
import { useSearchParams } from "react-router-dom";
import BottomSheet from "../components/BottomSheet";
import thankYouAnimation from "../assets/lottie/donaciones-thankyou.json";

const DonacionesPage = ({
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}) => {
  const [donanteNombre, setDonanteNombre] = useState("");
  const [donanteEmail, setDonanteEmail] = useState("");
  const [monto, setMonto] = useState<number>(5000);
  const [mensaje, setMensaje] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ultimoResultado, setUltimoResultado] = useState<{
    preferenceId: string;
    linkPago: string;
    donacion: Donacion;
  } | null>(null);
  const [searchParams] = useSearchParams();

  const montoSugerencias = useMemo(() => [2000, 5000, 10000, 20000], []);
  const estadoParametro = searchParams.get("status");

  const estadoMensaje = useMemo(() => {
    if (!estadoParametro) return null;
    if (estadoParametro === "pending")
      return {
        tipo: "info" as const,
        texto: "Tu pago está pendiente. Podés reintentar desde tu historial en MercadoPago.",
      };
    if (estadoParametro === "error")
      return {
        tipo: "error" as const,
        texto: "El pago fue cancelado o rechazado. Intentá nuevamente cuando quieras.",
      };
    return null;
  }, [estadoParametro]);

  const handleMontoRapido = (valor: number) => {
    setMonto(valor);
    setError(null);
  };

  const getPreferenceIdForPayment = useCallback(async (): Promise<string> => {
    setError(null);
    setLoading(true);
    const montoNumerico = Number(monto);
    if (!Number.isFinite(montoNumerico) || montoNumerico < 500) {
      setError("El monto mínimo es $500");
      setLoading(false);
      throw new Error("Monto inválido");
    }
    const emailLimpio = donanteEmail.trim();
    const nombreLimpio = donanteNombre.trim();
    const mensajeLimpio = mensaje.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailLimpio)) {
      setError("Email inválido");
      setLoading(false);
      throw new Error("Email inválido");
    }
    try {
      const resultado = await apiService.crearDonacion({
        monto: montoNumerico,
        donanteEmail: emailLimpio,
        donanteNombre: nombreLimpio || undefined,
        mensaje: mensajeLimpio || undefined,
      });
      setUltimoResultado(resultado);
      return resultado.preferenceId;
    } catch (err: any) {
      setUltimoResultado(null);
      setError(err?.mensaje || err?.message || "No pudimos crear la donación");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [donanteEmail, donanteNombre, mensaje, monto]);

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

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      await getPreferenceIdForPayment();
    // eslint-disable-next-line no-empty
    } catch {}
  };

  const inputClass =
    "w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:border-zinc-600 outline-none px-4 py-3 text-sm text-zinc-100 placeholder:text-zinc-600 transition-colors";

  return (
    <div className="min-h-screen bg-gradient-to-b from-refine-bg to-refine-bg-alt text-zinc-100">
      {/* Subtle gradient line at top */}
      <div className="pointer-events-none fixed inset-x-0 top-0 h-px bg-gradient-to-r from-purple-500 to-orange-400 z-50" />

      {/* Mobile Bottom Sheet */}
      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
        subtitle="Secciones"
      >
        <div className="space-y-1">
          {["Formulario", "¿Dónde va?", "Beneficios"].map((label) => (
            <button
              key={label}
              onClick={() => setIsMobileMenuOpen(false)}
              className="w-full text-left px-4 py-3 rounded-lg text-sm text-zinc-400 hover:bg-zinc-800 transition-colors"
            >
              {label}
            </button>
          ))}
        </div>
      </BottomSheet>

      <main className="max-w-5xl mx-auto px-5 sm:px-8 lg:px-10">

        {/* ── Hero ── */}
        <section className="pt-32 pb-14 border-b border-purple-500/20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <p className="text-xs tracking-widest text-zinc-600 uppercase">
                JJSecure VPN · Donaciones
              </p>
              <h1 className="text-3xl sm:text-4xl font-light tracking-tight leading-snug text-zinc-300">
                Apoyá el crecimiento<br />
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-purple-300 to-orange-300">de la red</span>
              </h1>
              <p className="text-sm text-zinc-500 leading-relaxed max-w-md">
                Tus aportes mantienen la red rápida, estable y privada. Cada donación se invierte directamente en infraestructura y nuevas funcionalidades.
              </p>

              {estadoMensaje && (
                <div
                  className={`flex items-start gap-3 rounded-xl px-4 py-3 border text-sm ${
                    estadoMensaje.tipo === "error"
                      ? "bg-red-950/50 border-red-900 text-red-400"
                      : "bg-purple-950/50 border-purple-900 text-purple-300"
                  }`}
                >
                  {estadoMensaje.tipo === "error" ? (
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  ) : (
                    <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  )}
                  <span>{estadoMensaje.texto}</span>
                </div>
              )}

              {/* Stats */}
              <div className="flex gap-8 pt-2">
                {[
                  { label: "Uptime", value: "99.9%" },
                  { label: "Nodos activos", value: "12" },
                  { label: "Usuarios", value: "4.2k+" },
                ].map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xl font-semibold text-white">{stat.value}</p>
                    <p className="text-xs text-zinc-600 mt-0.5">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-center lg:justify-end">
              <div className="w-full max-w-xs opacity-90">
                <Lottie
                  animationData={thankYouAnimation as unknown as object}
                  loop
                  autoplay
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ── Main Grid ── */}
        <section className="py-14 grid grid-cols-1 lg:grid-cols-[1fr,300px] gap-12 lg:gap-16">

          {/* Form */}
          <div className="rounded-2xl bg-refine-bg-alt border border-white/5 p-6 lg:p-8 shadow-lg">
            <form onSubmit={handleSubmit} className="space-y-8">

              {/* Amount */}
              <div className="space-y-3">
                <label className="text-xs tracking-widest text-zinc-600 uppercase block">
                  Monto
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 text-sm select-none">$</span>
                  <input
                    type="number"
                    min={500}
                    max={1000000}
                    step={100}
                    value={monto}
                    onChange={(e) => setMonto(Number(e.target.value))}
                    className="w-full rounded-xl bg-zinc-900 border border-zinc-800 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/30 outline-none pl-8 pr-4 py-3 text-2xl font-semibold text-white transition-colors"
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {montoSugerencias.map((valor) => (
                    <button
                      key={valor}
                      type="button"
                      onClick={() => handleMontoRapido(valor)}
                      className={`rounded-lg border px-4 py-2 text-sm transition-all ${
                        monto === valor
                          ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-purple-600 shadow-md shadow-black/40"
                          : "bg-transparent text-zinc-500 border-zinc-800 hover:border-purple-600/60 hover:text-white"
                      }`}
                    >
                      ${valor.toLocaleString("es-AR")}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-zinc-700">Monto mínimo $500. Podés editarlo libremente.</p>
              </div>

              <div className="w-full h-px bg-zinc-900" />

              {/* Personal info */}
              <div className="space-y-3">
                <label className="text-xs tracking-widest text-zinc-600 uppercase block">
                  Tus datos
                </label>
                <div className="grid gap-3 sm:grid-cols-2">
                  <input
                    type="text"
                    value={donanteNombre}
                    onChange={(e) => setDonanteNombre(e.target.value)}
                    placeholder="Nombre (opcional)"
                    className={inputClass}
                  />
                  <input
                    type="email"
                    value={donanteEmail}
                    onChange={(e) => setDonanteEmail(e.target.value)}
                    placeholder="Email para confirmación"
                    required
                    className={inputClass}
                  />
                </div>
                <textarea
                  value={mensaje}
                  onChange={(e) => setMensaje(e.target.value)}
                  placeholder="Mensaje opcional para el equipo"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              {/* Error */}
              {error && (
                <div className="flex items-center gap-2 text-sm text-red-400">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* CTA or result */}
              {ultimoResultado ? (
                <div className="rounded-2xl border border-purple-900 bg-purple-950/30 px-5 py-5 space-y-4">
                  <div className="flex items-center gap-2 text-emerald-400 text-sm font-medium">
                    <CheckCircle2 className="w-4 h-4" />
                    Link de pago generado
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                    <a
                      href={ultimoResultado.linkPago}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-sm font-medium px-5 py-3 transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Abrir en MercadoPago
                    </a>
                    <span className="text-xs text-zinc-600 font-mono">
                      ID: {ultimoResultado.donacion.id}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-700">Se abrirá en una nueva pestaña.</p>
                </div>
              ) : (
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium px-8 py-3 text-sm transition-all shadow-md shadow-black/40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Generando link...
                    </>
                  ) : (
                    "Generar link de pago"
                  )}
                </button>
              )}
            </form>
          </div>

          {/* ── Sidebar ── */}
          <div className="space-y-8 lg:border-l lg:border-zinc-900 lg:pl-10 bg-refine-bg-alt rounded-2xl p-6">

            {/* Summary */}
            <div className="space-y-3">
              <p className="text-xs tracking-widest text-zinc-600 uppercase">Resumen</p>
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-zinc-600">Total</span>
                <span className="text-3xl font-semibold text-white">
                  ${monto.toLocaleString("es-AR")}
                </span>
              </div>
              {ultimoResultado && (
                <p className="text-xs text-zinc-600 font-mono">
                  ID: {ultimoResultado.donacion.id}
                </p>
              )}
              <div className="flex items-center gap-2 text-xs text-zinc-700">
                <ShieldCheck className="w-3.5 h-3.5" />
                Procesado por MercadoPago
              </div>
            </div>

            <div className="w-full h-px bg-zinc-900" />

            {/* Where it goes */}
            <div className="space-y-3">
              <p className="text-xs tracking-widest text-zinc-600 uppercase">¿A dónde va?</p>
              <ul className="space-y-2.5">
                {[
                  "Infraestructura anti-DDoS",
                  "Nuevos nodos y regiones",
                  "Monitoreo 24/7 y soporte",
                  "Investigación y nuevas funciones",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start text-sm text-zinc-500">
                    <span className="mt-2 w-1 h-1 rounded-full bg-zinc-700 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full h-px bg-zinc-900" />

            {/* Benefits */}
            <div className="space-y-3">
              <p className="text-xs tracking-widest text-zinc-600 uppercase">Beneficios</p>
              <ul className="space-y-2.5">
                {[
                  "Acceso prioritario a betas",
                  "Invitaciones a focus groups",
                  "Reconocimiento en sponsors",
                  "Acelerás nuevas features",
                ].map((item) => (
                  <li key={item} className="flex gap-3 items-start text-sm text-zinc-500">
                    <span className="mt-2 w-1 h-1 rounded-full bg-zinc-700 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="w-full h-px bg-zinc-900" />

            {/* Steps */}
            <div className="space-y-3">
              <p className="text-xs tracking-widest text-zinc-600 uppercase">¿Qué sigue?</p>
              <ol className="space-y-4">
                {[
                  "Elegí el monto y generá el link",
                  "Pagá en MercadoPago en nueva pestaña",
                  "Recibí la confirmación en tu email",
                ].map((step, i) => (
                  <li key={i} className="flex gap-4 items-start text-sm text-zinc-500">
                    <span className="text-xs font-medium text-zinc-700 w-5 flex-shrink-0 pt-0.5 tabular-nums">
                      0{i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DonacionesPage;