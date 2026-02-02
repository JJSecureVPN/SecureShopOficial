import { MessageCircle, Phone, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { BodyText, CardTitle, LeadText, SectionTitle } from "../../../components/Typography";

export function SupportSection() {
  const channels = [
    {
      label: "Telegram",
      description: "Respuesta inmediata de nuestro equipo",
      href: "https://t.me/+rAuU1_uHGZthMWZh",
      icon: MessageCircle,
      color: { bg: "bg-zinc-900/50", border: "border-zinc-700", icon: "bg-orange-500/20 text-orange-400", hover: "hover:border-orange-500/50" },
    },
    {
      label: "WhatsApp",
      description: "Ayuda especializada y personalizada",
      href: "https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja",
      icon: Phone,
      color: { bg: "bg-zinc-900/50", border: "border-zinc-700", icon: "bg-orange-500/20 text-orange-400", hover: "hover:border-orange-500/50" },
    },
  ];

  return (
    <section id="section-soporte" className="relative bg-gradient-to-b from-zinc-900 to-refine-dark py-16 sm:py-20 lg:py-24 overflow-hidden">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12 sm:mb-16"
        >
          <span className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-4 bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-semibold">
            💬 Soporte humano
          </span>
          <SectionTitle as="h2" className="mb-4 text-white">Estamos online 24/7</SectionTitle>
          <LeadText as="p" className="max-w-2xl mx-auto text-base sm:text-lg text-zinc-400">
            Canales directos para resolver cualquier duda o bloqueo
          </LeadText>
        </motion.div>

        {/* Support Channels */}
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 max-w-3xl mx-auto">
          {channels.map((channel, index) => {
            const Icon = channel.icon;
            return (
              <motion.a
                key={channel.label}
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`group flex items-center justify-between gap-4 rounded-2xl ${channel.color.bg} border ${channel.color.border} ${channel.color.hover} p-5 sm:p-6 lg:p-8 transition-all duration-300 hover:shadow-lg`}
              >
                <div className="flex items-center gap-4">
                  <div className={`flex h-12 w-12 sm:h-14 sm:w-14 items-center justify-center rounded-xl ${channel.color.icon} flex-shrink-0`}>
                    <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
                  </div>
                  <div>
                    <CardTitle as="h3" className="text-base sm:text-lg text-white">{channel.label}</CardTitle>
                    <BodyText className="text-sm text-zinc-400">{channel.description}</BodyText>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-zinc-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all flex-shrink-0" />
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
