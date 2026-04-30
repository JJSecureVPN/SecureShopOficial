import { useState, useEffect, useCallback } from 'react';
import { referidosService, ValidacionCodigoReferido } from '../services/api.service';

const REFERRAL_STORAGE_KEY = 'securevpn_referral_code';
const REFERRAL_EXPIRY_KEY = 'securevpn_referral_expiry';
const REFERRAL_TTL_HOURS = 72; // Código válido por 72 horas

interface UseReferralCodeReturn {
  referralCode: string | null;
  referralValidation: ValidacionCodigoReferido | null;
  isValidating: boolean;
  descuentoReferido: number;
  clearReferralCode: () => void;
  validateCode: (code: string, email?: string) => Promise<ValidacionCodigoReferido>;
}

/**
 * Hook para manejar códigos de referido
 * - Detecta código en URL (?ref=CODIGO)
 * - Lo guarda en localStorage por 72 horas
 * - Valida el código con el backend
 */
export function useReferralCode(userEmail?: string): UseReferralCodeReturn {
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const [referralValidation, setReferralValidation] = useState<ValidacionCodigoReferido | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Limpiar código expirado
  const clearExpiredCode = useCallback(() => {
    const expiry = localStorage.getItem(REFERRAL_EXPIRY_KEY);
    if (expiry && Date.now() > parseInt(expiry)) {
      localStorage.removeItem(REFERRAL_STORAGE_KEY);
      localStorage.removeItem(REFERRAL_EXPIRY_KEY);
      return true;
    }
    return false;
  }, []);

  // Guardar código en localStorage
  const saveCode = useCallback((code: string) => {
    const expiry = Date.now() + REFERRAL_TTL_HOURS * 60 * 60 * 1000;
    localStorage.setItem(REFERRAL_STORAGE_KEY, code.toUpperCase());
    localStorage.setItem(REFERRAL_EXPIRY_KEY, expiry.toString());
  }, []);

  // Limpiar código
  const clearReferralCode = useCallback(() => {
    localStorage.removeItem(REFERRAL_STORAGE_KEY);
    localStorage.removeItem(REFERRAL_EXPIRY_KEY);
    setReferralCode(null);
    setReferralValidation(null);
  }, []);

  // Validar código con el backend
  const validateCode = useCallback(async (code: string, email?: string): Promise<ValidacionCodigoReferido> => {
    setIsValidating(true);
    try {
      const result = await referidosService.validarCodigo(code, email);
      setReferralValidation(result);
      
      if (result.valido) {
        saveCode(code);
        setReferralCode(code.toUpperCase());
      } else {
        clearReferralCode();
      }
      
      return result;
    } catch (error) {
      console.error('[useReferralCode] Error validando código:', error);
      const errorResult: ValidacionCodigoReferido = {
        valido: false,
        mensaje: 'Error validando código'
      };
      setReferralValidation(errorResult);
      return errorResult;
    } finally {
      setIsValidating(false);
    }
  }, [saveCode, clearReferralCode]);

  // Detectar código en URL al cargar
  useEffect(() => {
    const detectCode = async () => {
      // Primero verificar si hay código expirado
      clearExpiredCode();

      // Buscar código en URL
      const urlParams = new URLSearchParams(window.location.search);
      const urlCode = urlParams.get('ref') || urlParams.get('referral');

      if (urlCode) {
        console.log('[useReferralCode] Código detectado en URL:', urlCode);
        await validateCode(urlCode, userEmail);
        
        // Limpiar URL sin recargar página
        const newUrl = new URL(window.location.href);
        newUrl.searchParams.delete('ref');
        newUrl.searchParams.delete('referral');
        window.history.replaceState({}, '', newUrl.toString());
        return;
      }

      // Si no hay en URL, buscar en localStorage
      const storedCode = localStorage.getItem(REFERRAL_STORAGE_KEY);
      if (storedCode) {
        console.log('[useReferralCode] Código encontrado en localStorage:', storedCode);
        setReferralCode(storedCode);
        // Re-validar por si acaso
        await validateCode(storedCode, userEmail);
      }
    };

    detectCode();
  }, [userEmail, validateCode, clearExpiredCode]);

  return {
    referralCode,
    referralValidation,
    isValidating,
    descuentoReferido: referralValidation?.valido ? (referralValidation.descuento || 0) : 0,
    clearReferralCode,
    validateCode,
  };
}

/**
 * Hook para manejar el saldo del usuario
 */
export function useUserSaldo(userEmail?: string) {
  const [saldo, setSaldo] = useState<number>(0);
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchSaldo = useCallback(async () => {
    if (!userEmail) {
      setSaldo(0);
      setUserId(null);
      return;
    }

    setLoading(true);
    try {
      const result = await referidosService.getSaldoByEmail(userEmail);
      setSaldo(result.saldo);
      setUserId(result.userId);
    } catch (error) {
      console.error('[useUserSaldo] Error obteniendo saldo:', error);
      setSaldo(0);
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    fetchSaldo();
  }, [fetchSaldo]);

  return {
    saldo,
    userId,
    loading,
    refresh: fetchSaldo,
  };
}
