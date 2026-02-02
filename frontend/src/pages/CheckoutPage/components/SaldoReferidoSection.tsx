import { useState, useEffect } from 'react';
import { Wallet, Gift, Check, X, Loader2, Info, Sparkles } from 'lucide-react';
import { useReferralCode, useUserSaldo } from '../../../hooks/useReferralCode';
import { referidosService } from '../../../services/api.service';

interface SaldoReferidoSectionProps {
  userEmail?: string;
  precioTotal: number;
  onSaldoChange: (saldoUsado: number, montoAPagar: number) => void;
  onReferidoChange: (codigo: string | null, descuento: number) => void;
}

export function SaldoReferidoSection({
  userEmail,
  precioTotal,
  onSaldoChange,
  onReferidoChange,
}: SaldoReferidoSectionProps) {
  const { saldo } = useUserSaldo(userEmail);
  const {
    referralCode,
    referralValidation,
    isValidating,
    descuentoReferido,
    validateCode,
    clearReferralCode,
  } = useReferralCode(userEmail);

  const [usarSaldo, setUsarSaldo] = useState(false);
  const [saldoAUsar, setSaldoAUsar] = useState(0);
  const [codigoManual, setCodigoManual] = useState('');
  const [mostrarInputCodigo, setMostrarInputCodigo] = useState(false);
  const [programaActivo, setProgramaActivo] = useState(true);

  // Verificar si el programa está activo
  useEffect(() => {
    referidosService.getSettings()
      .then(settings => setProgramaActivo(settings.activo))
      .catch(() => setProgramaActivo(false));
  }, []);

  // Calcular descuento por referido
  const descuentoPorReferido = referralValidation?.valido 
    ? Math.round(precioTotal * descuentoReferido / 100) 
    : 0;

  // Precio después de descuento por referido
  const precioConDescuentoReferido = precioTotal - descuentoPorReferido;

  // Calcular cuánto saldo se puede usar
  useEffect(() => {
    if (usarSaldo && saldo > 0) {
      const maxSaldo = Math.min(saldo, precioConDescuentoReferido);
      setSaldoAUsar(maxSaldo);
    } else {
      setSaldoAUsar(0);
    }
  }, [usarSaldo, saldo, precioConDescuentoReferido]);

  // Notificar cambios de saldo
  useEffect(() => {
    const montoFinal = precioConDescuentoReferido - saldoAUsar;
    onSaldoChange(saldoAUsar, Math.max(0, montoFinal));
  }, [saldoAUsar, precioConDescuentoReferido, onSaldoChange]);

  // Notificar cambios de referido
  useEffect(() => {
    onReferidoChange(
      referralValidation?.valido ? referralCode : null,
      descuentoPorReferido
    );
  }, [referralCode, referralValidation, descuentoPorReferido, onReferidoChange]);

  const handleValidarCodigo = async () => {
    if (codigoManual.trim()) {
      await validateCode(codigoManual.trim(), userEmail);
      setMostrarInputCodigo(false);
      setCodigoManual('');
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Si el programa no está activo y no hay saldo, no mostrar nada
  if (!programaActivo && (!userEmail || saldo === 0)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Sección de Saldo - Solo si el usuario tiene email y saldo */}
      {userEmail && saldo > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 to-green-500/10 border border-emerald-500/20 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Wallet className="w-5 h-5 text-emerald-400" />
              <span className="font-medium text-emerald-200">Tu saldo disponible</span>
            </div>
            <span className="text-lg font-bold text-emerald-300">
              {formatCurrency(saldo)}
            </span>
          </div>

          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={usarSaldo}
                onChange={(e) => setUsarSaldo(e.target.checked)}
                className="sr-only"
              />
              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                usarSaldo 
                  ? 'bg-emerald-500 border-emerald-500' 
                  : 'bg-zinc-800 border-zinc-600 group-hover:border-emerald-400'
              }`}>
                {usarSaldo && <Check className="w-3 h-3 text-white" />}
              </div>
            </div>
            <span className="text-sm text-zinc-300">
              Usar saldo para pagar
              {usarSaldo && saldoAUsar > 0 && (
                <span className="ml-1 font-medium text-emerald-300">
                  (-{formatCurrency(saldoAUsar)})
                </span>
              )}
            </span>
          </label>

          {usarSaldo && saldoAUsar >= precioConDescuentoReferido && (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-300 bg-emerald-500/10 rounded-lg px-3 py-2 border border-emerald-500/20">
              <Sparkles className="w-4 h-4" />
              <span>¡Tu saldo cubre el total! No necesitas pagar.</span>
            </div>
          )}
        </div>
      )}

      {/* Sección de Código de Referido */}
      {programaActivo && (
        <div className="bg-gradient-to-r from-orange-500/10 to-orange-600/10 border border-orange-500/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-orange-400" />
            <span className="font-medium text-orange-200">Código de referido</span>
          </div>

          {referralCode && referralValidation?.valido ? (
            // Código válido aplicado
            <div className="flex items-center justify-between bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-600">
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="font-mono font-medium text-orange-200">{referralCode}</span>
                <span className="text-sm text-emerald-400">
                  -{descuentoReferido}% aplicado
                </span>
              </div>
              <button
                onClick={clearReferralCode}
                className="p-1 hover:bg-zinc-700 rounded transition-colors"
                title="Quitar código"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
          ) : referralValidation && !referralValidation.valido ? (
            // Código inválido
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-red-300 bg-red-500/10 rounded-lg px-3 py-2 border border-red-500/20">
                <X className="w-4 h-4" />
                <span>{referralValidation.mensaje}</span>
              </div>
              <button
                onClick={() => setMostrarInputCodigo(true)}
                className="text-sm text-orange-400 hover:text-orange-300"
              >
                Probar otro código
              </button>
            </div>
          ) : mostrarInputCodigo ? (
            // Input para ingresar código
            <div className="flex gap-2">
              <input
                type="text"
                value={codigoManual}
                onChange={(e) => setCodigoManual(e.target.value.toUpperCase())}
                placeholder="Ingresa el código"
                className="flex-1 px-3 py-2 border border-zinc-600 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono uppercase bg-zinc-800 text-zinc-100 placeholder-zinc-400"
                maxLength={10}
              />
              <button
                onClick={handleValidarCodigo}
                disabled={!codigoManual.trim() || isValidating}
                className="px-4 py-2 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isValidating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Aplicar'
                )}
              </button>
              <button
                onClick={() => {
                  setMostrarInputCodigo(false);
                  setCodigoManual('');
                }}
                className="p-2 text-zinc-400 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            // Botón para mostrar input
            <button
              onClick={() => setMostrarInputCodigo(true)}
              className="text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1"
            >
              <Gift className="w-4 h-4" />
              ¿Tienes un código de referido?
            </button>
          )}

          {descuentoPorReferido > 0 && (
            <div className="mt-3 flex items-center gap-2 text-sm text-orange-300 bg-orange-500/10 rounded-lg px-3 py-2 border border-orange-500/20">
              <Info className="w-4 h-4" />
              <span>
                Ahorras <strong>{formatCurrency(descuentoPorReferido)}</strong> con este código
              </span>
            </div>
          )}
        </div>
      )}

      {/* Resumen de descuentos si hay alguno aplicado */}
      {(descuentoPorReferido > 0 || saldoAUsar > 0) && (
        <div className="bg-zinc-800 border border-zinc-600 rounded-xl p-4 space-y-2">
          <div className="text-sm font-medium text-zinc-200 mb-2">Resumen de descuentos</div>
          
          {descuentoPorReferido > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Descuento por referido ({descuentoReferido}%)</span>
              <span className="text-emerald-400">-{formatCurrency(descuentoPorReferido)}</span>
            </div>
          )}
          
          {saldoAUsar > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-zinc-400">Saldo utilizado</span>
              <span className="text-emerald-400">-{formatCurrency(saldoAUsar)}</span>
            </div>
          )}
          
          <div className="border-t border-zinc-600 pt-2 mt-2 flex justify-between font-medium">
            <span className="text-zinc-200">Total a pagar</span>
            <span className="text-lg text-orange-400">
              {formatCurrency(Math.max(0, precioConDescuentoReferido - saldoAUsar))}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
