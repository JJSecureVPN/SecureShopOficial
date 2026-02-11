import { useState, useEffect } from "react";
import { Shield, Globe2, Lock, Server, UploadCloud } from "lucide-react";

interface Feature {
  id: number;
  icon: typeof Shield;
  title: string;
  image: string;
  description?: string;
  color: {
    icon: string;
    glow: string;
  };
}

const features: Feature[] = [
  {
    id: 0,
    icon: Server,
    title: "Interfaz Principal",
    image: "/ServerCard.png",
    description: "Descubre la interfaz intuitiva y moderna de JJSecure VP-N. Conecta y desconecta con un solo clic, selecciona servidores optimizados automáticamente, configura protocolos de seguridad avanzados y accede a estadísticas en tiempo real de tu conexión. Todo diseñado para una experiencia fluida y sin complicaciones.",
    color: {
      icon: "text-blue-500",
      glow: "rgba(59, 130, 246, 0.15)",
    },
  },
  {
    id: 1,
    icon: Shield,
    title: "Menú Completo",
    image: "/menuitem.png",
    description: "Descubre todas las opciones disponibles en nuestro menú intuitivo. Gestiona fácilmente el compartir WiFi para extender tu conexión VPN, accede a configuraciones de APN para conexiones móviles optimizadas, y encuentra herramientas básicas pero esenciales para mantener tu conexión segura y estable en todo momento.",
    color: {
      icon: "text-emerald-500",
      glow: "rgba(16, 185, 129, 0.15)",
    },
  },
  {
    id: 2,
    icon: Globe2,
    title: "Servidores Estratégicos",
    image: "/servidores.png",
    description: "Inicia tu experiencia VPN con nuestros servidores estratégicos de alta velocidad, cuidadosamente seleccionados para ofrecer conexiones óptimas y seguras. Cada servidor está optimizado para máxima velocidad y estabilidad, proporcionando una base sólida para tu navegación privada mientras expandimos continuamente nuestra red global.",
    color: {
      icon: "text-purple-500",
      glow: "rgba(168, 85, 247, 0.15)",
    },
  },
  {
    id: 3,
    icon: Lock,
    title: "Sistema de Logs",
    image: "/logs.png",
    description: "Mantén el control total de tu actividad con nuestro sistema avanzado de registros y logs detallados. Monitorea conexiones en tiempo real, revisa historial de sesiones, identifica posibles problemas de conectividad y genera reportes de uso para mantener un registro completo de tu navegación segura y privada.",
    color: {
      icon: "text-orange-500",
      glow: "rgba(251, 146, 60, 0.15)",
    },
  },
  {
    id: 4,
    icon: UploadCloud,
    title: "Importar configuración",
    image: "/ImportScreen.png",
    description: "En esta pantalla el usuario puede configurar la app de forma automática pegando un archivo JSON con el servidor y las credenciales ya definidas. Al presionar Continuar, la aplicación analiza el contenido, selecciona el servidor correspondiente y carga el usuario y la contraseña sin necesidad de hacerlo manualmente.",
    color: {
      icon: "text-cyan-400",
      glow: "rgba(34, 211, 238, 0.15)",
    },
  },
];

