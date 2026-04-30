import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '@supabase/supabase-js';
import {
  User as UserIcon,
  BadgeCheck,
  AlertTriangle,
  Save,
  Loader2,
  Shield,
  Bell,
} from 'lucide-react';
import { Profile } from '../../../lib/supabase';
import { formatDate } from '../utils';

interface SettingsSectionProps {
  user: User;
  profile: Profile | null;
  onUpdateProfile: (data: { nombre?: string; telefono?: string }) => Promise<any>;
}

export function SettingsSection({ user, profile, onUpdateProfile }: SettingsSectionProps) {
  const [nombre, setNombre] = useState(profile?.nombre || '');
  const [telefono, setTelefono] = useState(profile?.telefono || '');
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const emailVerificado = !!user.email_confirmed_at;

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      await onUpdateProfile({ nombre, telefono });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error guardando:', error);
    }
    setSaving(false);
  };

  const hasChanges = nombre !== (profile?.nombre || '') || telefono !== (profile?.telefono || '');

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 gap-6">
        {/* Información Personal */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-900/40 backdrop-blur-md rounded-[2rem] border border-zinc-800/80 overflow-hidden"
        >
          <div className="px-8 py-6 border-b border-zinc-800/50 bg-zinc-800/20">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-500">
                <UserIcon className="w-5 h-5" />
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Información Personal</h3>
            </div>
          </div>
          
          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Nombre */}
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  placeholder="Tu nombre"
                  className="w-full px-5 py-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-medium"
                />
              </div>

              {/* Teléfono */}
              <div>
                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  value={telefono}
                  onChange={(e) => setTelefono(e.target.value)}
                  placeholder="+54 11 1234-5678"
                  className="w-full px-5 py-4 bg-zinc-950/50 border border-zinc-800 rounded-2xl text-white placeholder:text-zinc-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/50 transition-all font-medium"
                />
              </div>
            </div>

            {/* Email (solo lectura) */}
            <div>
              <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 px-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={user.email || ''}
                  disabled
                  className="w-full px-5 py-4 bg-zinc-950/30 border border-zinc-900 rounded-2xl text-zinc-500 cursor-not-allowed font-medium"
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2">
                  {emailVerificado ? (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-500 px-3 py-1.5 rounded-xl border border-emerald-500/20">
                      <BadgeCheck className="w-3.5 h-3.5" />
                      Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-500 px-3 py-1.5 rounded-xl border border-yellow-500/20">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      Pendiente
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-zinc-800/50">
              <p className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                Miembro desde: <span className="text-zinc-400 ml-1">{formatDate(user.created_at)}</span>
              </p>

              {hasChanges && (
                <div className="flex items-center gap-4">
                  {success && (
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest animate-in fade-in slide-in-from-right-2">
                      ✓ Guardado
                    </span>
                  )}
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-800 text-white px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-orange-500/20"
                  >
                    {saving ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Save className="w-3.5 h-3.5" />
                    )}
                    Guardar Cambios
                  </button>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Seguridad & Notificaciones Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Seguridad */}
            <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-zinc-900/40 backdrop-blur-md rounded-[2rem] border border-zinc-800/80 overflow-hidden flex flex-col"
            >
                <div className="px-8 py-5 border-b border-zinc-800/50 bg-zinc-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-500">
                            <Shield className="w-4 h-4" />
                        </div>
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Seguridad</h3>
                    </div>
                </div>
                <div className="p-8 flex-1 flex flex-col justify-center">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-black text-white uppercase tracking-tight">Estado de la cuenta</p>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                                {emailVerificado ? 'Verificación completada' : 'Falta verificar email'}
                            </p>
                        </div>
                        {emailVerificado ? (
                            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                                <BadgeCheck className="w-6 h-6" />
                            </div>
                        ) : (
                            <button className="bg-zinc-950 border border-zinc-800 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-900 transition-colors">
                                Verificar
                            </button>
                        )}
                    </div>
                </div>
            </motion.div>

            {/* Notificaciones */}
            <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-zinc-900/40 backdrop-blur-md rounded-[2rem] border border-zinc-800/80 overflow-hidden"
            >
                <div className="px-8 py-5 border-b border-zinc-800/50 bg-zinc-800/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-zinc-950 border border-zinc-800 text-orange-500">
                            <Bell className="w-4 h-4" />
                        </div>
                        <h3 className="text-[11px] font-black text-white uppercase tracking-widest">Preferencias</h3>
                    </div>
                </div>
                <div className="p-8 space-y-5">
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Avisos por Email</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Alertas de Expiración</span>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" defaultChecked className="sr-only peer" />
                            <div className="w-10 h-5 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-orange-500 peer-checked:after:bg-white"></div>
                        </label>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>
    </div>
  );
}
