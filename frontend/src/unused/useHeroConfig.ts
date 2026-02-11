import { useState, useEffect } from "react";

interface HeroPromocion {
  habilitada: boolean;
  texto: string;
  estilo?: string; // Mantener por compatibilidad
  textColor: string;
  bgColor: string;
  borderColor?: string;
  iconColor?: string;
  shadowColor?: string;
  comentario?: string;
}

interface HeroConfig {
  titulo: string;
  descripcion: string;
  promocion: HeroPromocion;
}

export const useHeroConfig = () => {
  const [config, setConfig] = useState<HeroConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchHeroConfig = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/config/hero?t=${Date.now()}`);
      const result = await response.json();

      if (result.success && result.data) {
        setConfig(result.data);
      } else {
        setError("No se pudo obtener configuración del hero");
      }
    } catch (err) {
      console.error("Error fetching hero config:", err);
      setError("Error al conectar con el servidor");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeroConfig();
  }, [refreshTrigger]);

  useEffect(() => {
    const handleInvalidate = () => {
      setRefreshTrigger(prev => prev + 1);
    };

    const handleConfigSaved = () => {
      // Recargar cuando se guarde desde AdminTools
      setRefreshTrigger(prev => prev + 1);
    };

    window.addEventListener("hero-config-invalidate", handleInvalidate);
    window.addEventListener("hero-config-saved", handleConfigSaved);
    return () => {
      window.removeEventListener("hero-config-invalidate", handleInvalidate);
      window.removeEventListener("hero-config-saved", handleConfigSaved);
    };
  }, []);

  return { config, loading, error };
};
