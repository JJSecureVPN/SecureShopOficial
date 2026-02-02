import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Shield,
  Wifi,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Users,
  ChevronDown,
  ChevronUp,
  Zap,
  ShoppingBag,
  ArrowRight,
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
}

export function AllActiveSubscriptions({
  suscripcionesActivas,
  estadosCuenta,
  onConsultarEstado,
  onRefrescarEstado,
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
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionTitle as="h2" className="text-white">Mis Suscripciones</SectionTitle>
          <BodyText className="mt-1 text-zinc-400">
            {suscripcionesActivas.length} {suscripcionesActivas.length === 1 ? 'suscripción activa' : 'suscripciones activas'}
          </BodyText>
        </div>
      </div>

      <div className="space-y-4">
        <AnimatePresence>
          {suscripcionesActivas.map((suscripcion, index) => {
            const diasRestantes = calcularDiasRestantes(suscripcion.servex_expiracion!);
            const username = suscripcion.servex_username!;

            return (
              <motion.div
                key={suscripcion.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Card principal con gradiente */}
                <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 rounded-xl bg-white/20 flex items-center justify-center">
                        {suscripcion.tipo === 'revendedor' ? (
                          <Shield className="w-7 h-7" />
                        ) : (
                          <Wifi className="w-7 h-7" />
                        )}
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-wider opacity-80">
                          {suscripcion.tipo === 'revendedor' ? 'Plan Revendedor' : 'Plan VPN'}
                        </p>
                        <h3 className="text-xl font-bold">{suscripcion.plan_nombre}</h3>
                        <p className="text-sm opacity-80">Usuario: {username}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className={`text-3xl font-bold ${diasRestantes <= 7 ? 'text-yellow-300' : 'text-white'}`}>
                          {diasRestantes}
                        </div>
                        <div className="text-xs opacity-80">días restantes</div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => onConsultarEstado(username)}
                          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all bg-white/20 hover:bg-white/30"
                        >
                          <Zap className="w-4 h-4" />
                          Estado
                          {estadosCuenta[username]?.expanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                        <Button
                          onClick={() => handleRenovar(suscripcion)}
                          variant="secondary"
                          size="md"
                          className="bg-white/20 hover:bg-white/30 border-white/30 text-white"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Renovar
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Alerta de vencimiento próximo */}
                  {diasRestantes <= 7 && (
                    <div className="mt-4 pt-4 border-t border-white/20 flex items-center gap-2 text-yellow-200 text-sm">
                      <AlertTriangle className="w-4 h-4" />
                      Tu suscripción está por vencer. ¡Renueva ahora para no perder acceso!
                    </div>
                  )}
                </div>

                {/* Panel expandible con estado de cuenta */}
                <AnimatePresence>
                  {estadosCuenta[username]?.expanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div 
                        className="mt-2 p-4 rounded-xl bg-zinc-800 border border-zinc-700"
                      >
                        {estadosCuenta[username]?.loading ? (
                          <div className="flex items-center justify-center gap-2 py-4">
                            <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                            <span className="text-orange-500">Consultando estado...</span>
                          </div>
                        ) : estadosCuenta[username]?.error ? (
                          <div className="flex items-center justify-center gap-2 py-4 text-red-600">
                            <AlertTriangle className="w-5 h-5" />
                            <span>{estadosCuenta[username]?.error}</span>
                          </div>
                        ) : estadosCuenta[username]?.data ? (
                          <div>
                            {/* Header con estado y botón refrescar */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                {estadosCuenta[username]?.data?.estado === 'activo' ? (
                                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-sm font-medium">
                                    <CheckCircle className="w-4 h-4" />
                                    Cuenta Activa
                                  </div>
                                ) : estadosCuenta[username]?.data?.estado === 'por_expirar' ? (
                                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-700 text-sm font-medium">
                                    <AlertTriangle className="w-4 h-4" />
                                    Por Expirar
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-sm font-medium">
                                    <XCircle className="w-4 h-4" />
                                    Expirada
                                  </div>
                                )}
                              </div>
                              <button
                                onClick={() => onRefrescarEstado(username)}
                                className="flex items-center gap-1 text-sm hover:bg-zinc-700 px-2 py-1 rounded transition-all text-orange-400"
                              >
                                <RefreshCw className="w-4 h-4" />
                                Actualizar
                              </button>
                            </div>

                            {/* Grid de información */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {/* Días restantes */}
                              <div className="text-center p-3 rounded-lg bg-zinc-900">
                                <div 
                                  className="text-2xl font-bold"
                                  style={{ 
                                    color: (estadosCuenta[username]?.data?.diasRestantes || 0) <= 3 
                                      ? '#ef4444' 
                                      : '#f97316' 
                                  }}
                                >
                                  {estadosCuenta[username]?.data?.diasRestantes || 0}
                                </div>
                                <div className="text-xs text-zinc-400">
                                  Días restantes
                                </div>
                              </div>

                              {/* Fecha expiración */}
                              <div className="text-center p-3 rounded-lg bg-zinc-900">
                                <div className="text-sm font-semibold text-orange-400">
                                  {estadosCuenta[username]?.data?.fechaExpiracion 
                                    ? formatDate(estadosCuenta[username]?.data?.fechaExpiracion || '')
                                    : 'N/A'}
                                </div>
                                <div className="text-xs text-zinc-400">
                                  Fecha expiración
                                </div>
                              </div>

                              {/* Para revendedores: distinguir entre crédito y validez */}
                              {estadosCuenta[username]?.data?.tipo === 'revendedor' ? (
                                <>
                                  {estadosCuenta[username]?.data?.tipoRevendedor === 'credit' ? (
                                    <div className="text-center p-3 rounded-lg col-span-2 bg-zinc-900">
                                      <div className="flex items-center justify-center gap-1">
                                        <Users className="w-4 h-4 text-orange-500" />
                                        <span className="text-2xl font-bold text-orange-500">
                                          {estadosCuenta[username]?.data?.creditos || 0}
                                        </span>
                                      </div>
                                      <div className="text-xs text-zinc-400">
                                        Créditos disponibles
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="text-center p-3 rounded-lg col-span-2 bg-zinc-900">
                                      <div className="flex items-center justify-center gap-1">
                                        <Users className="w-4 h-4 text-orange-500" />
                                        <span className="text-2xl font-bold text-orange-500">
                                          {estadosCuenta[username]?.data?.usuariosActuales || 0} / {estadosCuenta[username]?.data?.maxUsuarios || 0}
                                        </span>
                                      </div>
                                      <div className="text-xs text-zinc-400">
                                        Usuarios creados
                                      </div>
                                    </div>
                                  )}
                                </>
                              ) : (
                                <div className="text-center p-3 rounded-lg col-span-2 bg-zinc-900">
                                  <div className="flex items-center justify-center gap-1">
                                    <Wifi className="w-4 h-4 text-orange-500" />
                                    <span className="text-2xl font-bold text-orange-500">
                                      {estadosCuenta[username]?.data?.conexionesMaximas || 1}
                                    </span>
                                  </div>
                                  <div className="text-xs text-zinc-400">
                                    Conexiones máx.
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Última conexión */}
                            {estadosCuenta[username]?.data?.ultimaConexion && (
                              <div className="mt-3 text-center text-xs text-zinc-400">
                                Última conexión: {formatDate(estadosCuenta[username]?.data?.ultimaConexion || '')}
                              </div>
                            )}
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
    </motion.div>
  );
}
