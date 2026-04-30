import { Link } from 'react-router-dom';
import { useChatNotifications } from '../../hooks/useChatNotifications';

export function LiveChat() {
  const { unreadCount } = useChatNotifications();

  return (
    <Link
      to="/chat"
      className="fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 hover:scale-110 hover:shadow-xl"
      title="Abrir chat de soporte"
    >
      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
      
      {/* Indicador de mensajes no leídos */}
      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
}

export default LiveChat;
