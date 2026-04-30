import { motion } from "framer-motion";
import { Zap, ShieldCheck, Cpu } from "lucide-react";

const features = [
  {
    title: "Velocidad Extrema",
    description: "Navega y descarga contenido en alta definición sin latencia gracias a nuestra red de servidores optimizados de 1Gbps.",
    icon: Zap,
    color: "text-orange-400",
  },
  {
    title: "Privacidad Total",
    description: "Encriptación de grado militar AES-256 que mantiene tus datos y tu navegación 100% anónimos frente a terceros.",
    icon: ShieldCheck,
    color: "text-green-400",
  },
  {
    title: "Tecnología Inteligente",
    description: "Nuestra app analiza tu conexión y selecciona automáticamente el protocolo más eficiente para evitar bloqueos.",
    icon: Cpu,
    color: "text-blue-400",
  },
];

export default function FeatureHighlights() {
  return (
    <section className="py-20 bg-transparent relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group relative p-8 rounded-2xl bg-[#1e1f26] border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300 shadow-xl"
            >

              <div className="mb-6 inline-flex p-3 rounded-xl bg-zinc-900/50 border border-zinc-800 group-hover:bg-zinc-800 transition-colors">
                <feature.icon className={`w-8 h-8 ${feature.color}`} />
              </div>

              <h3 className="text-xl font-bold text-white mb-3 font-title">
                {feature.title}
              </h3>

              <p className="text-zinc-400 leading-relaxed group-hover:text-zinc-300 transition-colors">
                {feature.description}
              </p>

              {/* Card Footer Detail */}
              <div className="mt-8 pt-6 border-t border-zinc-800/50 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-500">Feature Ready</span>
                <div className="w-1.5 h-1.5 rounded-full bg-zinc-700 group-hover:bg-green-500 transition-colors" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
