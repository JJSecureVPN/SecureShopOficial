import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, RefreshCw, Sparkles, Clock, Check } from 'lucide-react';

type Mode = 'compra' | 'renovacion' | 'expansion';

interface Tab {
  value: Mode;
  label: string;
  icon: React.ElementType;
  subtitle: string;
  description: string;
  badge?: string;
  features: string[];
}

const tabs: Tab[] = [
  {
    value: 'compra',
    label: 'Nueva Cuenta',
    icon: ShoppingCart,
    subtitle: 'Comienza desde cero',
    description: 'Crea una cuenta completamente nueva con todas las funcionalidades premium. Ideal para usuarios nuevos que quieren empezar con una experiencia fresca.',
    badge: '',
    features: ['Cuenta limpia', 'Setup personalizado', 'Activación instantánea']
  },
  {
    value: 'renovacion',
    label: 'Renovar Cuenta',
    icon: RefreshCw,
    subtitle: 'Extiende tu suscripción',
    description: 'Mantén todos tus datos, configuraciones y preferencias. Perfecto para usuarios existentes que desean continuar sin interrupciones.',
    badge: '',
    features: ['Mantén tu historial', 'Sin reconfiguraciones', 'Proceso inmediato']
  },
  {
    value: 'expansion',
    label: 'Expandir Usuarios',
    icon: Sparkles,
    subtitle: 'Aumenta tus cupos',
    description: 'Agrega más usuarios a tu suscripción actual de forma inmediata. El costo se prorratea por los días que te quedan.',
    badge: '',
    features: ['Más usuarios', 'Prorrateo justo', 'Sin cambiar fecha']
  }
];

const CompactHeroControl: React.FC<CompactHeroControlProps> = ({
  value,
  onChange,
  className = '',
  showExpansion = true
}) => {
  const filteredTabs = showExpansion ? tabs : tabs.filter(t => t.value !== 'expansion');
  const activeTab = filteredTabs.find(tab => tab.value === value) || filteredTabs[0];

  return (
    <div className={`w-full font-title ${className}`}>
      {/* Hero Header Compacto */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/10 rounded-full mb-6">
            <Sparkles className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Selecciona tu modalidad
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-4">
            ¿Cómo quieres{' '}
            <span className="text-zinc-500">
              acceder?
            </span>
          </h1>
        </motion.div>
      </div>

      {/* Selector de Cards Horizontal */}
      <div className="max-w-6xl mx-auto px-4">
        <div className={`grid ${showExpansion ? 'md:grid-cols-3' : 'md:grid-cols-2 max-w-4xl mx-auto'} gap-5 mb-8`}>
          {filteredTabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = value === tab.value;

            return (
              <motion.button
                key={tab.value}
                onClick={() => onChange(tab.value)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className={`
                  relative group text-left p-8 rounded-3xl
                  transition-all duration-300 border
                  ${isActive
                    ? 'bg-[#1e1f26] shadow-2xl shadow-black/50 border-zinc-600'
                    : 'bg-[#131417] border-zinc-800/80 hover:border-zinc-700'
                  }
                `}
              >
                {/* Badge */}
                {tab.badge && (
                  <div className="absolute -top-2 -right-2">
                    <span className="flex items-center gap-1 px-3 py-1 bg-white text-black text-[10px] font-black rounded-full shadow-lg uppercase tracking-tighter">
                      {tab.badge}
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Icon & Title Area */}
                  <div className="flex items-center justify-between">
                    <div className={`
                      p-3 rounded-xl border transition-colors
                      ${isActive
                        ? 'bg-white/5 border-white/10'
                        : 'bg-[#0d0d0f] border-zinc-800/50 group-hover:border-zinc-700'
                      }
                    `}>
                      <Icon className={`
                        w-6 h-6 
                        ${isActive ? 'text-white' : 'text-zinc-500 group-hover:text-white'}
                      `} />
                    </div>
                    {isActive && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="w-7 h-7 rounded-full bg-[#00ffc8]/10 border border-[#00ffc8]/20 flex items-center justify-center shadow-[0_0_15px_rgba(0,255,200,0.1)]"
                      >
                        <Check className="w-4 h-4 text-[#00ffc8]" />
                      </motion.div>
                    )}
                  </div>

                  {/* Text Content */}
                  <div>
                    <h3 className={`
                      text-xl font-black tracking-tight mb-1 transition-colors
                      ${isActive ? 'text-white' : 'text-zinc-400 group-hover:text-white'}
                    `}>
                      {tab.label}
                    </h3>
                    <p className={`
                      text-sm font-bold uppercase tracking-widest transition-colors
                      ${isActive ? 'text-zinc-400' : 'text-zinc-600'}
                    `}>
                      {tab.subtitle}
                    </p>
                  </div>

                  {/* Features compactos */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    {tab.features.map((feature, idx) => (
                      <span
                        key={idx}
                        className={`
                          inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-tighter transition-colors border
                          ${isActive
                            ? 'bg-white/5 text-zinc-300 border-white/5'
                            : 'bg-[#0d0d0f] text-zinc-600 border-zinc-800/50'
                          }
                        `}
                      >
                        <div className={`
                          w-1 h-1 rounded-full
                          ${isActive ? 'bg-[#00ffc8]' : 'bg-zinc-700'}
                        `} />
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Descripción detallada animada */}
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="p-8 bg-[#131417] border border-zinc-800/80 rounded-3xl">
              <div className="flex flex-col md:flex-row md:items-start gap-8">
                {/* Descripción */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-white/5 border border-white/10">
                      {React.createElement(activeTab.icon, {
                        className: "w-4 h-4 text-white/60"
                      })}
                    </div>
                    <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-[0.2em]">
                      Sobre esta opción
                    </h4>
                  </div>
                  <p className="text-base text-zinc-300 leading-relaxed max-w-2xl">
                    {activeTab.description}
                  </p>
                </div>

                {/* Info rápida */}
                <div className="flex md:flex-col gap-4 min-w-[200px]">
                  <div className="flex items-center gap-4 px-5 py-4 bg-[#0d0d0f] rounded-2xl border border-zinc-800/80">
                    <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                      <Clock className="w-5 h-5 text-zinc-500" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">
                        {value === 'compra' ? '2 min' : 'Instantáneo'}
                      </p>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        {value === 'compra' ? 'Setup' : value === 'renovacion' ? 'Activación' : 'Expansión'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 px-5 py-4 bg-[#0d0d0f] rounded-2xl border border-zinc-800/80">
                    <div className="w-10 h-10 rounded-full bg-[#00ffc8]/5 flex items-center justify-center border border-[#00ffc8]/10">
                      <Check className="w-5 h-5 text-[#00ffc8]/60" />
                    </div>
                    <div>
                      <p className="text-sm font-black text-white">
                        100% Seguro
                      </p>
                      <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest">
                        Garantizado
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

interface CompactHeroControlProps {
  value: Mode;
  onChange: (mode: Mode) => void;
  className?: string;
  showExpansion?: boolean;
}

export default CompactHeroControl;
