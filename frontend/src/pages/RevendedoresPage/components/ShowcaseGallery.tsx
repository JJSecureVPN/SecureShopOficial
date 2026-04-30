import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Heart,
  MessageSquare,
  Layout,
  UserPlus,
  ShieldCheck,
  Settings
} from "lucide-react";

interface ShowcaseItem {
  id: string;
  title: string;
  category: string;
  image: string;
  icon: React.ElementType;
  stats: {
    views: string;
    likes: string;
    comments: string;
  };
  badge?: string;
}

const showcaseItems: ShowcaseItem[] = [
  {
    id: "dashboard",
    title: "Panel de Control",
    category: "ADMINISTRACIÓN",
    image: "/Servex/DashboardServex.png",
    icon: Layout,
    stats: { views: "1.2k", likes: "45", comments: "12" },
    badge: "CORE"
  },
  {
    id: "users",
    title: "Gestión de Usuarios",
    category: "CRM",
    image: "/Servex/TarjetaUserServex.png",
    icon: ShieldCheck,
    stats: { views: "850", likes: "32", comments: "8" },
    badge: "PRO"
  },
  {
    id: "create-reseller",
    title: "Alta de Revendedores",
    category: "NETWORK",
    image: "/Servex/CrearRevendedorServex.png",
    icon: UserPlus,
    stats: { views: "640", likes: "28", comments: "5" },
    badge: "NEW"
  },
  {
    id: "create-account",
    title: "Generación de Cuentas",
    category: "AUTOMATION",
    image: "/Servex/CrearCuentaServex.png",
    icon: Settings,
    stats: { views: "920", likes: "40", comments: "15" }
  }
];

function ShowcaseCard({ item }: { item: ShowcaseItem }) {
  const [isHovered, setIsHovered] = useState(false);
  const Icon = item.icon;

  return (
    <div
      className="relative cursor-pointer font-title"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Plate */}
      <motion.div
        className="absolute bg-[#1e1f26] rounded-xl border border-zinc-800/50 shadow-2xl z-0"
        initial={false}
        animate={{
          top: isHovered ? -8 : 15,
          left: isHovered ? -8 : 15,
          right: isHovered ? -8 : -15,
          bottom: isHovered ? -48 : -15,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      />

      {/* Foreground Content */}
      <div className="relative z-10 p-0.5">
        {/* Image Section */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-lg bg-[#0a0a0a] border border-white/5">
          <motion.img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-contain p-1"
            animate={{
              opacity: isHovered ? 1 : 0.95
            }}
            transition={{ duration: 0.4 }}
          />
        </div>

        {/* Info Section */}
        <div className="mt-3 flex items-center gap-3 px-1">
          <div className={`w-9 h-9 rounded-lg bg-[#060606] border border-zinc-800 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${isHovered ? 'bg-[#131417]' : ''}`}>
            <Icon className="w-4.5 h-4.5 text-[#00ffc8]" />
          </div>

          <div className="flex-1 min-w-0">
            <h4 className="text-white font-black text-[12px] uppercase tracking-tight truncate">
              {item.title}
            </h4>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[8px] font-bold text-zinc-500 uppercase tracking-widest">
                {item.category}
              </span>
              {item.badge && (
                <span className="px-1.2 py-0.4 bg-[#00ffc8] text-black text-[7px] font-black rounded-sm uppercase tracking-tighter">
                  {item.badge}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Hover Stats Section */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0, y: 0 }}
              animate={{ opacity: 1, y: 10 }}
              exit={{ opacity: 0, y: 0 }}
              className="absolute left-0 right-0 px-2 pointer-events-none"
            >
              <div className="pt-3 border-t border-zinc-800/50 w-full flex items-center gap-4">
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <Heart className="w-3 h-3" />
                  <span className="text-[9px] font-bold">{item.stats.likes}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500">
                  <MessageSquare className="w-3 h-3" />
                  <span className="text-[9px] font-bold">{item.stats.comments}</span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-500 ml-auto">
                  <Eye className="w-3 h-3" />
                  <span className="text-[9px] font-bold">{item.stats.views}</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export function ShowcaseGallery() {
  return (
    <section className="py-20 md:py-40 font-title overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-16 md:mb-24">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/5 border border-white/10 rounded-full mb-6">
            <Layout className="w-3.5 h-3.5 text-zinc-500" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
              Interface Showcase
            </span>
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-4 leading-tight">
            Descubre el Panel <span className="text-zinc-600">Servex.</span>
          </h2>
          <p className="max-w-xl text-sm md:text-base text-zinc-500 font-medium leading-relaxed">
            Una plataforma diseñada para el alto rendimiento, con herramientas avanzadas de automatización y control total.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-12 gap-y-20 md:gap-y-40">
          {showcaseItems.map((item) => (
            <ShowcaseCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
