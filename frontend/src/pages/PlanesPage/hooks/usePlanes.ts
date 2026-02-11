import { useEffect, useMemo, useState } from "react";
import { Plan } from "../../../types";
import { apiService } from "../../../services/api.service";
import {
  obtenerDiasDisponibles,
  obtenerDispositivosDisponibles,
  encontrarPlan,
  calcularPrecioDiario,
} from "../utils";

export function usePlanes() {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [planesRenovacion, setPlanesRenovacion] = useState<Plan[]>([]);
  const [diasSeleccionados, setDiasSeleccionados] = useState<number>(30);
  const [dispositivosSeleccionados, setDispositivosSeleccionados] = useState<number>(1);

  useEffect(() => {
    const cargarPlanes = async () => {
      try {
        const [planesObtenidos, planesRenovacionObtenidos] = await Promise.all([
          apiService.obtenerPlanes(true, "compra"),
          apiService.obtenerPlanes(true, "renovacion"),
        ]);
        setPlanes(planesObtenidos);
        setPlanesRenovacion(planesRenovacionObtenidos);
      } catch (error) {
        console.error("Error cargando planes:", error);
        setPlanes([]);
        setPlanesRenovacion([]);
      }
    };

    cargarPlanes();
  }, []);

  const diasDisponibles = useMemo(() => obtenerDiasDisponibles(planes), [planes]);
  const dispositivosDisponibles = useMemo(() => obtenerDispositivosDisponibles(planes), [planes]);

  const planSeleccionado = useMemo(
    () => encontrarPlan(planes, diasSeleccionados, dispositivosSeleccionados),
    [planes, diasSeleccionados, dispositivosSeleccionados]
  );

  const precioPorDiaPlan = useMemo(() => calcularPrecioDiario(planSeleccionado), [planSeleccionado]);

  const planesParaRenovacion = useMemo(() => (planesRenovacion.length ? planesRenovacion : planes), [planesRenovacion, planes]);

  return {
    planes,
    planesRenovacion,
    diasDisponibles,
    dispositivosDisponibles,
    diasSeleccionados,
    setDiasSeleccionados,
    dispositivosSeleccionados,
    setDispositivosSeleccionados,
    planSeleccionado,
    precioPorDiaPlan,
    planesParaRenovacion,
  };
}

