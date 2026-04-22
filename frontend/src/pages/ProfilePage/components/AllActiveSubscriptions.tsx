import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Wifi,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Zap,
  ShoppingBag,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Button } from '../../../components/Button';
import { PurchaseHistory } from '../../../lib/supabase';
import { calcularDiasRestantes, formatDate } from '../utils';
import { EstadoCuentaMap } from '../types';
import { SectionTitle, BodyText } from '../../../components/Typography';

interface AllActiveSubscriptionsProps {
  suscripcionesActivas: PurchaseHistory[];
  estadosCuenta: EstadoCuentaMap;
  onConsultarEstado: (username: string) => void;
  onRefrescarEstado: (username: string) => void;
  onRepararEstado: (username: string) => void;
}

export function AllActiveSubscriptions({
  suscripcionesActivas,
  estadosCuenta,
  onConsultarEstado,
  onRefrescarEstado,
  onRepararEstado,
}: AllActiveSubscriptionsProps) {
  const navigate = useNavigate();

  const handleRenovar = (suscripcion: PurchaseHistory) => {
    const username = suscripcion.servex_username || '';
    const esRevendedor = suscripcion.tipo === 'revendedor';
    const ruta = esRevendedor ? '/revendedores' : '/planes';
    navigate(`${ruta}?cuenta=${encodeURIComponent(username)}`);
  };

  if (suscripcionesActivas.length === 0) {
    return (
      <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-700 rounded-2xl p-8 md:p-12 text-center">
        <ShoppingBag className="w-16 h-16 mx-auto mb-6 text-orange-400" />
        <SectionTitle as="h3" className="mb-2 text-white">No tienes suscripciones activas</SectionTitle>
        <BodyText className="mb-6 max-w-md mx-auto text-zinc-400">
          Adquiere un plan para comenzar a disfrutar de todos los beneficios.
        </BodyText>
        <Button
          onClick={() => navigate('/planes')}
          variant="primary"
          size="md"
        >
          Ver planes
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700"
    >
      <div className="space-y-6">
        <AnimatePresence>
          {suscripcionesActivas.map((suscripcion, index) => {
            const username = suscripcion.servex_username!;
            const infoCuenta = estadosCuenta[username];
            const isExpanded = infoCuenta?.expanded;
            const liveData = infoCuenta?.data;
            const hasData = !!liveData;
            const diasRestantes = liveData?.diasRestantes ?? calcularDiasRestantes(suscripcion.servex_expiracion!);

            const isResellerLocal = suscripcion.tipo === 'revendedor' || suscripcion.plan_nombre?.toLowerCase().includes('revendedor');
            const isResellerConfirmed = liveData?.tipo === 'revendedor' || isResellerLocal;
            const isSyncing = !hasData && !isResellerLocal;

            return (
              <motion.div
                key={suscripcion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group"
              >
                {/* Main Premium Card */}
                <div className={`relative overflow-hidden bg-zinc-900/40 backdrop-blur-md border ${isExpanded ? 'border-orange-500/30' : 'border-zinc-800/80'} rounded-[2rem] p-6 sm:p-8 transition-all duration-500 hover:border-zinc-700`}>
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/[0.02] blur-[80px] rounded-full pointer-events-none" />
                  
                  <div className="relative flex flex-col lg:flex-row lg:items-center gap-8 text-white">
                    {/* Plan Info */}
                    <div className="flex items-center gap-6 flex-1">
                      <div className="relative">
                        <div className="absolute -inset-2 bg-orange-500/10 blur-xl opacity-0 group-hover:opacity-100 transition duration-700" />
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-orange-500 shadow-xl group-hover:border-orange-500/30 transition-colors duration-500">
                          {isSyncing ? (
                            <RefreshCw className="w-6 h-6 sm:w-8 sm:h-8 animate-spin opacity-50" />
                          ) : isResellerConfirmed ? (
                            <Shield className="w-6 h-6 sm:w-8 sm:h-8" />
                          ) : (
                            <Wifi className="w-6 h-6 sm:w-8 sm:h-8" />
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
                            <span className="px-2 py-0.5 rounded-full bg-zinc-950 border border-zinc-800 text-zinc-500 text-[9px] font-black uppercase tracking-widest transition-opacity duration-300">
                                {isResellerConfirmed ? 'Revendedor' : 'Plan VPN'}
                            </span>
                          )}
                          <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-zinc-600' : 'bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]'}`} />
                        </div>
                        <h3 className="text-xl font-black text-white uppercase tracking-tight truncate">
                          {suscripcion.plan_nombre}
                        </h3>
                        <p className="text-sm font-bold text-zinc-500 tracking-wide">
                          ID: <span className="text-white">@{username}</span>
                        </p>
                      </div>
                    </div>

                    {/* Stats & Actions */}
                    <div className="flex items-center justify-between lg:justify-end gap-8 pt-6 lg:pt-0 border-t lg:border-t-0 border-zinc-800/50">
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-1 text-nowrap">Expiración</p>
                          <div className="flex items-baseline justify-end gap-1">
                            {estadosCuenta[username]?.loading && !estadosCuenta[username]?.data ? (
                              <span className="text-xl font-black text-orange-500/40 animate-pulse tracking-tighter">
                                SINC...
                              </span>
                            ) : (
                              <>
                                <span className={`text-3xl font-black ${diasRestantes <= 7 ? 'text-orange-500' : 'text-white'}`}>
                                  {diasRestantes}
                                </span>
                                <span className="text-[10px] font-bold text-zinc-500 uppercase">días</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full lg:w-auto">
                        <button
                          onClick={() => onConsultarEstado(username)}
                          className={`flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border w-full sm:w-auto ${
                            isExpanded ? 'bg-orange-500 text-white border-orange-400' : 'bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-white'
                          }`}
                        >
                          <Zap className={`w-3.5 h-3.5 ${isExpanded ? 'animate-pulse' : ''}`} />
                          Estado
                          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                        </button>

                        <button
                          onClick={() => handleRenovar(suscripcion)}
                          className="flex items-center justify-center gap-2 bg-white text-zinc-950 px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-orange-500 hover:text-white transition-all active:scale-95 shadow-xl shadow-white/5 w-full sm:w-auto"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          Renovar
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Alerta de vencimiento próximo */}
                  {diasRestantes <= 7 && (
                    <div className="mt-6 pt-4 border-t border-zinc-800/50 flex items-center gap-3 text-orange-500/80 text-[10px] font-black uppercase tracking-widest animate-pulse">
                      <AlertTriangle className="w-4 h-4" />
                      Se recomienda renovación inmediata para evitar suspensión
                    </div>
                  )}

                  {/* Panel expandible con estado de cuenta - AHORA DENTRO DEL CONTENEDOR */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.4, ease: "circOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-8 pt-8 border-t border-zinc-800/50">
                          {estadosCuenta[username]?.loading ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-10">
                              <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                              <span className="text-[10px] font-black text-orange-500/60 uppercase tracking-widest">Sincronizando con el servidor...</span>
                            </div>
                          ) : estadosCuenta[username]?.error ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-10 text-red-500/80">
                              <AlertTriangle className="w-8 h-8" />
                              <span className="text-[10px] font-black uppercase tracking-widest text-center">{estadosCuenta[username]?.error}</span>
                              <button 
                                  onClick={() => onRefrescarEstado(username)}
                                  className="mt-2 text-[9px] font-black uppercase tracking-widest underline underline-offset-4 opacity-60 hover:opacity-100"
                              >
                                  Reintentar conexión
                              </button>
                            </div>
                          ) : estadosCuenta[username]?.data ? (
                            <div className="animate-in fade-in zoom-in-95 duration-500">
                              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                                <div className="flex items-center gap-3">
                                  {infoCuenta?.repaired ? (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-white border border-emerald-400 text-[10px] font-black uppercase tracking-widest shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in zoom-in duration-300">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Sincronizado con éxito
                                    </div>
                                  ) : liveData?.estado === 'activo' ? (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                                      <CheckCircle className="w-3.5 h-3.5" />
                                      Conexión Estable
                                    </div>
                                  ) : (
                                    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 text-orange-500 border border-orange-500/20 text-[10px] font-black uppercase tracking-widest animate-pulse">
                                      <AlertTriangle className="w-3.5 h-3.5" />
                                      Requiere Atención
                                    </div>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                  <button
                                    onClick={() => onRepararEstado(username)}
                                    className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 transition-colors bg-emerald-500/5 hover:bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/10"
                                    title="Fuerza una resincronización de tu cuenta en todos los nodos de la VPN"
                                  >
                                    <Zap className="w-3.5 h-3.5 fill-emerald-400/20" />
                                    Reparar Conexión
                                  </button>
                                  <button
                                    onClick={() => onRefrescarEstado(username)}
                                    className="flex items-center justify-center gap-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-white transition-colors px-2 py-2"
                                  >
                                    <RefreshCw className="w-3.5 h-3.5" />
                                    Refrescar
                                  </button>
                                </div>
                              </div>

                              {/* Grid de información */}
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 text-center">Acceso</p>
                                  <div className="text-xl font-black text-white text-center">
                                    {estadosCuenta[username]?.data?.diasRestantes || 0}
                                    <span className="text-[10px] font-bold text-zinc-600 ml-1 uppercase">días</span>
                                  </div>
                                </div>

                                <div className="p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50">
                                  <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 text-center">Vencimiento</p>
                                  <div className="text-[11px] font-black text-orange-500 text-center uppercase tracking-tighter">
                                    {estadosCuenta[username]?.data?.fechaExpiracion 
                                      ? formatDate(estadosCuenta[username]?.data?.fechaExpiracion || '')
                                      : '---'}
                                  </div>
                                </div>

                                {estadosCuenta[username]?.data?.tipo === 'revendedor' ? (
                                  <div className="col-span-2 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 flex flex-col justify-center items-center">
                                      {estadosCuenta[username]?.data?.tipoRevendedor === 'credit' ? (
                                          <>
                                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Créditos de Reventa</p>
                                              <div className="text-xl font-black text-orange-500 uppercase tracking-tighter">
                                                  {estadosCuenta[username]?.data?.creditos || 0} Unidades
                                              </div>
                                          </>
                                      ) : (
                                          <>
                                              <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1">Capacidad Usuarios</p>
                                              <div className="text-xl font-black text-orange-500 uppercase tracking-tighter">
                                                  {estadosCuenta[username]?.data?.usuariosActuales || 0} / {estadosCuenta[username]?.data?.maxUsuarios || 0}
                                              </div>
                                          </>
                                      )}
                                  </div>
                                ) : (
                                  <div className="col-span-2 p-4 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 flex flex-col justify-center items-center">
                                      <p className="text-[9px] font-black text-zinc-600 uppercase tracking-widest mb-1 text-center">Límite Dispositivos</p>
                                      <div className="text-xl font-black text-orange-500 uppercase tracking-tighter">
                                          {estadosCuenta[username]?.data?.conexionesMaximas || 1} Conexiones simultáneas
                                      </div>
                                  </div>
                                )}
                              </div>

                              {/* Footer info labels */}
                              <div className="mt-6 pt-4 border-t border-zinc-800/50 flex flex-wrap gap-4 items-center justify-center">
                                  <div className="flex items-center gap-2">
                                      <Clock className="w-3.5 h-3.5 text-zinc-600" />
                                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                                          Último acceso: {estadosCuenta[username]?.data?.ultimaConexion ? formatDate(estadosCuenta[username]?.data?.ultimaConexion || '') : 'Sin registros'}
                                      </span>
                                  </div>
                                  <div className="hidden sm:block w-1 h-1 rounded-full bg-zinc-800" />
                                  <div className="flex items-center gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500/50 animate-pulse" />
                                      <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">Servicio sincronizado</span>
                                  </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
