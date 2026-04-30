import { useState, useEffect } from "react";
import { User } from '@supabase/supabase-js';
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Shield,
  Gift,
  MessageCircle,
  History,
  Settings,
  LogOut,
  ChevronRight,
  Menu,
  X,
  BadgeCheck,
  Wallet,
} from "lucide-react";
import { Profile } from '../../../lib/supabase';
import { formatCurrency } from '../utils';

export type ProfileSection = 'overview' | 'subscription' | 'referidos' | 'tickets' | 'history' | 'settings';

interface NavItem {
  id: ProfileSection;
  label: string;
  icon: React.ReactNode;
  description: string;
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
  const [isOpen, setIsOpen] = useState(false);

  const NAV_ITEMS: NavItem[] = [
    { id: 'overview',     label: 'Resumen',         icon: <LayoutDashboard className="w-5 h-5" />, description: "Vista general", },
    { id: 'subscription', label: 'Suscripciones',    icon: <Shield className="w-5 h-5" />,          description: "Planes activos", badge: suscripcionesActivas > 0 ? suscripcionesActivas : undefined },
    { id: 'referidos',    label: 'Referidos',       icon: <Gift className="w-5 h-5" />,           description: "Gana premios" },
    { id: 'tickets',      label: 'Soporte',         icon: <MessageCircle className="w-5 h-5" />,    description: "Tus consultas", badge: ticketsPendientes > 0 ? ticketsPendientes : undefined },
    { id: 'history',      label: 'Historial',       icon: <History className="w-5 h-5" />,         description: "Tus compras" },
    { id: 'settings',     label: 'Configuración',   icon: <Settings className="w-5 h-5" />,        description: "Tu perfil" },
  ];

  // Cerrar el drawer al cambiar el tamaño a escritorio
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bloquear scroll cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [isOpen]);

  const handleSectionClick = (id: ProfileSection) => {
    onSectionChange(id);
    setIsOpen(false);
  };

  const NavContent = () => (
    <>
      {/* User premium card info */}
      <div className="px-5 pt-8 pb-6 flex-shrink-0 border-b border-zinc-800/60">
        <div className="flex items-center gap-4 mb-4">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            {profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
              <img
                src={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture}
                alt="Avatar"
                className="relative w-12 h-12 rounded-full object-cover ring-2 ring-zinc-800 group-hover:ring-orange-500/50 transition-all"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="relative w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-lg font-black text-white ring-2 ring-zinc-800">
                {(profile?.nombre || user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
              </div>
            )}
            {emailVerificado && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-zinc-950 ring-1 ring-emerald-500/50 shadow-lg">
                <BadgeCheck className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-black text-white uppercase tracking-widest truncate">
              {profile?.nombre || user.user_metadata?.full_name || 'Usuario'}
            </p>
            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-tight truncate">
              {user.email}
            </p>
          </div>
        </div>

        {/* Saldo Pill */}
        <div className="relative overflow-hidden bg-zinc-900/50 border border-zinc-800/80 rounded-2xl p-3 flex items-center justify-between group hover:border-orange-500/30 transition-colors">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500/0 via-orange-500/0 to-orange-500/5 group-hover:via-orange-500/5 transition-all duration-700" />
          <div className="relative z-10 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-zinc-800/80 text-orange-500">
                <Wallet className="w-3.5 h-3.5" />
            </div>
            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Saldo</span>
          </div>
          <span className="relative z-10 text-xs font-black text-white tracking-widest">
            {formatCurrency(profile?.saldo || 0)}
          </span>
        </div>
      </div>

      {/* Nav items */}
      <div className="px-6 pt-6 pb-2 flex-shrink-0">
        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.25em]">
          Gestión de Cuenta
        </p>
      </div>

      <nav className="flex-1 px-3 space-y-1 pb-6 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSectionClick(item.id)}
              className={`
                relative w-full flex items-center gap-4 px-4 py-3.5
                rounded-2xl transition-colors duration-200 text-left overflow-hidden
                ${isActive
                  ? "text-white"
                  : "text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-200"
                }
              `}
            >
              {/* Background gradient pill */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              {/* Subtle shadow */}
              <div
                className={`absolute inset-0 rounded-2xl shadow-lg shadow-orange-500/30 transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Icon */}
              <div
                className={`relative z-10 flex-shrink-0 p-2 rounded-xl transition-colors duration-200 ${
                  isActive ? "bg-white/20" : "bg-transparent"
                }`}
              >
                {item.icon}
              </div>

              {/* Label & Description */}
              <div className="relative z-10 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <div className="font-black text-[11px] uppercase tracking-wider truncate">
                      {item.label}
                    </div>
                    {item.badge && (
                        <span className={`px-1.5 py-0.5 rounded-full text-[8px] font-black uppercase ${
                            isActive ? 'bg-white text-orange-600' : 'bg-orange-500 text-white'
                        }`}>
                            {item.badge}
                        </span>
                    )}
                </div>
                <div
                  className={`text-[9px] font-bold uppercase tracking-tight truncate transition-colors duration-200 ${
                    isActive ? "text-orange-100/70" : "text-zinc-600"
                  }`}
                >
                  {item.description}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                className={`relative z-10 w-4 h-4 flex-shrink-0 transition-all duration-200 ${
                  isActive
                    ? "text-white/80 opacity-100 translate-x-0"
                    : "text-zinc-700 opacity-0 -translate-x-1"
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Footer / Sign Out */}
      <div className="flex-shrink-0 px-4 py-6 border-t border-zinc-800/60 mt-auto">
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-zinc-500 hover:text-red-400 hover:bg-red-500/5 transition-all text-left group"
        >
          <div className="p-2 rounded-xl bg-transparent group-hover:bg-red-500/10 transition-colors">
            <LogOut className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] font-black uppercase tracking-widest">Cerrar Sesión</span>
            <span className="text-[8px] font-bold text-zinc-700 uppercase tracking-widest mt-0.5">Finalizar Actividad</span>
          </div>
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="
          hidden lg:flex flex-col
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-72
          bg-zinc-950 border-r border-zinc-800/60
          z-[9000] scrollbar-none
        "
      >
        <NavContent />
      </aside>

      {/* ── MOBILE MINI HEADER ── */}
      <div className="lg:hidden fixed top-16 left-0 right-0 w-full z-[8900] bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              Mi Cuenta
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[150px]">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
            {profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                <img
                    src={profile?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.picture}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full object-cover ring-1 ring-zinc-800"
                    referrerPolicy="no-referrer"
                />
            ) : (
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-white">
                    {(profile?.nombre || user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                </div>
            )}
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 top-16 z-[10000] flex">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Cabinet / Sidebar Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[85%] h-full bg-zinc-950 border-r border-zinc-800/60 flex flex-col pt-2 shadow-2xl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white z-20"
              >
                <X size={20} />
              </button>
              <NavContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
