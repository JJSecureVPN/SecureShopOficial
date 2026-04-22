import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Gift, Sparkles, Shield, Zap, Globe } from "lucide-react";
import DemoModal from "../components/DemoModal";
import RepairConnectionModal from "../components/RepairConnectionModal";
import { SmallText } from "../components/Typography";
import VariableProximity from "../components/VariableProximity";
import TextType from "../components/TextType";

// Textos que se van a alternar con efecto typewriter
const typingTexts = [
  "¿te gustaría Comprar un plan VPN?",
  "¿querés Revender nuestros servicios?",
  "¿buscas Protección total online?",
  "¿necesitas Velocidad sin límites?",
  "¿querés Desbloquear contenido?",
];

// CodePen Style Editor Window
const EditorPanel = ({
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
      initial={{ opacity: 0, y: 30, x: 20 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`relative w-full bg-[#0a0a0c] border border-zinc-800/80 rounded-xl overflow-hidden shadow-2xl flex flex-col ${className}`}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-zinc-900/50 border-b border-zinc-800/80">
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f56]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#27c93f]" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{language}</span>
          <span className="text-[10px] font-mono text-zinc-400">{title}</span>
        </div>
      </div>

      {/* Code Area */}
      <div className="p-5 font-mono text-[13px] leading-relaxed space-y-1">
        {code.map((line, i) => (
          <div key={i} className="flex gap-4">
            <span className="text-zinc-700 w-4 select-none">{i + 1}</span>
            <div dangerouslySetInnerHTML={{ __html: line }} />
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
  const containerRef = useRef<HTMLDivElement>(null);

  const [, setShowEffects] = useState(true);
  useEffect(() => {
    const update = () => {
      setShowEffects(window.innerWidth >= 1024); // match Tailwind 'lg' breakpoint
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Obtener datos reales de servidores
  const goToPlans = () => navigate("/planes");

  // Forzar scroll al top inicialmente
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <>
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
      <RepairConnectionModal isOpen={isRepairOpen} onClose={() => setIsRepairOpen(false)} />

      <section id="hero-section" className="relative min-h-screen overflow-x-clip">
        {/* Base solid background only */}

        {/* Decorative Lines SVG moved to HomePage.tsx for global consistency */}


        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-8 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Columna izquierda - Contenido principal */}
            <div className="space-y-8">
              {/* Badge animado */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex"
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-sm">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Sparkles className="w-4 h-4 text-emerald-400" />
                  </motion.div>
                  <span className="text-sm font-medium text-emerald-400">VPN #1 en Argentina</span>
                </div>
              </motion.div>

              {/* Título principal con efecto shimmer */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold text-white leading-[1.1] tracking-tight relative font-title">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-zinc-500">
                    Navega Seguro.
                  </span>
                  <br />
                  <span className="text-white">Sin Complicaciones.</span>
                </h1>
              </motion.div>

              {/* Texto animado con typewriter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
              >
                <div className="h-[4.5rem] sm:h-[5.5rem] flex items-center">
                  <TextType
                    text={typingTexts}
                    cursorCharacter="|"
                    as="h2"
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/90 leading-tight font-title"
                    typingSpeed={80}
                    deletingSpeed={40}
                    pauseDuration={2000}
                    initialDelay={0}
                    cursorClassName="text-white"
                  />
                </div>
              </motion.div>

              {/* Descripción con efecto de proximidad */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <div ref={containerRef} style={{ position: 'relative' }}>
                  <VariableProximity
                    label="Experimenta la verdadera libertad online. Acceso sin restricciones y máxima privacidad con velocidad garantizada en todo momento."
                    fromFontVariationSettings="'wght' 400"
                    toFontVariationSettings="'wght' 700"
                    containerRef={containerRef}
                    radius={60}
                    className="text-base sm:text-lg lg:text-xl leading-relaxed text-zinc-500"
                  />
                </div>
              </motion.div>

              {/* Feature pills compactos - Refined */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="flex flex-wrap gap-3"
              >
                {[
                  { icon: Shield, text: "Encriptación AES-256" },
                  { icon: Zap, text: "Ultra rápido" },
                  { icon: Globe, text: "+50 ubicaciones" },
                ].map((feature, i) => (
                  <motion.div
                    key={i}
                    whileHover={{ y: -2 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/30 border border-zinc-800/40 backdrop-blur-sm group hover:border-zinc-700 transition-all font-mono"
                  >
                    <feature.icon className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white transition-colors" />
                    <span className="text-[10px] uppercase tracking-wider text-zinc-500 group-hover:text-white transition-colors">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons - CodePen Inspired Geometric Style */}
              <motion.div
                className="flex flex-col sm:flex-row gap-4 pt-2 relative z-10 font-title"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={goToPlans}
                  className="px-8 py-4 bg-white text-black font-bold rounded-xl text-lg hover:bg-zinc-200 transition-colors shadow-[0_10px_30px_rgba(255,255,255,0.1)] flex items-center justify-center gap-2"
                >
                  Ver Planes
                  <ArrowRight className="h-5 w-5" />
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255,255,255,0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsDemoOpen(true)}
                  className="px-8 py-4 bg-transparent text-white font-bold rounded-xl text-lg border border-zinc-800 hover:border-zinc-700 transition-all flex items-center justify-center gap-2"
                >
                  <Gift className="h-5 w-5" />
                  Prueba Gratuita
                </motion.button>
              </motion.div>

              <div className="flex flex-col gap-3 py-2">
                <SmallText className="text-xs font-medium text-zinc-600">
                  ✓ Sin compromisos · Garantía de reembolso · Cancela cuando quieras
                </SmallText>
                <button
                  onClick={() => setIsRepairOpen(true)}
                  className="w-fit text-[10px] font-bold text-zinc-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1.5 group font-mono"
                >
                  System Check: <span className="underline decoration-zinc-800 group-hover:decoration-zinc-500 transition-colors">Repair Synchronization</span> <Zap className="w-3 h-3 fill-zinc-500/20" />
                </button>
              </div>
            </div>

            {/* Columna derecha - CodePen Editor Stack */}
            <motion.div
              className="relative hidden lg:block h-[500px]"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
            >
              {/* Window 1: Config.json */}
              <EditorPanel
                title="config.json"
                language="JSON"
                code={[
                  '<span className="text-indigo-400">"server"</span>: <span className="text-emerald-400">"ar-bue-01"</span>,',
                  '<span className="text-indigo-400">"encryption"</span>: <span className="text-emerald-400">"AES-256-GCM"</span>,',
                  '<span className="text-indigo-400">"protocol"</span>: <span className="text-emerald-400">"UDP-Turbo"</span>,',
                  '<span className="text-indigo-400">"status"</span>: <span className="text-orange-400">"connecting..."</span>'
                ]}
                className="absolute top-0 right-10 w-[320px] z-10"
                delay={0.4}
              />

              {/* Window 2: Servers.log */}
              <EditorPanel
                title="servers.log"
                language="LOG"
                code={[
                  '<span className="text-zinc-500">[17:42:01]</span> Checking latency...',
                  '<span className="text-emerald-500">[17:42:02]</span> Server <b>AR-01</b>: 12ms',
                  '<span className="text-indigo-500">[17:42:03]</span> Connecting to tunnel...',
                  '<span className="text-zinc-500">[17:42:04]</span> Routing optimized.'
                ]}
                className="absolute top-24 -right-4 w-[340px] z-20 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                delay={0.6}
              />

              {/* Window 3: Secure.sh */}
              <EditorPanel
                title="secure.sh"
                language="BASH"
                code={[
                  '<span className="text-indigo-400">auth</span> <span className="text-zinc-400">--user</span> <span className="text-emerald-400">"jjsecure"</span>',
                  '<span className="text-indigo-400">connect</span> <span className="text-zinc-400">--stealth</span> <span className="text-emerald-400">true</span>',
                  '<span className="text-zinc-500"># Privacy guaranteed by SecureShop</span>',
                  '<span className="text-zinc-300">echo</span> <span className="text-emerald-400">"V-PN Active"</span>'
                ]}
                className="absolute top-64 right-16 w-[300px] z-30 shadow-[0_30px_70px_rgba(0,0,0,0.8)]"
                delay={0.8}
              />
            </motion.div>
          </div>
        </div>


      </section>

      <style>{`
        @keyframes shimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
      `}</style>
    </>
  );
}