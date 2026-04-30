import { useRef, useEffect, useCallback } from 'react';
import { ChatMessage } from './ChatMessage';
import { ChatInput } from './ChatInput';
import { ChatRoom as ChatRoomType, ChatMessageWithUser } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2, MessageCircle, Pin } from 'lucide-react';

interface ChatRoomProps {
  room: ChatRoomType;
  messages: ChatMessageWithUser[];
  onlineCount: number;
  isLoading: boolean;
  isSending: boolean;
  isAdmin: boolean;
  hasMoreMessages: boolean;
  onSendMessage: (content: string) => Promise<boolean>;
  onDeleteMessage: (messageId: string) => Promise<boolean>;
  onPinMessage: (messageId: string, isPinned: boolean) => Promise<boolean>;
  onLoadMore: () => Promise<void>;
  onClose: () => void;
  showHeader?: boolean;
  categoryColors?: { bg: string; text: string; border: string; gradient: string };
}

export function ChatRoom({
  room,
  messages,
  onlineCount,
  isLoading,
  isSending,
  isAdmin,
  hasMoreMessages,
  onSendMessage,
  onDeleteMessage,
  onPinMessage,
  onLoadMore,
  onClose,
  showHeader = true,
  categoryColors
}: ChatRoomProps) {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isFirstLoad = useRef(true);
  const prevMessagesLength = useRef(messages.length);

  // Auto-scroll cuando llegan nuevos mensajes
  useEffect(() => {
    if (messages.length > prevMessagesLength.current) {
      // Nuevo mensaje agregado
      const isNewMessage = messages.length > 0 && 
        prevMessagesLength.current > 0 &&
        messages[messages.length - 1].id !== messages[prevMessagesLength.current - 1]?.id;
      
      if (isFirstLoad.current || isNewMessage) {
        messagesEndRef.current?.scrollIntoView({ behavior: isFirstLoad.current ? 'auto' : 'smooth' });
        isFirstLoad.current = false;
      }
    }
    prevMessagesLength.current = messages.length;
  }, [messages]);

  // Cuando cambia de sala, posicionar en el último mensaje
  useEffect(() => {
    // marcar como primera carga para que el siguiente scroll sea inmediato
    isFirstLoad.current = true;
    // Resetear prev length para forzar scroll cuando lleguen mensajes
    prevMessagesLength.current = 0;
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      isFirstLoad.current = false;
      prevMessagesLength.current = messages.length;
    }
  }, [room?.id]);

  // Scroll al tope para cargar más
  const handleScroll = useCallback(() => {
    if (!messagesContainerRef.current || isLoading || !hasMoreMessages) return;
    
    const { scrollTop } = messagesContainerRef.current;
    if (scrollTop < 100) {
      onLoadMore();
    }
  }, [isLoading, hasMoreMessages, onLoadMore]);

  // Mensajes fijados primero
  const pinnedMessages = messages.filter(m => m.is_pinned);
  
  const gradientClass = categoryColors?.gradient || 'from-emerald-500 to-teal-600';
  const textColorClass = categoryColors?.text || 'text-emerald-600';

  return (
    <div className="flex flex-col h-full bg-zinc-900 text-zinc-100 overflow-hidden">
      {/* Header - Solo mostrar si showHeader es true */}
      {showHeader && (
        <div className={`flex items-center justify-between px-4 py-3 bg-gradient-to-r ${gradientClass} text-white`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm">{room.nombre}</h3>
              <div className="flex items-center gap-1.5 text-xs text-white/80">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                {onlineCount} {onlineCount === 1 ? 'conectado' : 'conectados'}
              </div>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
            title="Cerrar chat"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
      
      {/* Room info bar - Mostrar cuando no hay header */}
      {!showHeader && (
        <div className={`px-4 py-3 border-b border-zinc-700 ${categoryColors?.bg || 'bg-zinc-800'}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className={`font-semibold text-sm ${textColorClass}`}>{room.nombre}</h3>
              <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{room.descripcion}</p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-purple-400 font-semibold">
                  Roles
                </span>
              </div>

              <span className="inline-flex items-center gap-2 rounded-full border border-purple-200 bg-zinc-800 px-3 py-1 text-[11px] font-semibold text-zinc-200">
                <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${gradientClass}`} />
                Tú{isAdmin ? ' (Admin)' : ''}
              </span>

              <span className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-[11px] font-semibold text-zinc-200">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-200" />
                {isAdmin ? 'Usuarios' : 'Soporte'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Mensajes fijados */}
      {pinnedMessages.length > 0 && (
        <div className="bg-yellow-900 border-b border-yellow-800 px-4 py-2">
          <div className="flex items-center gap-2 text-xs text-yellow-300 font-medium mb-1">
            <Pin className="w-3.5 h-3.5" />
            Mensaje fijado
          </div>
          <p className="text-sm text-yellow-200 line-clamp-2">
            {pinnedMessages[pinnedMessages.length - 1].content}
          </p>
        </div>
      )}

      {/* Lista de mensajes */}
      <div 
        ref={messagesContainerRef}
        onScroll={handleScroll}
        onWheel={(e) => {
          // Asegurar que la rueda produzca scroll dentro del contenedor
          const el = messagesContainerRef.current;
          if (el) {
            el.scrollTop += e.deltaY;
          }
        }}
        style={{ touchAction: 'auto' }}
        className="flex-1 overflow-y-auto bg-gradient-to-b from-zinc-900 to-zinc-800 hide-scrollbar"
      >
        {/* Botón cargar más */}
        {hasMoreMessages && !isLoading && (
          <div className="flex justify-center py-3">
            <button
              onClick={onLoadMore}
              className={`text-xs ${textColorClass} hover:underline`}
            >
              Cargar mensajes anteriores
            </button>
          </div>
        )}

        {/* Loading */}
        {isLoading && messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <div className="flex flex-col items-center gap-2 text-zinc-400">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm">Cargando mensajes...</span>
            </div>
          </div>
        )}

        {/* Sin mensajes */}
        {!isLoading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-zinc-400 p-6">
            <MessageCircle className="w-16 h-16 mb-4 opacity-30" />
            <p className="text-sm text-center text-zinc-400">
              ¡Sé el primero en escribir!<br />
              <span className="text-xs opacity-60">La comunidad está lista para ayudarte</span>
            </p>
          </div>
        )}

        {/* Mensajes */}
        {messages.map((message) => (
          <ChatMessage
            key={message.id}
            message={message}
            isAdmin={isAdmin}
            categoryGradientClass={gradientClass}
            onDelete={user ? onDeleteMessage : undefined}
            onPin={isAdmin ? onPinMessage : undefined}
          />
        ))}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      {user ? (
        <ChatInput
          onSend={onSendMessage}
          isSending={isSending}
        />
      ) : (
        <div className="border-t border-zinc-700 bg-zinc-900 p-4 text-center">
          <p className="text-sm text-zinc-400">
            <button 
              onClick={() => {
                document.dispatchEvent(new CustomEvent('open-auth-modal'));
              }}
              className={`${textColorClass} font-medium hover:underline`}
            >
              Inicia sesión
            </button>
            {' '}para participar en el chat
          </p>
        </div>
      )}
    </div>
  );
}
