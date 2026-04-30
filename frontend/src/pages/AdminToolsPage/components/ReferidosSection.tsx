import { useState, useEffect } from 'react';
import {
  Gift,
  Settings,
  DollarSign,
  Save,
  Loader2,
  Check,
  AlertCircle,
  RefreshCw,
  Plus,
  Minus,
} from 'lucide-react';
import { referidosService } from '../../../services/api.service';

interface ReferralSettingsAdmin {
  id: number;
  porcentaje_recompensa: number;
  porcentaje_descuento_referido: number;
  min_compra_requerida: number;
  activo: boolean;
  solo_primera_compra: boolean;
  max_recompensa_por_referido: number | null;
  mensaje_promocional: string;
  updated_at: string;
}

export function ReferidosSection() {
  // Estado de configuración
  const [settings, setSettings] = useState<ReferralSettingsAdmin | null>(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState<string | null>(null);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Estado de ajuste de saldo
  const [ajusteEmail, setAjusteEmail] = useState('');
  const [ajusteMonto, setAjusteMonto] = useState('');
  const [ajusteDescripcion, setAjusteDescripcion] = useState('');
  const [ajustando, setAjustando] = useState(false);
  const [ajusteSuccess, setAjusteSuccess] = useState<string | null>(null);
  const [ajusteError, setAjusteError] = useState<string | null>(null);

  // Estado para usuarios con saldo
  const [usuariosSaldo, setUsuariosSaldo] = useState<any[]>([]);
  const [loadingUsuariosSaldo, setLoadingUsuariosSaldo] = useState(false);

  // Cargar configuración
  useEffect(() => {
    loadSettings();
    loadUsuariosConSaldo();
  }, []);

  const loadUsuariosConSaldo = async () => {
    try {
      setLoadingUsuariosSaldo(true);
      const data = await referidosService.getUsuariosConSaldo(50);
      setUsuariosSaldo(data);
    } catch (error) {
      console.error('[ReferidosSection] Error cargando usuarios con saldo:', error);
    } finally {
      setLoadingUsuariosSaldo(false);
    }
  };

  const loadSettings = async () => {
    try {
      setLoadingSettings(true);
      const data = await referidosService.getAdminSettings();
      setSettings(data);
    } catch (error) {
      console.error('[ReferidosSection] Error cargando settings:', error);
      setSettingsError('Fallo en la sincronización de protocolos de referidos.');
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleSaveSettings = async () => {
    if (!settings) return;

    try {
      setSavingSettings(true);
      setSettingsError(null);
      setSettingsSuccess(null);

      await referidosService.updateSettings({
        porcentaje_recompensa: settings.porcentaje_recompensa,
        porcentaje_descuento_referido: settings.porcentaje_descuento_referido,
        activo: settings.activo,
      });

      setSettingsSuccess('Arquitectura de referidos actualizada');
      setTimeout(() => setSettingsSuccess(null), 3000);
    } catch (error: any) {
      setSettingsError(error.message || 'Error en la actualización de configuración');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAjustarSaldo = async (esPositivo: boolean) => {
    if (!ajusteEmail || !ajusteMonto) {
      setAjusteError('Se requieren coordenadas de identidad y valor (Email/Monto)');
      return;
    }

    try {
      setAjustando(true);
      setAjusteError(null);
      setAjusteSuccess(null);

      const montoNumerico = parseFloat(ajusteMonto);
      const montoFinal = esPositivo ? Math.abs(montoNumerico) : -Math.abs(montoNumerico);

      const result = await referidosService.ajustarSaldo(
        ajusteEmail,
        montoFinal,
        ajusteDescripcion || `Ajuste táctico por admin: ${esPositivo ? '+' : '-'}$${Math.abs(montoNumerico)}`
      );

      if (result.success) {
        setAjusteSuccess(`Saldo recalibrado. Nuevo vector: $${result.nuevo_saldo?.toFixed(2)}`);
        setAjusteEmail('');
        setAjusteMonto('');
        setAjusteDescripcion('');
        await loadUsuariosConSaldo();
        setTimeout(() => setAjusteSuccess(null), 3000);
      } else {
        setAjusteError(result.mensaje);
      }
    } catch (error: any) {
      setAjusteError(error.message || 'Fallo en la inyección de saldo');
    } finally {
      setAjustando(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loadingSettings) {
    return (
      <div className="py-24 text-center">
        <div className="w-12 h-12 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_20px_rgba(168,85,247,0.2)]" />
        <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] animate-pulse">Sincronizando Sistema de Recompensas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Estelar */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900/20 backdrop-blur-3xl border border-zinc-800/50 p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-purple-500/10 border border-purple-500/30 flex items-center justify-center shadow-2xl shadow-purple-500/10">
               <Gift className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">Cámara de Recompensas</h2>
              <p className="text-zinc-500 font-medium mt-1 text-sm max-w-xl">
                Arquitectura de crecimiento orgánico. Monitoriza el flujo de incentivos, ajusta vectores de saldo y configura protocolos de expansión mediante referidos.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-2 shrink-0">
             <div className="px-4 py-2 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 backdrop-blur-xl">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                   Protocolo: <span className={settings?.activo ? "text-emerald-400" : "text-red-400"}>{settings?.activo ? "ACTIVO" : "OFFLINE"}</span>
                </span>
             </div>
             <p className="text-[9px] font-bold text-zinc-700 uppercase tracking-widest px-2 italic">Actualizado: {settings?.updated_at ? new Date(settings.updated_at).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
        
        {/* Lado Izquierdo: Configuración */}
        <div className="xl:col-span-2 space-y-10">
          
          <div className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 p-8 md:p-10 shadow-xl transition-all duration-500 hover:border-purple-500/30">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500 rounded-full opacity-50" />
            
            <div className="flex items-center gap-4 mb-10">
              <Settings className="w-5 h-5 text-purple-400" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Algoritmo de Incentivo</h3>
            </div>

            {settingsError && (
              <div className="mb-8 p-5 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <p className="text-sm text-red-300 font-medium">{settingsError}</p>
              </div>
            )}

            {settingsSuccess && (
              <div className="mb-8 p-5 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-4 duration-500">
                <Check className="w-5 h-5 text-emerald-500" />
                <p className="text-sm text-emerald-300 font-medium">{settingsSuccess}</p>
              </div>
            )}

            <div className="grid md:grid-cols-2 gap-10">
              {/* Toggle Switch Modernizado */}
              <div className="flex items-center justify-between p-6 rounded-3xl bg-zinc-950/40 border border-zinc-800 shadow-inner group/toggle">
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-1">Activar Protocolos</label>
                  <p className="text-[9px] font-bold text-zinc-600 uppercase italic">Habilitar expansión global</p>
                </div>
                <button
                  onClick={() => setSettings(s => s ? { ...s, activo: !s.activo } : s)}
                  className={`relative w-16 h-8 rounded-full transition-all duration-500 flex items-center p-1 ${
                    settings?.activo ? 'bg-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : 'bg-zinc-800'
                  }`}
                >
                  <div className={`w-6 h-6 bg-white rounded-full transition-transform duration-500 shadow-xl ${
                    settings?.activo ? 'translate-x-8 scale-105' : 'translate-x-0'
                  }`} />
                </button>
              </div>

              {/* Porcentaje Recompensa */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1 flex justify-between">
                  Comisión de Enlace <span>(Receptor)</span>
                </label>
                <div className="relative group/input">
                  <input
                    type="number"
                    value={settings?.porcentaje_recompensa || 0}
                    onChange={(e) => setSettings(s => s ? { ...s, porcentaje_recompensa: parseFloat(e.target.value) || 0 } : s)}
                    className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-xl font-black text-white focus:outline-none focus:border-purple-500/50 transition-all text-center tracking-widest"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-black text-purple-500/40">%</span>
                </div>
              </div>

              {/* Porcentaje Descuento Referido */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1 flex justify-between">
                  Bono de Ingreso <span>(Nuevo Usuario)</span>
                </label>
                <div className="relative group/input">
                  <input
                    type="number"
                    value={settings?.porcentaje_descuento_referido || 0}
                    onChange={(e) => setSettings(s => s ? { ...s, porcentaje_descuento_referido: parseFloat(e.target.value) || 0 } : s)}
                    className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-xl font-black text-white focus:outline-none focus:border-purple-500/50 transition-all text-center tracking-widest"
                  />
                  <span className="absolute right-6 top-1/2 -translate-y-1/2 text-lg font-black text-purple-500/40">%</span>
                </div>
              </div>

              {/* Max Recompensa o similar - Placeholder para diseño simétrico */}
              <div className="space-y-4">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Límite por Operación</label>
                <div className="w-full h-14 rounded-2xl bg-zinc-900/50 border border-dashed border-zinc-800 flex items-center justify-center opacity-30">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] italic text-zinc-600">Protocolo Sin Cap</span>
                </div>
              </div>
            </div>

            <div className="mt-10 space-y-4">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Llamado a la Acción (Frontend)</label>
              <textarea
                value={settings?.mensaje_promocional || ''}
                onChange={(e) => setSettings(s => s ? { ...s, mensaje_promocional: e.target.value } : s)}
                className="w-full rounded-2xl bg-zinc-950/50 border border-zinc-800 p-6 text-sm font-medium text-zinc-400 placeholder-zinc-800 focus:outline-none focus:border-purple-500/50 transition-all resize-none"
                rows={3}
                placeholder="EJ: ¡CONECTA A TUS ALIADOS Y DOMINA LA RED CON BENEFICIOS EXCLUSIVOS!"
              />
            </div>

            <div className="mt-10 pt-8 border-t border-zinc-800/50 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="group relative h-14 px-10 rounded-2xl bg-purple-600 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-purple-500 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] active:scale-95 flex items-center justify-center gap-3 overflow-hidden shadow-xl"
              >
                {savingSettings ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Save className="w-5 h-5 group-hover:rotate-12 transition-transform duration-500" />
                )}
                <span>Sincronizar Arquitectura</span>
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>
          </div>

          {/* Tabla de Usuarios */}
          <div className="rounded-[2.5rem] bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 p-8 md:p-10 shadow-xl overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <DollarSign className="w-5 h-5 text-purple-400" />
                <h3 className="text-xl font-black text-white uppercase tracking-tight">Vectores de Saldo Activos</h3>
              </div>
              <button
                onClick={loadUsuariosConSaldo}
                disabled={loadingUsuariosSaldo}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest text-purple-400 hover:bg-purple-500/20 hover:text-white transition-all active:scale-90 shadow-2xl shadow-purple-500/5"
              >
                <RefreshCw className={`w-4 h-4 transition-transform duration-700 ${loadingUsuariosSaldo ? 'animate-spin' : 'group-hover:rotate-180'}`} />
                Actualizar Registros
              </button>
            </div>

            {loadingUsuariosSaldo ? (
              <div className="py-20 flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-purple-500/10 border-t-purple-500 rounded-full animate-spin mb-4" />
                <p className="text-[9px] font-black text-zinc-700 uppercase tracking-widest">Indexando Datos...</p>
              </div>
            ) : usuariosSaldo.length === 0 ? (
              <div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
                <p className="text-sm font-medium text-zinc-600 italic">No se han detectado usuarios con balances positivos en la red.</p>
              </div>
            ) : (
              <div className="overflow-x-auto -mx-4 px-4 pb-4">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800">
                      <th className="text-left py-4 px-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Identidad / Nodo</th>
                      <th className="text-center py-4 px-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Referral ID</th>
                      <th className="text-right py-4 px-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Saldo Activo</th>
                      <th className="text-right py-4 px-4 text-[9px] font-black text-zinc-500 uppercase tracking-widest">Cosecha Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {usuariosSaldo.map((usuario) => (
                      <tr key={usuario.id} className="group hover:bg-zinc-800/20 transition-all duration-300">
                        <td className="py-5 px-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-500 shadow-inner group-hover:border-purple-500/30 group-hover:text-purple-400 transition-all">
                               {usuario.email.charAt(0).toUpperCase()}
                            </div>
                            <div>
                               <div className="text-xs font-black text-white uppercase tracking-tight group-hover:text-purple-400 transition-colors">{usuario.nombre || usuario.email.split('@')[0]}</div>
                               <div className="text-[10px] font-medium text-zinc-600 mt-0.5">{usuario.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-5 px-4 text-center">
                          <span className="px-3 py-1.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-widest group-hover:bg-purple-500/10 group-hover:border-purple-500/30 group-hover:text-purple-400 transition-all">
                            {usuario.referral_code || '---'}
                          </span>
                        </td>
                        <td className="py-5 px-4 text-right">
                           <div className="text-sm font-black text-emerald-400 tracking-tight">{formatCurrency(usuario.saldo)}</div>
                           <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-0.5 italic">Capital Disponible</div>
                        </td>
                        <td className="py-5 px-4 text-right">
                           <div className="text-sm font-black text-purple-400 tracking-tight">{formatCurrency(usuario.total_earned)}</div>
                           <div className="text-[8px] font-black text-zinc-700 uppercase tracking-widest mt-0.5 italic">Histórico Generado</div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Lado Derecho: Acciones Rápidas */}
        <div className="space-y-10">
          
          <div className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-900 border border-zinc-800 p-8 shadow-xl transition-all duration-500 hover:border-orange-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
            
            <div className="flex items-center gap-4 mb-8">
              <DollarSign className="w-5 h-5 text-orange-400" />
              <h3 className="text-xl font-black text-white uppercase tracking-tight">Ajuste de Capital</h3>
            </div>

            {ajusteError && (
              <div className="mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-500">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-red-300 font-medium">{ajusteError}</p>
              </div>
            )}

            {ajusteSuccess && (
              <div className="mb-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-4 duration-500">
                <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <p className="text-[11px] text-emerald-300 font-medium">{ajusteSuccess}</p>
              </div>
            )}

            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Identidad del Nodo (Email)</label>
                <div className="relative group/field">
                  <input
                    type="email"
                    value={ajusteEmail}
                    onChange={(e) => setAjusteEmail(e.target.value)}
                    placeholder="usuario@dominio.xyz"
                    className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-sm font-bold text-white placeholder-zinc-800 focus:outline-none focus:border-orange-500/50 transition-all shadow-inner"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-orange-500/0 group-focus-within/field:bg-orange-500/[0.02] transition-colors pointer-events-none" />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Monto a Inyectar/Retirar (ARS)</label>
                <input
                  type="number"
                  value={ajusteMonto}
                  onChange={(e) => setAjusteMonto(e.target.value)}
                  placeholder="0.00"
                  className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-xl font-black text-white focus:outline-none focus:border-orange-500/50 transition-all shadow-inner tracking-widest"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Bitácora de Ajuste (Opcional)</label>
                <textarea
                  value={ajusteDescripcion}
                  onChange={(e) => setAjusteDescripcion(e.target.value)}
                  placeholder="MOTIVO DEL AJUSTE MANUAL..."
                  rows={2}
                  className="w-full rounded-2xl bg-zinc-950/50 border border-zinc-800 p-5 text-xs font-medium text-zinc-500 placeholder-zinc-800 focus:outline-none focus:border-orange-500/50 transition-all resize-none shadow-inner uppercase tracking-wider"
                />
              </div>

              <div className="flex flex-col gap-3 pt-2">
                <button
                  onClick={() => handleAjustarSaldo(true)}
                  disabled={ajustando || !ajusteEmail || !ajusteMonto}
                  className="h-14 rounded-2xl bg-zinc-950 border border-emerald-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden shadow-2xl shadow-emerald-500/5 disabled:opacity-30 disabled:hover:bg-zinc-950 disabled:hover:text-emerald-400"
                >
                  {ajustando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-4 h-4" />}
                  <span>Inyectar Saldo</span>
                </button>
                <button
                  onClick={() => handleAjustarSaldo(false)}
                  disabled={ajustando || !ajusteEmail || !ajusteMonto}
                  className="h-14 rounded-2xl bg-zinc-950 border border-red-500/20 text-[10px] font-black uppercase tracking-[0.2em] text-red-400 hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden shadow-2xl shadow-red-500/5 disabled:opacity-30 disabled:hover:bg-zinc-950 disabled:hover:text-red-400"
                >
                  {ajustando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Minus className="w-4 h-4" />}
                  <span>Retirar Saldo</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Info Card */}
          <div className="rounded-[2rem] bg-zinc-950/50 border border-dashed border-zinc-800 p-8 shadow-inner overflow-hidden text-center">
             <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-4">
                <RefreshCw className="w-5 h-5 text-zinc-700" />
             </div>
             <h5 className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-2">Sincronización en Tiempo Real</h5>
             <p className="text-[9px] font-medium text-zinc-600 italic leading-relaxed uppercase">Todos los ajustes de vectores de saldo se reflejan instantáneamente en las wallets de los usuarios en red.</p>
          </div>

        </div>

      </div>
    </div>
  );
}
