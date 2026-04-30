import { Activity, Globe2, Zap, Shield } from "lucide-react";
import { motion } from "framer-motion";

// Subtle grid pattern - only on left side
const GridPattern = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 lg:w-1/2 bg-[linear-gradient(rgba(52,211,153,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(52,211,153,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_80%_80%_at_30%_50%,black,transparent)]" />
    </div>
  );
};

// Enhanced feature pill with hover effects
const FeaturePill = ({
  icon: Icon,
  label,
  color = "orange"
}: {
  icon: any;
  label: string;
  color?: "orange" | "emerald" | "blue";
}) => {
  const colorClasses = {
    orange: "text-orange-400 group-hover:text-orange-300",
    emerald: "text-emerald-400 group-hover:text-emerald-300",
    blue: "text-blue-400 group-hover:text-blue-300",
  };

  const glowClasses = {
    orange: "group-hover:shadow-orange-500/20",
    emerald: "group-hover:shadow-emerald-500/20",
    blue: "group-hover:shadow-blue-500/20",
  };

  return (
    <motion.div
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className="group"
    >
      <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 hover:border-zinc-700 text-sm text-zinc-300 transition-all duration-300 hover:shadow-lg ${glowClasses[color]}`}>
        <motion.div
          animate={{ rotate: [0, 5, -5, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon className={`w-4 h-4 transition-colors duration-300 ${colorClasses[color]}`} />
        </motion.div>
        <span className="font-medium group-hover:text-white transition-colors duration-300">{label}</span>
      </div>
    </motion.div>
  );
};

export function ServersHero() {
  return (
    <section
      className="relative w-full bg-[#18181b] pt-4 sm:pt-8 lg:pt-12 overflow-hidden"
      style={{
        // CSS variables to control video appearance (can be overridden globally or per-page)
        ['--video-brightness' as any]: '1.14',
        ['--video-contrast' as any]: '1.02',
        ['--video-saturate' as any]: '1.05',
      } as React.CSSProperties}
    >
      {/* Background effects - only on left side to avoid video overlap */}
      <GridPattern />



      <div className="mt-0">
        <div className="max-w-7xl mx-auto">
          <div className="px-4 sm:px-0 flex w-full relative min-h-[360px] lg:min-h-[520px] py-4">
            <div className="pl-4 sm:pl-10 flex flex-col justify-center gap-6 z-[1] lg:justify-start lg:py-8">
              {/* Badge with enhanced animation */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="self-start"
              >
                <div className="relative rounded-full h-8 flex gap-2 items-center justify-center pt-2 pr-4 pb-2 pl-2 border border-zinc-800 bg-zinc-950/90 backdrop-blur-sm shadow-lg shadow-emerald-500/10">
                  {/* Animated pulse dot */}
                  <span className="relative flex h-2 w-2">
                    <motion.span
                      className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
                      animate={{
                        scale: [1, 2, 1],
                        opacity: [0.75, 0, 0.75],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut",
                      }}
                    />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                  </span>
                  <span className="font-medium text-xs tracking-[-0.006em] text-white">Red operativa</span>
                </div>
              </motion.div>

              {/* Title with gradient */}
              <div className="flex flex-col gap-6">
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="text-[32px] leading-[40px] tracking-[-0.5%] sm:text-[56px] sm:leading-[72px] sm:max-w-[588px] sm:tracking-[-0.06rem] font-semibold text-gray-0"
                >
                  <span className="inline-block bg-clip-text text-transparent bg-gradient-to-r from-white via-white to-emerald-400">
                    Estado de la red
                  </span>
                  <br />
                  <span className="text-zinc-100">en tiempo real</span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="font-normal text-base text-gray-300 xs:max-w-[388px] leading-relaxed"
                >
                  Rendimiento y disponibilidad en vivo con una vista limpia y enfocada.
                </motion.p>
              </div>

              {/* Enhanced feature pills */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="flex items-center justify-start gap-3 lg:mt-7 flex-wrap"
              >
                <FeaturePill icon={Activity} label="Tiempo real" color="orange" />
                <FeaturePill icon={Globe2} label="Multi-región" color="emerald" />
                <FeaturePill icon={Zap} label="Alta velocidad" color="blue" />
                <FeaturePill icon={Shield} label="Seguro" color="emerald" />
              </motion.div>

              {/* Stats counter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex items-center gap-6 lg:mt-4"
              >
                {[
                  { label: "Uptime", value: "99.9%" },
                  { label: "Servidores", value: "50+" },
                ].map((stat, i) => (
                  <div key={i} className="flex flex-col gap-1">
                    <motion.span
                      className="text-2xl font-bold text-white"
                      initial={{ opacity: 0, scale: 0.5 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.5, delay: 0.5 + i * 0.1 }}
                    >
                      {stat.value}
                    </motion.span>
                    <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* Video without background modifications */}
            <motion.div
              className="hidden lg:block absolute bottom-0 right-0 z-0 pointer-events-none"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <video
                autoPlay
                loop
                muted
                playsInline
                preload="auto"
                className="w-[690px] max-h-[520px] h-auto block z-0 object-contain"
                style={{ filter: `brightness(var(--video-brightness, 1.15)) contrast(var(--video-contrast, 1.03)) saturate(var(--video-saturate, 1.05))` }}
                src="/VideoSecure.mp4"
                aria-hidden
              />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}