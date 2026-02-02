import { motion } from "framer-motion";
import { Users, Shield, Headphones } from "lucide-react";

const STATS = [
  { label: "Usuarios Activos", value: "15K+", icon: Users, color: "purple" },
  { label: "Disponibilidad", value: "99.9%", icon: Shield, color: "emerald" },
  { label: "Soporte", value: "24/7", icon: Headphones, color: "sky" },
];


export function QuickStatsSection() {
  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="grid gap-4 sm:gap-6 sm:grid-cols-3"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          {STATS.map((stat, index) => {
            // map light palette to subtle dark variants
            const darkMap: Record<string, { bg: string; icon: string; text: string }> = {
              purple: { bg: "bg-indigo-900/10", icon: "text-indigo-400", text: "text-indigo-300" },
              emerald: { bg: "bg-emerald-900/10", icon: "text-emerald-400", text: "text-emerald-300" },
              sky: { bg: "bg-sky-900/10", icon: "text-sky-400", text: "text-sky-300" },
            };
            const colors = darkMap[stat.color];
            return (
              <motion.div 
                key={stat.label} 
                className={`rounded-2xl ${colors.bg} border border-zinc-700 p-6 sm:p-8 text-center`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl ${colors.bg} mb-4`}>
                  <stat.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <p className="text-xs uppercase tracking-widest text-zinc-400 mb-2">{stat.label}</p>
                <p className={`text-3xl sm:text-4xl lg:text-5xl font-serif font-medium ${colors.text}`}>{stat.value}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}