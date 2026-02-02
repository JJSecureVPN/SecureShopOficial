import { Target, CheckCircle, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { SectionTitle } from "./SectionTitle";

export function MisionSection() {
  const items = [
    {
      title: "Acceso sin saldo",
      copy: "Si tu saldo se agota, la app mantiene la sesión activa mientras encuentras una recarga.",
    },
    {
      title: "Servidores que congelan megas",
      copy: "Nuestros nodos especializados evitan que tus datos se descuenten mientras navegas.",
    },
    {
      title: "Respuesta a bloqueos",
      copy: "Detectamos cambios de la operadora y lanzamos un fix en horas, no en semanas.",
    },
  ];

  return (
    <section id="mision" className="w-full px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 scroll-mt-24">
      <div className="max-w-7xl mx-auto space-y-8 sm:space-y-12">
        <SectionTitle
          icon={<Target className="h-5 w-5" />}
          title="Nuestra misión"
          subtitle="Lo que activamos cada día"
          iconColor="text-rose-500"
        />

        <div className="grid gap-6 lg:grid-cols-2">
          <motion.article 
            className="rounded-2xl bg-zinc-800 border border-zinc-700 shadow-sm p-6 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h3 className="text-xl sm:text-2xl font-serif font-medium text-zinc-100 mb-6">¿Qué hacemos exactamente?</h3>
            <ul className="space-y-4">
              {items.map((item, index) => (
                <motion.li 
                  key={item.title} 
                  className="flex gap-4"
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                >
                  <CheckCircle className="mt-1 h-5 w-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <p className="font-medium text-zinc-100">{item.title}</p>
                    <p className="text-zinc-400 text-sm sm:text-base">{item.copy}</p>
                  </div>
                </motion.li>
              ))}
            </ul>
          </motion.article>

          <motion.article 
            className="rounded-2xl bg-zinc-800 border border-zinc-700 shadow-sm p-6 sm:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h3 className="text-xl sm:text-2xl font-serif font-medium text-zinc-100 mb-4">Nuestra promesa</h3>
            <p className="text-zinc-400 text-sm sm:text-base leading-relaxed mb-6">
              Nos comprometemos a mantener activa tu conexión incluso cuando el operador decide bloquearla. Cuando
              hay cambios, compartimos el estado en nuestra comunidad y priorizamos la solución de forma pública.
            </p>
            <div className="rounded-xl bg-emerald-900/10 border border-emerald-800 p-5 flex items-start gap-4">
              <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
              <p className="text-emerald-300 text-sm sm:text-base italic">
                "Innovamos sin pausa para que nunca te quedes sin opciones."
              </p>
            </div>
          </motion.article>
        </div>
      </div>
    </section>
  );
}