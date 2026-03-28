import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, RefreshCw, Sparkles, Clock, ArrowRight, Check } from 'lucide-react';

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

interface CompactHeroControlProps {
  value: Mode;
  onChange: (mode: Mode) => void;
  className?: string;
}

const tabs: Tab[] = [
  {
    value: 'compra',
    label: 'Nueva Cuenta',
    icon: ShoppingCart,
    subtitle: 'Comienza desde cero',
    description: 'Crea una cuenta completamente nueva con todas las funcionalidades premium. Ideal para usuarios nuevos que quieren empezar con una experiencia fresca.',
    badge: 'Popular',
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
    badge: 'Nuevo',
    features: ['Más usuarios', 'Prorrateo justo', 'Sin cambiar fecha']
  }
];

const CompactHeroControl: React.FC<CompactHeroControlProps> = ({ 
  value, 
  onChange, 
  className = ''
}) => {
  const activeTab = tabs.find(tab => tab.value === value) || tabs[0];

  return (
    <div className={`w-full ${className}`}>
      {/* Hero Header Compacto */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-600/10 border border-indigo-500/20 rounded-full mb-4">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-xs font-medium text-indigo-300">
              Selecciona tu modalidad
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3">
            ¿Cómo quieres{' '}
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              acceder?
            </span>
          </h1>
        </motion.div>
      </div>

      {/* Selector de Cards Horizontal */}
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          {tabs.map((tab, index) => {
            const Icon = tab.icon;
            const isActive = value === tab.value;
            
            return (
              <motion.button
                key={tab.value}
                onClick={() => onChange(tab.value)}
                initial={{ opacity: 0, x: index === 0 ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative group text-left p-6 rounded-xl
                  transition-all duration-300
                  ${isActive 
                    ? 'bg-gradient-to-br from-indigo-600 to-purple-600 shadow-xl shadow-indigo-500/25 border border-indigo-400/50' 
                    : 'bg-zinc-900/70 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
                  }
                `}
              >
                {/* Badge */}
                {tab.badge && (
                  <div className="absolute -top-2 -right-2">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs font-bold rounded-full shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      {tab.badge}
                    </span>
                  </div>
                )}

                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 p-3 rounded-lg
                    ${isActive 
                      ? 'bg-white/15' 
                      : 'bg-indigo-600/10 group-hover:bg-indigo-600/15'
                    }
                  `}>
                    <Icon className={`
                      w-6 h-6 
                      ${isActive ? 'text-white' : 'text-indigo-400'}
                    `} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={`
                        text-lg font-bold
                        ${isActive ? 'text-white' : 'text-zinc-100'}
                      `}>
                        {tab.label}
                      </h3>
                      {isActive && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex-shrink-0"
                        >
                          <Check className="w-5 h-5 text-white" />
                        </motion.div>
                      )}
                    </div>
                    
                    <p className={`
                      text-sm font-medium mb-3
                      ${isActive ? 'text-indigo-100' : 'text-indigo-400'}
                    `}>
                      {tab.subtitle}
                    </p>

                    {/* Features compactos */}
                    <div className="flex flex-wrap gap-2">
                      {tab.features.map((feature, idx) => (
                        <span
                          key={idx}
                          className={`
                            inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs
                            ${isActive 
                              ? 'bg-white/10 text-white/90' 
                              : 'bg-zinc-800/50 text-zinc-400'
                            }
                          `}
                        >
                          <div className={`
                            w-1 h-1 rounded-full
                            ${isActive ? 'bg-white' : 'bg-indigo-400'}
                          `} />
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Hover arrow */}
                {!isActive && (
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-indigo-400" />
                  </div>
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Descripción detallada animada */}
        <AnimatePresence mode="wait">
          <motion.div
            key={value}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="p-6 bg-zinc-900/40 border border-zinc-800/50 rounded-xl backdrop-blur-sm">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                {/* Descripción */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    {React.createElement(activeTab.icon, { 
                      className: "w-5 h-5 text-indigo-400" 
                    })}
                    <h4 className="text-sm font-semibold text-white">
                      Sobre esta opción
                    </h4>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">
                    {activeTab.description}
                  </p>
                </div>

                {/* Info rápida */}
                <div className="flex md:flex-col gap-4">
                  <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                    <Clock className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">
                      {value === 'compra' ? '2 min' : 'Instantáneo'}
                      </p>
                      <p className="text-xs text-zinc-500">
                        {value === 'compra' ? 'Setup' : value === 'renovacion' ? 'Activación' : 'Expansión'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 px-4 py-3 bg-zinc-900/50 rounded-lg border border-zinc-800/50">
                    <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-white">
                        100% Seguro
                      </p>
                      <p className="text-xs text-zinc-500">
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

export default CompactHeroControl;
