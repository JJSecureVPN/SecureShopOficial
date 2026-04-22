import { useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import FlipCountdownTimer from "./FlipCountdownTimer";

type PromoTheme = {
  accent: string;
  accentDark: string;
  accentText: string;
};

const THEME_PLANES: PromoTheme = {
  // (Actual) verde/neón
  accent: "#d4ff00",
  accentDark: "#b8e600",
  accentText: "#110723",
};

const THEME_REVENDEDORES: PromoTheme = {
  // Naranja
  accent: "#fb923c",
  accentDark: "#f97316",
  accentText: "#110723",
};

const THEME_AMBAS: PromoTheme = {
  // Índigo (brillante para mantener texto oscuro)
  accent: "#a5b4fc",
  accentDark: "#818cf8",
  accentText: "#110723",
};

const THEME_2X1: PromoTheme = {
  // Púrpura brillante
  accent: "#c084fc",
  accentDark: "#a855f7",
  accentText: "#ffffff",
};

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace("#", "");
  const full = normalized.length === 3
    ? normalized.split("").map((c) => c + c).join("")
    : normalized;

  const r = parseInt(full.slice(0, 2), 16);
  const g = parseInt(full.slice(2, 4), 16);
  const b = parseInt(full.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

interface PromoConfig {
  activa: boolean;
  activada_en: string | null;
  duracion_horas: number;
  vpn_2x1_activa?: boolean;
  vpn_2x1_activada_en?: string | null;
  vpn_2x1_duracion_horas?: number;
}

interface PromoHeaderProps {
  tipo?: "planes" | "revendedores" | undefined;
  showButton?: boolean;
  buttonText?: string;
  onButtonClick?: () => void;
}

export function PromoHeader({ 
  tipo,
  showButton = true, 
  buttonText = "Obtener la oferta",
  onButtonClick 
}: PromoHeaderProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const isPlanesPage = location.pathname === '/planes';
  const isRevendedoresPage = location.pathname === '/revendedores';
  const [promo_config, setPromoConfig] = useState<PromoConfig | null>(null);
  const [tiempo_restante_segundos, setTiempoRestante] = useState(0);
  const configRef = useRef<PromoConfig | null>(null);
  const [promoPlanes, setPromoPlanes] = useState<PromoConfig | null>(null);
  const [promoRevendedores, setPromoRevendedores] = useState<PromoConfig | null>(null);
  const [promoMostradaTipo, setPromoMostradaTipo] = useState<"planes" | "revendedores" | null>(null);

  // Función para calcular tiempo restante
  const calcularTiempoRestante = (config: PromoConfig) => {
    // Si es una promo 2x1 pura (sin descuento activo), usar sus campos de tiempo
    const is2x1Timer = (config.vpn_2x1_activa && !config.activa);
    const activadaEnRaw = is2x1Timer ? config.vpn_2x1_activada_en : config.activada_en;
    const duracionHoras = is2x1Timer ? (config.vpn_2x1_duracion_horas || 24) : config.duracion_horas;

    if ((!config.activa && !config.vpn_2x1_activa) || !activadaEnRaw) {
      return 0;
    }

    const ahora = new Date();
    const activadaEn = new Date(activadaEnRaw);
    const duracionMs = duracionHoras * 60 * 60 * 1000;
    const expiracion = activadaEn.getTime() + duracionMs;
    const tiempoRestanteMs = expiracion - ahora.getTime();

    if (tiempoRestanteMs <= 0) {
      return 0;
    }

    return Math.floor(tiempoRestanteMs / 1000);
  };

  const endpointBase = import.meta.env.VITE_API_URL || "/api";
  const endpointPlanes = `${endpointBase}/config/promo-status`;
  const endpointRevendedores = `${endpointBase}/config/promo-status-revendedores`;

  // Cargar promo config desde el endpoint correcto
  useEffect(() => {
    const fetchPromo = async () => {
      try {
        const [resPlanes, resRev] = await Promise.all([
          fetch(endpointPlanes).catch(() => null as any),
          fetch(endpointRevendedores).catch(() => null as any),
        ]);

        const dataPlanes = resPlanes ? await resPlanes.json().catch(() => null) : null;
        const dataRev = resRev ? await resRev.json().catch(() => null) : null;

        const planesCfg: PromoConfig | null = dataPlanes?.promo_config ?? null;
        const revCfg: PromoConfig | null = dataRev?.promo_config ?? null;

        setPromoPlanes(planesCfg);
        setPromoRevendedores(revCfg);

        // Lógica mejorada para decidir qué promo mostrar
        // 1. Si tipo está definido (planes o revendedores), preferir esa si está activa
        // 2. Si esa no está activa, buscar la otra que esté activa
        // 3. Si tipo no está definido (otras páginas), mostrar cualquiera que esté activa
        
        let mostradaTipo: "planes" | "revendedores" | null = null;
        let mostradaCfg: PromoConfig | null = null;

        if (tipo === "planes") {
          // En /planes: preferir planes, pero mostrar revendedores si planes no está activa
          if (planesCfg?.activa || planesCfg?.vpn_2x1_activa) {
            mostradaTipo = "planes";
            mostradaCfg = planesCfg;
          } else if (revCfg?.activa) {
            mostradaTipo = "revendedores";
            mostradaCfg = revCfg;
          }
        } else if (tipo === "revendedores") {
          // En /revendedores: preferir revendedores, pero mostrar planes si revendedores no está activa
          if (revCfg?.activa) {
            mostradaTipo = "revendedores";
            mostradaCfg = revCfg;
          } else if (planesCfg?.activa || planesCfg?.vpn_2x1_activa) {
            mostradaTipo = "planes";
            mostradaCfg = planesCfg;
          }
        } else {
          // En otras páginas: mostrar la que esté activa, preferencia a revendedores
          if (revCfg?.activa) {
            mostradaTipo = "revendedores";
            mostradaCfg = revCfg;
          } else if (planesCfg?.activa || planesCfg?.vpn_2x1_activa) {
            mostradaTipo = "planes";
            mostradaCfg = planesCfg;
          }
        }

        configRef.current = mostradaCfg;
        setPromoMostradaTipo(mostradaTipo);
        setPromoConfig(mostradaCfg);
        setTiempoRestante(mostradaCfg ? calcularTiempoRestante(mostradaCfg) : 0);
      } catch (err) {
        console.error("Error fetching promo config:", err);
      }
    };

    fetchPromo();
    // Fetch cada 30 segundos para sincronizar
    const fetchInterval = setInterval(fetchPromo, 30000);
    return () => clearInterval(fetchInterval);
  }, [tipo]); // tipo ahora puede ser undefined

  // Contador local que actualiza cada segundo
  useEffect(() => {
    const tickInterval = setInterval(() => {
      if (configRef.current) {
        setTiempoRestante(calcularTiempoRestante(configRef.current));
      }
    }, 1000);
    return () => clearInterval(tickInterval);
  }, []);

  const handleButtonClick = () => {
    if (onButtonClick) {
      onButtonClick();
    } else {
      navigate(promoMostradaTipo === "revendedores" ? "/revendedores" : "/planes");
    }
  };

  // No renderizar si tanto el descuento como el 2x1 están desactivados
  if (!promo_config?.activa && !promo_config?.vpn_2x1_activa) {
    return null;
  }

  const ambasActivas = Boolean(promoPlanes?.activa) && Boolean(promoRevendedores?.activa);
  
  let theme: PromoTheme = ambasActivas
    ? THEME_AMBAS
    : (promoMostradaTipo === "revendedores" ? THEME_REVENDEDORES : THEME_PLANES);
    
  // Si hay 2x1 activo y no es promo de revendedores, usar el tema púrpura
  if (promo_config?.vpn_2x1_activa && promoMostradaTipo !== "revendedores") {
    theme = THEME_2X1;
  }

  return (
    <>
      <div
        style={{
          background: 'linear-gradient(180deg, #110723 0%, #0a0312 100%)',
          color: '#ffffff',
          padding: 'clamp(4px, 1vw, 6px) clamp(8px, 2vw, 12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isPlanesPage ? 'center' : 'space-between',
          gap: 'clamp(8px, 2vw, 16px)',
          width: '100%',
          borderBottom: `1px solid ${hexToRgba(theme.accent, 0.15)}`,
        }}
      >
        {/* Contenedor del timer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'clamp(6px, 1.5vw, 10px)',
            flex: isPlanesPage ? 'none' : 1,
            justifyContent: isPlanesPage ? 'center' : 'flex-start',
          }}
        >
          {/* Etiqueta OFERTA con icono */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            {/* Icono de rayo */}
            <div
              style={{
                width: 'clamp(14px, 2.5vw, 16px)',
                height: 'clamp(14px, 2.5vw, 16px)',
                borderRadius: '50%',
                background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentDark} 100%)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg
                width="clamp(8px, 1.5vw, 10px)"
                height="clamp(8px, 1.5vw, 10px)"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#110723"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            
            <span
              style={{
                fontSize: 'clamp(8px, 1.5vw, 10px)',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: '#ffffff',
                display: window.innerWidth < 380 ? 'none' : 'block',
              }}
            >
              {promo_config?.vpn_2x1_activa ? 'OFERTA 2X1 ACTIVA' : 'Oferta'}
            </span>
          </div>

          {/* Flip Clock */}
          <FlipCountdownTimer time={tiempo_restante_segundos} play={true} />
        </div>

        {/* Botón CTA - oculto en /planes */}
        {showButton && !(promoMostradaTipo === "planes" && isPlanesPage) && !(promoMostradaTipo === "revendedores" && isRevendedoresPage) && (
          <button
            onClick={handleButtonClick}
            style={{
              flexShrink: 0,
              background: `linear-gradient(135deg, ${theme.accent} 0%, ${theme.accentDark} 100%)`,
              border: 'none',
              color: theme.accentText,
              cursor: 'pointer',
              padding: 'clamp(4px, 1vw, 6px) clamp(10px, 2vw, 14px)',
              borderRadius: '12px',
              fontSize: 'clamp(8px, 1.5vw, 10px)',
              fontWeight: '700',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {buttonText || 'Obtener'}
          </button>
        )}
      </div>
    </>
  );
}
