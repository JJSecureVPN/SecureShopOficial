import { Clock, Zap, Flame } from "lucide-react";
import { memo } from "react";
import { usePromoTimerRevendedores } from "../hooks/usePromoTimerRevendedores";

/**
 * Componente que muestra el temporizador de promoción para revendedores en tiempo real
 * Memoizado para evitar re-renders innecesarios
 */
function PromoTimerRevendedoresComponent() {
  const {
    promo_config,
    tiempo_restante_formateado,
    porcentaje_restante,
    loading,
  } = usePromoTimerRevendedores();

  // No mostrar nada si la promo no está activa
  if (!promo_config?.activa) {
    return null;
  }

  // No mostrar mientras carga
  if (loading) {
    return null;
  }

  // Valores por defecto si no están disponibles
  const porcentaje = porcentaje_restante ?? 0;
  const tiempo = tiempo_restante_formateado ?? "Cargando...";

  // Calcular configuración de colores basado en tiempo restante
  const getColorConfig = () => {
    if (porcentaje > 50) {
      return {
        text: "text-emerald-400",
        progress: "bg-emerald-500",
        icon: <Zap className="w-4 h-4" />,
      };
    }
    if (porcentaje > 20) {
      return {
        text: "text-amber-400",
        progress: "bg-amber-500",
        icon: <Flame className="w-4 h-4" />,
      };
    }
    return {
      text: "text-red-400",
      progress: "bg-red-500",
      icon: <Clock className="w-4 h-4" />,
    };
  };

  const colorConfig = getColorConfig();

  return (
    <div className="w-full flex justify-center px-4 py-3">
      <div className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl border border-neutral-800 bg-neutral-900/80 backdrop-blur-sm">
        {/* Icono */}
        <div className={colorConfig.text}>{colorConfig.icon}</div>

        {/* Título y temporizador */}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-neutral-300">
            ¡Promoción Activa!
          </span>
          <span className="text-sm font-mono font-bold text-neutral-200 bg-neutral-800 px-2.5 py-0.5 rounded">
            {tiempo}
          </span>
        </div>

        {/* Barra de progreso y porcentaje */}
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-neutral-700 rounded-full overflow-hidden">
            <div
              className={`h-full ${colorConfig.progress} transition-all duration-500`}
              style={{ width: `${Math.max(0, Math.min(100, porcentaje))}%` }}
            />
          </div>
          <div
            className={`text-xs ${colorConfig.text} font-medium whitespace-nowrap`}
          >
            {Math.round(porcentaje)}%
          </div>
        </div>
      </div>
    </div>
  );
}

export const PromoTimerRevendedores = memo(PromoTimerRevendedoresComponent);
