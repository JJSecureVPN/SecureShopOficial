import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MessageCircle, Headphones, Users, Store, Lightbulb, ChevronLeft, Loader2 } from 'lucide-react';
import { ChatRoom } from './ChatRoom';
import { useChat } from '../../hooks/useChat';
import { useAuth } from '../../contexts/AuthContext';
import { ChatRoom as ChatRoomType } from '../../lib/supabase';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Iconos para cada categoría
const categoryIcons: Record<string, React.ReactNode> = {
  'Chat Global': <Users className="w-5 h-5" />,
  'Soporte Técnico': <Headphones className="w-5 h-5" />,
  'Reventa': <Store className="w-5 h-5" />,
  'Sugerencias': <Lightbulb className="w-5 h-5" />,
  'default': <MessageCircle className="w-5 h-5" />
};

// Colores para cada categoría
const categoryColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  'Chat Global': { 
    bg: 'bg-emerald-900/20', 
    text: 'text-emerald-300', 
    border: 'border-emerald-800',
    gradient: 'from-emerald-500 to-teal-600'
  },
  'Soporte Técnico': { 
    bg: 'bg-blue-900/20', 
    text: 'text-blue-300', 
    border: 'border-blue-800',
    gradient: 'from-blue-500 to-indigo-600'
  },
  'Reventa': { 
    bg: 'bg-purple-900/20', 
    text: 'text-purple-300', 
    border: 'border-purple-800',
    gradient: 'from-purple-500 to-pink-600'
  },
  'Sugerencias': { 
    bg: 'bg-amber-900/20', 
    text: 'text-amber-300', 
    border: 'border-amber-800',
    gradient: 'from-amber-500 to-orange-600'
  },
  'default': { 
    bg: 'bg-zinc-800', 
    text: 'text-zinc-100', 
    border: 'border-zinc-700',
    gradient: 'from-gray-500 to-gray-600'
  }
};

export function ChatModal({ isOpen, onClose }: ChatModalProps) {
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [showRoomList, setShowRoomList] = useState(true); // Para móvil
  
  const {
    rooms,
    messages,
    currentRoom,
    onlineCount,
    isLoading,
    isSending,
    isAdmin,
    selectRoom,
    sendMessage,
    deleteMessage,
    pinMessage,
    loadMoreMessages,
    hasMoreMessages
  } = useChat();

  // Cuando cambia la sala seleccionada
  useEffect(() => {
    if (selectedRoom) {
      selectRoom(selectedRoom.id);
      // En móvil, ocultar lista de salas
      if (window.innerWidth < 768) {
        setShowRoomList(false);
      }
    }
  }, [selectedRoom, selectRoom]);

  // Seleccionar primera sala disponible
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  // Volver a lista de salas (móvil)
  const handleBackToRooms = () => {
    setShowRoomList(true);
  };

  const getIcon = (roomName: string) => categoryIcons[roomName] || categoryIcons['default'];
  const getColors = (roomName: string) => categoryColors[roomName] || categoryColors['default'];

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay - blur y oscurecer para tema dark */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-black/40 z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', duration: 0.5 }}
            className="fixed inset-4 md:inset-8 lg:inset-16 xl:inset-24 z-50 flex flex-col bg-zinc-900 text-zinc-100 rounded-2xl shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b border-zinc-700 bg-gradient-to-r from-purple-700 to-indigo-700">
              <div className="flex items-center gap-3">
                {/* Botón volver en móvil */}
                {!showRoomList && (
                  <button
                    onClick={handleBackToRooms}
                    className="md:hidden p-2 -ml-2 hover:bg-purple-100 rounded-full transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-purple-600" />
                  </button>
                )}
                
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-black/40">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-zinc-100">Chat en Vivo</h2>
                  <p className="text-xs text-zinc-400">
                    {onlineCount > 0 ? (
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                        {onlineCount} {onlineCount === 1 ? 'conectado' : 'conectados'}
                      </span>
                    ) : (
                      'Conectando...'
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X className="w-5 h-5 text-zinc-300 hover:text-white" />
              </button>
            </div>

            {/* Contenido Principal */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Sidebar de Categorías - Desktop siempre visible, Mobile condicional */}
              <div className={`
                w-full md:w-72 lg:w-80 flex-shrink-0 border-r border-zinc-700 bg-zinc-800 overflow-y-auto hide-scrollbar
                ${showRoomList ? 'block' : 'hidden md:block'}
              `}>
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-purple-400 uppercase tracking-wider mb-3 px-2">
                    Categorías
                  </h3>
                  
                  {rooms.length === 0 ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {rooms.map((room) => {
                        const colors = getColors(room.nombre);
                        const isSelected = selectedRoom?.id === room.id;
                        
                        return (
                          <button
                            key={room.id}
                            onClick={() => setSelectedRoom(room)}
                            className={`
                              w-full flex items-start gap-3 p-3 rounded-xl transition-all duration-200 text-left
                              ${isSelected 
                                ? `${colors.bg} ${colors.border} border-2 shadow-sm` 
                                : 'hover:bg-zinc-800 border-2 border-transparent'
                              }
                            `}
                          >
                            <div className={`
                              w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0
                              ${isSelected 
                                ? `bg-gradient-to-br ${colors.gradient} text-white` 
                                : `${colors.bg} ${colors.text}`
                              }
                            `}>
                              {getIcon(room.nombre)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className={`font-medium text-sm ${isSelected ? colors.text : 'text-zinc-100'}`}>
                                {room.nombre}
                              </h4>
                              <p className="text-xs text-zinc-400 line-clamp-2 mt-0.5">
                                {room.descripcion}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Info de usuario no logueado */}
                {!user && (
                  <div className="p-4 border-t border-zinc-700">
                    <div className="rounded-xl p-4 text-center border border-zinc-700 bg-zinc-800">
                      <p className="text-sm text-zinc-200 mb-3">
                        Inicia sesión para participar en el chat
                      </p>
                      <button
                        onClick={() => {
                          document.dispatchEvent(new CustomEvent('open-auth-modal'));
                        }}
                        className="w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all"
                      >
                        Iniciar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Área de Chat */}
              <div className={`
                flex-1 flex flex-col min-w-0
                ${!showRoomList ? 'block' : 'hidden md:flex'}
              `}>
                {currentRoom ? (
                  <ChatRoom
                    room={currentRoom}
                    messages={messages}
                    onlineCount={onlineCount}
                    isLoading={isLoading}
                    isSending={isSending}
                    isAdmin={isAdmin}
                    hasMoreMessages={hasMoreMessages}
                    onSendMessage={sendMessage}
                    onDeleteMessage={deleteMessage}
                    onPinMessage={pinMessage}
                    onLoadMore={loadMoreMessages}
                    onClose={onClose}
                    showHeader={false}
                    categoryColors={getColors(currentRoom.nombre)}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <MessageCircle className="w-12 h-12 mx-auto mb-3 text-zinc-400" />
                      <p className="text-zinc-400">Selecciona una categoría para comenzar</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
