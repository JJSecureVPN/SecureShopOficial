import { memo } from 'react';
import { ChatMessageWithUser } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface ChatMessageProps {
  message: ChatMessageWithUser;
  isAdmin: boolean;
  categoryGradientClass?: string;
  onDelete?: (messageId: string) => void;
  onPin?: (messageId: string, isPinned: boolean) => void;
}

function ChatMessageComponent({ message, isAdmin, categoryGradientClass, onDelete, onPin }: ChatMessageProps) {
  const { user } = useAuth();
  const isOwnMessage = user?.id === message.user_id;
  const isFromAdmin = !!message.is_admin;
  
  // Formatear hora
  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('es-AR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Formatear fecha si es diferente a hoy
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    
    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    }
    
    return date.toLocaleDateString('es-AR', { 
      day: 'numeric',
      month: 'short'
    });
  };

  // Obtener inicial del nombre
  const getInitial = () => {
    if (message.user_nombre) {
      return message.user_nombre.charAt(0).toUpperCase();
    }
    return message.user_email.charAt(0).toUpperCase();
  };

  // Obtener nombre a mostrar
  const getDisplayName = () => {
    if (message.user_nombre) {
      return message.user_nombre;
    }
    return message.user_email.split('@')[0];
  };

  const roleLabel = isOwnMessage
    ? (isFromAdmin ? 'TÚ · SOPORTE' : 'TÚ')
    : (isFromAdmin ? 'SOPORTE' : 'USUARIO');

  const ownGradientClass = categoryGradientClass || 'from-purple-500 to-indigo-600';

  return (
    <div className="px-4 py-2">
      <div
        className={`group flex items-end gap-2 md:gap-3 ${
          isOwnMessage ? 'justify-end' : 'justify-start'
        }`}
      >
        {/* Avatar (solo mensajes de otros para que se entienda más rápido quién habla) */}
        {!isOwnMessage && (
          <div className="flex-shrink-0">
            {message.user_avatar ? (
              <img
                src={message.user_avatar}
                alt={getDisplayName()}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                  isFromAdmin
                    ? 'bg-gradient-to-br from-purple-500 to-indigo-600'
                    : 'bg-gradient-to-br from-emerald-500 to-teal-600'
                }`}
              >
                {getInitial()}
              </div>
            )}
          </div>
        )}

        {/* Burbuja */}
        <div
          className={`relative max-w-[88%] md:max-w-[72%] rounded-2xl px-4 py-2.5 shadow-sm ${
            isOwnMessage
              ? `bg-gradient-to-r ${ownGradientClass} text-white`
              : isFromAdmin
                ? 'bg-purple-800 border border-purple-700 text-zinc-100'
                : 'bg-zinc-800 border border-zinc-700 text-zinc-100'
          } ${message.is_pinned ? 'ring-2 ring-yellow-700' : ''}`}
        >
          {/* Encabezado */}
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`text-sm font-semibold ${
                isOwnMessage ? 'text-white' : (isFromAdmin ? 'text-purple-300' : 'text-zinc-100')
              }`}
            >
              {isOwnMessage ? 'Tú' : getDisplayName()}
            </span>

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide ${
                isOwnMessage
                  ? 'bg-white/10 text-white'
                  : isFromAdmin
                    ? 'bg-purple-800 text-purple-200'
                    : 'bg-zinc-700 text-zinc-200'
              }`}
            >
              {roleLabel}
            </span>

            {message.is_pinned && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-yellow-800 text-yellow-200">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 2zM10 15a.75.75 0 01.75.75v1.5a.75.75 0 01-1.5 0v-1.5A.75.75 0 0110 15zM10 7a3 3 0 100 6 3 3 0 000-6zM15.657 5.404a.75.75 0 10-1.06-1.06l-1.061 1.06a.75.75 0 001.06 1.06l1.06-1.06zM6.464 14.596a.75.75 0 10-1.06-1.06l-1.06 1.06a.75.75 0 001.06 1.06l1.06-1.06zM18 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 0118 10zM5 10a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5A.75.75 0 015 10zM14.596 15.657a.75.75 0 001.06-1.06l-1.06-1.061a.75.75 0 10-1.06 1.06l1.06 1.06zM5.404 6.464a.75.75 0 001.06-1.06l-1.06-1.06a.75.75 0 10-1.06 1.06l1.06 1.06z" />
                </svg>
                FIJADO
              </span>
            )}

            <span className={`text-[11px] ${isOwnMessage ? 'text-white/80' : 'text-zinc-400'}`}>
              {formatDate(message.created_at)} {formatTime(message.created_at)}
            </span>
          </div>

          {/* Mensaje */}
          <p className={`mt-1 text-sm break-words whitespace-pre-wrap ${isOwnMessage ? 'text-white' : 'text-zinc-100'}`}>
            {message.content}
          </p>

          {/* Acciones (visibles en hover) */}
          {(isOwnMessage || isAdmin) && (
            <div className="absolute -top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex items-center gap-1">
                {/* Fijar (solo admin) */}
                {isAdmin && onPin && (
                  <button
                    onClick={() => onPin(message.id, !message.is_pinned)}
                      className={`p-1.5 rounded-lg border shadow-sm transition-colors ${
                        message.is_pinned
                          ? 'bg-yellow-800 text-yellow-200 border-yellow-700'
                          : 'bg-zinc-800 text-zinc-300 hover:text-purple-300 border-zinc-700 hover:border-purple-700'
                      }`}
                    title={message.is_pinned ? 'Desfijar mensaje' : 'Fijar mensaje'}
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                    </svg>
                  </button>
                )}

                {/* Eliminar */}
                {onDelete && (
                  <button
                    onClick={() => {
                      if (confirm('¿Eliminar este mensaje?')) {
                        onDelete(message.id);
                      }
                    }}
                      className="p-1.5 rounded-lg border shadow-sm bg-zinc-800 text-zinc-300 hover:text-red-400 border-zinc-700 hover:border-red-400 transition-colors"
                    title="Eliminar mensaje"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const ChatMessage = memo(ChatMessageComponent);
