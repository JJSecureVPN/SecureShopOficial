import { X, CheckCircle, Copy, Check, Mail } from "lucide-react";
import { useState } from "react";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  cuentaVPN: {
    username: string;
    password: string;
    expiracion: string;
    categoria: string;
  };
  saldoUsado: number;
  codigoReferidoUsado?: string;
}

export const SuccessModal = ({
  isOpen,
  onClose,
  cuentaVPN,
  saldoUsado,
  codigoReferidoUsado,
}: SuccessModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-zinc-900 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-300 border border-zinc-700">
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-emerald-500 to-green-500 p-6 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-4">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">¡Compra Exitosa!</h2>
          <p className="text-emerald-100 mt-1">Tu cuenta VPN está lista para usar</p>
        </div>

        {/* Contenido */}
        <div className="p-6 space-y-4">
          {/* Info del pago */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg p-4">
            <div className="flex items-center gap-2 text-emerald-300 mb-2">
              <span className="text-sm font-medium">Pagado con saldo</span>
              <span className="font-bold">{formatCurrency(saldoUsado)}</span>
            </div>
            {codigoReferidoUsado && (
              <div className="text-sm text-emerald-400">
                Código de referido usado: <span className="font-mono font-medium">{codigoReferidoUsado}</span>
              </div>
            )}
          </div>

          {/* Credenciales */}
          <div className="space-y-3">
            <h3 className="font-semibold text-zinc-100">Tus credenciales de acceso:</h3>
            
            {/* Usuario */}
            <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-600">
              <label className="text-xs text-zinc-400 block mb-1">Usuario</label>
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium text-zinc-100">{cuentaVPN.username}</span>
                <button
                  onClick={() => handleCopy(cuentaVPN.username, 'username')}
                  className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                >
                  {copiedField === 'username' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Contraseña */}
            <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-600">
              <label className="text-xs text-zinc-400 block mb-1">Contraseña</label>
              <div className="flex items-center justify-between">
                <span className="font-mono font-medium text-zinc-100">{cuentaVPN.password}</span>
                <button
                  onClick={() => handleCopy(cuentaVPN.password, 'password')}
                  className="p-1.5 hover:bg-zinc-700 rounded transition-colors"
                >
                  {copiedField === 'password' ? (
                    <Check className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Copy className="w-4 h-4 text-zinc-400" />
                  )}
                </button>
              </div>
            </div>

            {/* Plan y expiración */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-600">
                <label className="text-xs text-zinc-400 block mb-1">Plan</label>
                <span className="font-medium text-zinc-100">{cuentaVPN.categoria}</span>
              </div>
              <div className="bg-zinc-800 rounded-lg p-3 border border-zinc-600">
                <label className="text-xs text-zinc-400 block mb-1">Válido hasta</label>
                <span className="font-medium text-zinc-100">{cuentaVPN.expiracion}</span>
              </div>
            </div>
          </div>

          {/* Nota de email */}
          <div className="flex items-start gap-2 text-sm text-zinc-300 bg-blue-500/10 rounded-lg p-3 border border-blue-500/20">
            <Mail className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
            <span>También enviamos estas credenciales a tu email.</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-colors"
          >
            Continuar
          </button>
        </div>

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 hover:bg-zinc-800 rounded-full transition-colors"
        >
          <X className="w-5 h-5 text-zinc-400" />
        </button>
      </div>
    </div>
  );
};
