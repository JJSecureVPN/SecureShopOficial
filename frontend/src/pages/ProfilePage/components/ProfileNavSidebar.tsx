import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import {
  LogOut,
  Wallet,
  BadgeCheck,
  User as UserIcon,
  History,
  MessageCircle,
  Gift,
  Settings,
  Shield,
} from 'lucide-react';
import { Profile } from '../../../lib/supabase';
import { formatCurrency } from '../utils';
import { CardTitle, SmallText } from '../../../components/Typography';

export type ProfileSection = 'overview' | 'subscription' | 'referidos' | 'tickets' | 'history' | 'settings';

interface NavItem {
  id: ProfileSection;
  label: string;
  icon: React.ReactNode;
  badge?: number;
}

interface ProfileNavSidebarProps {
  user: User;
  profile: Profile | null;
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  emailVerificado: boolean;
  onSignOut: () => void;
  suscripcionesActivas?: number;
  ticketsPendientes?: number;
}

export function ProfileNavSidebar({
  user,
  profile,
  activeSection,
  onSectionChange,
  emailVerificado,
  onSignOut,
  suscripcionesActivas = 0,
  ticketsPendientes = 0,
}: ProfileNavSidebarProps) {
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Resumen', icon: <UserIcon className="w-5 h-5" /> },
    { id: 'subscription' as ProfileSection, label: 'Mis Suscripciones', icon: <Shield className="w-5 h-5" />, badge: suscripcionesActivas > 0 ? suscripcionesActivas : undefined },
    { id: 'referidos', label: 'Referidos', icon: <Gift className="w-5 h-5" /> },
    { id: 'tickets', label: 'Soporte', icon: <MessageCircle className="w-5 h-5" />, badge: ticketsPendientes },
    { id: 'history', label: 'Historial', icon: <History className="w-5 h-5" /> },
    { id: 'settings', label: 'Configuración', icon: <Settings className="w-5 h-5" /> },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Card del usuario */}
      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-700 shadow-sm overflow-hidden">
        {/* Header con gradiente */}
        <div className="relative bg-gradient-to-br from-orange-600 via-orange-700 to-orange-900 px-5 py-6">
          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-orange-400/10 rounded-full translate-y-1/2 -translate-x-1/2" />
          </div>
          
          <div className="relative flex items-center gap-4">
            {/* Avatar */}
            {profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
              <img
                src={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture}
                alt="Avatar"
                className="w-14 h-14 rounded-full object-cover ring-2 ring-white/30"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-xl font-bold text-white ring-2 ring-white/30">
                {(profile?.nombre || user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            
            <div className="flex-1 min-w-0">
              <CardTitle className="!text-white truncate">
                {profile?.nombre || user.user_metadata?.full_name || 'Usuario'}
              </CardTitle>
              <SmallText className="!text-orange-200 truncate">
                {user.email}
              </SmallText>
              {emailVerificado && (
                <span className="inline-flex items-center gap-1 text-xs text-green-400 mt-1">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verificado
                </span>
              )}
            </div>
          </div>

          {/* Saldo */}
          {(profile?.saldo ?? 0) > 0 && (
            <div className="relative mt-4 bg-white/15 backdrop-blur-sm rounded-xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-100">
                <Wallet className="w-4 h-4" />
                <span className="text-sm">Saldo</span>
              </div>
              <span className="text-white font-bold">
                {formatCurrency(profile?.saldo || 0)}
              </span>
            </div>
          )}
        </div>

        {/* Navegación */}
        <nav className="p-2">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                activeSection === item.id
                  ? 'bg-orange-500/20 text-orange-400'
                  : 'text-zinc-400 hover:bg-zinc-800'
              }`}
            >
              <span className={`transition-colors ${
                activeSection === item.id ? 'text-orange-400' : 'text-zinc-500 group-hover:text-zinc-400'
              }`}>
                {item.icon}
              </span>
              <span className={`flex-1 text-sm ${activeSection === item.id ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
              {item.badge && item.badge > 0 && (
                <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* Cerrar sesión */}
        <div className="p-2 pt-0">
          <button
            onClick={onSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-sm font-medium"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
