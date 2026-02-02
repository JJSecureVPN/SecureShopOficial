import { ArrowRight, Shield, Users, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Lottie from "lottie-react";
import aboutHeroAnimation from "../../../assets/lottie/about-hero.json";

export function HeroSection() {
  return (
    <section id="hero-section" className="bg-gradient-to-b from-indigo-900/30 to-transparent w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-20 lg:pt-24 pb-12 sm:pb-16 lg:pb-20">
        <div className="grid gap-8 lg:gap-12 items-center lg:grid-cols-2">
          {/* Content */}
          <motion.div 
            className="space-y-6 text-center lg:text-left"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Badge */}
            <div className="inline-flex items-center gap-2 rounded-full bg-zinc-800/60 border border-zinc-700 px-4 py-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-500 opacity-50"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-400"></span>
              </span>
              <span className="text-indigo-300 text-sm font-medium">Sobre JJSecure VPN</span>
            </div>

            {/* Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-medium text-zinc-100 leading-tight">
              Nunca más sin conexión
              <span className="block text-indigo-300">cuando más la necesitas</span>
            </h1>

            {/* Description */}
            <p className="text-zinc-400 text-base sm:text-lg lg:text-xl max-w-xl mx-auto lg:mx-0 leading-relaxed">
              JJSecure es una VPN creada en la región para mantener tu línea activa incluso sin saldo. Nos movemos rápido ante bloqueos y compartimos cada iteración con la comunidad.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
              {[
                { icon: Users, label: "15K+ usuarios" },
                { icon: Shield, label: "99.9% uptime" },
                { icon: Zap, label: "Soporte 24/7" },
              ].map((feature) => (
                <div 
                  key={feature.label}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-800 border border-zinc-700 shadow-sm text-sm text-zinc-300"
                >
                  <feature.icon className="w-4 h-4 text-indigo-400" />
                  <span className="font-medium">{feature.label}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 justify-center lg:justify-start pt-2">
              <a
                href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-full font-semibold transition-all shadow-lg shadow-indigo-900"
              >
                Descargar JJSecure
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </motion.div>

          {/* Animation */}
          <motion.div 
            className="flex items-center justify-center order-first lg:order-last"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="w-full max-w-md">
              <Lottie animationData={aboutHeroAnimation as unknown as object} loop autoplay />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}