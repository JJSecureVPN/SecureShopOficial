import { useState } from "react";
import {
  ShieldCheck,
  RefreshCw,
  Ban,
  CreditCard,
  FileWarning,
  CheckCircle,
  MessageCircle,
  Phone,
  Sparkles,
  Zap,
} from "lucide-react";
import BottomSheet from "../components/BottomSheet";
import { Title } from "../components/Title";
import { motion } from "framer-motion";

interface TermsPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

const sectionsData = [
  {
    title: "Aceptación de Términos",
    icon: ShieldCheck,
    content: (
      <p className="text-zinc-300 leading-relaxed">
        Al acceder y utilizar JJSecure VPN, confirmas que has leído, entendido y
        aceptas estos términos. Si no estás de acuerdo, no debes usar el
        servicio.
      </p>
    ),
  },
  {
    title: "Descripción del Servicio",
    icon: RefreshCw,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          JJSecure VPN es un servicio de proxy/VPN que te permite:
        </p>
        <ul className="space-y-2 text-zinc-300">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Navegar de forma más privada y segura
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Acceder a contenido con restricciones geográficas
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Proteger tu conexión en redes WiFi públicas
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Uso Responsable",
    icon: CheckCircle,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          Te comprometes a usar el servicio de manera responsable y legal. Está
          prohibido usar el servicio para:
        </p>
        <ul className="space-y-2 text-zinc-300">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Actividades ilegales o maliciosas
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Spam, phishing o distribución de malware
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-400" />
            Ataques contra otros servicios o usuarios
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Limitaciones del Servicio",
    icon: FileWarning,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          El servicio se proporciona "tal como es", con las siguientes
          consideraciones:
        </p>
        <ul className="space-y-2 text-zinc-300">
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Puede haber interrupciones ocasionales por mantenimiento
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            La velocidad puede variar según la congestión de la red
          </li>
          <li className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            Nos reservamos el derecho de limitar conexiones simultáneas
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: "Responsabilidad y Garantías",
    icon: Ban,
    content: (
      <div className="space-y-4">
        <p className="text-zinc-300">
          JJSecure VPN no se hace responsable de daños directos o indirectos
          derivados del uso del servicio. El usuario es el único responsable de
          sus actividades mientras usa el servicio.
        </p>
      </div>
    ),
  },
  {
    title: "Reembolso y Compra de Logins",
    icon: CreditCard,
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div>
            <p className="text-white font-medium mb-2">
              Política de reembolso:
            </p>
            <p className="text-zinc-400 text-sm">
              Tendrás derecho al reembolso solamente si se comprueba que el
              problema está relacionado con nuestros servidores y no con
              bloqueos de las operadoras. Debes proporcionar pruebas del
              problema.
            </p>
          </div>

          <div>
            <p className="text-white font-medium mb-2">
              Congelamiento de planes:
            </p>
            <p className="text-zinc-400 text-sm">
              En casos de bloqueos por parte de las operadoras, los planes se
              congelarán hasta que se encuentre un nuevo método funcional. Se
              reintegrarán todos los días restantes.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
            <p className="text-emerald-400 font-medium mb-1 text-sm flex items-center gap-2">
              <Sparkles className="w-4 h-4" /> Importante:
            </p>
            <p className="text-emerald-400/80 text-xs">
              No se realizarán reembolsos por bloqueos de operadoras o problemas
              de conectividad del usuario, pero los días pagados se preservarán
              mediante el sistema de congelamiento.
            </p>
          </div>
        </div>
      </div>
    ),
  },
];

const TermsPage = ({ isMobileMenuOpen, setIsMobileMenuOpen }: TermsPageProps) => {
  const [activeSection, setActiveSection] = useState("aceptacion-de-terminos");

  const sections = [
    {
      id: "aceptacion-de-terminos",
      label: "Aceptación",
      icon: <ShieldCheck className="w-4 h-4" />,
    },
    {
      id: "descripcion-del-servicio",
      label: "Descripción",
      icon: <RefreshCw className="w-4 h-4" />,
    },
    {
      id: "uso-responsable",
      label: "Uso Responsable",
      icon: <CheckCircle className="w-4 h-4" />,
    },
    {
      id: "limitaciones-del-servicio",
      label: "Limitaciones",
      icon: <Ban className="w-4 h-4" />,
    },
    {
      id: "responsabilidad-y-garantias",
      label: "Responsabilidad",
      icon: <FileWarning className="w-4 h-4" />,
    },
    {
      id: "reembolso-y-compra-de-logins",
      label: "Reembolso",
      icon: <CreditCard className="w-4 h-4" />,
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
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-medium text-emerald-400">
                  Documentación Legal
                </span>
              </div>
              <Title as="h1" className="mb-6 !text-white">
                Términos de uso del servicio
              </Title>
              <p className="text-lg text-zinc-400 leading-relaxed max-w-3xl mx-auto">
                Al usar JJSecure VPN, aceptas los siguientes términos y
                condiciones. Te recomendamos leerlos detenidamente para entender
                tus derechos y responsabilidades.
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
                  ¿Tienes preguntas sobre los términos?
                </h2>
                <p className="text-zinc-400 mb-8 max-w-2xl mx-auto">
                  Nuestro equipo de soporte está disponible 24/7 para aclarar
                  cualquier duda sobre nuestros términos de servicio y políticas.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="https://t.me/SoporteJHS_bot"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 px-8 py-3 rounded-xl transition-all duration-300 font-bold"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Soporte oficial bot
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
        title="Navegación legal"
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

export default TermsPage;
