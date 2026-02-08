import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { ArrowRight, Users, Gift, Sparkles, Shield, Zap, Globe } from "lucide-react";
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

// Floating particles effect
const FloatingParticles = () => {
  const particles = Array.from({ length: 20 });
  
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-emerald-400/20 rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

// Animated gradient background
const AnimatedBackground = () => {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <motion.div
        className="absolute -top-1/2 -left-1/4 w-3/4 h-3/4 bg-emerald-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.2, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute -bottom-1/2 -right-1/4 w-3/4 h-3/4 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
};

// Stat card with hover effect
const StatCard = ({ 
  icon: Icon, 
  label, 
  value, 
  delay = 0 
}: { 
  icon: any; 
  label: string; 
  value: string | number; 
  delay?: number;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group"
    >
      <div className="bg-zinc-900/50 backdrop-blur-xl rounded-xl p-5 border border-zinc-800/50 hover:border-emerald-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-emerald-500/5">
        {/* Glow effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          animate={{
            opacity: isHovered ? [0.5, 0.8, 0.5] : 0,
          }}
          transition={{
            duration: 2,
            repeat: isHovered ? Infinity : 0,
          }}
        />
        
        <div className="relative z-10 flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4 text-emerald-400" />
              <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider">{label}</p>
            </div>
            <motion.p 
              className="text-2xl font-bold text-white"
              animate={{
                scale: isHovered ? 1.05 : 1,
              }}
              transition={{ duration: 0.2 }}
            >
              {value}
            </motion.p>
          </div>
          
          <motion.div
            animate={{
              rotate: isHovered ? 360 : 0,
            }}
            transition={{ duration: 0.6 }}
            className="text-emerald-400/20"
          >
            <Icon className="w-6 h-6" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

// Mouse follower dot effect
const MouseFollower = () => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const smoothMouseX = useSpring(mouseX, { stiffness: 50, damping: 20 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 50, damping: 20 });
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX);
      mouseY.set(e.clientY);
    };
    
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);
  
  return (
    <motion.div
      className="fixed w-6 h-6 bg-emerald-400/10 rounded-full pointer-events-none z-50 blur-md"
      style={{
        left: smoothMouseX,
        top: smoothMouseY,
        x: "-50%",
        y: "-50%",
      }}
    />
  );
};

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
      <MouseFollower />

      <section id="hero-section" className="relative bg-refine-dark min-h-screen overflow-hidden">
        {/* Animated background */}
        <AnimatedBackground />
        <FloatingParticles />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-16 sm:pb-20">
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
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight relative">
                  <span className="bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-emerald-400 animate-[shimmer_3s_ease-in-out_infinite]">
                    Navega Seguro.
                  </span>
                  <br />
                  <span className="text-zinc-300">Sin Complicaciones.</span>
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
                    className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white leading-tight"
                    typingSpeed={80}
                    deletingSpeed={40}
                    pauseDuration={2000}
                    initialDelay={0}
                    cursorClassName="text-emerald-400"
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
                    label="Experimenta la verdadera libertad online. Acceso sin restricciones y máxima privacidad con velocidad garantizada."
                    fromFontVariationSettings="'wght' 400"
                    toFontVariationSettings="'wght' 700"
                    containerRef={containerRef}
                    radius={60}
                    className="text-base sm:text-lg lg:text-xl leading-relaxed text-zinc-400"
                  />
                </div>
              </motion.div>

              {/* Feature pills compactos */}
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
                    whileHover={{ scale: 1.05, y: -2 }}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/50 border border-zinc-800/50 backdrop-blur-sm group hover:border-emerald-500/30 transition-all"
                  >
                    <feature.icon className="w-3.5 h-3.5 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
                    <span className="text-xs text-zinc-400 group-hover:text-zinc-300 font-medium transition-colors">
                      {feature.text}
                    </span>
                  </motion.div>
                ))}
              </motion.div>

              {/* CTA Buttons con efectos mejorados */}
              <motion.div 
                className="flex flex-col sm:flex-row gap-4 pt-2" 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <motion.div 
                  whileHover={{ scale: 1.03 }} 
                  whileTap={{ scale: 0.97 }}
                  className="relative group"
                >
                  <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-lg blur opacity-30 group-hover:opacity-50 transition duration-300" />
                  <RefineButton
                    onClick={goToPlans}
                    variant="primary"
                    fullWidthMobile
                    className="relative"
                  >
                    Ver Planes
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </RefineButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
                  <RefineButton
                    onClick={() => setIsDemoOpen(true)}
                    variant="secondary"
                    fullWidthMobile
                  >
                    <Gift className="h-4 w-4 relative z-[1]" />
                    <span className="relative z-[1]">Prueba Gratuita</span>
                  </RefineButton>
                </motion.div>

                <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
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

              <SmallText className="text-xs font-medium text-zinc-500">
                ✓ Sin compromisos · Garantía de reembolso · Cancela cuando quieras
              </SmallText>
            </div>

            {/* Columna derecha - Estadísticas mejoradas */}
            <motion.div 
              className="relative hidden lg:flex justify-end" 
              initial={{ opacity: 0, x: 40 }} 
              animate={{ opacity: 1, x: 0 }} 
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              <div className="w-full max-w-[420px] space-y-4">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.35 }}
                >
                  <ActiveUsersCard />
                </motion.div>

                <StatCard
                  icon={Users}
                  label="Usuarios Activos"
                  value={totalUsers > 0 ? `${totalUsers.toLocaleString('es-AR')}+` : '15,000+'}
                  delay={0.4}
                />
                <StatCard
                  icon={Globe}
                  label="Servidores Activos"
                  value={onlineServers > 0 ? `${onlineServers}+` : '25+'}
                  delay={0.5}
                />
                <StatCard
                  icon={Zap}
                  label="Velocidad Promedio"
                  value={`${averageSpeed} Mbps`}
                  delay={0.6}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden lg:block z-30"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-6 h-10 border-2 border-zinc-700 rounded-full flex items-start justify-center p-2"
          >
            <motion.div className="w-1 h-2 bg-emerald-400 rounded-full" />
          </motion.div>
        </motion.div>

        {/* Bottom soft fade to blend with next sections */}
        <div className="absolute left-0 right-0 bottom-0 pointer-events-none z-0">
          {/* Large soft blurred shape to diffuse the animated background */}
          <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-[120%] h-40 bg-gradient-to-b from-transparent to-zinc-900/80 blur-3xl opacity-70" />
          {/* Gradient overlay to smoothly darken toward the page background */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-b from-transparent to-zinc-900/95" />
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