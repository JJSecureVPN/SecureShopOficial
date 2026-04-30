import React, { useEffect, useState } from 'react';
import { cuponesService } from '../services/cupones.service';
import { ValidacionCupon } from '../services/api.service';
import { Loader2, Check, X, Tag, CheckCircle2 } from 'lucide-react';

type CuponAplicado = NonNullable<ValidacionCupon['cupon']>;

interface CuponInputProps {
  planId?: number;
  precioPlan?: number;
  onCuponValidado: (descuento: number, cuponData: CuponAplicado) => void;
  onCuponRemovido: () => void;
  cuponActual?: CuponAplicado | null;
  descuentoActual?: number;
  clienteEmail?: string;
}

const CuponInput: React.FC<CuponInputProps> = ({
  planId,
  precioPlan,
  onCuponValidado,
  onCuponRemovido,
  cuponActual,
  descuentoActual = 0,
  clienteEmail,
}) => {
  const [codigo, setCodigo] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cuponValidado, setCuponValidado] = useState<CuponAplicado | null>(cuponActual || null);
  const [validationStep, setValidationStep] = useState<'idle' | 'searching' | 'applying'>('idle');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (cuponActual) {
      setCuponValidado(cuponActual);
      setCodigo(cuponActual.codigo);
      setError(null);
    } else {
      setCuponValidado(null);
      setCodigo('');
      setShowSuccess(false);
      setError(null);
    }
  }, [cuponActual]);

  const handleValidarCupon = async () => {
    if (!codigo.trim()) {
      setError('Ingresa un código de cupón');
      return;
    }

    setIsValidating(true);
    setError(null);
    setValidationStep('searching');

    console.log('[CuponInput] Validando cupón:', {
      codigo: codigo.trim(),
      planId,
      precioPlan
    });

    try {
      const emailNormalizado = clienteEmail && clienteEmail.trim().length > 0 ? clienteEmail.trim() : undefined;
      const resultado = await cuponesService.validarCupon(
        codigo.trim(),
        planId,
        precioPlan,
        emailNormalizado
      );

      console.log('[CuponInput] Resultado:', resultado);

      if (resultado.valido && resultado.cupon) {
        // Transición a "applying"
        setValidationStep('applying');
        await new Promise(resolve => setTimeout(resolve, 400));
        
        setCuponValidado(resultado.cupon);
        setShowSuccess(true);
        onCuponValidado(resultado.descuento || 0, resultado.cupon);
        setError(null);

        // Desactiva el state de éxito después de 2 segundos
        setTimeout(() => setShowSuccess(false), 2000);
      } else {
        setError(resultado.mensaje || 'Cupón inválido');
        setCuponValidado(null);
      }
    } catch (err: any) {
      console.error('[CuponInput] Error:', err);
      setError(err.message || 'Error validando cupón');
      setCuponValidado(null);
    } finally {
      setIsValidating(false);
      setValidationStep('idle');
    }
  };

  const handleRemoverCupon = () => {
    setCuponValidado(null);
    setCodigo('');
    setError(null);
    setShowSuccess(false);
    onCuponRemovido();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isValidating) {
      handleValidarCupon();
    }
  };

  // Si ya hay un cupón validado, mostrar el estado aplicado
  if (cuponValidado) {
    return (
      <div className="space-y-2">
        <div className="relative group">
          {/* Glow redondeado */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl blur opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
          
          <div className={`relative overflow-hidden bg-gradient-to-r from-emerald-500/5 to-cyan-500/5 transition-opacity duration-500 rounded-xl ${showSuccess ? 'opacity-100' : 'opacity-0'}`} />
          
          <div className="relative bg-zinc-800/80 border border-zinc-600 rounded-2xl p-4 shadow-sm shadow-zinc-900/50 transition-all duration-300 hover:border-emerald-500/50">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <div className="relative w-10 h-10">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/15 to-cyan-500/10 rounded-full animate-pulse" />
                    <div className="absolute inset-1 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-200">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-1 flex-1 min-w-0">
                  <p className="text-emerald-400 text-xs font-semibold uppercase tracking-widest opacity-90">
                    Cupón activo
                  </p>
                  <p className="text-zinc-100 text-sm font-medium truncate">
                    {cuponValidado.codigo}
                  </p>
                  <p className="text-emerald-400/70 text-xs font-light">
                    Ahorro: <span className="font-semibold text-emerald-400">${descuentoActual.toLocaleString('es-AR')}</span>
                    {cuponValidado.tipo === 'porcentaje' && ` • ${cuponValidado.valor}% off`}
                    {cuponValidado.tipo === 'monto_fijo' && ` • $${cuponValidado.valor} off`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleRemoverCupon}
                className="flex-shrink-0 p-2 text-emerald-400/60 hover:text-emerald-400 hover:bg-emerald-500/10 rounded-xl transition-all duration-200 opacity-80 hover:opacity-100"
                title="Remover cupón"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Línea decorativa animada */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/30 to-transparent" />
          </div>
        </div>
      </div>
    );
  }

  // Formulario para ingresar cupón
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <div className="p-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
            <Tag className="w-4 h-4 text-orange-500" />
          </div>
          <span className="font-medium">Código de descuento</span>
        </div>
      </label>

      <div className="flex gap-2">
        <div className="flex-1 relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500/10 to-orange-500/10 rounded-lg blur opacity-0 group-focus-within:opacity-100 transition-all duration-300" />
          
          <input
            type="text"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value.toUpperCase())}
            onKeyPress={handleKeyPress}
            placeholder="CODIGO2024"
            disabled={isValidating}
            className="relative w-full px-4 py-3 bg-zinc-800 border border-zinc-600 rounded-lg text-zinc-100 placeholder-zinc-400 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 transition-all duration-200 uppercase disabled:opacity-50 disabled:cursor-not-allowed"
          />
          
          {/* Indicador de estado sutil */}
          {isValidating && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <div className={`w-5 h-5 flex items-center justify-center transition-all duration-300 ${
                validationStep === 'applying' ? 'text-emerald-400' : 'text-orange-400'
              }`}>
                {validationStep === 'searching' && (
                  <Loader2 className="w-4 h-4 animate-spin" />
                )}
                {validationStep === 'applying' && (
                  <Check className="w-4 h-4 animate-pulse" />
                )}
              </div>
            </div>
          )}

          {/* Barra de progreso elegante */}
          {isValidating && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-b-lg overflow-hidden bg-gradient-to-r from-zinc-700/50 to-zinc-600/30">
              <div 
                className={`h-full rounded-full transition-all ${
                  validationStep === 'searching' 
                    ? 'w-2/3 bg-gradient-to-r from-orange-500 via-orange-400 to-orange-500 opacity-80 animate-pulse' 
                    : 'w-full bg-gradient-to-r from-emerald-500 to-cyan-400 opacity-100'
                }`}
              />
            </div>
          )}
        </div>

        <button
          onClick={handleValidarCupon}
          disabled={isValidating || !codigo.trim()}
          className="group relative px-5 py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-lg flex items-center gap-2 transition-all duration-300 overflow-hidden shadow-md shadow-orange-500/20"
        >
          {/* Efecto de brillo */}
          <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-full group-hover:translate-x-0 transition-transform duration-500 group-disabled:opacity-0" />
          
          <div className="relative flex items-center gap-2">
            <div className="w-4 h-4 flex items-center justify-center transition-all duration-300">
              {isValidating ? (
                validationStep === 'searching' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Check className="w-4 h-4" />
                )
              ) : (
                <Tag className="w-4 h-4" />
              )}
            </div>
            <span className="font-medium">
              {isValidating ? (validationStep === 'searching' ? 'Validando...' : 'Aplicando...') : 'Aplicar'}
            </span>
          </div>
        </button>
      </div>

      {/* Mensaje de error elegante */}
      {error && (
        <div className="flex items-start gap-3 text-sm text-rose-700 bg-rose-50 border border-rose-300 rounded-lg p-3 animate-in fade-in slide-in-from-top-1 duration-300">
          <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span className="font-light">{error}</span>
        </div>
      )}
    </div>
  );
};

export default CuponInput;
