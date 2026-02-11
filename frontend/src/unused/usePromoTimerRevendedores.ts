import { useState, useEffect, useCallback, useRef, useMemo } from "react";

export interface PromoConfig {
  activa: boolean;
  activada_en: string | null;
  duracion_horas: number;
  auto_desactivar: boolean;
}

export interface PromoTimerData {
  promo_config: PromoConfig;
  tiempo_restante_segundos: number;
  tiempo_restante_formateado: string;
  porcentaje_restante: number;
}

export interface UsePromoTimerReturn extends Partial<PromoTimerData> {
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function usePromoTimerRevendedores(): UsePromoTimerReturn {
  const [data, setData] = useState<PromoTimerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const configRef = useRef<PromoConfig | null>(null);

  // Función para calcular tiempo restante
  const calcularTiempoRestante = useCallback((promoConfig: PromoConfig) => {
    if (!promoConfig.activa || !promoConfig.activada_en) {
      return { segundos: 0, formateado: "00:00:00", porcentaje: 0 };
    }

    const ahora = new Date();
    const activadaEn = new Date(promoConfig.activada_en);
    const duracionMs = promoConfig.duracion_horas * 60 * 60 * 1000;
    const expiracion = activadaEn.getTime() + duracionMs;
    const tiempoRestanteMs = expiracion - ahora.getTime();

    if (tiempoRestanteMs <= 0) {
      return { segundos: 0, formateado: "00:00:00", porcentaje: 0 };
    }

    const segundosTotales = Math.floor(tiempoRestanteMs / 1000);
    const horas = Math.floor(segundosTotales / 3600);
    const minutos = Math.floor((segundosTotales % 3600) / 60);
    const segs = segundosTotales % 60;

    const formateado =
      horas > 0
        ? `${horas}h ${minutos}m ${segs}s`
        : minutos > 0
        ? `${minutos}m ${segs}s`
        : `${segs}s`;

    const porcentaje = (tiempoRestanteMs / duracionMs) * 100;

    return { segundos: segundosTotales, formateado, porcentaje };
  }, []);

  const obtenerPromoRef = useRef<() => Promise<void>>();

  // Función para obtener los datos de la promo específica de revendedores
  const obtenerPromo = useCallback(async () => {
    try {
      const response = await fetch("/api/config/promo-status-revendedores");

      if (!response.ok) {
        throw new Error(
          "Error obteniendo estado de promoción para revendedores"
        );
      }

      const result = await response.json();
      configRef.current = result.promo_config;

      const { segundos, formateado, porcentaje } = calcularTiempoRestante(
        result.promo_config
      );

      setData({
        promo_config: result.promo_config,
        tiempo_restante_segundos: segundos,
        tiempo_restante_formateado: formateado,
        porcentaje_restante: porcentaje,
      });

      setError(null);
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
      setLoading(false);
    }
  }, [calcularTiempoRestante]);

  // Actualizar la ref con la función
  useEffect(() => {
    obtenerPromoRef.current = obtenerPromo;
  }, [obtenerPromo]);

  // Obtener datos iniciales (solo una vez)
  useEffect(() => {
    obtenerPromoRef.current?.();

    // Refetch cada 30 segundos para sincronizar con el servidor
    const refetchInterval = setInterval(() => {
      obtenerPromoRef.current?.();
    }, 30000);

    return () => clearInterval(refetchInterval);
  }, []);

  return useMemo(
    () => ({
      ...data,
      loading,
      error,
      refetch: () => obtenerPromoRef.current?.(),
    }),
    [data, loading, error]
  );
}
