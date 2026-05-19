import React, { useState } from "react";
import { createPortal } from "react-dom";
import { apiService } from "../services/api.service";
import { useBodyOverflow } from "../hooks/useBodyOverflow";
import {
  X,
  Zap,
  CheckCircle,
  AlertCircle,
  Loader2,
  RefreshCw,
  Search,
} from "lucide-react";

interface RepairConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialUsername?: string;
}

const RepairConnectionModal: React.FC<RepairConnectionModalProps> = ({ 
  isOpen, 
  onClose,
  initialUsername = ""
}) => {
  const [username, setUsername] = useState(initialUsername);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Bloquear scroll del body cuando el modal está abierto
  useBodyOverflow(isOpen);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim()) {
      setError("El nombre de usuario es requerido");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await apiService.repararConexion(username.trim());
      if (response.success) {
        setSuccess(true);
      } else {
        setError(response.error || "Error al sincronizar la cuenta");
      }
    } catch (err: any) {
      setError(err.mensaje || err.message || "Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setUsername(initialUsername);
      setError(null);
      setSuccess(false);
      onClose();
    }
  };

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
          <div className="flex items-center gap-3 mb-2">
             <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <Zap className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-[0.2em]">Sincronización</span>
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Reparar Conexión.
          </h2>
          <p className="text-zinc-500 mt-2 text-sm">
            Si tienes problemas para conectar tras una renovación.
          </p>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {success ? (
            <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-20 h-20 rounded-full bg-emerald-500/5 flex items-center justify-center border border-emerald-500/10">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-extrabold text-white">¡Reparado!</h3>
                  <p className="text-zinc-400 text-sm">
                    Hemos actualizado tu cuenta <span className="text-white font-mono">@{username}</span> en el cluster.
                  </p>
                  <p className="text-emerald-400 font-semibold text-sm leading-relaxed">
                    Intenta conectar ahora. Si el error persiste, repite esta acción una vez más.
                  </p>
                </div>
              </div>

              <div className="p-6 bg-[#060606] border border-zinc-800/80 rounded-2xl space-y-4">
                <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest text-center border-b border-zinc-800/50 pb-4">Pasos a seguir</p>
                <ul className="text-sm text-zinc-300 space-y-3">
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                    Reinicia la aplicación VPN
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                    Vuelve a presionar Conectar
                  </li>
                  <li className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
                    Prueba cambiar de servidor
                  </li>
                </ul>
              </div>

              <button
                onClick={handleClose}
                className="w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-zinc-200 transition-all shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
              >
                ENTENDIDO
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="p-4 bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
                <p className="text-xs text-zinc-500 leading-relaxed text-center italic">
                  "Esta herramienta sincroniza tu suscripción con todos los servidores globales en segundos."
                </p>
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-widest ml-1">
                  Usuario de la cuenta
                </label>
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-white transition-colors" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ej. juan123"
                    disabled={loading}
                    className="w-full pl-12 pr-4 py-3.5 bg-[#060606] border border-zinc-800/80 rounded-xl text-white placeholder-zinc-700 focus:outline-none focus:ring-1 focus:ring-zinc-600 focus:border-zinc-600 transition-all font-mono text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold uppercase tracking-widest">Error</p>
                    <p className="text-xs opacity-80">{error}</p>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !username.trim()}
                className="w-full py-4 bg-white text-black font-extrabold rounded-xl hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-[0_10px_20px_rgba(255,255,255,0.05)]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    SINCRONIZANDO...
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-5 h-5" />
                    SINCRONIZAR AHORA
                  </>
                )}
              </button>
              
              <p className="text-[10px] text-zinc-600 text-center uppercase tracking-widest font-bold">
                Operación segura • No cambia contraseñas
              </p>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default RepairConnectionModal;
