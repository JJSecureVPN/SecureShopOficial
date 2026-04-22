import React from 'react';
import { Sparkles, ArrowRight, Megaphone } from 'lucide-react';
import { motion } from 'framer-motion';

interface AdBannerProps {
  variant?: 'horizontal' | 'grid-item';
  className?: string;
  title?: string;
  description?: string;
  ctaText?: string;
}

const AdBanner: React.FC<AdBannerProps> = ({
  variant = 'horizontal',
  className = '',
  title = 'Publicite Aquí',
  description = 'Posiciona tu marca ante miles de usuarios activos en toda la región. Espacio disponible para patrocinio premium.',
  ctaText = 'Contactar',
}) => {
  const isHorizontal = variant === 'horizontal';
  const whatsappLink = "https://wa.me/5493812531123?text=Hola,%20me%20interesa%20publicitar%20en%20JJSecure%20VPN";

  const containerStyles = isHorizontal
    ? 'flex flex-col md:flex-row items-center justify-between p-6 md:p-8 gap-6'
    : 'flex flex-col p-6 gap-4 h-full';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`
        relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900
        group hover:border-orange-500/40 transition-all duration-300
        ${className}
      `}
    >
      {/* Optimized Background Glows (Radial Gradients instead of heavy blurs) */}
      <div 
        className="absolute -top-24 -right-24 w-64 h-64 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity duration-500"
        style={{
          background: 'radial-gradient(circle, rgba(249,115,22,0.15) 0%, transparent 70%)'
        }}
      />
      <div 
        className="absolute -bottom-24 -left-24 w-64 h-64 opacity-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(249,115,22,0.1) 0%, transparent 70%)'
        }}
      />

      <div className={`${containerStyles} relative z-10`}>
        <div className={`flex items-start gap-4 ${isHorizontal ? 'max-w-2xl' : 'w-full'}`}>
          <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 shrink-0 group-hover:scale-110 transition-transform duration-300">
            <Megaphone className="w-6 h-6" />
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-widest text-orange-500/80">Sponsorship</span>
              <Sparkles className="w-3 h-3 text-orange-400 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-orange-400 transition-colors uppercase tracking-tight">{title}</h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className={`${isHorizontal ? 'shrink-0' : 'mt-auto pt-4'}`}>
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className={`
              inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm
              bg-zinc-800 text-white border border-zinc-700
              hover:bg-orange-500 hover:border-orange-400 hover:text-black
              transition-all duration-300 group/btn
            `}
          >
            {ctaText}
            <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
          </a>
        </div>
      </div>

      {/* Subtle border shine effect */}
      <div className="absolute inset-0 border border-white/5 rounded-2xl pointer-events-none" />
      
      {/* Decorative lines (Optimized) */}
      <div className="absolute top-0 right-0 w-32 h-[1px] overflow-hidden opacity-30">
        <div className="w-full h-full bg-gradient-to-r from-transparent via-orange-500 to-transparent translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000" />
      </div>
    </motion.div>
  );
};

export default AdBanner;
