import React, { useEffect, useState } from 'react';
import { referidosService } from '../services/api.service';
import { Loader2, X, Users, Wallet, CheckCircle2 } from 'lucide-react';

interface SaldoReferidoRenovacionProps {
  clienteEmail: string;
  walletEmail?: string;
  precioSubtotal: number; // Precio después de cupones
  onReferidoAplicado: (descuento: number, codigo: string) => void;
  onReferidoRemovido: () => void;
  onSaldoAplicado: (monto: number) => void;
  onSaldoRemovido: () => void;
  codigoReferidoActual?: string | null;
  descuentoReferidoActual?: number;
  saldoUsadoActual?: number;
}

const SaldoReferidoRenovacion: React.FC<SaldoReferidoRenovacionProps> = ({
  clienteEmail,
  walletEmail,
  precioSubtotal,
  onReferidoAplicado,
  onReferidoRemovido,
  onSaldoAplicado,
  onSaldoRemovido,
  codigoReferidoActual,
  descuentoReferidoActual = 0,
  saldoUsadoActual = 0,
}) => {
  const [codigo, setCodigo] = useState(codigoReferidoActual || '');
  const [isValidating, setIsValidating] = useState(false);
  const [errorReferido, setErrorReferido] = useState<string | null>(null);
  const [referidoValidado, setReferidoValidado] = useState<string | null>(codigoReferidoActual || null);
  
  const [saldoDisponible, setSaldoDisponible] = useState<number>(0);
  const [buscandoSaldo, setBuscandoSaldo] = useState(false);
  const [usarSaldo, setUsarSaldo] = useState(saldoUsadoActual > 0);

  const saldoOwnerEmail = walletEmail || clienteEmail;

  // Cargar saldo disponible cuando cambia el email del wallet
  useEffect(() => {
    const cargarSaldo = async () => {
      if (!saldoOwnerEmail || !saldoOwnerEmail.includes('@')) return;
      
      setBuscandoSaldo(true);
      try {
        const data = await referidosService.getSaldoByEmail(saldoOwnerEmail);
        setSaldoDisponible(data.saldo || 0);
      } catch (err) {
        console.error('[SaldoReferido] Error cargando saldo:', err);
      } finally {
        setBuscandoSaldo(false);
      }
    };

    cargarSaldo();
  }, [saldoOwnerEmail]);

  // Actualizar estados internos si cambian los props
  useEffect(() => {
    if (codigoReferidoActual) {
      setReferidoValidado(codigoReferidoActual);
      setCodigo(codigoReferidoActual);
    } else {
      setReferidoValidado(null);
      setCodigo('');
    }
  }, [codigoReferidoActual]);

  useEffect(() => {
    setUsarSaldo(saldoUsadoActual > 0);
  }, [saldoUsadoActual]);

  const handleValidarReferido = async () => {
    if (!codigo.trim()) {
      setErrorReferido('Ingresa un código de referido');
      return;
    }

    setIsValidating(true);
    setErrorReferido(null);

    try {
      const resultado = await referidosService.validarCodigo(codigo.trim(), saldoOwnerEmail);

      if (resultado.valido) {
        const descPorcentaje = resultado.descuento || 0;
        const montoDescuento = Math.round((precioSubtotal * descPorcentaje) / 100);
        
        setReferidoValidado(codigo.trim().toUpperCase());
        onReferidoAplicado(montoDescuento, codigo.trim().toUpperCase());
        setErrorReferido(null);
      } else {
        setErrorReferido(resultado.mensaje || 'Código no válido');
        setReferidoValidado(null);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err: any) {
      setErrorReferido('Error validando código');
    } finally {
      setIsValidating(false);
    }
  };

  const handleRemoverReferido = () => {
    setReferidoValidado(null);
    setCodigo('');
    setErrorReferido(null);
    onReferidoRemovido();
  };

  const toggleSaldo = () => {
    if (usarSaldo) {
      setUsarSaldo(false);
      onSaldoRemovido();
    } else {
      if (saldoDisponible > 0) {
        setUsarSaldo(true);
        // Calculamos cuánto saldo podemos usar (el máximo es el subtotal o el disponible)
        const montoAUsar = Math.min(precioSubtotal - descuentoReferidoActual, saldoDisponible);
        onSaldoAplicado(montoAUsar);
      }
    }
  };

  return (
    <div className="space-y-6 pt-4 border-t border-zinc-800/50">
      {/* Sección Referidos */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-zinc-100">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20">
              <Users className="w-4 h-4 text-indigo-400" />
            </div>
            <span className="font-medium">Código de referido</span>
          </div>
        </label>

        {referidoValidado ? (
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 rounded-xl blur opacity-50 transition-opacity duration-300" />
            <div className="relative bg-zinc-900/80 border border-indigo-500/30 rounded-xl p-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                  <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{referidoValidado}</p>
                  <p className="text-indigo-400 text-xs">Descuento aplicado: ${descuentoReferidoActual.toLocaleString('es-AR')}</p>
                </div>
              </div>
              <button 
                onClick={handleRemoverReferido}
                className="p-1.5 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-2">
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="CÓDIGO AMIGO"
              className="flex-1 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-indigo-500/50 transition-all uppercase"
            />
            <button
              onClick={handleValidarReferido}
              disabled={isValidating || !codigo.trim()}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-medium rounded-xl transition-all flex items-center gap-2 min-w-[100px] justify-center"
            >
              {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validar'}
            </button>
          </div>
        )}
        {errorReferido && <p className="text-xs text-red-400 px-1">{errorReferido}</p>}
      </div>

      {/* Sección Saldo (Wallet) */}
      {saldoDisponible > 0 && (
        <div className="space-y-3">
          <div 
            onClick={toggleSaldo}
            className={`cursor-pointer group relative overflow-hidden rounded-2xl border transition-all duration-300 ${
              usarSaldo 
                ? 'bg-emerald-500/10 border-emerald-500/40 shadow-[0_0_20px_rgba(16,185,129,0.1)]' 
                : 'bg-zinc-900/50 border-zinc-800 hover:border-emerald-500/30'
            }`}
          >
            <div className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl border transition-colors ${
                  usarSaldo ? 'bg-emerald-500/20 border-emerald-500/30' : 'bg-zinc-800 border-zinc-700'
                }`}>
                  <Wallet className={`w-5 h-5 ${usarSaldo ? 'text-emerald-400' : 'text-zinc-400'}`} />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Usar saldo de mi cuenta</h4>
                  <p className={`text-xs ${usarSaldo ? 'text-emerald-400' : 'text-zinc-500'}`}>
                    Disponible: <span className="font-bold">${saldoDisponible.toLocaleString('es-AR')}</span>
                  </p>
                </div>
              </div>
              
              <div className={`w-10 h-5 rounded-full relative transition-colors ${
                usarSaldo ? 'bg-emerald-500' : 'bg-zinc-800'
              }`}>
                <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${
                  usarSaldo ? 'left-6' : 'left-1'
                }`} />
              </div>
            </div>
          </div>
          
          {usarSaldo && (
            <p className="text-[11px] text-emerald-400/80 px-2 animate-in fade-in slide-in-from-top-1">
              Se aplicará un descuento de <span className="font-bold">${saldoUsadoActual.toLocaleString('es-AR')}</span> a tu total.
            </p>
          )}
        </div>
      )}

      {buscandoSaldo && (
        <div className="flex items-center gap-2 text-xs text-zinc-500 px-2">
          <Loader2 className="w-3 h-3 animate-spin" />
          <span>Consultando saldo disponible...</span>
        </div>
      )}
    </div>
  );
};

export default SaldoReferidoRenovacion;
