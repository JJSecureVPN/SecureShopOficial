import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, RefreshCw, Sparkles, Clock } from 'lucide-react';

type Mode = 'compra' | 'renovacion' | 'expansion';

interface Tab {
  value: Mode;
  label: string;
  icon: React.ElementType;
  description: string;
  badge?: string;
}

interface SegmentedControlProps {
  value: Mode;
  onChange: (mode: Mode) => void;
  className?: string;
  showDescriptions?: boolean;
  descriptions?: Partial<Record<Mode, string>>;
}

const tabs: Tab[] = [
  {
    value: 'compra',
    label: 'Nueva cuenta',
    icon: ShoppingCart,
    description: 'Crea una cuenta nueva con todas las funcionalidades premium desde cero',
    badge: 'Popular'
  },
  {
    value: 'renovacion',
    label: 'Renovar cuenta',
    icon: RefreshCw,
    description: 'Extiende tu suscripción actual y mantén todos tus datos y configuraciones',
    badge: ''
  },
  {
    value: 'expansion',
    label: 'Expandir usuarios',
    icon: Sparkles,
    description: 'Aumenta el límite de usuarios de tu cuenta de forma inmediata',
    badge: ''
  }
];

const SegmentedControl: React.FC<SegmentedControlProps> = ({ 
  value, 
  onChange, 
  className = '',
  showDescriptions = true,
  descriptions = {}
}) => {
  const finalTabs = tabs.map(tab => ({
    ...tab,
    description: descriptions?.[tab.value] ?? tab.description,
  }));

  const activeIndex = finalTabs.findIndex(tab => tab.value === value);
  const activeTab = finalTabs[activeIndex];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Control principal */}
      <div className="relative mx-auto max-w-2xl">
        <div className="relative rounded-2xl bg-gradient-to-b from-zinc-800/90 to-zinc-900/90 border border-zinc-700/50 p-1.5 shadow-xl backdrop-blur-sm overflow-hidden">
          {/* Tabs */}
          <div className="relative z-10 flex flex-col sm:flex-row items-stretch gap-1">
            {finalTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = value === tab.value;
              
              return (
                <button
                  key={tab.value}
                  onClick={() => onChange(tab.value)}
                  className={`
                    relative flex-1 flex items-center justify-center
                    py-3 px-4 rounded-xl
                    font-semibold text-sm
                    transition-all duration-200
                    ${isActive 
                      ? 'text-white' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50'
                    }
                  `}
                  aria-pressed={isActive}
                  aria-label={`${tab.label}: ${tab.description}`}
                >
                  {/* Indicador de fondo animado (layoutId) */}
                  {isActive && (
                    <motion.div
                      layoutId="segmented-indicator"
                      className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 rounded-xl shadow-lg"
                      transition={{ 
                        type: 'spring', 
                        stiffness: 380, 
                        damping: 32,
                        mass: 0.8
                      }}
                    >
                      {/* Brillo interno */}
                      <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 rounded-xl" />
                    </motion.div>
                  )}

                  {/* Badge */}
                  <div className="relative z-20 flex items-center justify-center gap-2.5">
                    {tab.badge && (
                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0, opacity: 0 }}
                            className="absolute -top-6 -right-2"
                          >
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                              <Sparkles className="w-3 h-3" />
                              {tab.badge}
                            </span>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}

                    {/* Contenido del tab */}
                    <Icon 
                      className={`w-5 h-5 transition-transform ${
                        isActive ? 'scale-110' : 'scale-100'
                      }`}
                    />
                    <span className="whitespace-nowrap">{tab.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Descripción animada */}
      {showDescriptions && (
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 10, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="mx-auto max-w-2xl overflow-hidden mb-6"
          >
            <div className="relative rounded-xl bg-zinc-900/50 border border-zinc-800/50 p-5 backdrop-blur-sm">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-purple-600/5 to-indigo-600/5 rounded-xl" />
              
              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 p-2.5 bg-indigo-600/10 rounded-lg border border-indigo-500/20">
                  {React.createElement(activeTab.icon, { 
                    className: "w-5 h-5 text-indigo-400" 
                  })}
                </div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-white">
                      {activeTab.label}
                    </h3>
                    {activeTab.badge && (
                      <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 text-xs font-medium rounded-full border border-amber-500/20">
                        <Sparkles className="w-3 h-3" />
                        {activeTab.badge}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {activeTab.description}
                  </p>

                  {/* Info adicional según el tipo */}
                  <div className="flex items-center gap-2 pt-2">
                    <Clock className="w-4 h-4 text-zinc-500" />
                    <span className="text-xs text-zinc-500">
                      {value === 'compra' 
                        ? 'Configuración en 2 minutos' 
                        : value === 'renovacion'
                        ? 'Proceso instantáneo'
                        : 'Actualización inmediata'
                      }
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};

export default SegmentedControl;