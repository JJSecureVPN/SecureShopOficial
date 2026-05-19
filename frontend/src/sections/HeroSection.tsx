import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Gift, Sparkles, Zap } from "lucide-react";
import DemoModal from "../components/DemoModal";
import RepairConnectionModal from "../components/RepairConnectionModal";
import TextType from "../components/TextType";

// Textos que se van a alternar con efecto typewriter
const typingTexts = [
  "Privacidad total.",
  "Velocidad extrema.",
  "Sin restricciones.",
  "Acceso global.",
  "Seguridad militar.",
];

// CodePen Style Editor Window
const TerminalWindow = ({
  title,
  language,
  code,
  className = "",
  delay = 0
}: {
  title: string;
  language: string;
  code: string[];
  className?: string;
  delay?: number;
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 1, delay, ease: [0.16, 1, 0.3, 1] }}
      className={`relative w-full max-w-3xl mx-auto bg-[#0a0a0c] border border-white/5 rounded-2xl overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.6)] flex flex-col ${className}`}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-6 py-4 bg-[#0d0d0f] border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
          <div className="w-3 h-3 rounded-full bg-white/10" />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{language}</span>
          <div className="h-4 w-px bg-white/10" />
          <span className="text-[10px] font-mono text-zinc-400">{title}</span>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-8 font-mono text-sm leading-relaxed space-y-2 overflow-hidden">
        {code.map((line, i) => (
          <div key={i} className="flex gap-6 group">
            <span className="text-zinc-800 w-4 select-none group-hover:text-zinc-600 transition-colors text-right">{i + 1}</span>
            <div className="text-zinc-400" dangerouslySetInnerHTML={{ __html: line }} />
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default function HeroSection() {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [isRepairOpen, setIsRepairOpen] = useState(false);

  const goToPlans = () => navigate("/planes");

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  return (
    <>
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <RepairConnectionModal isOpen={isRepairOpen} onClose={() => setIsRepairOpen(false)} />

      <section id="hero-section" className="relative pt-24 pb-32 overflow-hidden">
        <div className="relative z-20 max-w-5xl mx-auto px-6 flex flex-col items-center text-center">
          
          {/* Badge minimalista */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[11px] font-bold text-white/50 uppercase tracking-[0.2em]">Premium VPN Solution</span>
            </div>
          </motion.div>

          {/* Headline elegante */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="mb-6"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-white leading-[1.05] tracking-tight font-title">
              Navega Seguro. <br />
              <span className="text-zinc-500">Sin Complicaciones.</span>
            </h1>
          </motion.div>

          {/* Typewriter text */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-10 h-12 flex items-center justify-center"
          >
            <TextType
              text={typingTexts}
              cursorCharacter="|"
              as="h2"
              className="text-xl sm:text-2xl font-medium text-white/60 font-title"
              typingSpeed={60}
              deletingSpeed={30}
              pauseDuration={2500}
            />
          </motion.div>

          {/* CTAs minimalistas */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center gap-4 mb-24"
          >
            <motion.button
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={goToPlans}
              className="px-10 py-5 bg-white text-black font-black rounded-full text-sm uppercase tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-3 shadow-[0_20px_50px_rgba(255,255,255,0.15)]"
            >
              Comenzar ahora
              <ArrowRight className="h-4 w-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05, y: -2, backgroundColor: "rgba(255,255,255,0.05)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsDemoOpen(true)}
              className="px-10 py-5 bg-transparent text-white font-black rounded-full text-sm uppercase tracking-widest border border-white/10 hover:border-white/20 transition-all flex items-center gap-3"
            >
              <Gift className="h-4 w-4 text-white/60" />
              Prueba Gratuita
            </motion.button>
          </motion.div>

          {/* Terminal Centralizada Estilo CodePen */}
          <TerminalWindow
            title="connection.log"
            language="BASH"
            code={[
              '<span className="text-zinc-600">$</span> <span className="text-indigo-400">vpn-client</span> <span className="text-zinc-500">connect</span> <span className="text-emerald-400">--location</span> <span className="text-emerald-400">"AR-BUE"</span>',
              '<span className="text-zinc-600">...</span> <span className="text-zinc-400">Buscando nodo óptimo en Buenos Aires...</span>',
              '<span className="text-emerald-400">✓</span> <span className="text-white font-bold">CONECTADO</span> <span className="text-zinc-500">| Protocolo: UDP-Turbo | Latencia: 14ms</span>',
              '<span className="text-zinc-600">$</span> <span className="text-white">status --active</span>',
              '<span className="text-zinc-500">Tu dirección IP está ahora protegida por SecureShop.</span>'
            ]}
            delay={0.5}
          />

          {/* System status pill */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="mt-12"
          >
            <button
              onClick={() => setIsRepairOpen(true)}
              className="group flex items-center gap-3 px-5 py-2.5 rounded-full border border-zinc-800/80 hover:border-emerald-500/30 bg-[#0d0d0f] transition-all duration-300 shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
            >
              <Zap className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                ¿Problemas tras renovar?
              </span>
              <div className="h-3 w-px bg-white/10 mx-1" />
              <span className="text-[10.5px] font-bold text-emerald-400 group-hover:text-white transition-colors underline underline-offset-4 decoration-emerald-500/30">
                Reparar / Sincronizar Cuenta
              </span>
            </button>
          </motion.div>

        </div>
      </section>
    </>
  );
}
