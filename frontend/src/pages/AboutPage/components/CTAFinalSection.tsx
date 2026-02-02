import { ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function CTAFinalSection() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <motion.div 
        className="max-w-4xl mx-auto rounded-3xl bg-gradient-to-br from-indigo-600 to-indigo-900 p-8 sm:p-12 lg:p-16 text-center relative overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-700/20 border border-indigo-700/30 text-indigo-100 text-sm mb-6">
            <Zap className="w-4 h-4" />
            Listo para conectarte
          </div>
          
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-medium text-white mb-4">
            Probá JJSecure y mantené tu línea activa
          </h2>
          
          <p className="text-white/80 text-base sm:text-lg max-w-2xl mx-auto mb-8">
            La app se actualiza con cada fix que lanzamos. Únete al canal para enterarte de las nuevas builds.
          </p>
          
          <a
            href="https://play.google.com/store/apps/details?id=com.jjsecure.lite&hl=es_AR"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-2 bg-white text-indigo-900 hover:bg-gray-50 px-6 py-3 rounded-full font-semibold transition-all shadow-lg"
          >
            Descargar JJSecure
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </motion.div>
    </section>
  );
}