import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, Zap } from "lucide-react";
import PlanGroupsSection from "./components/PlanGroupsSection";
import { SupportSection } from "./components/SupportSection";
import { apiService } from "../../services/api.service";
import { PlanRevendedor } from "../../types";
import { PlanGroup } from "./types";

export default function CreditosPage({ isMobileMenuOpen: _isMobileMenuOpen, setIsMobileMenuOpen: _setIsMobileMenuOpen }: { isMobileMenuOpen: boolean, setIsMobileMenuOpen: (v: boolean) => void }) {
  const navigate = useNavigate();
  const [planes, setPlanes] = useState<PlanRevendedor[]>([]);

  useEffect(() => {
    const cargar = async () => {
      try {
        const planos = await apiService.obtenerPlanesRevendedores(true, "compra");
        setPlanes(planos);
      } catch {
        setPlanes([]);
      }
    };
    cargar();
  }, []);

  // Forzar header fijo mientras esta página esté montada (evita que Lenis u otros contenedores
  // con transform rompan el comportamiento sticky del header global)
  useEffect(() => {
    const headerEl = document.querySelector('header');
    if (!headerEl) return;

    const prev = {
      position: headerEl.style.position || '',
      top: headerEl.style.top || '',
      left: headerEl.style.left || '',
      right: headerEl.style.right || '',
      zIndex: headerEl.style.zIndex || '',
    };

    headerEl.style.position = 'fixed';
    headerEl.style.top = '0';
    headerEl.style.left = '0';
    headerEl.style.right = '0';
    headerEl.style.zIndex = '10001';

    return () => {
      headerEl.style.position = prev.position;
      headerEl.style.top = prev.top;
      headerEl.style.left = prev.left;
      headerEl.style.right = prev.right;
      headerEl.style.zIndex = prev.zIndex;
    };
  }, []);

  const planesCredit = useMemo(
    () => planes.filter((p) => p.account_type === "credit").sort((a, b) => a.max_users - b.max_users),
    [planes]
  );

  const planesValidity = useMemo(
    () => planes.filter((p) => p.account_type === "validity").sort((a, b) => a.max_users - b.max_users),
    [planes]
  );

  const groupedPlans: PlanGroup[] = useMemo<PlanGroup[]>(() => [
    {
        id: "creditos",
      title: "Sistema de Créditos",
      subtitle: "1 crédito = 30 días de servicio",
      accent: "bg-purple-500/10 border-purple-500/20",
      accentText: "text-purple-400",
      icon: <Zap className="w-5 h-5" />,
      recommended: true,
      mainDescription:
        "Diseñado para máxima flexibilidad. 1 conexión = 1 crédito. Las cuentas son independientes de tu suscripción.",
      shortDescription: "1 conexión = 1 crédito | 30 días = 1 crédito, 60 días = 2 créditos",
      keyFeatures: [
        { icon: "zap", title: "1 Conexión = 1 Crédito", description: "Cada crédito = 1 conexión VPN independiente" },
        { icon: "clock", title: "Costo por Duración", description: "30 días = 1 crédito | 60 días = 2 créditos | 90 días = 3 créditos" },
        { icon: "users", title: "Cuentas Independientes", description: "Se mantienen vigentes incluso después de vencer tu suscripción" },
        { icon: "check-circle", title: "Acumula Créditos", description: "Almacena en tu panel y úsalos cuando necesites" },
      ],
      useCases: [
        "Vender planes mensuales estándar (30 días)",
        "Ofrecer pruebas extendidas personalizadas",
        "Crear planes anuales (360+ días) para clientes premium",
        "Adaptarse a preferencias específicas de cada cliente",
      ],
      bestFor: "Revendedores que buscan máxima flexibilidad para crear planes personalizados sin limitaciones de duración.",
      items: planesCredit,
    },
    {
        id: "validez",
      title: "Sistema de Validez",
      subtitle: "Suscripción con reutilización automática de cupos",
      accent: "bg-purple-500/10 border-purple-500/20",
      accentText: "text-purple-400",
      icon: <BarChart3 className="w-5 h-5" />,
      mainDescription:
        "Suscripción mensual renovable con reutilización de cupos. Los usuarios están vinculados a tu suscripción.",
      shortDescription: "0/N usuarios → Vinculados a tu suscripción mensual",
      keyFeatures: [
        { icon: "refresh-cw", title: "Vinculado a Suscripción Mensual", description: "Los usuarios están ligados a tu suscripción. Si expira, todos expiran." },
        { icon: "users", title: "Reutilización dentro del Mes", description: "Crea cuentas de cualquier duración dentro del mismo mes" },
        { icon: "dollar-sign", title: "Sin Costo Adicional", description: "No consumes créditos, solo cupos reutilizables" },
        { icon: "maximize", title: "Máxima Rentabilidad", description: "Optimiza tu inventario con diferentes duraciones mensuales" },
      ],
      useCases: [
        "Vender cuentas dentro del mes (30, 20, 15 días)",
        "Combinar duraciones (1×30 días, 2×15 días, etc.) en el mismo mes",
        "Maximizar la utilización de cupos mensuales",
        "Mantener rentabilidad sin costo adicional durante el mes",
      ],
      bestFor: "Revendedores que buscan eficiencia: vender cuentas premium personalizadas reutilizando cupos sin gastar créditos.",
      items: planesValidity,
    },
  ], [planesCredit, planesValidity]);

  const handleConfirmarCompra = (plan: PlanRevendedor) => {
    navigate(`/checkout-revendedor?planId=${plan.id}`);
  };

  return (
    <div className="bg-refine-dark text-zinc-100">
      <main className="flex flex-col">
        <section className="relative py-12 sm:py-16 lg:py-20 bg-refine-dark">
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="w-full">
              <PlanGroupsSection groups={groupedPlans} onConfirmarCompra={handleConfirmarCompra} initialGroupId="creditos" />
            </div>
          </div>
        </section>

        <SupportSection />
      </main>
    </div>
  );
}
