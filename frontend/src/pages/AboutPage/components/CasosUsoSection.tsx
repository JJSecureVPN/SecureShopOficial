import { Smartphone, Wifi, AlertTriangle, MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { SectionTitle } from "./SectionTitle";

export function CasosUsoSection() {
  const cases = [
    {
      title: "Sin saldo",
      desc: "Seguís conectado para trabajar o estudiar aunque la recarga llegue más tarde.",
      icon: Wifi,
      color: "purple",
    },
    {
      title: "Bloqueos de operadora",
      desc: "Cuando hay bloqueos masivos, la app rota automáticamente al servidor sano.",
      icon: AlertTriangle,
      color: "amber",
    },
    {
      title: "Emergencias",
      desc: "Podés pedir ayuda o compartir tu ubicación incluso si agotaste el plan.",
      icon: Smartphone,
      color: "rose",
    },
    {
      title: "Viajes",
      desc: "Conectá desde cualquier punto del país sin depender de redes públicas inseguras.",
      icon: MapPin,
      color: "sky",
    },
  ];

  const colorClasses: Record<string, { bg: string; icon: string }> = {
    purple: { bg: "bg-purple-50", icon: "text-purple-500" },
    amber: { bg: "bg-amber-50", icon: "text-amber-500" },
    rose: { bg: "bg-rose-50", icon: "text-rose-500" },
    sky: { bg: "bg-sky-50", icon: "text-sky-500" },
  };

  return (
    <section id="casos-uso" className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <SectionTitle
          icon={<Smartphone className="h-5 w-5" />}
          title="Casos de uso"
          subtitle="Escenarios reales donde más ayudamos"
          iconColor="text-amber-500"
        />

        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {cases.map((use, index) => {
            const colors = colorClasses[use.color];
            return (
              <motion.article 
                key={use.title} 
                className="rounded-2xl bg-zinc-800 border border-zinc-700 shadow-sm p-6 sm:p-8 flex gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl ${colors.bg} flex items-center justify-center`}>
                  <use.icon className={`w-6 h-6 ${colors.icon}`} />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-serif font-medium text-zinc-100 mb-1">{use.title}</h3>
                  <p className="text-zinc-400 text-sm sm:text-base">{use.desc}</p>
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}