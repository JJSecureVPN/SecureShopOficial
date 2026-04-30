import { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, ShoppingBag, LogOut, Loader2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import AuthModal from './AuthModal';
import { HeaderDropdown } from './HeaderDropdown';

export default function UserMenu() {
  const { user, profile, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  if (loading) {
    return (
      <div className="p-2">
        <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setShowAuthModal(true)}
          className="text-sm font-semibold text-orange-500 hover:text-orange-400 transition-colors"
        >
          Iniciar sesión
        </button>
        <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
      </>
    );
  }

  const handleSignOut = async () => {
    setIsOpen(false);
    await signOut();
  };

  const handleGoToProfile = () => {
    setIsOpen(false);
    navigate('/perfil');
  };

  const handleGoToPurchases = () => {
    setIsOpen(false);
    navigate('/perfil?section=subscription');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-zinc-200 hover:text-white hover:bg-zinc-800 transition-colors"
      >
        {/* Avatar - Mostrar imagen de Google si está disponible */}
        {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
          <img
            src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
            alt="Avatar"
            className="w-7 h-7 rounded-full object-cover"
          />
        ) : (
          <div 
            className="w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold text-white bg-orange-500"
          >
            {(profile?.nombre || user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
          </div>
        )}
        <span className="hidden sm:inline text-sm font-medium max-w-[100px] truncate">
          {profile?.nombre || user.email?.split('@')[0]}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform text-orange-500 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      <HeaderDropdown
        isOpen={isOpen}
        width="w-56"
        align="right"
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-zinc-700/50">
          <p className="text-sm font-semibold truncate text-white">
            {profile?.nombre || 'Usuario'}
          </p>
          <p className="text-xs truncate text-zinc-400">{user.email}</p>
        </div>

        {/* Menu Items */}
        <div className="py-1">
          <button
            onClick={handleGoToProfile}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
          >
            <User className="w-4 h-4" />
            Mi Perfil
          </button>
          <button
            onClick={handleGoToPurchases}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            Mis Suscripciones
          </button>
        </div>

        {/* Logout */}
        <div className="border-t border-zinc-700/50 py-1">
          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </HeaderDropdown>
    </div>
  );
}
