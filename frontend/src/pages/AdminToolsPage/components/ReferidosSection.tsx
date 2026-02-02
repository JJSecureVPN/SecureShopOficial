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
      setSettingsError('Error cargando configuración');
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

      setSettingsSuccess('Configuración guardada correctamente');
      setTimeout(() => setSettingsSuccess(null), 3000);
    } catch (error: any) {
      setSettingsError(error.message || 'Error guardando configuración');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleAjustarSaldo = async (esPositivo: boolean) => {
    if (!ajusteEmail || !ajusteMonto) {
      setAjusteError('Email y monto son requeridos');
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
        ajusteDescripcion || `Ajuste manual por admin: ${esPositivo ? '+' : '-'}$${Math.abs(montoNumerico)}`
      );

      if (result.success) {
        setAjusteSuccess(`Saldo ajustado. Nuevo saldo: $${result.nuevo_saldo?.toFixed(2)}`);
        setAjusteEmail('');
        setAjusteMonto('');
        setAjusteDescripcion('');
        // Recargar la lista de usuarios con saldo después del ajuste
        await loadUsuariosConSaldo();
        setTimeout(() => setAjusteSuccess(null), 3000);
      } else {
        setAjusteError(result.mensaje);
      }
    } catch (error: any) {
      setAjusteError(error.message || 'Error ajustando saldo');
    } finally {
      setAjustando(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loadingSettings) {
    return (
      <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 p-8">
        <div className="flex items-center justify-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          <span className="text-neutral-400">Cargando configuración de referidos...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-purple-500/20 rounded-lg">
          <Gift className="w-6 h-6 text-purple-400" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-white">Programa de Referidos</h2>
          <p className="text-sm text-neutral-400">Configura el sistema de referidos y saldo</p>
        </div>
      </div>

      {/* Configuración */}
      <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Settings className="w-5 h-5 text-neutral-400" />
          <h3 className="font-semibold text-white">Configuración General</h3>
        </div>

        {settingsError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {settingsError}
          </div>
        )}

        {settingsSuccess && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400">
            <Check className="w-5 h-5" />
            {settingsSuccess}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {/* Programa activo */}
          <div className="flex items-center justify-between p-4 bg-neutral-700/50 rounded-lg">
            <div>
              <label className="font-medium text-white">Programa Activo</label>
              <p className="text-sm text-neutral-400">Habilitar o deshabilitar el programa</p>
            </div>
            <button
              onClick={() => setSettings(s => s ? { ...s, activo: !s.activo } : s)}
              className={`relative w-14 h-7 rounded-full transition-colors ${
                settings?.activo ? 'bg-purple-600' : 'bg-neutral-600'
              }`}
            >
              <span
                className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                  settings?.activo ? 'left-8' : 'left-1'
                }`}
              />
            </button>
          </div>

          {/* Porcentaje de recompensa */}
          <div className="p-4 bg-neutral-700/50 rounded-lg">
            <label className="font-medium text-white block mb-2">
              Comisión por Referido (%)
            </label>
            <p className="text-sm text-neutral-400 mb-2">
              Porcentaje que recibe quien refiere
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings?.porcentaje_recompensa || 0}
                onChange={(e) => setSettings(s => s ? { ...s, porcentaje_recompensa: parseFloat(e.target.value) || 0 } : s)}
                className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                min="0"
                max="100"
                step="1"
              />
              <span className="text-neutral-400 font-medium">%</span>
            </div>
          </div>

          {/* Descuento para referido */}
          <div className="p-4 bg-neutral-700/50 rounded-lg">
            <label className="font-medium text-white block mb-2">
              Descuento para Nuevos Usuarios (%)
            </label>
            <p className="text-sm text-neutral-400 mb-2">
              Descuento que recibe quien usa el código
            </p>
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={settings?.porcentaje_descuento_referido || 0}
                onChange={(e) => setSettings(s => s ? { ...s, porcentaje_descuento_referido: parseFloat(e.target.value) || 0 } : s)}
                className="w-24 px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white"
                min="0"
                max="100"
                step="1"
              />
              <span className="text-neutral-400 font-medium">%</span>
            </div>
          </div>

          {/* Mensaje promocional */}
          <div className="p-4 bg-neutral-700/50 rounded-lg md:col-span-2">
            <label className="font-medium text-white block mb-2">
              Mensaje Promocional
            </label>
            <textarea
              value={settings?.mensaje_promocional || ''}
              onChange={(e) => setSettings(s => s ? { ...s, mensaje_promocional: e.target.value } : s)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 resize-none text-white placeholder-neutral-500"
              rows={2}
              placeholder="Mensaje que verán los usuarios en su perfil..."
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSaveSettings}
            disabled={savingSettings}
            className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
          >
            {savingSettings ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Configuración
          </button>
        </div>
      </div>

      {/* Ajustar saldo manualmente */}
      <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-neutral-400" />
          <h3 className="font-semibold text-white">Ajustar Saldo de Usuario</h3>
        </div>

        {ajusteError && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400">
            <AlertCircle className="w-5 h-5" />
            {ajusteError}
          </div>
        )}

        {ajusteSuccess && (
          <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400">
            <Check className="w-5 h-5" />
            {ajusteSuccess}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Email del usuario
            </label>
            <input
              type="email"
              value={ajusteEmail}
              onChange={(e) => setAjusteEmail(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-neutral-500"
              placeholder="usuario@email.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Monto (ARS)
            </label>
            <input
              type="number"
              value={ajusteMonto}
              onChange={(e) => setAjusteMonto(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-neutral-500"
              placeholder="1000"
              min="0"
              step="100"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">
              Descripción (opcional)
            </label>
            <input
              type="text"
              value={ajusteDescripcion}
              onChange={(e) => setAjusteDescripcion(e.target.value)}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-600 rounded-lg focus:ring-2 focus:ring-purple-500 text-white placeholder-neutral-500"
              placeholder="Motivo del ajuste..."
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => handleAjustarSaldo(true)}
            disabled={ajustando || !ajusteEmail || !ajusteMonto}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            {ajustando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            Agregar Saldo
          </button>
          <button
            onClick={() => handleAjustarSaldo(false)}
            disabled={ajustando || !ajusteEmail || !ajusteMonto}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            {ajustando ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Minus className="w-4 h-4" />
            )}
            Quitar Saldo
          </button>
        </div>
      </div>

      {/* Usuarios con Saldo */}
      <div className="bg-neutral-800/50 rounded-xl border border-neutral-700 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-neutral-400" />
            <h3 className="font-semibold text-white">Usuarios con Saldo</h3>
          </div>
          <button
            onClick={loadUsuariosConSaldo}
            disabled={loadingUsuariosSaldo}
            className="flex items-center gap-1 px-3 py-1 text-sm text-purple-400 hover:bg-purple-500/20 rounded-lg transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loadingUsuariosSaldo ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>

        {loadingUsuariosSaldo ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : usuariosSaldo.length === 0 ? (
          <div className="text-center py-8 text-neutral-500">
            No hay usuarios con saldo
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-700">
                  <th className="text-left py-3 px-2 font-medium text-neutral-400">Usuario</th>
                  <th className="text-left py-3 px-2 font-medium text-neutral-400">Email</th>
                  <th className="text-right py-3 px-2 font-medium text-neutral-400">Saldo Actual</th>
                  <th className="text-right py-3 px-2 font-medium text-neutral-400">Total Ganado</th>
                  <th className="text-center py-3 px-2 font-medium text-neutral-400">Código</th>
                  <th className="text-right py-3 px-2 font-medium text-neutral-400">Registro</th>
                </tr>
              </thead>
              <tbody>
                {usuariosSaldo.map((usuario) => (
                  <tr key={usuario.id} className="border-b border-neutral-700/50 hover:bg-neutral-700/30">
                    <td className="py-3 px-2">
                      <div className="font-medium text-white">
                        {usuario.nombre || usuario.email?.split('@')[0] || 'N/A'}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <div className="font-medium text-white">{usuario.email}</div>
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-green-400">
                      {formatCurrency(usuario.saldo)}
                    </td>
                    <td className="py-3 px-2 text-right font-medium text-blue-400">
                      {formatCurrency(usuario.total_earned)}
                    </td>
                    <td className="py-3 px-2 text-center">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-400">
                        {usuario.referral_code || 'N/A'}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-right text-neutral-400">
                      {formatDate(usuario.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
