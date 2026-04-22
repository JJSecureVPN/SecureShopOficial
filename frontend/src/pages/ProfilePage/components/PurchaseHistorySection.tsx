import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  ShoppingBag,
  Loader2,
  Shield,
  Wifi,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PurchaseHistory } from '../../../lib/supabase';
import { EstadoCuentaMap } from '../types';
import { formatDate, formatCurrency, getStatusText } from '../utils';

interface PurchaseHistorySectionProps {
  purchaseHistory: PurchaseHistory[];
  estadosCuenta: EstadoCuentaMap;
  onConsultarEstado: (username: string) => void;
  readOnly?: boolean;
}

export function PurchaseHistorySection({
  purchaseHistory,
  estadosCuenta,
  onConsultarEstado,
  readOnly = false,
}: PurchaseHistorySectionProps) {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      {purchaseHistory.length === 0 ? (
        <div className="bg-zinc-900/40 backdrop-blur-md border border-zinc-800/80 rounded-[2rem] p-12 text-center">
          <div className="w-20 h-20 bg-zinc-950 border border-zinc-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-tight mb-2">No hay registros</h3>
          <p className="text-sm font-bold text-zinc-600 uppercase tracking-wide mb-8 max-w-xs mx-auto">
            Tus transacciones aparecerán aquí una vez que realices tu primera compra.
          </p>
          <button
            onClick={() => navigate('/planes')}
            className="inline-flex items-center gap-3 bg-white text-zinc-950 px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5"
          >
            Explorar Planes
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {purchaseHistory.map((compra, index) => {
                const isExpanded = estadosCuenta[compra.servex_username!]?.expanded;
                
                return (
                    <motion.div
                        key={compra.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group"
                    >
                        <div className={`relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border ${isExpanded ? 'border-orange-500/30' : 'border-zinc-800/80'} rounded-[1.5rem] md:rounded-[2rem] p-5 md:p-6 transition-all duration-500 hover:border-zinc-700`}>
                            <div className="flex flex-col md:flex-row md:items-center gap-6">
                                {/* Icono y Info Principal */}
                                <div className="flex items-center gap-5 flex-1 min-w-0">
                                    <div className="relative flex-shrink-0">
                                        <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-orange-500 group-hover:border-orange-500/20 transition-all shadow-lg">
                                            {compra.tipo === 'revendedor' ? (
                                                <Shield className="w-7 h-7" />
                                            ) : (
                                                <Wifi className="w-7 h-7" />
                                            )}
                                        </div>
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-sm font-black text-white uppercase tracking-tight truncate">
                                            {compra.plan_nombre}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                                                {compra.tipo === 'renovacion' ? 'Renovación' : compra.tipo === 'revendedor' ? 'Revendedor' : 'Plan VPN'}
                                            </span>
                                            {compra.estado === 'aprobado' && compra.servex_username && (
                                                <>
                                                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                                    <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest truncate max-w-[120px]">
                                                        @{compra.servex_username}
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Monto y Detalles */}
                                <div className="flex flex-wrap items-center justify-between md:justify-end gap-6 border-t md:border-t-0 border-zinc-800/50 pt-5 md:pt-0">
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Monto</p>
                                            <p className="text-lg font-black text-white uppercase tracking-tighter">
                                                {formatCurrency(compra.monto)}
                                            </p>
                                        </div>
                                        <div className="w-px h-8 bg-zinc-800/50" />
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-0.5">Estado</p>
                                            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                                                compra.estado === 'aprobado' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 
                                                compra.estado === 'pendiente' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : 
                                                'bg-red-500/10 text-red-500 border-red-500/20'
                                            }`}>
                                                <div className={`w-1 h-1 rounded-full ${
                                                    compra.estado === 'aprobado' ? 'bg-emerald-500' : 
                                                    compra.estado === 'pendiente' ? 'bg-yellow-500' : 'bg-red-500'
                                                }`} />
                                                {getStatusText(compra.estado)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Info Adicional y Acciones */}
                            <div className="mt-6 pt-5 border-t border-zinc-800/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black text-zinc-600 uppercase tracking-[0.1em]">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>{formatDate(compra.created_at)}</span>
                                    </div>
                                    {compra.mp_payment_id && (
                                        <div className="flex items-center gap-2 opacity-60">
                                            <span className="text-[9px]">REF: {compra.mp_payment_id}</span>
                                        </div>
                                    )}
                                </div>

                                {!readOnly && compra.estado === 'aprobado' && compra.servex_username && (
                                    <button
                                        onClick={() => onConsultarEstado(compra.servex_username!)}
                                        className={`flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border ${
                                            isExpanded ? 'bg-orange-500 text-white border-orange-400 shadow-lg shadow-orange-500/20' : 'bg-zinc-950 text-zinc-500 border-zinc-800 hover:text-white hover:border-zinc-700'
                                        }`}
                                    >
                                        <Zap className={`w-3.5 h-3.5 ${isExpanded ? 'animate-pulse' : ''}`} />
                                        Ver Detalles
                                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Panel expandible (Reutilizando el estilo de ActiveSubscriptions) */}
                        <AnimatePresence>
                            {!readOnly && isExpanded && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0, y: -10 }}
                                    animate={{ opacity: 1, height: 'auto', y: 0 }}
                                    exit={{ opacity: 0, height: 0, y: -10 }}
                                    transition={{ duration: 0.4, ease: "circOut" }}
                                    className="overflow-hidden"
                                >
                                    <div className="mx-4 md:mx-10 mt-1 p-6 rounded-b-[1.5rem] bg-zinc-900/60 border-x border-b border-zinc-800/80 backdrop-blur-xl">
                                        {estadosCuenta[compra.servex_username!]?.loading ? (
                                            <div className="flex flex-col items-center justify-center gap-3 py-6">
                                                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                                                <span className="text-[9px] font-black text-orange-500/60 uppercase tracking-widest text-center">Consultando nube...</span>
                                            </div>
                                        ) : estadosCuenta[compra.servex_username!]?.data ? (
                                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in zoom-in-95 duration-500">
                                                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50 text-center">
                                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Días Restantes</p>
                                                    <p className="text-lg font-black text-orange-500">{estadosCuenta[compra.servex_username!]?.data?.diasRestantes || 0}</p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50 text-center">
                                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Nueva Expiración</p>
                                                    <p className="text-[10px] font-black text-white uppercase tracking-tighter">
                                                        {estadosCuenta[compra.servex_username!]?.data?.fechaExpiracion ? formatDate(estadosCuenta[compra.servex_username!]?.data?.fechaExpiracion || '') : '---'}
                                                    </p>
                                                </div>
                                                <div className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/50 text-center col-span-2 flex flex-col justify-center">
                                                    <p className="text-[8px] font-black text-zinc-600 uppercase tracking-widest mb-1">Último contacto</p>
                                                    <p className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                                        {estadosCuenta[compra.servex_username!]?.data?.ultimaConexion ? formatDate(estadosCuenta[compra.servex_username!]?.data?.ultimaConexion || '') : 'Sin registros'}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : null}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </motion.div>
                );
            })}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
