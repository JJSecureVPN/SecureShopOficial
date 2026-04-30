import { MessageCircle, Phone, ArrowRight, Zap } from "lucide-react";
import { motion } from "framer-motion";

export function SupportSection() {
  const channels = [
    {
      label: "Telegram",
      description: "Soporte técnico inmediato",
      href: "https://t.me/+rAuU1_uHGZthMWZh",
      icon: MessageCircle,
      color: { 
        bg: "bg-[#131417]", 
        border: "border-zinc-800/80", 
        icon: "bg-white/5 border-white/10 text-zinc-400", 
        hover: "hover:border-zinc-700" 
      },
    },
    {
      label: "WhatsApp",
      description: "Atención comercial 24/7",
      href: "https://chat.whatsapp.com/LU16SUptp4xFQ4zTNta7Ja",
      icon: Phone,
      color: { 
        bg: "bg-[#131417]", 
        border: "border-zinc-800/80", 
        icon: "bg-white/5 border-white/10 text-zinc-400", 
        hover: "hover:border-zinc-700" 
      },
    },
  ];

  return (
    <section id="section-soporte" className="relative py-24 overflow-hidden font-title">
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
            <Zap className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Asistencia Humana
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-4">
            Estamos <span className="text-zinc-600">Online.</span>
          </h2>
          <p className="max-w-2xl mx-auto text-base text-zinc-500 font-medium leading-relaxed">
            Canales directos de comunicación para resolver dudas técnicas o bloqueos comerciales en tiempo real.
          </p>
        </motion.div>

        {/* Support Channels */}
        <div className="grid gap-6 sm:grid-cols-2 max-w-4xl mx-auto">
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
                className={`group flex items-center justify-between gap-4 rounded-3xl ${channel.color.bg} border ${channel.color.border} ${channel.color.hover} p-8 transition-all duration-300 shadow-xl`}
              >
                <div className="flex items-center gap-5">
                  <div className={`flex h-16 w-16 items-center justify-center rounded-2xl border ${channel.color.icon} flex-shrink-0 transition-colors group-hover:text-white group-hover:border-white/20`}>
                    <Icon className="h-7 w-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white uppercase tracking-tight">{channel.label}</h3>
                    <p className="text-sm font-bold text-zinc-600 uppercase tracking-widest mt-1">{channel.description}</p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-white group-hover:text-black transition-all">
                   <ArrowRight className="w-5 h-5" />
                </div>
              </motion.a>
            );
          })}
        </div>
      </div>
    </section>
  );
}
