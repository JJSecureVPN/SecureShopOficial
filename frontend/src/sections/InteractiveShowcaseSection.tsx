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
      glow: "rgba(59, 130, 246, 0.15)", // blue-500
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
      glow: "rgba(16, 185, 129, 0.15)", // emerald-500
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
      glow: "rgba(168, 85, 247, 0.15)", // purple-500
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
      glow: "rgba(251, 146, 60, 0.15)", // orange-500
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
    <section className="py-16 sm:py-20 lg:py-24 bg-refine-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mt-8 sm:mt-12">
          <div className="select-none relative h-[752px] sm:h-[874px] md:h-[984px] lg:h-[688px] pt-4 sm:pt-10 lg:pt-20 pb-32 sm:pb-4 lg:pb-0 pl-4 sm:pl-10 bg-zinc-800 rounded-2xl sm:rounded-3xl overflow-hidden">
            {/* Glow background - cambia según la sección activa, viene desde esquina superior derecha */}
            <div 
              className="absolute inset-0 z-0 opacity-100 transition-all duration-700"
              style={{
                background: `radial-gradient(circle at 100% 0%, ${features[activeIndex].color.glow}, transparent 60%)`,
              }}
            />

            {/* Content grid */}
            <div className="relative z-[1] h-full w-full flex flex-col lg:grid lg:grid-cols-12">
              {/* Left side: Text and buttons */}
              <div className="pr-6 sm:pr-0 sm:max-w-[540px] md:max-w-[760px] lg:max-w-[435px] lg:col-span-5 lg:mt-16">
                <h3 className="text-base sm:text-2xl font-normal text-white">
                  JJSecure VP-N — la app más completa para Internet ilimitado, velocidad y privacidad.
                </h3>
                <p className="mt-6 text-sm text-zinc-300">
                  Controla tu conexión y protege tu privacidad con <strong>JJSecure VP-N</strong>. Conecta con un solo clic, selecciona servidores optimizados y consulta estadísticas en tiempo real para una experiencia segura y confiable.
                </p>

                {/* Feature buttons grid */}
                <div 
                  className="mt-4 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6"
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
                        className={`appearance-none focus:outline-none cursor-pointer w-full flex items-center justify-start gap-3 pl-3 pr-5 py-3 rounded-lg text-sm sm:text-base transition-all duration-200 ${
                          isActive ? 'bg-black' : 'bg-zinc-900'
                        }`}
                      >
                        <Icon className={`w-5 h-5 transition-colors duration-200 ${isActive ? feature.color.icon : 'text-zinc-500'}`} />
                        <span className={isActive ? 'text-white' : 'text-zinc-400'}>
                          {feature.title}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right side: Images */}
              <div className="relative h-[300px] sm:h-full mt-4 sm:mt-[72px] lg:mt-0 flex lg:col-start-7 lg:col-end-13 -ml-8">
                <div className="w-full h-full z-[1] lg:absolute top-0 right-0">
                  {features.map((feature, index) => {
                    const isActive = activeIndex === index;
                    
                    return (
                      <img
                        key={feature.id}
                        src={feature.image}
                        alt={`UI de ${feature.title}`}
                        className={`block object-contain object-center w-full md:w-[874px] lg:w-full ${feature.id === 4 ? 'h-[420px] sm:h-[520px] lg:h-[640px]' : feature.id === 1 ? 'h-[360px] sm:h-[460px] lg:h-[540px]' : 'h-[300px] sm:h-full lg:h-[464px]'} absolute ${feature.id === 4 ? 'top-[-40px] sm:top-[-80px] lg:top-[-120px]' : feature.id === 1 ? 'top-[-20px] sm:top-[-50px] lg:top-[-80px]' : 'top-0'} left-0 right-0 transition-[transform,opacity] duration-500 ease-in-out ${
                          isActive
                            ? 'translate-x-0 opacity-100 delay-300'
                            : 'translate-x-full opacity-0'
                        }` }
                        style={{
                          maskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
                          WebkitMaskImage: 'linear-gradient(to right, transparent 0%, black 20%, black 80%, transparent 100%)',
                        }}
                      />
                    );
                  })}
                </div>

                {/* Contenedor inferior con descripción */}
                {features.map((feature, index) => {
                  const isActive = activeIndex === index;
                  
                  if (!feature.description) return null;
                  
                  return (
                    <div
                      key={`desc-${feature.id}`}
                      className={`hidden sm:block z-[2] w-full sm:w-[488px] absolute -bottom-28 sm:bottom-[0px] lg:bottom-[12px] left-4 right-4 sm:left-auto sm:right-auto sm:-left-2 lg:-left-20 rounded-xl bg-black p-3 sm:p-4 transition-[transform,opacity] duration-500 ease-in-out ${
                        isActive
                          ? 'delay-300 translate-y-0 opacity-100'
                          : 'translate-y-full opacity-0'
                      }`}
                      style={{
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.4)',
                      }}
                    >
                      <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>


        </div>
      </div>
    </section>
  );
}
