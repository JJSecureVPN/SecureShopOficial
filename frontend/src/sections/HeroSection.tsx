import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Users, Gift, Sparkles } from "lucide-react";
import DemoModal from "../components/DemoModal";
import ActiveUsersCard from "../components/ActiveUsersCard";
import { RefineButton } from "../components/RefineButton";
import { SmallText } from "../components/Typography";
import { useServerStats } from "../hooks/useServerStats";
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

export default function HeroSection() {
  const navigate = useNavigate();
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Obtener datos reales de servidores
  const { servers, totalUsers, onlineServers } = useServerStats(9000);
  
  // Calcular velocidad promedio de los servidores activos
  const averageSpeed = servers.length > 0 
    ? Math.round(servers.filter(s => s.status === 'online').length / servers.length * 150)
    : 100;

  const goToPlans = () => navigate("/planes");
  const goToResellers = () => navigate("/revendedores");


  // Forzar scroll al top inicialmente
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  return (
    <>
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />

      <section id="hero-section" className="relative bg-refine-dark min-h-screen overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16 sm:pb-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
              {/* Columna izquierda - Contenido principal (minimalista) */}
              <div className="space-y-6">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-tight">
                    Navega Seguro. Sin Complicaciones.
                  </h1>
                  <div className="mt-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                    <p className="text-sm sm:text-base text-zinc-400 font-medium">VPN · App N°1 en Argentina</p>
                  </div>
                </motion.div>
                {/* Active Users Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                >
                  <ActiveUsersCard />
                </motion.div>

                {/* Texto animado con typewriter (sutil) */}
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                  <div className="h-[4.5rem] sm:h-[5.5rem] flex items-center">
                    <TextType
                      text={typingTexts}
                      cursorCharacter="|"
                      as="h2"
                      className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight"
                      typingSpeed={80}
                      deletingSpeed={40}
                      pauseDuration={2000}
                      initialDelay={0}
                      cursorClassName="text-emerald-400"
                    />
                  </div>
                </motion.div>

                {/* Descripción */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <div ref={containerRef} style={{ position: 'relative' }}>
                    <VariableProximity
                      label="Experimenta la verdadera libertad online. Acceso sin restricciones y máxima privacidad con velocidad garantizada."
                      fromFontVariationSettings="'wght' 400"
                      toFontVariationSettings="'wght' 700"
                      containerRef={containerRef}
                      radius={60}
                      className="text-base sm:text-lg lg:text-xl leading-relaxed text-zinc-400"
                    />
                  </div>
                </motion.div>

                {/* Feature pills removed as requested */}

                {/* CTA Buttons */}
                <motion.div className="flex flex-col sm:flex-row gap-4 pt-4" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }}>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <RefineButton
                      onClick={goToPlans}
                      variant="primary"
                      fullWidthMobile
                    >
                      Ver Planes
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                    </RefineButton>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <RefineButton
                      onClick={() => setIsDemoOpen(true)}
                      variant="secondary"
                      fullWidthMobile
                    >
                      <Gift className="h-4 w-4 relative z-[1]" />
                      <span className="relative z-[1]">Prueba Gratuita</span>
                    </RefineButton>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <RefineButton
                      onClick={goToResellers}
                      variant="secondary"
                      fullWidthMobile
                    >
                      <Users className="h-4 w-4 relative z-[1]" />
                      <span className="relative z-[1]">Sé Revendedor</span>
                    </RefineButton>
                  </motion.div>
                </motion.div>

                <SmallText className="text-xs font-medium text-zinc-500">✓ Sin compromisos · Garantía de reembolso · Cancela cuando quieras</SmallText>
              </div>

              {/* Columna derecha - Estadísticas compactas */}
              <motion.div className="relative hidden lg:flex justify-end" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <div className="w-[380px]">
                  <div className="bg-zinc-900/70 backdrop-blur rounded-2xl p-6 border border-zinc-700/50 shadow-lg">
                    <div className="space-y-6">
                      <div>
                        <p className="text-sm text-zinc-400">Usuarios Activos</p>
                        <p className="text-2xl font-semibold text-white mt-1">{totalUsers > 0 ? `${totalUsers.toLocaleString('es-AR')}+` : '15,000+'}</p>
                      </div>
                      <div className="border-t border-zinc-700" />
                      <div>
                        <p className="text-sm text-zinc-400">Servidores Activos</p>
                        <p className="text-2xl font-semibold text-white mt-1">{onlineServers > 0 ? onlineServers : 25}+</p>
                      </div>
                      <div className="border-t border-zinc-700" />
                      <div>
                        <p className="text-sm text-zinc-400">Velocidad Promedio</p>
                        <p className="text-2xl font-semibold text-white mt-1">{averageSpeed} Mbps</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
        </div>
      </section>
    </>
  );
}
