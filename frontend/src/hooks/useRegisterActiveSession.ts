import { useEffect } from "react";
import { activeSessionsService } from "../services/active-sessions.service";

/**
 * Hook que registra la sesión activa del usuario cuando entra a la página
 * También mantiene viva la sesión mientras está en la página
 */
export function useRegisterActiveSession(userId?: string) {
  useEffect(() => {
    // Registrar sesión al montar el componente
    activeSessionsService.registerSession(userId);

    // Mantener la sesión viva cada 30 segundos
    const keepAliveInterval = setInterval(() => {
      activeSessionsService.keepSessionAlive(userId);
    }, 30000);

    // Limpiar la sesión cuando el usuario se va
    const handleBeforeUnload = () => {
      activeSessionsService.endSession();
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      clearInterval(keepAliveInterval);
      window.removeEventListener("beforeunload", handleBeforeUnload);
      // No terminamos la sesión en unload, dejamos que expire naturalmente
      // activeSessionsService.endSession(); // Comentado porque puede ser bloqueante
    };
  }, [userId]);
}
