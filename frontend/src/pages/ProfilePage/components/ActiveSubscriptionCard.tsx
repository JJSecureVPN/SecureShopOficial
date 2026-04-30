import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Shield, Wifi, RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '../../../components/Button';
import { PurchaseHistory } from '../../../lib/supabase';
import { calcularDiasRestantes } from '../utils';

interface ActiveSubscriptionCardProps {
  suscripcion: PurchaseHistory;
}

export function ActiveSubscriptionCard({ suscripcion }: ActiveSubscriptionCardProps) {
  const navigate = useNavigate();
  const diasRestantes = calcularDiasRestantes(suscripcion.servex_expiracion!);

  const handleRenovar = () => {
    // Navegar a la página correcta según el tipo de cuenta
    const username = suscripcion.servex_username || '';
    const esRevendedor = suscripcion.tipo === 'revendedor';
    
    // Revendedores van a /revendedores, clientes van a /planes
    const ruta = esRevendedor ? '/revendedores' : '/planes';
    navigate(`${ruta}?cuenta=${encodeURIComponent(username)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.03 }}
    >
      <div className="bg-[#1a1a1a] border border-orange-500/30 rounded-2xl p-6 text-white shadow-lg hover:border-orange-500/50 transition-all duration-300">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/20">
              {suscripcion.tipo === 'revendedor' ? (
                <Shield className="w-7 h-7 text-white" />
              ) : (
                <Wifi className="w-7 h-7 text-white" />
              )}
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-400">Tu plan activo</p>
              <h3 className="text-xl font-bold text-white">{suscripcion.plan_nombre}</h3>
              <p className="text-sm text-gray-300">Usuario: <span className="text-orange-400 font-medium">{suscripcion.servex_username}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className={`text-3xl font-bold ${diasRestantes <= 7 ? 'text-orange-400' : 'text-white'}`}>
                {diasRestantes}
              </div>
              <div className="text-xs text-gray-400">días restantes</div>
            </div>
            <Button
              onClick={handleRenovar}
              variant="secondary"
              size="md"
              className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 border-0 text-white shadow-lg shadow-orange-500/20"
            >
              <RefreshCw className="w-4 h-4" />
              Renovar
            </Button>
          </div>
        </div>
        {diasRestantes <= 7 && (
          <div className="mt-4 pt-4 border-t border-orange-500/20 flex items-center gap-2 text-orange-400 text-sm bg-orange-500/5 -mx-6 -mb-6 px-6 py-4 rounded-b-2xl">
            <AlertTriangle className="w-4 h-4" />
            Tu suscripción está por vencer. ¡Renueva ahora para no perder acceso!
          </div>
        )}
      </div>
    </motion.div>
  );
}