export default function InteractiveShowcaseSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);

  // Auto-rotate cuando no hay hover
  useEffect(() => {
    if (!isHovering) {
      const interval = setInterval(() => {
        setActiveIndex((prev) => (prev + 1) % features.length);
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [isHovering]);

  return (
    <section className="py-12 sm:py-16 lg:py-24 bg-refine-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-6 sm:mt-8 lg:mt-12">
          {/* Container principal - altura dinámica en móvil */}
          <div className="select-none relative min-h-[720px] sm:h-[874px] md:h-[984px] lg:h-[688px] pt-6 sm:pt-10 lg:pt-20 pb-6 sm:pb-4 lg:pb-0 px-4 sm:pl-10 sm:pr-4 bg-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Glow background */}
            <div 
              className="absolute inset-0 z-0 opacity-100 transition-all duration-700"
              style={{
                background: `radial-gradient(circle at 100% 0%, ${features[activeIndex].color.glow}, transparent 60%)`,
              }}
            />

            {/* Content grid */}
            <div className="relative z-[1] h-full w-full flex flex-col lg:grid lg:grid-cols-12 lg:gap-8">
              {/* Left side: Text and buttons */}
              <div className="lg:col-span-5 lg:mt-16">
                <h3 className="text-lg sm:text-2xl font-normal text-white leading-tight">
                  JJSecure VP-N — la app más completa para Internet ilimitado, velocidad y privacidad.
                </h3>
                <p className="mt-4 sm:mt-6 text-sm sm:text-base text-zinc-300 leading-relaxed">
                  Controla tu conexión y protege tu privacidad con <strong>JJSecure VP-N</strong>. Conecta con un solo clic, selecciona servidores optimizados y consulta estadísticas en tiempo real para una experiencia segura y confiable.
                </p>

                {/* Feature buttons grid */}
                <div 
                  className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 lg:gap-6"
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
                >
                  {features.map((feature, index) => {
                    const Icon = feature.icon;
                    const isActive = activeIndex === index;
                    
                    return (
                      <button
                        key={feature.id}
                        onMouseEnter={() => setActiveIndex(index)}
                        onClick={() => setActiveIndex(index)}
                        className={`appearance-none focus:outline-none cursor-pointer w-full flex items-center justify-start gap-3 pl-3 pr-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                          isActive ? 'bg-black shadow-lg' : 'bg-zinc-900'
                        }`}
                      >
                        <Icon className={`w-5 h-5 flex-shrink-0 transition-colors duration-200 ${isActive ? feature.color.icon : 'text-zinc-500'}`} />
                        <span className={`text-left transition-colors duration-200 ${isActive ? 'text-white font-medium' : 'text-zinc-400'}`}>
                          {feature.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right side: Images and description */}
              <div className="relative mt-8 sm:mt-12 lg:mt-0 lg:col-start-7 lg:col-end-13 flex flex-col">
                {/* Image container */}
                <div className="relative w-full h-[340px] sm:h-auto mb-4 sm:mb-0 sm:flex-1 flex items-center justify-center">
                  {features.map((feature, index) => {
                    const isActive = activeIndex === index;

                    return (
                      <div key={`img-${feature.id}`} className="absolute inset-0 w-full h-full">
                        {/* Desktop & Tablet: layered absolute images */}
                        <img
                          src={feature.image}
                          alt={`UI de ${feature.title}`}
                          className={`hidden sm:block absolute left-0 right-0 object-contain object-center w-full md:w-[874px] lg:w-full ${
                            feature.id === 4 
                              ? 'h-[520px] lg:h-[640px] top-[-80px] lg:top-[-120px]' 
                              : feature.id === 1 
                              ? 'h-[460px] lg:h-[540px] top-[-50px] lg:top-[-80px]' 
                              : 'h-full lg:h-[464px] top-0'
                          } transition-[transform,opacity] duration-500 ease-in-out ${
                            isActive ? 'translate-x-0 opacity-100 delay-300' : 'translate-x-full opacity-0'
                          }`}
                          style={{
                            maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
                          }}
                        />

                        {/* Mobile: centered, properly sized images with crossfade */}
                        <div className={`sm:hidden absolute inset-0 flex items-center justify-center transition-opacity duration-500 ${
                          isActive ? 'opacity-100 z-10' : 'opacity-0 z-0'
                        }`}>
                          <img
                            src={feature.image}
                            alt={`UI de ${feature.title}`}
                            className="object-contain w-auto max-w-full h-full max-h-[340px]"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Description cards */}
                <div className="relative sm:mt-0">
                  {features.map((feature, index) => {
                    const isActive = activeIndex === index;
                    if (!feature.description) return null;

                    return (
                      <div key={`desc-${feature.id}`}>
                        {/* Mobile: description card below image */}
                        <div
                          className={`sm:hidden w-full rounded-xl bg-black/90 backdrop-blur-sm p-4 transition-all duration-300 ${
                            isActive ? 'opacity-100 translate-y-0 relative' : 'opacity-0 translate-y-4 pointer-events-none absolute top-0 left-0 right-0'
                          }`}
                        >
                          <p className="text-xs text-zinc-300 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>

                        {/* Desktop & tablet: absolute positioned card */}
                        <div
                          className={`hidden sm:block absolute w-full sm:w-[488px] bottom-0 lg:bottom-3 left-0 sm:-left-2 lg:-left-20 rounded-xl bg-black/95 backdrop-blur-sm p-4 transition-[transform,opacity] duration-500 ease-in-out ${
                            isActive ? 'delay-300 translate-y-0 opacity-100' : 'translate-y-full opacity-0 pointer-events-none'
                          }`}
                        >
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {feature.description}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}