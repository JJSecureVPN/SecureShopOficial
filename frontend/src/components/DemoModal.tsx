import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { apiService } from "../services/api.service";
import { useBodyOverflow } from "../hooks/useBodyOverflow";
import { useAuth } from "../contexts/AuthContext";
import Loading from "./Loading";
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
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4 pt-20">
        <div className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full p-8 flex items-center justify-center border border-zinc-700">
          <Loading />
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 flex items-center justify-center p-4 pt-20">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full max-h-[85vh] border border-zinc-700 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-zinc-700 p-6 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
              <Gift className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-100">
                Prueba Gratuita
              </h2>
              <p className="text-xs text-zinc-400">
                Acceso completo por 2 horas
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* No autenticado - Mostrar mensaje de login */}
          {!isAuthenticated && (
            <div className="space-y-6">
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <LogIn className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-orange-200 font-semibold text-sm">
                      Inicia sesión para continuar
                    </p>
                    <p className="text-orange-300 text-xs mt-1">
                      Debes tener una cuenta para solicitar demos gratuitas. 
                      Cada cuenta puede solicitar hasta 2 demos.
                    </p>
                  </div>
                </div>
              </div>

              {/* Beneficios */}
              <div className="bg-gradient-to-br from-zinc-800 via-zinc-800/90 to-zinc-700 border border-zinc-600 rounded-lg p-4 space-y-2">
                <p className="text-zinc-100 text-xs font-semibold">
                  ✨ La demo incluye:
                </p>
                <ul className="text-zinc-300 text-xs space-y-1">
                  <li>✅ 2 horas de acceso completo</li>
                  <li>✅ Todos los servidores disponibles</li>
                  <li>✅ Velocidad sin limitaciones</li>
                  <li>✅ Máximo 2 demos por cuenta</li>
                </ul>
              </div>

              <button
                onClick={handleGoToLogin}
                className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                <LogIn className="w-5 h-5" />
                Iniciar Sesión
              </button>
              
              <p className="text-center text-xs text-zinc-400">
                ¿No tienes cuenta?{" "}
                <button
                  onClick={handleGoToRegister}
                  className="text-orange-400 hover:text-orange-300 font-medium"
                >
                  Regístrate gratis
                </button>
              </p>
            </div>
          )}

          {/* Autenticado */}
          {isAuthenticated && (
            <>
              {/* Usuario info */}
              <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-orange-400" />
                </div>
                <div className="flex-1">
                  <p className="text-orange-200 text-sm font-medium truncate">
                    {user?.email}
                  </p>
                  {demosInfo && (
                    <p className="text-orange-300 text-xs">
                      Demos: {demosInfo.demos_usadas}/{demosInfo.demos_maximas} usadas
                    </p>
                  )}
                </div>
              </div>

              {/* Loading demos info */}
              {checkingDemos && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-orange-400" />
                  <span className="ml-2 text-sm text-zinc-400">Verificando disponibilidad...</span>
                </div>
              )}

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center py-8">
                  <Loading />
                </div>
              )}

              {/* Success State - Email enviado */}
              {success && credentials && !loading && (
                <div className="space-y-6">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-emerald-200 font-semibold text-sm">
                          ¡Credenciales enviadas!
                        </p>
                        <p className="text-zinc-300 text-xs mt-1">
                          Hemos enviado las credenciales de tu demo a:
                        </p>
                        <p className="text-emerald-300 font-semibold text-sm mt-1">
                          {user?.email}
                        </p>
                        {credentials.demos_restantes !== undefined && (
                          <p className="text-emerald-400 text-xs mt-2">
                            Te quedan {credentials.demos_restantes} demo(s) disponible(s).
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Info de la demo */}
                  <div className="bg-gradient-to-br from-zinc-800 via-zinc-800/90 to-zinc-700 border border-zinc-600 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-orange-300" />
                      <p className="text-zinc-300 text-sm">
                        <span className="font-semibold text-white">{credentials.horas_validas} horas</span> de acceso completo
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📧</span>
                      <p className="text-zinc-300 text-xs">
                        Revisa tu bandeja de entrada (y spam)
                      </p>
                    </div>
                  </div>

                  <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
                    <p className="text-orange-200 text-xs leading-relaxed">
                      📱 Descarga la app <span className="font-semibold">JJSecure VPN</span> desde Play Store o App Store e ingresa las credenciales que enviamos a tu email.
                    </p>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl transition-colors shadow-lg hover:shadow-xl"
                  >
                    Entendido
                  </button>
                </div>
              )}

              {/* Límite alcanzado */}
              {limiteAlcanzado && !loading && !success && (
                <div className="space-y-6">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-red-200 font-semibold text-sm">
                          Límite de demos alcanzado
                        </p>
                        <p className="text-red-300 text-xs mt-1">
                          Has usado todas tus demos disponibles ({demosInfo?.demos_maximas || 2} máximo por cuenta).
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-orange-500/10 to-zinc-800/50 border border-orange-500/20 rounded-lg p-4">
                    <p className="text-orange-200 text-sm font-semibold mb-2">
                      ¿Te gustó el servicio?
                    </p>
                    <p className="text-orange-300 text-xs mb-3">
                      Adquiere un plan completo y disfruta de internet ilimitado.
                    </p>
                    <button
                      onClick={() => {
                        handleClose();
                        navigate("/planes");
                      }}
                      className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors text-sm"
                    >
                      Ver Planes
                    </button>
                  </div>

                  <button
                    onClick={handleClose}
                    className="w-full py-2 text-zinc-400 hover:text-zinc-200 font-medium text-sm transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              )}

              {/* Form State */}
              {!success && !loading && !checkingDemos && !limiteAlcanzado && (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Error Message */}
                  {error && (
                    <div
                      className={`rounded-lg p-4 ${
                        bloqueado
                          ? "bg-orange-500/10 border border-orange-500/20"
                          : "bg-red-500/10 border border-red-500/20"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {bloqueado ? (
                          <Clock className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p
                            className={`font-semibold text-sm ${
                              bloqueado ? "text-orange-200" : "text-red-200"
                            }`}
                          >
                            {bloqueado ? "Demo bloqueada" : "Error"}
                          </p>
                          <p
                            className={`text-xs mt-1 ${
                              bloqueado ? "text-orange-300" : "text-red-300"
                            }`}
                          >
                            {error}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Nombre Input */}
                  <div>
                    <label className="block text-sm font-semibold text-zinc-100 mb-2">
                      Nombre o Alias
                    </label>
                    <input
                      type="text"
                      value={nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      disabled={loading}
                      placeholder="Tu nombre"
                      className="w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-colors disabled:opacity-50"
                    />
                  </div>

                  {/* Info Box */}
                  <div className="bg-gradient-to-br from-zinc-800 via-zinc-800/90 to-zinc-700 border border-zinc-600 rounded-lg p-4 space-y-2">
                    <p className="text-zinc-100 text-xs font-semibold">
                      ✨ Incluye:
                    </p>
                    <ul className="text-zinc-300 text-xs space-y-1">
                      <li>✅ 2 horas de acceso completo</li>
                      <li>✅ Todos los servidores disponibles</li>
                      <li>✅ Velocidad sin limitaciones</li>
                    </ul>
                    <p className="text-zinc-400 text-xs mt-3 pt-2 border-t border-zinc-600">
                      📧 Las credenciales se enviarán a: <span className="text-orange-200">{user?.email}</span>
                    </p>
                    {demosInfo && (
                      <p className="text-orange-200 text-xs">
                        ⚠️ Demos disponibles: {demosInfo.demos_disponibles} de {demosInfo.demos_maximas}
                      </p>
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || bloqueado}
                    className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-600 disabled:text-zinc-400 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                  >
                    {bloqueado ? (
                      <>
                        <Clock className="w-5 h-5" />
                        Bloqueado temporalmente
                      </>
                    ) : loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Solicitando...
                      </>
                    ) : (
                      <>
                        <Gift className="w-5 h-5" />
                        Solicitar Demo
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
    </div>
  );
};

export default DemoModal;
