import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users } from "lucide-react";
import { ServerStats } from "./components/ServerStats";
import { LatestUsers } from "./components/LatestUsers";
import { ServersHero } from "./components/ServersHero";
import BottomSheet from "../../components/BottomSheet";
import type { ServersPageProps } from "./types";
import { ServerGlobalSummary } from "./components/ServerGlobalSummary";

const ServersPage = ({ isMobileMenuOpen, setIsMobileMenuOpen }: ServersPageProps) => {
  const [activeSection, setActiveSection] = useState("server-stats");

  const serversSections = [
    {
      id: "server-stats",
      label: "Estadísticas",
      subtitle: "Servidores en tiempo real",
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      id: "latest-users",
      label: "Usuarios",
      subtitle: "Últimos registrados",
      icon: <Users className="w-4 h-4" />,
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Mobile Bottom Sheet Navigation */}
      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
        subtitle="Secciones"
      >
        <div className="space-y-1">
          {serversSections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  document
                    .getElementById(`section-${section.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "center" });
                }, 300);
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                  : "text-zinc-400 hover:bg-zinc-800"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </BottomSheet>

      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <ServersHero />
        
        {/* Content Container - starts where video ends */}
        <div className="bg-zinc-900">
          <div className="max-w-7xl mx-auto">
            {/* Global Summary - Stats Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <ServerGlobalSummary />
            </motion.div>

            {/* Server Stats Section */}
            <div id="section-server-stats">
              <ServerStats />
            </div>
          </div>
        </div>

        {/* Latest Users Section */}
        <div id="section-latest-users">
          <LatestUsers />
        </div>
      </main>
    </div>
  );
};

export default ServersPage;
export type { ServersPageProps };
