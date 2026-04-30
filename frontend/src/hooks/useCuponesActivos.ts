import { useState, useCallback, useRef } from 'react';
import { useStaggeredFetch } from './useStaggeredFetch';
import type { Cupon } from '../types';

export function useCuponesActivos() {
  const [cupones, setCupones] = useState<Cupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firstLoadRef = useRef(true);

  const fetchCupones = useCallback(async () => {
    try {
      if (firstLoadRef.current) {
        setLoading(true);
      }
      const response = await fetch('/api/cupones/listar');
      const result = await response.json();

      if (result.success) {
        // Filtrar solo los cupones activos y no expirados
        const now = new Date();
        const cuponesActivos = (result.data || []).filter((cupon: Cupon) => {
          if (!cupon.activo) return false;
          if (cupon.fecha_expiracion && new Date(cupon.fecha_expiracion) < now) {
            return false;
          }
          return true;
        });
        setCupones(cuponesActivos);
        setError(null);
      } else {
        setCupones([]);
      }
    } catch (err) {
      console.error('Error fetching cupones:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCupones([]);
    } finally {
      if (firstLoadRef.current) {
        firstLoadRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  // Usar staggered fetch para evitar 429 errors (actualizar cada 5 minutos)
  useStaggeredFetch('cupones-activos', fetchCupones, 300000);

  return { cupones, loading, error };
}
