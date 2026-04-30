import { useState, useCallback, useRef } from 'react';
import { useStaggeredFetch } from './useStaggeredFetch';
import type { NoticiaConfig } from '../types';

export function useNoticias() {
  const [config, setConfig] = useState<NoticiaConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const firstLoadRef = useRef(true);

  const fetchNoticias = useCallback(async () => {
    try {
      if (firstLoadRef.current) {
        setLoading(true);
      }
      const response = await fetch('/api/config/noticias');
      const result = await response.json();

      if (result.success) {
        setConfig(result.data || null);
        setError(null);
      } else {
        setConfig(null);
      }
    } catch (err) {
      console.error('Error fetching noticias:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setConfig(null);
    } finally {
      if (firstLoadRef.current) {
        firstLoadRef.current = false;
        setLoading(false);
      }
    }
  }, []);

  // Usar staggered fetch para evitar 429 errors
  useStaggeredFetch('noticias', fetchNoticias, 60000);

  return { config, loading, error };
}
