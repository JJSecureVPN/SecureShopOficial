import { User } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import {
  Loader2,
  LogOut,
  Edit2,
  Save,
  X,
  Wallet,
  BadgeCheck,
  Mail,
} from 'lucide-react';
import { Button } from '../../../components/Button';
import { Profile } from '../../../lib/supabase';
import { formatDate, formatCurrency } from '../utils';

interface ProfileSidebarProps {
  user: User;
  profile: Profile | null;
  isEditing: boolean;
  editedNombre: string;
  editedTelefono: string;
  saving: boolean;
  emailVerificado: boolean;
  onEditedNombreChange: (value: string) => void;
  onEditedTelefonoChange: (value: string) => void;
  onSaveProfile: () => void;
  onCancelEdit: () => void;
  onStartEdit: () => void;
  onSignOut: () => void;
}

export function ProfileSidebar({
  user,
  profile,
  isEditing,
  editedNombre,
  editedTelefono,
  saving,
  emailVerificado,
  onEditedNombreChange,
  onEditedTelefonoChange,
  onSaveProfile,
  onCancelEdit,
  onStartEdit,
  onSignOut,
}: ProfileSidebarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="space-y-4">
        {/* Card de Perfil */}
        <div className="bg-zinc-900/50 backdrop-blur-sm border border-zinc-700 rounded-2xl p-6 shadow-sm">
          {/* Badge */}
          <p className="text-[10px] uppercase tracking-[0.2em] text-orange-400 font-semibold mb-4 text-center">
            Mi cuenta
          </p>
          
          {/* Avatar - Mostrar imagen de Google si está disponible */}
          {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
            <img
              src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
              alt="Avatar"
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full mx-auto mb-4 object-cover border-4 border-orange-500/30"
            />
          ) : (
            <div 
              className="w-20 h-20 lg:w-24 lg:h-24 rounded-full flex items-center justify-center text-3xl lg:text-4xl font-bold text-white mx-auto mb-4 bg-gradient-to-br from-orange-500 to-orange-700"
            >
              {(profile?.nombre || user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
            </div>
          )}

          {/* Badge Email Verificado */}
          <div className="flex justify-center mb-4">
            {emailVerificado ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                <BadgeCheck className="w-3.5 h-3.5" />
                Email verificado
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-medium">
                <Mail className="w-3.5 h-3.5" />
                Pendiente verificación
              </div>
            )}
          </div>

          {/* Nombre y Email */}
          {isEditing ? (
            <div className="space-y-3">
              <input
                type="text"
                value={editedNombre}
                onChange={(e) => onEditedNombreChange(e.target.value)}
                placeholder="Tu nombre"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-sm text-white"
              />
              <input
                type="tel"
                value={editedTelefono}
                onChange={(e) => onEditedTelefonoChange(e.target.value)}
                placeholder="Teléfono (opcional)"
                className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-center text-sm text-white"
              />
              <div className="flex gap-2 justify-center">
                <Button
                  onClick={onSaveProfile}
                  disabled={saving}
                  variant="primary"
                  size="sm"
                >
                  {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                  Guardar
                </Button>
                <Button
                  onClick={onCancelEdit}
                  variant="secondary"
                  size="sm"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </Button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">
                {profile?.nombre || 'Usuario'}
              </h2>
              <p className="text-sm mt-1 text-zinc-400">
                {user.email}
              </p>
              <p className="text-xs mt-2 text-zinc-500">
                Miembro desde {formatDate(user.created_at)}
              </p>

              {/* Botón Editar */}
              <button
                onClick={onStartEdit}
                className="mt-4 text-sm text-orange-400 hover:text-orange-300 flex items-center gap-1.5 mx-auto transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                Editar perfil
              </button>
            </div>
          )}
        </div>

        {/* Card de Saldo */}
        {(profile?.saldo ?? 0) > 0 && (
          <div className="bg-gradient-to-br from-orange-600 to-orange-800 rounded-2xl p-5 text-white shadow-lg">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 opacity-80" />
              <span className="text-sm opacity-80">Saldo disponible</span>
            </div>
            <div className="text-2xl font-bold">
              {formatCurrency(profile?.saldo || 0)}
            </div>
            <p className="text-xs opacity-70 mt-1">Para tus próximas compras</p>
          </div>
        )}

        {/* Botón Cerrar Sesión */}
        <Button
          onClick={onSignOut}
          variant="danger"
          size="md"
          className="w-full"
        >
          <LogOut className="w-4 h-4" />
          Cerrar sesión
        </Button>
      </div>
    </motion.div>
  );
}
