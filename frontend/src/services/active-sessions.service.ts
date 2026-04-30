/**
 * Servicio para gestionar sesiones activas
 * Registra y sincroniza la sesión del usuario con Supabase
 */

export interface SessionData {
  sessionToken: string;
  userId?: string;
  registeredAt: string;
}

class ActiveSessionsService {
  private sessionToken: string | null = null;
  private isRegistered = false;
  private registrationAttempts = 0;
  private maxRegistrationAttempts = 3;

  constructor(private apiUrl: string = import.meta.env.VITE_API_URL || "") {
    // Si no hay URL configurada, intenta usar una relativa
    if (!this.apiUrl) {
      this.apiUrl = "";
    }
  }

  /**
   * Inicializa la sesión y la registra en el backend
   */
  async registerSession(userId?: string): Promise<string | null> {
    try {
      // Obtener o generar token de sesión
      this.sessionToken = this.getOrCreateSessionToken();

      // Registrar sesión en el backend
      const url = this.apiUrl.endsWith('/api') 
        ? `${this.apiUrl}/sessions/register`
        : `${this.apiUrl}/api/sessions/register`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId || null,
          session_token: this.sessionToken,
        }),
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        this.isRegistered = true;
        this.registrationAttempts = 0;
        console.log("[ActiveSessions] Sesión registrada exitosamente");
        return data.sessionToken;
      } else {
        throw new Error(data.error || "Error registering session");
      }
    } catch (error) {
      console.error("[ActiveSessions] Error registrando sesión:", error);

      // Reintentar hasta maxRegistrationAttempts
      if (this.registrationAttempts < this.maxRegistrationAttempts) {
        this.registrationAttempts++;
        const delay = 1000 * Math.pow(2, this.registrationAttempts - 1); // Exponential backoff
        console.log(
          `[ActiveSessions] Reintentando en ${delay}ms (intento ${this.registrationAttempts}/${this.maxRegistrationAttempts})`
        );

        setTimeout(() => this.registerSession(userId), delay);
      }

      return null;
    }
  }

  /**
   * Obtiene o crea un token de sesión único
   */
  private getOrCreateSessionToken(): string {
    const storageKey = "activeSessions:token";
    let token = sessionStorage.getItem(storageKey);

    if (!token) {
      // Generar nuevo token
      token = this.generateSessionToken();
      sessionStorage.setItem(storageKey, token);
    }

    return token;
  }

  /**
   * Genera un token de sesión aleatorio
   */
  private generateSessionToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  /**
   * Actualiza la sesión activa (para mantenerla viva)
   */
  async keepSessionAlive(userId?: string): Promise<boolean> {
    if (!this.sessionToken) {
      return this.registerSession(userId) !== null;
    }

    try {
      const url = this.apiUrl.endsWith('/api') 
        ? `${this.apiUrl}/sessions/register`
        : `${this.apiUrl}/api/sessions/register`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: userId || null,
          session_token: this.sessionToken,
        }),
        credentials: "include",
      });

      return response.ok;
    } catch (error) {
      console.error("[ActiveSessions] Error actualizando sesión:", error);
      return false;
    }
  }

  /**
   * Termina la sesión del usuario
   */
  async endSession(): Promise<boolean> {
    if (!this.sessionToken) {
      return false;
    }

    try {
      const url = this.apiUrl.endsWith('/api') 
        ? `${this.apiUrl}/sessions/end`
        : `${this.apiUrl}/api/sessions/end`;
      
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          session_token: this.sessionToken,
        }),
        credentials: "include",
      });

      if (response.ok) {
        this.isRegistered = false;
        sessionStorage.removeItem("activeSessions:token");
        return true;
      }

      return false;
    } catch (error) {
      console.error("[ActiveSessions] Error terminando sesión:", error);
      return false;
    }
  }

  /**
   * Obtiene el token de sesión actual
   */
  getSessionToken(): string | null {
    return this.sessionToken;
  }

  /**
   * Verifica si la sesión está registrada
   */
  isSessionRegistered(): boolean {
    return this.isRegistered;
  }

  /**
   * Obtiene el conteo de usuarios activos
   */
  async getActiveUsersCount(): Promise<{
    totalUsers: number;
    totalSessions: number;
    updatedAt: string;
  }> {
    try {
      const url = this.apiUrl.endsWith('/api') 
        ? `${this.apiUrl}/sessions/active-users`
        : `${this.apiUrl}/api/sessions/active-users`;
      
      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        return {
          totalUsers: data.totalUsers || 0,
          totalSessions: data.totalSessions || 0,
          updatedAt: data.updatedAt || new Date().toISOString(),
        };
      } else {
        throw new Error(data.error || "Error getting active users count");
      }
    } catch (error) {
      console.error("[ActiveSessions] Error obteniendo conteo de usuarios:", error);
      return {
        totalUsers: 0,
        totalSessions: 0,
        updatedAt: new Date().toISOString(),
      };
    }
  }
}

// Exportar instancia única del servicio
export const activeSessionsService = new ActiveSessionsService();
