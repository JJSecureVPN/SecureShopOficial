import { useState } from "react";
import {
  ShieldCheck,
  Database,
  Lock,
  UserX,
  Eye,
  MessageCircle,
  Phone,
  Zap,
} from "lucide-react";
import BottomSheet from "../components/BottomSheet";
import { Title } from "../components/Title";
import { motion } from "framer-motion";

interface PrivacyPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

const sectionsData = [
  {
    title: "Información que Recopilamos",
    icon: Database,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          Para el funcionamiento del servicio, recopilamos mínima información:
        </p>
        <ul className="space-y-2 text-zinc-300">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Device ID (removido automáticamente cada 24 horas)
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Información básica de conexión para control de límites
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Datos técnicos necesarios para el funcionamiento del proxy
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Uso de la Información",
    icon: Eye,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          La información recopilada se utiliza exclusivamente para:
        </p>
        <ul className="space-y-2 text-zinc-300">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Controlar límites de conexiones simultáneas
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Mantener la estabilidad del servicio
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Proveer soporte técnico cuando sea necesario
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Protección de Datos",
    icon: Lock,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          No almacenamos historial de navegación, contenido de comunicaciones ni
          datos personales identificables. Los datos temporales (como Device ID)
          se eliminan automáticamente de nuestros servidores cada 24 horas.
        </p>
      </div>
    ),
  },
  {
    title: "Compartir Información",
    icon: UserX,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          No vendemos, alquilamos ni compartimos tu información personal con
          terceros. Solo podríamos divulgar información si fuera requerido por
          ley y con orden judicial válida.
        </p>
      </div>
    ),
  },
  {
    title: "Tus Derechos",
    icon: ShieldCheck,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">Como usuario, tienes derecho a:</p>
        <ul className="space-y-2 text-zinc-300">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Solicitar información sobre los datos que almacenamos
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Pedir la eliminación de tus datos
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Dejar de usar el servicio en cualquier momento
          </li>
        </ul>
      </div>
    ),
  },
];

const PrivacyPage = ({ isMobileMenuOpen, setIsMobileMenuOpen }: PrivacyPageProps) => {
  const [activeSection, setActiveSection] = useState(
    "informacion-que-recopilamos"
  );

  const sections = [
    {
      id: "informacion-que-recopilamos",
      label: "Información",
      icon: <Database className="w-4 h-4" />,
    },
    {
      id: "uso-de-la-informacion",
      label: "Uso de Datos",
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: "proteccion-de-datos",
      label: "Protección",
      icon: <Lock className="w-4 h-4" />,
    },
    {
      id: "compartir-informacion",
      label: "Compartir",
      icon: <UserX className="w-4 h-4" />,
    },
    {
      id: "tus-derechos",
      label: "Tus Derechos",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-refine-dark text-white selection:bg-emerald-500/30">
      {/* Main Content */}
      <main className="relative z-10">
        {/* Header */}
        <section className="relative pt-24 pb-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 mb-6">
                <Lock className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  Privacidad Garantizada
                </span>
              </div>
              <Title as="h1" className="mb-6 !text-white">
                Tu privacidad es nuestra prioridad
              </Title>
              <p className="text-lg text-zinc-400 leading-relaxed max-w-3xl mx-auto">
                Entendemos la importancia de tu privacidad. Aquí te explicamos
                cómo recopilamos, usamos y protegemos tu información al utilizar
                JJSecure VPN.
              </p>
            </motion.div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-24">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid gap-4">
              {sectionsData.map((section, index) => {
                const Icon = section.icon;
                const sectionId = section.title
                  .toLowerCase()
                  .normalize("NFD")
                  .replace(/[\u0300-\u036f]/g, "")
                  .replace(/\s+/g, "-")
                  .replace(/[^a-z0-9-]/g, "");
                
                return (
                  <motion.div
                    key={section.title}
                    id={sectionId}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                    className="group relative bg-zinc-900/50 rounded-xl p-8 border border-zinc-800/50 hover:border-zinc-700 transition-all duration-300 scroll-mt-24"
                  >
                    <div className="relative z-10 flex flex-col md:flex-row items-start gap-6">
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center transition-colors border border-zinc-700">
                          <Icon className="w-6 h-6 text-emerald-400" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <span className="text-[10px] font-mono font-bold text-zinc-500 tracking-wider">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <h2 className="text-xl font-bold text-white">
                            {section.title}
                          </h2>
                        </div>
                        <div className="text-zinc-400 text-sm sm:text-base">
                          {section.content}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Contact CTA */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="mt-12"
            >
              <div className="relative bg-zinc-900/50 border border-zinc-800/50 rounded-2xl p-8 md:p-12 text-center">
                <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-zinc-700">
                  <MessageCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  ¿Tienes preguntas sobre privacidad?
                </h2>
                <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
                  Nuestro equipo está disponible 24/7 para resolver cualquier
                  duda sobre cómo manejamos tus datos.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://t.me/SoporteJHS_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-8 py-3 rounded-xl transition-all duration-300 font-bold"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Soporte en Telegram
                  </a>
                  <a
                    href="https://wa.me/5493812531123"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-8 py-3 rounded-xl transition-all duration-300 font-bold border border-zinc-700"
                  >
                    <Phone className="w-5 h-5" />
                    WhatsApp
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-12 border-t border-zinc-900 bg-zinc-950/50 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Zap className="w-5 h-5 text-emerald-400" />
              <span className="font-bold text-xl tracking-tight text-white">JJSECURE VPN</span>
            </div>
            <p className="text-zinc-500 text-sm">
              © {new Date().getFullYear()} JJSecure VPN - Todos los derechos
              reservados
            </p>
          </div>
        </footer>
      </main>

      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Privacidad"
        subtitle="Secciones"
      >
        <div className="space-y-2 p-2">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  const element = document.getElementById(section.id);
                  if (element) {
                    element.scrollIntoView({ behavior: "smooth", block: "center" });
                  }
                }, 300);
              }}
              className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-sm font-semibold transition-all ${
                activeSection === section.id
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200"
              }`}
            >
              <div className={`${activeSection === section.id ? "text-emerald-400" : "text-zinc-500"}`}>
                {section.icon}
              </div>
              {section.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
};

export default PrivacyPage;
