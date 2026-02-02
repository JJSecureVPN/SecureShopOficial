import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { MessageCircle, Headphones, Users, Store, Lightbulb, ChevronLeft, Loader2 } from 'lucide-react';
import { ChatRoom } from '../../components/LiveChat/ChatRoom';
import { useChat } from '../../hooks/useChat';
import { useUnreadByRoom, markRoomAsRead } from '../../hooks/useChatNotifications';
import { useAuth } from '../../contexts/AuthContext';
import { ChatRoom as ChatRoomType } from '../../lib/supabase';

// Iconos para cada categoría
const categoryIcons: Record<string, React.ReactNode> = {
  'Chat Global': <Users className="w-5 h-5" />,
  'Soporte Técnico': <Headphones className="w-5 h-5" />,
  'Reventa': <Store className="w-5 h-5" />,
  'Sugerencias': <Lightbulb className="w-5 h-5" />,
  'default': <MessageCircle className="w-5 h-5" />
};

// Colores para cada categoría (versión dark)
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

export default function ChatPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRoom, setSelectedRoom] = useState<ChatRoomType | null>(null);
  const [showRoomList, setShowRoomList] = useState(true);
  const unreadByRoom = useUnreadByRoom();
  
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
      markRoomAsRead(selectedRoom.id); // Marcar sala como leída
      if (window.innerWidth < 768) {
        setShowRoomList(false);
      }
    }
  }, [selectedRoom, selectRoom]);

  // Seleccionar primera sala disponible (solo en desktop)
  useEffect(() => {
    if (rooms.length > 0 && !selectedRoom && window.innerWidth >= 768) {
      setSelectedRoom(rooms[0]);
    }
  }, [rooms, selectedRoom]);

  const handleBackToRooms = () => {
    setShowRoomList(true);
  };

  const getIcon = (roomName: string) => categoryIcons[roomName] || categoryIcons['default'];
  const getColors = (roomName: string) => categoryColors[roomName] || categoryColors['default'];

  return (
    <div className="bg-zinc-900 text-zinc-100 fixed inset-0 overflow-hidden" style={{ top: 0 }}>
      <section className="h-full bg-zinc-900 pt-[100px] md:pt-[80px]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 pb-4 h-full flex flex-col">
          
          {/* Header de la página */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 flex-shrink-0"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-black/40">
                <MessageCircle className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-zinc-100">Chat en Vivo</h1>
                <p className="text-purple-300 text-sm mt-1 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  {onlineCount > 0 ? (
                    <>{onlineCount} {onlineCount === 1 ? 'usuario conectado' : 'usuarios conectados'}</>
                  ) : (
                    'Conectando...'
                  )}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Layout Principal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-zinc-900 rounded-2xl shadow-xl shadow-black/40 border border-zinc-700 overflow-hidden flex-1 min-h-0"
          >
            <div className="flex h-full">
              
              {/* Sidebar de Categorías */}
              <div className={`
                w-full md:w-72 lg:w-80 flex-shrink-0 border-r border-zinc-700 bg-zinc-800 overflow-y-auto hide-scrollbar
                ${showRoomList ? 'block' : 'hidden md:block'}
              `}>
                <div className="p-4">
                  <h3 className="text-xs font-semibold text-purple-300 uppercase tracking-wider mb-4 px-2">
                    Categorías
                  </h3>
                  
                  {rooms.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
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
                              w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all
                              ${isSelected 
                                ? `bg-gradient-to-br ${colors.gradient} text-white shadow-md` 
                                : `${colors.bg} ${colors.text}`
                              }
                            `}>
                              {getIcon(room.nombre)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className={`font-semibold text-sm ${isSelected ? colors.text : 'text-zinc-100'}`}>
                                  {room.nombre}
                                </h4>
                                {unreadByRoom[room.id] > 0 && !isSelected && (
                                  <span className="min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                                    {unreadByRoom[room.id] > 99 ? '99+' : unreadByRoom[room.id]}
                                  </span>
                                )}
                              </div>
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
                  <div className="p-4 border-t border-zinc-700 mt-auto">
                    <div className="rounded-xl p-4 text-center border border-zinc-700 bg-zinc-800">
                      <MessageCircle className="w-8 h-8 mx-auto mb-2 text-purple-300" />
                      <p className="text-sm text-purple-300 mb-3">
                        Inicia sesión para participar
                      </p>
                      <button
                        onClick={() => {
                          document.dispatchEvent(new CustomEvent('open-auth-modal'));
                        }}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-indigo-700 transition-all shadow-md shadow-black/40"
                      >
                        Iniciar Sesión
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Área de Chat */}
              <div className={`
                flex-1 flex flex-col min-w-0 bg-zinc-900
                ${!showRoomList ? 'block' : 'hidden md:flex'}
              `}>
                {/* Botón volver a categorías - solo móvil cuando hay sala seleccionada */}
                {!showRoomList && currentRoom && (
                  <div className="md:hidden px-4 py-3 border-b border-zinc-700 bg-zinc-800">
                    <button
                      onClick={handleBackToRooms}
                      className="flex items-center gap-2 text-purple-300 hover:text-purple-400"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="text-sm font-medium">Elegir otra categoría</span>
                    </button>
                  </div>
                )}
                
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
                    onClose={() => navigate(-1)}
                    showHeader={false}
                    categoryColors={getColors(currentRoom.nombre)}
                  />
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-10 h-10 text-purple-300" />
                      </div>
                      <p className="text-purple-300 font-medium">Selecciona una categoría</p>
                      <p className="text-sm text-zinc-400 mt-1">para comenzar a chatear</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
