import { useState, useEffect, useCallback, useRef } from 'react';
import { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, ChatRoom, ChatMessageWithUser } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface UseChatReturn {
  // Estado
  rooms: ChatRoom[];
  messages: ChatMessageWithUser[];
  currentRoom: ChatRoom | null;
  onlineCount: number;
  isLoading: boolean;
  isSending: boolean;
  isAdmin: boolean;
  error: string | null;
  
  // Acciones
  selectRoom: (roomId: string) => void;
  sendMessage: (content: string) => Promise<boolean>;
  deleteMessage: (messageId: string) => Promise<boolean>;
  pinMessage: (messageId: string, isPinned: boolean) => Promise<boolean>;
  loadMoreMessages: () => Promise<void>;
  hasMoreMessages: boolean;
}

const MESSAGES_PER_PAGE = 50;
const LAST_READ_KEY = 'chat_last_read_timestamp';

// Actualizar timestamp de último mensaje leído
function updateLastReadTimestamp() {
  try {
    localStorage.setItem(LAST_READ_KEY, new Date().toISOString());
    window.dispatchEvent(new CustomEvent('chat-marked-as-read'));
  } catch {
    // Ignorar errores
  }
}

export function useChat(): UseChatReturn {
  const { user } = useAuth();
  
  // Estado
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<ChatMessageWithUser[]>([]);
  const [currentRoom, setCurrentRoom] = useState<ChatRoom | null>(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreMessages, setHasMoreMessages] = useState(true);
  const [oldestMessageDate, setOldestMessageDate] = useState<string | null>(null);
  
  // Refs
  const channelRef = useRef<RealtimeChannel | null>(null);
  const presenceIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Marcar como leídos al montar el hook (cuando se usa en ChatPage)
  useEffect(() => {
    updateLastReadTimestamp();
  }, []);

  // Verificar si el usuario es admin
  useEffect(() => {
    const checkAdmin = async () => {
      if (!user) {
        setIsAdmin(false);
        return;
      }
      
      const { data } = await supabase
        .from('chat_admins')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      setIsAdmin(!!data);
    };
    
    checkAdmin();
  }, [user]);

  // Cargar salas disponibles
  useEffect(() => {
    const loadRooms = async () => {
      const { data, error: err } = await supabase
        .from('chat_rooms')
        .select('*')
        .eq('is_public', true)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (err) {
        console.error('Error loading chat rooms:', err);
        setError('Error al cargar las salas de chat');
        return;
      }

      setRooms(data || []);
      
      // Seleccionar la primera sala automáticamente
      if (data && data.length > 0 && !currentRoom) {
        setCurrentRoom(data[0]);
      }
    };

    loadRooms();
  }, []);

  // Cargar mensajes cuando cambia la sala
  const loadMessages = useCallback(async (roomId: string, before?: string) => {
    setIsLoading(true);
    setError(null);

    try {
      let query = supabase
        .from('chat_messages_with_user')
        .select('*')
        .eq('room_id', roomId)
        .order('created_at', { ascending: false })
        .limit(MESSAGES_PER_PAGE);

      if (before) {
        query = query.lt('created_at', before);
      }

      const { data, error: err } = await query;

      if (err) {
        console.error('Error loading messages:', err);
        setError('Error al cargar los mensajes');
        return;
      }

      const newMessages = (data || []).reverse();
      
      if (before) {
        // Cargar más mensajes antiguos
        setMessages(prev => [...newMessages, ...prev]);
      } else {
        // Carga inicial
        setMessages(newMessages);
      }

      // Verificar si hay más mensajes
      setHasMoreMessages(newMessages.length === MESSAGES_PER_PAGE);
      
      if (newMessages.length > 0) {
        setOldestMessageDate(newMessages[0].created_at);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Cargar más mensajes antiguos
  const loadMoreMessages = useCallback(async () => {
    if (!currentRoom || !hasMoreMessages || isLoading || !oldestMessageDate) return;
    await loadMessages(currentRoom.id, oldestMessageDate);
  }, [currentRoom, hasMoreMessages, isLoading, oldestMessageDate, loadMessages]);

  // Actualizar presencia
  const updatePresence = useCallback(async () => {
    if (!user || !currentRoom) return;

    try {
      await supabase
        .from('chat_presence')
        .upsert({
          room_id: currentRoom.id,
          user_id: user.id,
          last_seen: new Date().toISOString()
        }, {
          onConflict: 'room_id,user_id'
        });
    } catch (err) {
      console.error('Error updating presence:', err);
    }
  }, [user, currentRoom]);

  // Obtener cantidad de usuarios online
  const fetchOnlineCount = useCallback(async () => {
    if (!currentRoom) return;

    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    
    const { count } = await supabase
      .from('chat_presence')
      .select('*', { count: 'exact', head: true })
      .eq('room_id', currentRoom.id)
      .gte('last_seen', fiveMinutesAgo);

    setOnlineCount(count || 0);
  }, [currentRoom]);

  // Suscribirse a cambios en tiempo real
  useEffect(() => {
    if (!currentRoom) return;

    // Cargar mensajes iniciales
    loadMessages(currentRoom.id);
    
    // Marcar como leídos cuando se carga una sala
    updateLastReadTimestamp();

    // Limpiar suscripción anterior
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
    }

    // Crear nueva suscripción
    const channel = supabase
      .channel(`room:${currentRoom.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${currentRoom.id}`
        },
        async (payload) => {
          // Obtener mensaje con info del usuario
          const { data } = await supabase
            .from('chat_messages_with_user')
            .select('*')
            .eq('id', payload.new.id)
            .single();

          if (data) {
            setMessages(prev => [...prev, data]);
            
            // Actualizar timestamp de lectura (estamos viendo el chat)
            updateLastReadTimestamp();
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'chat_messages',
          filter: `room_id=eq.${currentRoom.id}`
        },
        async (payload) => {
          if (payload.new.is_deleted) {
            // Mensaje eliminado
            setMessages(prev => prev.filter(m => m.id !== payload.new.id));
          } else {
            // Mensaje actualizado (ej: pinned)
            const { data } = await supabase
              .from('chat_messages_with_user')
              .select('*')
              .eq('id', payload.new.id)
              .single();

            if (data) {
              setMessages(prev => prev.map(m => m.id === data.id ? data : m));
            }
          }
        }
      )
      .subscribe();

    channelRef.current = channel;

    // Actualizar presencia periódicamente
    if (user) {
      updatePresence();
      presenceIntervalRef.current = setInterval(() => {
        updatePresence();
        fetchOnlineCount();
      }, 30000); // Cada 30 segundos
      
      fetchOnlineCount();
    }

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
      if (presenceIntervalRef.current) {
        clearInterval(presenceIntervalRef.current);
      }
    };
  }, [currentRoom, user, loadMessages, updatePresence, fetchOnlineCount]);

  // Limpiar presencia al salir
  useEffect(() => {
    return () => {
      if (user && currentRoom) {
        supabase
          .from('chat_presence')
          .delete()
          .eq('user_id', user.id)
          .eq('room_id', currentRoom.id);
      }
    };
  }, [user, currentRoom]);

  // Seleccionar sala
  const selectRoom = useCallback((roomId: string) => {
    const room = rooms.find(r => r.id === roomId);
    if (room) {
      setCurrentRoom(room);
      setMessages([]);
      setHasMoreMessages(true);
      setOldestMessageDate(null);
    }
  }, [rooms]);

  // Enviar mensaje
  const sendMessage = useCallback(async (content: string): Promise<boolean> => {
    if (!user || !currentRoom || !content.trim()) return false;

    setIsSending(true);
    setError(null);

    try {
      const { error: err } = await supabase
        .from('chat_messages')
        .insert({
          room_id: currentRoom.id,
          user_id: user.id,
          content: content.trim()
        });

      if (err) {
        console.error('Error sending message:', err);
        setError('Error al enviar el mensaje');
        return false;
      }

      return true;
    } finally {
      setIsSending(false);
    }
  }, [user, currentRoom]);

  // Eliminar mensaje (solo admin o autor)
  const deleteMessage = useCallback(async (messageId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error: err } = await supabase
        .from('chat_messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (err) {
        console.error('Error deleting message:', err);
        setError('Error al eliminar el mensaje');
        return false;
      }

      setMessages(prev => prev.filter(m => m.id !== messageId));
      return true;
    } catch {
      return false;
    }
  }, [user]);

  // Fijar/desfijar mensaje (solo admin)
  const pinMessage = useCallback(async (messageId: string, isPinned: boolean): Promise<boolean> => {
    if (!isAdmin) return false;

    try {
      const { error: err } = await supabase
        .from('chat_messages')
        .update({ is_pinned: isPinned })
        .eq('id', messageId);

      if (err) {
        console.error('Error pinning message:', err);
        return false;
      }

      setMessages(prev => prev.map(m => 
        m.id === messageId ? { ...m, is_pinned: isPinned } : m
      ));
      return true;
    } catch {
      return false;
    }
  }, [isAdmin]);

  return {
    rooms,
    messages,
    currentRoom,
    onlineCount,
    isLoading,
    isSending,
    isAdmin,
    error,
    selectRoom,
    sendMessage,
    deleteMessage,
    pinMessage,
    loadMoreMessages,
    hasMoreMessages
  };
}
