import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import {
  Shield,
  Wifi,
  Gift,
  History,
  MessageCircle,
  Calendar,
  CreditCard,
  ArrowRight,
  ShoppingBag,
  Clock,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { Profile, PurchaseHistory } from '../../../lib/supabase';
import { formatDate, formatCurrency, calcularDiasRestantes } from '../utils';
import { ProfileSection } from './ProfileNavSidebar';
import { EstadoCuentaMap } from '../types';

interface OverviewSectionProps {
  user: User;
  profile: Profile | null;
  suscripcionActiva: PurchaseHistory | null;
  purchaseHistory: PurchaseHistory[];
  estadosCuenta: EstadoCuentaMap;
  onNavigate: (section: ProfileSection) => void;
}

export function OverviewSection({
  user,
  profile,
  suscripcionActiva,
  purchaseHistory,
  estadosCuenta,
  onNavigate,
}: OverviewSectionProps) {
  const username = suscripcionActiva?.servex_username || '';
  const infoCuenta = estadosCuenta[username];
  const liveData = infoCuenta?.data;
  const hasData = !!liveData;
  
  const diasRestantes = liveData?.diasRestantes ?? (suscripcionActiva?.servex_expiracion 
    ? calcularDiasRestantes(suscripcionActiva.servex_expiracion)
    : 0);

  const isResellerLocal = suscripcionActiva?.tipo === 'revendedor' || suscripcionActiva?.plan_nombre?.toLowerCase().includes('revendedor');
  const isResellerConfirmed = liveData?.tipo === 'revendedor' || isResellerLocal;
  const isSyncing = !hasData && !isResellerLocal;

  const totalCompras = purchaseHistory.filter(p => p.estado === 'aprobado').length;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Welcome Header */}
      <div className="relative group">
        <div className="flex items-center gap-4">
            <div className="w-1.5 h-10 bg-orange-500 rounded-full shadow-[0_0_15px_rgba(249,115,22,0.4)]" />
            <div>
                <h2 className="text-2xl font-black text-white uppercase tracking-tight">
                    ¡Hola, {profile?.nombre?.split(' ')[0] || 'Usuario'}! 👋
                </h2>
                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mt-1">
                    Bienvenido a tu panel de control personal
                </p>
            </div>
        </div>
      </div>

      {/* Suscripción Activa - Premium Card */}
      {suscripcionActiva ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden group"
        >
          {/* Main Card */}
          <div className="relative z-10 bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 rounded-[2rem] p-6 sm:p-8 overflow-hidden transition-all duration-500 hover:border-zinc-700">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-orange-500/[0.03] blur-[100px] rounded-full pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-zinc-800/[0.05] blur-[100px] rounded-full pointer-events-none" />
            
            <div className="relative flex flex-col lg:flex-row lg:items-center gap-8">
              {/* Plan Info */}
              <div className="flex items-center gap-6 flex-1">
                <div className="relative">
                  <div className="absolute -inset-2 bg-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
                  <div className="relative w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-500 shadow-xl group-hover:border-orange-500/30 transition-colors duration-500">
                    {isSyncing ? (
                      <RefreshCw className="w-8 h-8 animate-spin opacity-50" />
                    ) : isResellerConfirmed ? (
                      <Shield className="w-8 h-8" />
                    ) : (
                      <Wifi className="w-8 h-8" />
                    )}
                  </div>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {isSyncing ? (
                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-zinc-900/50 border border-zinc-800/50 animate-pulse">
                        <div className="w-1.5 h-1.5 rounded-full bg-zinc-700" />
                        <span className="text-[8px] font-black text-zinc-500 uppercase tracking-tighter">Sincronizando...</span>
                      </div>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-500 text-[10px] font-black uppercase tracking-widest border border-orange-500/20 transition-opacity duration-300">
                          {isResellerConfirmed ? 'Revendedor' : 'Plan VPN'}
                      </span>
                    )}
                    <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-zinc-600' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight truncate">
                    {suscripcionActiva.plan_nombre}
                  </h3>
                  <p className="text-sm font-bold text-zinc-500 tracking-wide">
                    Usuario: <span className="text-white">@{suscripcionActiva.servex_username}</span>
                  </p>
                </div>
              </div>
              
              {/* Countdown & Action */}
              <div className="flex items-center justify-between lg:justify-end gap-8 pt-6 lg:pt-0 border-t lg:border-t-0 border-zinc-800/50">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1">Días Restantes</p>
                    <div className="flex items-baseline justify-end gap-1">
                      {estadosCuenta[username]?.loading && !estadosCuenta[username]?.data ? (
                        <span className="text-xl font-black text-orange-500/40 animate-pulse tracking-tighter">
                          SINC...
                        </span>
                      ) : (
                        <>
                          <span className={`text-4xl font-black ${diasRestantes <= 7 ? 'text-orange-500' : 'text-white'}`}>
                            {diasRestantes}
                          </span>
                          <span className="text-xs font-bold text-zinc-500 uppercase">días</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="w-px h-12 bg-zinc-800/50 hidden sm:block" />
                </div>

                <button
                  onClick={() => onNavigate('subscription')}
                  className="group/btn flex items-center gap-3 bg-white text-zinc-950 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all duration-300 shadow-xl shadow-white/5 active:scale-95"
                >
                  Gestionar
                  <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-2xl p-8 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-800/50 flex items-center justify-center text-zinc-600 mb-4">
                  <Shield className="w-8 h-8 opacity-20" />
              </div>
              <h3 className="text-lg font-bold text-zinc-400 uppercase tracking-tight">Sin suscripción activa</h3>
              <p className="text-sm text-zinc-600 mt-2 max-w-sm">
                  Adquiere un plan para disfrutar de todas las características de SecureShop VPN.
              </p>
          </div>
      )}

      {/* Grid de Stats - Estilo AdminTools */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Compras', value: totalCompras, icon: <ShoppingBag className="w-5 h-5" />, color: 'blue' },
          { label: 'Saldo', value: formatCurrency(profile?.saldo || 0), icon: <CreditCard className="w-5 h-5" />, color: 'emerald' },
          { label: 'Miembro', value: user?.created_at ? formatDate(user.created_at) : '-', icon: <Calendar className="w-5 h-5" />, color: 'orange', isText: true },
          { label: 'Días VPN', value: diasRestantes || '-', icon: <Clock className="w-5 h-5" />, color: 'orange' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + (i * 0.05) }}
            className="group relative overflow-hidden bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-5 hover:border-zinc-700 transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-4">
                <div className={`p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 group-hover:text-white group-hover:border-zinc-700 transition-all`}>
                    {item.icon}
                </div>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-800 group-hover:bg-orange-500 transition-colors" />
            </div>
            <div>
              <p className={`text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 group-hover:text-zinc-500`}>{item.label}</p>
              <p className={`font-black text-white truncate ${item.isText ? 'text-sm' : 'text-xl'}`}>
                {item.value}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions - Premium Cards */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
            <div className="w-1 h-4 bg-orange-500 rounded-full" />
            <h3 className="text-[11px] font-black text-zinc-500 uppercase tracking-[0.2em]">Acciones Rápidas</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'referidos', label: 'Invitar Amigos', sublabel: 'Gana recompensas', icon: <Gift className="w-6 h-6" />, color: 'orange' },
            { id: 'tickets', label: 'Soporte Técnico', sublabel: '¿Necesitas ayuda?', icon: <MessageCircle className="w-6 h-6" />, color: 'blue' },
            { id: 'history', label: 'Mis Compras', sublabel: 'Ver historial', icon: <History className="w-6 h-6" />, color: 'emerald' },
          ].map((action, i) => (
            <motion.button
              key={action.id}
              onClick={() => onNavigate(action.id as ProfileSection)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (i * 0.05) }}
              className="group relative flex items-center gap-4 p-5 rounded-[1.5rem] bg-zinc-900/40 border border-zinc-800 hover:border-orange-500/30 transition-all duration-300 text-left active:scale-95 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-orange-500/0 to-orange-500/[0.02] group-hover:to-orange-500/[0.05] transition-all" />
              
              <div className="relative z-10 w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:text-orange-500 group-hover:border-orange-500/20 transition-all shadow-lg">
                {action.icon}
              </div>
              <div className="relative z-10 min-w-0">
                <p className="font-black text-white text-[11px] uppercase tracking-wider mb-0.5 group-hover:text-orange-500 transition-colors">{action.label}</p>
                <p className="text-[9px] font-bold text-zinc-600 uppercase tracking-tight">{action.sublabel}</p>
              </div>
              <ChevronRight className="relative z-10 ml-auto w-4 h-4 text-zinc-800 group-hover:text-orange-500 group-hover:translate-x-1 transition-all" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
