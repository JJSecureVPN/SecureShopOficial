import { useState, useEffect, useRef } from "react";
import { activeSessionsService } from "../services/active-sessions.service";

interface ActiveUsersData {
  totalUsers: number;
  totalSessions: number;
  updatedAt: string;
  loading: boolean;
  error: string | null;
}

/**
 * Hook para obtener usuarios activos en tiempo real
 * Se sincroniza con el backend cada 5 segundos para obtener el conteo actualizado
 */
export function useActiveUsers(): ActiveUsersData {
  const [data, setData] = useState<ActiveUsersData>({
    totalUsers: 0,
    totalSessions: 0,
    updatedAt: new Date().toISOString(),
    loading: true,
    error: null,
  });

  const isMountedRef = useRef(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    isMountedRef.current = true;

    const fetchActiveUsers = async () => {
      try {
        const result = await activeSessionsService.getActiveUsersCount();

        if (isMountedRef.current) {
          setData((prev) => ({
            ...prev,
            totalUsers: result.totalUsers,
            totalSessions: result.totalSessions,
            updatedAt: result.updatedAt,
            loading: false,
            error: null,
          }));
        }
      } catch (error) {
        console.error("Error fetching active users:", error);
        if (isMountedRef.current) {
          setData((prev) => ({
            ...prev,
            loading: false,
            error: "No se pudieron cargar usuarios activos",
          }));
        }
      }
    };

    // Fetch inicial
    fetchActiveUsers();

    // Configurar polling cada 5 segundos
    intervalRef.current = setInterval(fetchActiveUsers, 5000);

    // Cleanup
    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return data;
}
