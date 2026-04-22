import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, RefreshCw, Sparkles, Clock, Check } from 'lucide-react';

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
  showExpansion?: boolean;
}

const tabs: Tab[] = [
  {
    value: 'compra',
    label: 'Nueva cuenta',
    icon: ShoppingCart,
    description: 'Crea una cuenta nueva con todas las funcionalidades premium desde cero',
    badge: ''
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
  descriptions = {},
  showExpansion = true
}) => {
  const filteredTabs = showExpansion ? tabs : tabs.filter(t => t.value !== 'expansion');

  const finalTabs = filteredTabs.map(tab => ({
    ...tab,
    description: descriptions?.[tab.value] ?? tab.description,
  }));

  const activeIndex = finalTabs.findIndex(tab => tab.value === value);
  const activeTab = finalTabs[activeIndex] || finalTabs[0];

  return (
    <div className={`space-y-6 font-title ${className}`}>
      {/* Control principal */}
      <div className="relative mx-auto max-w-2xl mt-6 px-1">
        <div className="relative rounded-2xl bg-[#060606] border border-zinc-800/80 p-1.5 shadow-2xl">
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
                    relative flex-1 flex flex-col items-center justify-center
                    py-3.5 px-2 rounded-xl
                    transition-all duration-300
                    ${isActive
                      ? 'text-white'
                      : 'text-zinc-600 hover:text-zinc-400'
                    }
                  `}
                  aria-pressed={isActive}
                >
                  {/* Indicador de fondo animado (layoutId) */}
                  {isActive && (
                    <motion.div
                      layoutId="segmented-indicator"
                      className="absolute inset-0 bg-[#1e1f26] border border-zinc-700/50 rounded-xl shadow-[0_10px_20px_rgba(0,0,0,0.4)]"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                        mass: 0.8
                      }}
                    />
                  )}

                  {/* Content */}
                  <div className="relative z-20 flex flex-col items-center gap-1.5">
                    <Icon
                      className={`w-4 h-4 transition-all duration-300 ${isActive ? 'text-[#00ffc8] scale-110' : 'text-zinc-700 group-hover:text-zinc-500'
                        }`}
                    />
                    <span className={`text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${isActive ? 'text-white' : 'text-zinc-700'}`}>
                      {tab.label.split(' ')[0]}
                    </span>
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
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.25 }}
            className="mx-auto max-w-2xl overflow-hidden px-1"
          >
            <div className="relative rounded-2xl bg-[#131417] border border-zinc-800/80 p-6 shadow-xl">
              <div className="relative space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      {React.createElement(activeTab.icon, {
                        className: "w-4 h-4 text-zinc-500"
                      })}
                    </div>
                    <div className="space-y-0.5">
                      <h3 className="text-sm font-black text-white tracking-tight uppercase">
                        {activeTab.label}
                      </h3>
                      {activeTab.badge && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-white text-black text-[9px] font-black rounded-full uppercase tracking-tighter">
                          {activeTab.badge}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#00ffc8]/5 border border-[#00ffc8]/10 flex items-center justify-center">
                    <Check className="w-4 h-4 text-[#00ffc8]/60" />
                  </div>
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed font-medium">
                  {activeTab.description}
                </p>

                {/* Info adicional */}
                <div className="flex items-center gap-3 pt-3 border-t border-zinc-800/50">
                  <div className="p-1.5 rounded-md bg-[#060606] border border-zinc-800/50">
                    <Clock className="w-3 h-3 text-zinc-600" />
                  </div>
                  <span className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.15em]">
                    {value === 'compra'
                      ? 'Configuración en 2 min'
                      : value === 'renovacion'
                        ? 'Activación instantánea'
                        : 'Expansión inmediata'
                    }
                  </span>
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