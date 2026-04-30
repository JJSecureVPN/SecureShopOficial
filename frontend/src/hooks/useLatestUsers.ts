import { useState, useCallback } from "react";
import { useStaggeredFetch } from "./useStaggeredFetch";
import { Usuario } from "../types";
import { apiService } from "../services/api.service";

interface LatestUsersData {
  usuarios: Usuario[];
  loading: boolean;
  error: string | null;
}

export function useLatestUsers(
  limit: number = 10,
  refreshInterval: number = 45000
): LatestUsersData {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = useCallback(async () => {
    try {
      setError(null);
      const data = await apiService.obtenerUltimosUsuarios(limit);
      setUsuarios(data);
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Error cargando usuarios");
      setLoading(false);
    }
  }, [limit]);

  // Usar staggered fetch para evitar 429 errors
  useStaggeredFetch(`latest-users-${limit}`, fetchUsuarios, refreshInterval);

  return {
    usuarios,
    loading,
    error,
  };
}
