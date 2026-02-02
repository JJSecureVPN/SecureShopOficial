import { Heart, Globe, Eye, Shield } from "lucide-react";
import { motion } from "framer-motion";
import { SectionTitle } from "./SectionTitle";

export function ValoresSection() {
  const valores = [
    {
      title: "Accesibilidad",
      desc: "Internet como derecho. Diseñamos pensando en contextos reales.",
      icon: Globe,
      color: "purple",
    },
    {
      title: "Transparencia",
      desc: "Compartimos el estado, los fixes y el roadmap sin adornos.",
      icon: Eye,
      color: "sky",
    },
    {
      title: "Resiliencia",
      desc: "Bloqueos van a suceder, reaccionamos rápido y con la comunidad.",
      icon: Shield,
      color: "emerald",
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    purple: { bg: "bg-purple-50", icon: "text-purple-500" },
    sky: { bg: "bg-sky-50", icon: "text-sky-500" },
    emerald: { bg: "bg-emerald-50", icon: "text-emerald-500" },
  };

  return (
    <section id="valores" className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <SectionTitle
          icon={<Heart className="h-5 w-5" />}
          title="Nuestros valores"
          subtitle="Principios que sostienen la red"
          iconColor="text-rose-500"
        />

        <div className="grid gap-4 sm:gap-6 md:grid-cols-3">
          {valores.map((value, index) => {
            const colors = colorClasses[value.color];
            return (
              <motion.article 
                key={value.title} 
                className="rounded-2xl bg-zinc-800 border border-zinc-700 shadow-sm p-6 sm:p-8 text-center"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-zinc-700 mb-4`}>
                  <value.icon className={`w-7 h-7 ${colors.icon.replace('-500','-400')}`} />
                </div>
                <h3 className="text-lg sm:text-xl font-serif font-medium text-zinc-100 mb-2">{value.title}</h3>
                <p className="text-zinc-400 text-sm sm:text-base">{value.desc}</p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}