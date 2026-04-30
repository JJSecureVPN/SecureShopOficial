import { SupabaseClient } from '@supabase/supabase-js';

/**
 * Servicio de Sesiones Activas
 * Registra y gestiona sesiones activas de usuarios en tiempo real
 */
export class ActiveSessionsService {
  private supabase: SupabaseClient;

  constructor(supabase: SupabaseClient) {
    this.supabase = supabase;
  }

  /**
   * Registra o actualiza una sesión activa de usuario
   */
  async registerSession(
    userId: string | null,
    sessionToken: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      const { error } = await this.supabase.rpc('register_active_session', {
        p_user_id: userId,
        p_session_token: sessionToken,
        p_ip_address: ipAddress,
        p_user_agent: userAgent,
      });

      if (error) {
        console.error('Error registering session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to register session:', error);
      // No lanzar error - esto no debe romper la aplicación
    }
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
      const { data, error } = await this.supabase.rpc('get_active_users_count');

      if (error) {
        console.error('Error getting active users count:', error);
        throw error;
      }

      if (data && data.length > 0) {
        return {
          totalUsers: data[0].total_users || 0,
          totalSessions: data[0].total_sessions || 0,
          updatedAt: data[0].updated_at || new Date().toISOString(),
        };
      }

      return {
        totalUsers: 0,
        totalSessions: 0,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get active users count:', error);
      return {
        totalUsers: 0,
        totalSessions: 0,
        updatedAt: new Date().toISOString(),
      };
    }
  }

  /**
   * Termina la sesión de un usuario
   */
  async endSession(sessionToken: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('active_sessions')
        .delete()
        .eq('session_token', sessionToken);

      if (error) {
        console.error('Error ending session:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to end session:', error);
    }
  }

  /**
   * Suscribirse a cambios en tiempo real de usuarios activos
   */
  subscribeToActiveUsers(callback: (count: number) => void) {
    try {
      // Usar Realtime para suscribirse a cambios en active_sessions
      return this.supabase
        .channel('active_sessions_channel')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'active_sessions',
          },
          async () => {
            // Cuando hay cambios, obtener el nuevo conteo
            const result = await this.getActiveUsersCount();
            callback(result.totalUsers);
          }
        )
        .subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            console.log('Subscribed to active sessions');
          } else if (status === 'CLOSED') {
            console.log('Unsubscribed from active sessions');
          }
        });
    } catch (error) {
      console.error('Failed to subscribe to active users:', error);
      return null;
    }
  }

  /**
   * Obtener estadísticas de usuarios activos de la tabla caché
   */
  async getActiveUsersStats() {
    try {
      const { data, error } = await this.supabase
        .from('active_users_stats')
        .select('total_active_users, total_sessions, updated_at')
        .eq('id', 1)
        .single();

      if (error) throw error;

      return {
        totalUsers: data?.total_active_users || 0,
        totalSessions: data?.total_sessions || 0,
        updatedAt: data?.updated_at || new Date().toISOString(),
      };
    } catch (error) {
      console.error('Failed to get active users stats:', error);
      return {
        totalUsers: 0,
        totalSessions: 0,
        updatedAt: new Date().toISOString(),
      };
    }
  }
}
