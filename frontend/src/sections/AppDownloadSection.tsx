import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Download, Shield, Cpu, Globe } from "lucide-react";
import CodeWindow from "../components/CodeWindow";

const features = [
  {
    id: "config",
    label: "Soporte para Android",
    icon: Globe,
    title: "Optimizado para Android",
    description: "JJSecure VPN está diseñada específicamente para dispositivos Android. Nuestra tecnología de túnel dinámico se adapta a tu conexión para ofrecerte siempre el mejor rendimiento.",
    codeTitle: "device_sync.sh",
    codeLanguage: "BASH",
    code: [
      '<span class="text-indigo-400">detect</span> <span class="text-zinc-400">--network</span> <span class="text-emerald-400">"auto"</span>',
      '<span class="text-indigo-400">sync</span> <span class="text-zinc-400">--profile</span> <span class="text-emerald-400">"mobile_global"</span>',
      '<span class="text-zinc-500"># Optimizando para red 4G/5G/WiFi</span>',
      '<span class="text-indigo-400">connect</span> <span class="text-zinc-400">--optimized</span> <span class="text-emerald-400">true</span>'
    ]
  },
  {
    id: "privacy",
    label: "Privacidad por Diseño",
    icon: Shield,
    title: "Tus datos son tuyos",
    description: "Nadie puede ver tu actividad online. Implementamos una política estricta de no-logs combinada con encriptación AES-256 de grado militar.",
    codeTitle: "privacy_layer.json",
    codeLanguage: "JSON",
    code: [
      '<span class="text-indigo-400">"encryption"</span>: <span class="text-emerald-400">"AES-256-GCM"</span>,',
      '<span class="text-indigo-400">"no_logs_policy"</span>: <span class="text-emerald-400">true</span>,',
      '<span class="text-indigo-400">"dns_leak_protection"</span>: <span class="text-emerald-400">true</span>,',
      '<span class="text-indigo-400">"active_stealth"</span>: <span class="text-emerald-400">true</span>'
    ]
  },
  {
    id: "speed",
    label: "Velocidad Turbo Garantizada",
    icon: Cpu,
    title: "Rendimiento sin límites",
    description: "Servidores exclusivos de 1Gbps en Argentina y el mundo. Olvídate del lag en juegos y el buffering en tus series favoritas.",
    codeTitle: "speed_test.log",
    codeLanguage: "LOG",
    code: [
      '<span class="text-zinc-500">[SYSTEM]</span> Latency: <span class="text-emerald-400">8ms</span>',
      '<span class="text-zinc-500">[SYSTEM]</span> Download: <span class="text-emerald-400">940 Mbps</span>',
      '<span class="text-zinc-500">[SYSTEM]</span> Upload: <span class="text-emerald-400">420 Mbps</span>',
      '<span class="text-indigo-400">MODE:</span> <span class="text-orange-400">Ultra-Turbo</span>'
    ]
  }
];

export default function AppDownloadSection() {
  const [activeTab, setActiveTab] = useState(features[0]);

  return (
    <section id="get-started" className="relative z-20 py-24 sm:py-32 bg-transparent overflow-hidden" style={{ scrollMarginTop: '4rem' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header - CodePen Hero Style */}
        <motion.div
          className="flex flex-col items-center text-center mb-20"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 tracking-tight font-title max-w-3xl">
            Un entorno de navegación hecho para <span className="text-orange-400">seguridad</span> y <span className="text-orange-400">velocidad</span>.
          </h2>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
            <motion.a
              href="https://play.google.com/store/apps/details?id=com.jjsecure.lite"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-white text-black font-bold rounded-xl text-lg hover:bg-zinc-200 transition-colors shadow-2xl flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Descargar App
            </motion.a>
            <div className="flex items-center gap-2 text-zinc-500 font-mono text-xs uppercase tracking-widest bg-[#131417] px-4 py-2 rounded-lg border border-zinc-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Build v2.4.0 Live
            </div>
          </div>
        </motion.div>

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

          {/* Left Column: Interactive Feature List (1/3 approx) */}
          <div className="lg:col-span-4 space-y-2">
            <h3 className="text-zinc-500 font-mono text-[10px] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
              <span className="h-px w-8 bg-zinc-800" />
              Características Pro
            </h3>

            {features.map((feature) => {
              const isActive = activeTab.id === feature.id;
              const Icon = feature.icon;

              return (
                <div key={feature.id} className="relative">
                  <button
                    onClick={() => setActiveTab(feature)}
                    className={`w-full flex items-start gap-4 p-5 rounded-2xl transition-all duration-300 text-left group
                      ${isActive ? "bg-[#1e1f26]" : "hover:bg-zinc-900/20"}`}
                  >
                    <div className={`mt-1 transition-transform duration-300 ${isActive ? "rotate-90 text-orange-400" : "text-zinc-600 group-hover:text-zinc-400"}`}>
                      <ChevronRight className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${isActive ? "text-orange-400" : "text-zinc-500"}`} />
                        <span className={`font-bold transition-colors ${isActive ? "text-white" : "text-zinc-400 group-hover:text-zinc-300"}`}>
                          {feature.label}
                        </span>
                      </div>

                      <AnimatePresence>
                        {isActive && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <p className="text-sm text-zinc-500 leading-relaxed pt-2">
                              {feature.description}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </button>
                </div>
              );
            })}

            {/* Support Detail Footer */}
            <div className="pt-8 px-5 border-t border-zinc-900 mt-6">
              <div className="flex items-center gap-3 text-zinc-600">
                <Shield className="w-8 h-8 opacity-20" />
                <p className="text-xs italic leading-snug">
                  "Privacidad garantizada bajo los más altos estándares de seguridad."
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Code Window Display (2/3 approx) */}
          <div className="lg:col-span-8 relative">
            <div className="absolute -inset-4 bg-orange-500/5 blur-3xl rounded-full" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
              >
                <div className="space-y-6">
                  <div className="flex items-center justify-between text-zinc-500 bg-[#131417] p-2 rounded-lg border border-zinc-800/50">
                    <div className="flex items-center gap-3 px-3">
                      <div className="flex gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-red-500/40" />
                        <div className="w-2 h-2 rounded-full bg-amber-500/40" />
                        <div className="w-2 h-2 rounded-full bg-emerald-500/40" />
                      </div>
                      <span className="h-4 w-px bg-zinc-800 mx-1" />
                      <span className="text-[10px] font-mono tracking-wider">{activeTab.title}</span>
                    </div>
                  </div>

                  <CodeWindow
                    title={activeTab.codeTitle}
                    language={activeTab.codeLanguage}
                    code={activeTab.code}
                  />

                  {/* Visual Proof / Small Card */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-[#131417] border border-zinc-800 flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Protocolo</span>
                      <span className="text-sm font-bold text-white">UDP-Turbo v4</span>
                    </div>
                    <div className="p-4 rounded-xl bg-[#131417] border border-zinc-800 flex flex-col gap-1">
                      <span className="text-[10px] font-mono text-zinc-600 uppercase tracking-widest">Ubicación</span>
                      <span className="text-sm font-bold text-white">Buenos Aires, AR</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

        </div>
      </div>

      {/* Background Decorative Gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-orange-500/5 blur-[120px] rounded-full pointer-events-none -z-10" />
    </section>
  );
}
