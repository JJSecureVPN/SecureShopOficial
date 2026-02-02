import { Lock, Server, TrendingUp, Zap, Shield, Check } from "lucide-react";
import { motion } from "framer-motion";
import { SectionTitle } from "./SectionTitle";

export function TecnologiaSection() {
  const techs = [
    {
      icon: Server,
      title: "Servidores inteligentes",
      desc: "Detectan cambios de la operadora y ajustan el túnel automáticamente.",
      color: "purple",
    },
    {
      icon: TrendingUp,
      title: "Rotación automática",
      desc: "Cuando un nodo cae, otro toma el control sin que tengas que tocar nada.",
      color: "sky",
    },
    {
      icon: Zap,
      title: "Optimización mobile",
      desc: "Cifrado ligero pensado para no drenar batería ni recursos.",
      color: "amber",
    },
    {
      icon: Shield,
      title: "Privacidad real",
      desc: "Sin logs y con tráfico cifrado de extremo a extremo.",
      color: "emerald",
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    purple: { bg: "bg-purple-50", icon: "text-purple-500" },
    sky: { bg: "bg-sky-50", icon: "text-sky-500" },
    amber: { bg: "bg-amber-50", icon: "text-amber-500" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500" },
  };

  const features = ["Acceso sin saldo", "Fixes ante bloqueos en horas", "Diseñada para LATAM", "Soporte 24/7 real", "App liviana", "Sin logs"];

  return (
    <section id="tecnologia" className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <SectionTitle
          icon={<Lock className="h-5 w-5" />}
          title="Tecnología VPN"
          subtitle="Stack diseñado para rotar y proteger"
          iconColor="text-indigo-500"
        />

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {techs.map((tech, index) => {
            const colors = colorClasses[tech.color];
            return (
              <motion.article 
                key={tech.title} 
                className="rounded-2xl bg-zinc-800 border border-zinc-700 shadow-sm p-6 sm:p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-zinc-700 mb-4`}>
                  <tech.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-medium text-zinc-100 mb-2">{tech.title}</h3>
                <p className="text-zinc-400 text-sm sm:text-base">{tech.desc}</p>
              </motion.article>
            );
          })}
        </div>

        <motion.div 
          className="rounded-2xl bg-zinc-800 border border-zinc-700 shadow-sm p-6 sm:p-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h3 className="text-lg sm:text-xl font-serif font-medium text-zinc-100 mb-6">¿Por qué es diferente?</h3>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((item, index) => (
              <motion.div 
                key={item} 
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-900/10 flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <span className="text-zinc-300 text-sm sm:text-base">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}