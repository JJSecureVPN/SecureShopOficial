import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { useLocation } from 'react-router-dom';

const LAST_READ_KEY = 'chat_last_read_timestamp';
const ORIGINAL_TITLE = 'SecureShop VPN';

// Función para actualizar el título de la pestaña
function updateDocumentTitle(count: number) {
  if (count > 0) {
    document.title = `💬 (${count}) ${ORIGINAL_TITLE}`;
  } else {
    document.title = ORIGINAL_TITLE;
  }
}

// Obtener el timestamp del último mensaje leído
function getLastReadTimestamp(): string {
  try {
    return localStorage.getItem(LAST_READ_KEY) || new Date(0).toISOString();
  } catch {
    return new Date(0).toISOString();
  }
}

// Guardar el timestamp del último mensaje leído
function setLastReadTimestamp(timestamp: string) {
  try {
    localStorage.setItem(LAST_READ_KEY, timestamp);
  } catch {
    // Ignorar errores de localStorage
  }
}

// Función para reproducir sonido de notificación
function playNotificationSound() {
  try {
    const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(1100, audioContext.currentTime + 0.1);
    
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } catch (e) {
    console.log('No se pudo reproducir sonido:', e);
  }
}

interface UseChatNotificationsReturn {
  unreadCount: number;
  markAsRead: () => void;
}

/**
 * Hook ligero para notificaciones del chat.
 * Diseñado para usarse en el botón flotante sin crear suscripciones pesadas.
 */
export function useChatNotifications(): UseChatNotificationsReturn {
  const { user } = useAuth();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const unreadCountRef = useRef(0); // Ref para acceso sincrónico
  
  const isOnChatPage = location.pathname === '/chat';

  // Mantener ref sincronizado
  useEffect(() => {
    unreadCountRef.current = unreadCount;
    updateDocumentTitle(unreadCount);
  }, [unreadCount]);

  // Marcar como leídos todos los mensajes
  const markAsRead = useCallback(() => {
    const now = new Date().toISOString();
    setLastReadTimestamp(now);
    setUnreadCount(0);
    updateDocumentTitle(0);
    
    // Notificar a otras pestañas/componentes
    window.dispatchEvent(new CustomEvent('chat-marked-as-read'));
  }, []);

  // Si estamos en la página del chat, marcar como leídos automáticamente
  useEffect(() => {
    if (isOnChatPage) {
      markAsRead();
    }
  }, [isOnChatPage, markAsRead]);

  // Contar mensajes no leídos al montar y cuando cambia la ruta
  useEffect(() => {
    const countUnread = async () => {
      // Si estamos en el chat, limpiar todo
      if (isOnChatPage) {
        setUnreadCount(0);
        updateDocumentTitle(0);
        return;
      }

      const lastRead = getLastReadTimestamp();
      
      // Consultar mensajes nuevos desde el último leído
      // Solo contamos mensajes que NO son del usuario actual
      const query = supabase
        .from('chat_messages')
        .select('id', { count: 'exact', head: true })
        .eq('is_deleted', false)
        .gt('created_at', lastRead);
      
      // Si hay usuario, excluir sus propios mensajes
      if (user) {
        query.neq('user_id', user.id);
      }

      const { count } = await query;
      const newCount = count || 0;
      setUnreadCount(newCount);
      
      // Solo actualizar título si no estamos en el chat
      if (!isOnChatPage) {
        updateDocumentTitle(newCount);
      }
    };

    countUnread();
  }, [isOnChatPage, user]);

  // Suscribirse a nuevos mensajes (ligero - solo escucha INSERTs)
  useEffect(() => {
    // Si estamos en el chat, no suscribirse aquí
    if (isOnChatPage) {
      updateDocumentTitle(0);
      return;
    }

    const channel = supabase
      .channel('chat-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          // Ignorar mensajes propios
          if (user && payload.new.user_id === user.id) return;
          
          // Ignorar si estamos en la página del chat (doble check)
          if (location.pathname === '/chat') return;

          // Incrementar contador
          const newCount = unreadCountRef.current + 1;
          setUnreadCount(newCount);
          updateDocumentTitle(newCount);
          
          // Reproducir sonido
          playNotificationSound();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [isOnChatPage, user, location.pathname]);

  // Restaurar título cuando la página vuelve a estar visible Y estamos en el chat
  useEffect(() => {
    const handleVisibility = () => {
      if (!document.hidden) {
        // Si estamos en el chat, siempre limpiar
        if (location.pathname === '/chat') {
          updateDocumentTitle(0);
        } else {
          // Si no estamos en el chat, mostrar el contador actual
          updateDocumentTitle(unreadCountRef.current);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [location.pathname]);

  // Escuchar cuando se marcan como leídos desde otro lugar (ej: useChat)
  useEffect(() => {
    const handleMarkedAsRead = () => {
      setUnreadCount(0);
      updateDocumentTitle(0);
    };

    window.addEventListener('chat-marked-as-read', handleMarkedAsRead);
    return () => window.removeEventListener('chat-marked-as-read', handleMarkedAsRead);
  }, []);

  return {
    unreadCount,
    markAsRead
  };
}

/**
 * Hook para obtener conteo de mensajes no leídos por sala.
 * Diseñado para usarse en ChatPage.
 */
export function useUnreadByRoom(): Record<string, number> {
  const { user } = useAuth();
  const [unreadByRoom, setUnreadByRoom] = useState<Record<string, number>>({});

  useEffect(() => {
    const fetchUnreadByRoom = async () => {
      const lastRead = getLastReadTimestamp();
      
      // Obtener mensajes no leídos agrupados por sala
      let query = supabase
        .from('chat_messages')
        .select('room_id')
        .eq('is_deleted', false)
        .gt('created_at', lastRead);
      
      if (user) {
        query = query.neq('user_id', user.id);
      }

      const { data } = await query;
      
      if (data) {
        const counts: Record<string, number> = {};
        data.forEach(msg => {
          counts[msg.room_id] = (counts[msg.room_id] || 0) + 1;
        });
        setUnreadByRoom(counts);
      }
    };

    fetchUnreadByRoom();

    // Suscribirse a nuevos mensajes
    const channel = supabase
      .channel('unread-by-room')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages'
        },
        (payload) => {
          // Ignorar mensajes propios
          if (user && payload.new.user_id === user.id) return;
          
          const roomId = payload.new.room_id as string;
          setUnreadByRoom(prev => ({
            ...prev,
            [roomId]: (prev[roomId] || 0) + 1
          }));
        }
      )
      .subscribe();

    // Escuchar cuando se marcan como leídos
    const handleMarkedAsRead = () => {
      setUnreadByRoom({});
    };
    window.addEventListener('chat-marked-as-read', handleMarkedAsRead);

    // Escuchar cuando se entra a una sala específica
    const handleRoomRead = (e: CustomEvent<string>) => {
      const roomId = e.detail;
      setUnreadByRoom(prev => {
        const newState = { ...prev };
        delete newState[roomId];
        return newState;
      });
    };
    window.addEventListener('chat-room-read', handleRoomRead as EventListener);

    return () => {
      supabase.removeChannel(channel);
      window.removeEventListener('chat-marked-as-read', handleMarkedAsRead);
      window.removeEventListener('chat-room-read', handleRoomRead as EventListener);
    };
  }, [user]);

  return unreadByRoom;
}

// Función para marcar una sala como leída
export function markRoomAsRead(roomId: string) {
  window.dispatchEvent(new CustomEvent('chat-room-read', { detail: roomId }));
}

export default useChatNotifications;
