import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api.service";
import { useBodyOverflow } from "../hooks/useBodyOverflow";
import { useAuth } from "../contexts/AuthContext";
import AuthModal from "./AuthModal";
import {
  X,
  Gift,
  CheckCircle,
  AlertCircle,
  Clock,
  Loader2,
  LogIn,
  User,
} from "lucide-react";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DemoModal: React.FC<DemoModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const isAuthenticated = !!user;

  const [nombre, setNombre] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingDemos, setCheckingDemos] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [credentials, setCredentials] = useState<{
    horas_validas: number;
    email_enviado: boolean;
    demos_restantes?: number;
  } | null>(null);
  const [bloqueado, setBloqueado] = useState(false);
  const [limiteAlcanzado, setLimiteAlcanzado] = useState(false);
  const [demosInfo, setDemosInfo] = useState<{
    demos_usadas: number;
    demos_maximas: number;
    demos_disponibles: number;
    puede_solicitar: boolean;
  } | null>(null);

  // Bloquear scroll del body cuando el modal está abierto
  useBodyOverflow(isOpen);

  // Cargar información de demos disponibles cuando el usuario está logueado
  useEffect(() => {
    const cargarDemosInfo = async () => {
      if (isAuthenticated && user?.id && isOpen) {
        setCheckingDemos(true);
        try {
          const info = await apiService.obtenerDemosDisponibles(user.id);
          setDemosInfo(info);
          if (info && !info.puede_solicitar) {
            setLimiteAlcanzado(true);
          }
        } catch (err) {
          console.error("Error cargando demos info:", err);
        } finally {
          setCheckingDemos(false);
        }
      }
    };

    cargarDemosInfo();
  }, [isAuthenticated, user?.id, isOpen]);

  if (!isOpen) return null;

  const validar = (): boolean => {
    if (!nombre.trim()) {
      setError("El nombre es requerido");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!isAuthenticated || !user) {
      setError("Debes iniciar sesión para solicitar una demo");
      return;
    }

    if (!validar()) return;

    setLoading(true);

    try {
      const response = await apiService.solicitarDemo(nombre, user.email || '', user.id);

      if (response.success) {
        setSuccess(true);
        setCredentials({
          horas_validas: response.data?.horas_validas || 2,
          email_enviado: true,
          demos_restantes: response.data?.demos_restantes
        });
        // Actualizar el contador de demos en la UI
        setDemosInfo(prev => prev ? {
          ...prev,
          demos_usadas: prev.demos_usadas + 1,
          demos_disponibles: Math.max(0, prev.demos_disponibles - 1),
          puede_solicitar: Math.max(0, prev.demos_disponibles - 1) > 0
        } : null);
        setNombre("");

        // Auto-cerrar después de 30 segundos
        setTimeout(() => {
          handleClose();
        }, 30000);
      } else if ((response as any).requiere_login) {
        setError("Debes iniciar sesión para solicitar una demo");
      } else if ((response as any).limite_alcanzado) {
        setLimiteAlcanzado(true);
        setDemosInfo({
          demos_usadas: (response as any).demos_usadas || 2,
          demos_maximas: (response as any).demos_maximas || 2,
          demos_disponibles: 0,
          puede_solicitar: false
        });
        setError((response as any).error || "Has alcanzado el límite de demos");
      } else if ((response as any).bloqueado) {
        setBloqueado(true);
        const tiempoTexto = formatearTiempo((response as any).tiempo_restante || 0);
        const mensajeBloqueado =
          (response as any).error ||
          `Ya has solicitado una demo recientemente. Podrás solicitar otra en ${tiempoTexto}.`;
        setError(mensajeBloqueado);
      } else {
        setError(response.error || "Error solicitando demostración");
      }
    } catch (err: any) {
      const mensajeError = err.mensaje || err.message || "Error al procesar la solicitud";
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setNombre("");
    setError(null);
    setSuccess(false);
    setCredentials(null);
    setBloqueado(false);
    setLimiteAlcanzado(false);
    onClose();
  };

  const handleGoToLogin = () => {
    setAuthModalMode('login');
    setShowAuthModal(true);
  };

  const handleGoToRegister = () => {
    setAuthModalMode('register');
    setShowAuthModal(true);
  };

  const formatearTiempo = (segundos: number): string => {
    const horas = Math.ceil(segundos / 3600);
    if (horas === 1) return "1 hora";
    if (horas < 24) return `${horas} horas`;
    const dias = Math.ceil(horas / 24);
    return dias === 1 ? "1 día" : `${dias} días`;
  };

  // Vista de carga de autenticación
  if (authLoading) {
    return createPortal(
      <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
        <div className="bg-[#131417] rounded-3xl shadow-2xl max-w-md w-full p-12 flex flex-col items-center justify-center border border-zinc-800/80">
          <Loader2 className="w-10 h-10 animate-spin text-white mb-4" />
          <p className="text-zinc-500 font-medium">Cargando...</p>
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div className="fixed inset-0 z-[10002] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={handleClose}>
      <div
        className="w-full max-w-md bg-[#131417] rounded-3xl shadow-2xl overflow-hidden border border-zinc-800/80 font-title animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="relative p-8 border-b border-zinc-800/50 bg-zinc-900/10">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Prueba Gratuita.
          </h2>
          <p className="text-zinc-500 mt-2 text-sm">
            Obtén acceso total por 2 horas sin compromiso.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* No autenticado - Mostrar mensaje de login */}
          {!isAuthenticated && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl text-orange-400">
                <LogIn className="w-5 h-5 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-xs font-bold uppercase tracking-widest">Requiere Cuenta</p>
                  <p className="text-xs opacity-80">Debes iniciar sesión para solicitar demos gratuitas.</p>
                </div>
              </div>

              {/* Beneficios */}
              <div className="space-y-4 p-6 bg-[#060606] border border-zinc-800/80 rounded-2xl">
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                  Beneficios incluidos
                </p>
                <ul className="space-y-3">
                  {[
                    "2 horas de acceso completo",
                    "Todos los servidores premium",
                    "Velocidad máxima (1Gbps)",
                    "Soporte técnico prioritario"
                  ].map((benefit, i) => (
                    <li key={i} className="flex items-center gap-3 text-sm text-zinc-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-white/20" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <button
                onClick={handleGoToLogin}
                className="w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
              >
                INICIAR SESIÓN
              </button>

              <p className="text-center text-xs text-zinc-500">
                ¿No tienes cuenta?{" "}
                <button
                  onClick={handleGoToRegister}
                  className="text-white hover:underline font-bold"
                >
                  REGÍSTRATE GRATIS
                </button>
              </p>
            </div>
          )}

          {/* Autenticado */}
          {isAuthenticated && (
            <>
              {/* Usuario info */}
              <div className="flex items-center gap-4 p-4 bg-[#060606] border border-zinc-800/80 rounded-2xl">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                  <User className="w-5 h-5 text-white/60" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">
                    {user?.email}
                  </p>
                  {demosInfo && (
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                      {demosInfo.demos_usadas}/{demosInfo.demos_maximas} DEMOS USADAS
                    </p>
                  )}
                </div>
              </div>

              {/* Loading demos info */}
              {checkingDemos && (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin text-white/20" />
                  <span className="text-xs font-bold text-zinc-600 uppercase tracking-widest">Verificando...</span>
                </div>
              )}

              {/* Loading solicitud */}
              {loading && !success && (
                <div className="flex flex-col items-center justify-center py-12 space-y-4">
                  <Loader2 className="w-10 h-10 animate-spin text-white" />
                  <p className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">Procesando Solicitud</p>
                </div>
              )}

              {/* Success State - Email enviado */}
              {success && credentials && !loading && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400">
                    <CheckCircle className="w-5 h-5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest">¡Credenciales Enviadas!</p>
                      <p className="text-xs opacity-80">Revisa tu bandeja de entrada y carpeta de spam.</p>
                    </div>
                  </div>

                  <div className="p-6 bg-[#060606] border border-zinc-800/80 rounded-2xl space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-zinc-800/50">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Duración</span>
                      <span className="text-sm font-mono text-white">{credentials.horas_validas} horas</span>
                    </div>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Enviado a</span>
                      <span className="text-sm font-mono text-white truncate max-w-[200px]">{user?.email}</span>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-xl">
                    <p className="text-xs text-orange-400/80 leading-relaxed text-center">
                      Descarga la app <span className="font-bold text-orange-400">JJSecure VPN</span> e ingresa los datos enviados.
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-zinc-200 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
                  >
                    ENTENDIDO
                  </button>
                </div>
              )}

              {/* Límite alcanzado */}
              {limiteAlcanzado && !loading && !success && (
                <div className="space-y-6">
                  <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <div className="space-y-1">
                      <p className="text-xs font-bold uppercase tracking-widest">Límite Alcanzado</p>
                      <p className="text-xs opacity-80">Has agotado tus demos disponibles.</p>
                    </div>
                  </div>

                  <div className="p-6 bg-[#060606] border border-zinc-800/80 rounded-2xl space-y-4">
                    <p className="text-sm text-zinc-400 text-center">
                      ¿Te gustó el servicio? Adquiere un plan completo para seguir navegando sin límites.
                    </p>
                    <button
                      onClick={() => {
                        handleClose();
                        navigate("/planes");
                      }}
                      className="w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-zinc-200 transition-all"
                    >
                      VER PLANES
                    </button>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full py-3 text-zinc-500 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
                  >
                    CERRAR
                  </button>
                </div>
              )}

              {/* Form State */}
              {!success && !loading && !checkingDemos && !limiteAlcanzado && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div className={`flex items-center gap-3 p-4 rounded-xl ${bloqueado ? "bg-orange-500/10 border border-orange-500/20 text-orange-400" : "bg-red-500/10 border border-red-500/20 text-red-400"
                      }`}>
                      {bloqueado ? <Clock className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                      <div className="space-y-1">
                        <p className="text-xs font-bold uppercase tracking-widest">{bloqueado ? "Temporalmente Bloqueado" : "Error"}</p>
                        <p className="text-xs opacity-80">{error}</p>
                      </div>
                    </div>
                  )}

                  {/* Nombre Input */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                      Tu Nombre o Alias
                    </label>
                    <div className="relative group">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                      <input
                        type="text"
                        value={nombre}
                        onChange={(e) => setNombre(e.target.value)}
                        disabled={loading}
                        placeholder="Ej. Juan Pérez"
                        className="w-full pl-12 pr-4 py-3.5 bg-[#060606] border border-zinc-800/80 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all font-mono text-sm"
                      />
                    </div>
                  </div>

                  {/* Info Box */}
                  <div className="p-5 bg-zinc-900/50 border border-zinc-800/80 rounded-2xl space-y-3">
                    <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.2em]">Detalles de la demo</p>
                    <div className="flex items-center gap-2 text-sm text-zinc-300">
                      <CheckCircle className="w-4 h-4 text-emerald-500/60" />
                      <span>Acceso Premium por 2 horas</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800/50">
                      📧 Se enviará a: <span className="text-zinc-300 font-mono">{user?.email}</span>
                    </p>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || bloqueado}
                    className="w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
                  >
                    {bloqueado ? (
                      <>
                        <Clock className="w-5 h-5" />
                        BLOQUEADO
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        SOLICITAR DEMO
                      </>
                    )}
                  </button>
                </form>
              )}
            </>
          )}
        </div>
      </div>

      {/* Modal de autenticación */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
      />
    </div>,
    document.body
  );
};

export default DemoModal;
