import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, RefreshCw, Sparkles, Clock } from 'lucide-react';

type Mode = 'compra' | 'renovacion';

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
    <div className={`space-y-3.5 ${className}`}>
      {/* Control principal */}
      <div className="relative mx-auto max-w-2xl">
        <div className="relative rounded-xl bg-zinc-900/60 border border-zinc-800/60 p-1 shadow-sm backdrop-blur-sm">
          {/* Indicador animado */}
          <motion.div
            className="absolute top-1 bottom-1 bg-indigo-600/90 rounded-lg shadow-sm"
            animate={{
              left: activeIndex === 0 ? 4 : 'calc(50% + 4px)',
              right: activeIndex === 0 ? 'calc(50% + 4px)' : 4
            }}
            transition={{ 
              type: 'spring', 
              stiffness: 320, 
              damping: 30,
              mass: 0.6
            }}
            style={{ width: 'calc(50% - 8px)' }}
          >
            {/* Brillo sutil */}
            <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/5 rounded-lg" />
          </motion.div>

          {/* Tabs */}
          <div className="relative z-10 flex items-stretch gap-1">
            {finalTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = value === tab.value;
              
              return (
                <button
                  key={tab.value}
                  onClick={() => onChange(tab.value)}
                  className={`
                    relative flex-1 flex items-center justify-center
                    py-2.5 px-4 rounded-lg
                    font-medium text-sm
                    transition-all duration-200
                    ${isActive 
                      ? 'text-white' 
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/40'
                    }
                  `}
                  aria-pressed={isActive}
                  aria-label={`${tab.label}: ${tab.description}`}
                >
                  {/* Badge */}
                  {tab.badge && (
                    <AnimatePresence>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="absolute -top-1 -right-1"
                        >
                          <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/90 text-white text-[10px] font-medium rounded-md shadow-sm">
                            <Sparkles className="w-2.5 h-2.5" />
                            {tab.badge}
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {/* Contenido del tab */}
                  <div className="flex items-center justify-center gap-2">
                    <Icon 
                      className={`w-4 h-4 transition-transform ${
                        isActive ? 'scale-105' : 'scale-100'
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
            initial={{ opacity: 0, y: -8, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: 8, height: 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-2xl overflow-hidden"
          >
            <div className="relative rounded-lg bg-zinc-900/30 border border-zinc-800/40 p-4 backdrop-blur-sm">
              {/* Glow sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/3 via-purple-600/3 to-indigo-600/3 rounded-lg" />
              
              <div className="relative flex items-start gap-3">
                <div className="flex-shrink-0 p-2 bg-indigo-600/8 rounded-lg border border-indigo-500/15">
                  {React.createElement(activeTab.icon, { 
                    className: "w-4 h-4 text-indigo-400/90" 
                  })}
                </div>
                
                <div className="flex-1 space-y-1.5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-white/95">
                      {activeTab.label}
                    </h3>
                    {activeTab.badge && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 bg-orange-500/8 text-orange-400/90 text-[10px] font-medium rounded border border-orange-500/15">
                        <Sparkles className="w-2.5 h-2.5" />
                        {activeTab.badge}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-[13px] text-zinc-400/90 leading-relaxed">
                    {activeTab.description}
                  </p>

                  {/* Info adicional según el tipo */}
                  <div className="flex items-center gap-1.5 pt-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-500/70" />
                    <span className="text-xs text-zinc-500/80">
                      {value === 'compra' 
                        ? 'Configuración en 2 minutos' 
                        : 'Proceso instantáneo'
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