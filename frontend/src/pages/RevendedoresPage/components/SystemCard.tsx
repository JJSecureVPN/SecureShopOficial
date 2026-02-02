import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Check, Zap, RefreshCw, Users, Clock, DollarSign, Maximize } from "lucide-react";
import { PlanGroup } from "../types";

const getIcon = (iconName: string) => {
  switch (iconName) {
    case "zap": return <Zap className="w-5 h-5" />;
    case "refresh-cw": return <RefreshCw className="w-5 h-5" />;
    case "users": return <Users className="w-5 h-5" />;
    case "clock": return <Clock className="w-5 h-5" />;
    case "dollar-sign": return <DollarSign className="w-5 h-5" />;
    case "maximize": return <Maximize className="w-5 h-5" />;
    default: return <Check className="w-5 h-5" />;
  }
};

export default function SystemCard({
  group,
  onSelect,
}: {
  group: PlanGroup;
  onSelect: (groupId: string) => void;
}) {
  const [copied, setCopied] = useState(false);
  // Use clear border accent: purple for creditos, orange for validez
  const accentClass = group.id === "validez" ? "border-orange-500/40" : "border-purple-500/40";
  const accentText = group.id === "validez" ? "text-orange-400" : "text-purple-400";
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="group cursor-pointer h-full"
      onClick={() => onSelect(group.id)}
    >
      <motion.div
        className={`relative overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800/50 h-full transition-all duration-500 ${accentClass}`}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            const url = `${window.location.origin}/revendedores/${group.id}`;
            navigator.clipboard.writeText(url).then(() => {
              setCopied(true);
              setTimeout(() => setCopied(false), 2000);
            });
          }}
          className="absolute top-3 right-3 text-xs px-2 py-1 rounded-full bg-zinc-800/60 border border-zinc-700 text-zinc-300 hover:bg-zinc-700 transition"
          title="Copiar URL"
        >
          {copied ? "Copiado" : "Copiar URL"}
        </button>
        <div className="relative p-8 sm:p-10 flex flex-col h-full">
          {/* Minimalist Header */}
          <div className="mb-8">
            <motion.div 
              className={`inline-flex p-2.5 rounded-2xl ${accentText} bg-current/5 mb-5 ring-1 ring-current/10`}
              whileHover={{ scale: 1.05, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              {group.icon}
            </motion.div>
            <h3 className="text-2xl font-light text-white tracking-tight mb-1.5">{group.title}</h3>
            <p className="text-sm text-zinc-500 font-light tracking-wide uppercase">{group.subtitle}</p>
          </div>

          {/* Clean Description */}
          <p className="text-zinc-400 mb-8 leading-relaxed text-[15px] font-light">{group.mainDescription}</p>

          {/* Refined Features */}
          <div className="space-y-4 mb-8 flex-grow">
            {group.keyFeatures.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -10 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3.5 group/item"
              >
                <div className={`p-1.5 rounded-xl ${accentText} bg-current/5 mt-0.5 ring-1 ring-current/5 group-hover/item:bg-current/10 transition-colors`}>
                  {getIcon(feature.icon)}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-white text-[13px] mb-0.5 tracking-wide">{feature.title}</h4>
                  <p className="text-zinc-500 text-[13px] font-light leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Elegant CTA */}
          <div className="flex items-center justify-between pt-6 border-t border-zinc-800/50">
            <div className="text-[13px] text-zinc-600 font-light tracking-wide">{group.bestFor}</div>
            <motion.div 
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full ${accentText} font-light text-sm tracking-wide group-hover:gap-3 transition-all duration-300`}
              whileHover={{ x: 4 }}
            >
              Ver planes
              <ArrowRight className="w-4 h-4" />
            </motion.div>
          </div>
        </div>

        {/* corner accent removed per design request */}
      </motion.div>
    </motion.div>
  );
}
