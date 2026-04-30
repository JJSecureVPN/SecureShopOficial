import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  Users,
  Ticket,
  Bell,
  Percent,
  Gift,
  ChevronRight,
  LifeBuoy,
  BookOpen,
  Menu,
  X,
} from "lucide-react";

type AdminSection =
  | "overview"
  | "planes"
  | "sponsors"
  | "cupones"
  | "noticias"
  | "descuentos"
  | "referidos"
  | "tutorials"
  | "tickets";

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "overview",   label: "Dashboard",   icon: <LayoutDashboard className="w-5 h-5" />, description: "Resumen general" },
  { id: "tickets",    label: "Soporte",     icon: <LifeBuoy className="w-5 h-5" />,        description: "Gestionar tickets" },
  { id: "planes",     label: "Planes",      icon: <Package className="w-5 h-5" />,          description: "Gestionar planes VPN" },
  { id: "sponsors",   label: "Sponsors",    icon: <Users className="w-5 h-5" />,            description: "Gestionar sponsors" },
  { id: "cupones",    label: "Cupones",     icon: <Ticket className="w-5 h-5" />,           description: "Crear y gestionar cupones" },
  { id: "noticias",   label: "Avisos",      icon: <Bell className="w-5 h-5" />,             description: "Configurar avisos" },
  { id: "descuentos", label: "Descuentos",  icon: <Percent className="w-5 h-5" />,          description: "Descuentos globales" },
  { id: "referidos",  label: "Referidos",   icon: <Gift className="w-5 h-5" />,             description: "Programa de referidos" },
  { id: "tutorials",  label: "Tutoriales",  icon: <BookOpen className="w-5 h-5" />,         description: "Revisar tutoriales" },
];

interface AdminSidebarProps {
  activeSection: AdminSection;
  onSectionChange: (section: AdminSection) => void;
}

export function AdminSidebar({ activeSection, onSectionChange }: AdminSidebarProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Cerrar el drawer al cambiar el tamaño a escritorio
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) setIsOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bloquear scroll cuando el drawer está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }
  }, [isOpen]);

  const handleSectionClick = (id: AdminSection) => {
    onSectionChange(id);
    setIsOpen(false);
  };

  const NavContent = () => (
    <>
      {/* Admin panel label */}
      <div className="px-5 pt-5 pb-4 flex-shrink-0 border-b border-zinc-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
          <div>
            <p className="text-[11px] font-black text-white uppercase tracking-widest">
              Admin<span className="text-orange-500">Tools</span>
            </p>
            <p className="text-[8px] font-bold text-zinc-600 uppercase tracking-widest mt-0.5">
              Panel de control
            </p>
          </div>
        </div>
      </div>

      {/* Section label */}
      <div className="px-6 pt-5 pb-3 flex-shrink-0">
        <p className="text-[9px] font-black text-zinc-600 uppercase tracking-[0.25em]">
          Módulos de Gestión
        </p>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 space-y-1 pb-6 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleSectionClick(item.id)}
              className={`
                relative w-full flex items-center gap-4 px-4 py-3.5
                rounded-2xl transition-colors duration-200 text-left overflow-hidden
                ${isActive
                  ? "text-white"
                  : "text-zinc-500 hover:bg-zinc-900/80 hover:text-zinc-200"
                }
              `}
            >
              {/* Background — always in DOM, toggled via opacity to avoid layout recalc */}
              <div
                className={`absolute inset-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-2xl transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />
              {/* Subtle shadow when active */}
              <div
                className={`absolute inset-0 rounded-2xl shadow-lg shadow-orange-500/30 transition-opacity duration-200 ${
                  isActive ? "opacity-100" : "opacity-0"
                }`}
              />

              {/* Icon — transparent bg when inactive to avoid flash during gradient transition */}
              <div
                className={`relative z-10 flex-shrink-0 p-2 rounded-xl transition-colors duration-200 ${
                  isActive ? "bg-white/20" : "bg-transparent"
                }`}
              >
                {item.icon}
              </div>

              {/* Label */}
              <div className="relative z-10 flex-1 min-w-0">
                <div className="font-black text-[11px] uppercase tracking-wider truncate">
                  {item.label}
                </div>
                <div
                  className={`text-[9px] font-bold uppercase tracking-tight truncate transition-colors duration-200 ${
                    isActive ? "text-orange-100/70" : "text-zinc-600"
                  }`}
                >
                  {item.description}
                </div>
              </div>

              {/* Arrow */}
              <ChevronRight
                className={`relative z-10 w-4 h-4 flex-shrink-0 transition-all duration-200 ${
                  isActive
                    ? "text-white/80 opacity-100 translate-x-0"
                    : "text-zinc-700 opacity-0 -translate-x-1"
                }`}
              />
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="flex-shrink-0 px-6 py-6 border-t border-zinc-800/60 mt-auto">
        <div className="flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.6)]" />
          <span className="text-[9px] font-black text-zinc-600 uppercase tracking-widest">
            Sistema Sincronizado
          </span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className="
          hidden lg:flex flex-col
          fixed top-16 left-0 h-[calc(100vh-4rem)] w-72
          bg-zinc-950 border-r border-zinc-800/60
          z-[9000] scrollbar-none
        "
      >
        <NavContent />
      </aside>

      {/* ── MOBILE MINI HEADER ── */}
      <div className="lg:hidden fixed top-16 left-0 right-0 w-full z-[9000] bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800/60 h-14 flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsOpen(true)}
            className="p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
          >
            <Menu size={20} />
          </button>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest">
              AdminTools
            </span>
            <span className="text-xs font-bold text-white truncate max-w-[150px]">
              {NAV_ITEMS.find(n => n.id === activeSection)?.label}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
            <div className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-800 text-[10px] font-black text-zinc-500 uppercase tracking-tighter">
                v4.0
            </div>
        </div>
      </div>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {isOpen && (
          <div className="lg:hidden fixed inset-x-0 bottom-0 top-16 z-[10000] flex">
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Cabinet / Sidebar Panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="relative w-80 max-w-[85%] h-full bg-zinc-950 border-r border-zinc-800/60 flex flex-col pt-2 shadow-2xl"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white z-20"
              >
                <X size={20} />
              </button>
              <NavContent />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

export { NAV_ITEMS };
export type { AdminSection };
