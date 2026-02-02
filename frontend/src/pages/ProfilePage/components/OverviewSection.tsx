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
} from 'lucide-react';
import { Profile, PurchaseHistory } from '../../../lib/supabase';
import { formatDate, formatCurrency, calcularDiasRestantes } from '../utils';
import { ProfileSection } from './ProfileNavSidebar';
import { SectionTitle, BodyText, CardTitle } from '../../../components/Typography';

interface OverviewSectionProps {
  user: User;
  profile: Profile | null;
  suscripcionActiva: PurchaseHistory | null;
  purchaseHistory: PurchaseHistory[];
  onNavigate: (section: ProfileSection) => void;
}

export function OverviewSection({
  user,
  profile,
  suscripcionActiva,
  purchaseHistory,
  onNavigate,
}: OverviewSectionProps) {
  const diasRestantes = suscripcionActiva?.servex_expiracion 
    ? calcularDiasRestantes(suscripcionActiva.servex_expiracion)
    : 0;

  const totalCompras = purchaseHistory.filter(p => p.estado === 'aprobado').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <SectionTitle className="!text-white">
          ¡Hola, {profile?.nombre?.split(' ')[0] || 'Usuario'}! 👋
        </SectionTitle>
        <BodyText className="mt-1 text-zinc-400">
          Bienvenido a tu panel de cuenta
        </BodyText>
      </div>

      {/* Suscripción Activa */}
      {suscripcionActiva && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-r from-orange-600 via-orange-700 to-orange-800 rounded-2xl p-6 text-white"
        >
          {/* Decoración */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                {suscripcionActiva.tipo === 'revendedor' ? (
                  <Shield className="w-6 h-6" />
                ) : (
                  <Wifi className="w-6 h-6" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-orange-200 text-xs uppercase tracking-wider">Plan activo</p>
                <h3 className="text-lg font-bold truncate">{suscripcionActiva.plan_nombre}</h3>
                <p className="text-orange-200 text-sm">@{suscripcionActiva.servex_username}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 sm:gap-6">
              <div className="text-center">
                <div className={`text-2xl sm:text-3xl font-bold ${diasRestantes <= 7 ? 'text-yellow-300' : ''}`}>
                  {diasRestantes}
                </div>
                <div className="text-xs text-orange-200">días</div>
              </div>
              <button
                onClick={() => onNavigate('subscription')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                Ver más
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats rápidas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-zinc-900/50 rounded-xl border border-zinc-700 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-900/30 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{totalCompras}</p>
              <p className="text-xs text-zinc-400">Compras</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-zinc-900/50 rounded-xl border border-zinc-700 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-900/30 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{formatCurrency(profile?.saldo || 0)}</p>
              <p className="text-xs text-zinc-400">Saldo</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-zinc-900/50 rounded-xl border border-zinc-700 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-900/30 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">{formatDate(user.created_at)}</p>
              <p className="text-xs text-zinc-400">Miembro</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-zinc-900/50 rounded-xl border border-zinc-700 p-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-900/30 flex items-center justify-center">
              <Clock className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{diasRestantes || '-'}</p>
              <p className="text-xs text-zinc-400">Días restantes</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Acciones rápidas */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-zinc-900/50 rounded-xl border border-zinc-700 overflow-hidden"
      >
        <div className="px-5 py-4 border-b border-zinc-700">
          <CardTitle className="!text-white">Acciones rápidas</CardTitle>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => onNavigate('referidos')}
              className="flex items-center gap-3 p-4 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-orange-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Invitar amigos</p>
                <p className="text-xs text-orange-400">Gana recompensas</p>
              </div>
            </button>
            
            <button
              onClick={() => onNavigate('tickets')}
              className="flex items-center gap-3 p-4 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <MessageCircle className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Soporte</p>
                <p className="text-xs text-blue-400">¿Necesitas ayuda?</p>
              </div>
            </button>
            
            <button
              onClick={() => onNavigate('history')}
              className="flex items-center gap-3 p-4 rounded-xl bg-green-500/10 hover:bg-green-500/20 border border-green-500/30 text-green-400 transition-all group"
            >
              <div className="w-10 h-10 rounded-lg bg-green-500 text-white flex items-center justify-center group-hover:scale-110 transition-transform">
                <History className="w-5 h-5" />
              </div>
              <div className="text-left">
                <p className="font-medium text-white">Historial</p>
                <p className="text-xs text-green-400">Ver compras</p>
              </div>
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
