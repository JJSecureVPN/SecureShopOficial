import { useState, useCallback, useEffect } from 'react';
import type { Noticia, NoticiaCategoria } from '../types';

interface UseNoticiasResult {
  noticias: Noticia[];
  categorias: NoticiaCategoria[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useNoticias(categoria?: string): UseNoticiasResult {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [categorias, setCategorias] = useState<NoticiaCategoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNoticias = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      let url = '/api/noticias';
      if (categoria) {
        url += `?categoria=${categoria}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        setNoticias(result.data || []);
      } else {
        setError(result.error || 'Error cargando noticias');
      }
    } catch (err) {
      console.error('Error fetching noticias:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [categoria]);

  const fetchCategorias = useCallback(async () => {
    try {
      const response = await fetch('/api/noticias/categorias/todas');
      const result = await response.json();

      if (result.success) {
        setCategorias(result.data || []);
      }
    } catch (err) {
      console.error('Error fetching categorías:', err);
    }
  }, []);

  useEffect(() => {
    fetchNoticias();
    fetchCategorias();
  }, [fetchNoticias, fetchCategorias]);

  return {
    noticias,
    categorias,
    loading,
    error,
    refetch: fetchNoticias,
  };
}
