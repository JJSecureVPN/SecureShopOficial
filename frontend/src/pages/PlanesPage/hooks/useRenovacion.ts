import { useCallback, useEffect, useMemo, useState } from "react";
import type { ValidacionCupon } from "../../../services/api.service";
import {
  obtenerConnectionActual,
  calcularPrecioRenovacion,
  calcularPrecioRenovacionPorDia,
  crearParametrosRenovacion,
  puedeProcesarRenovacion,
  encontrarPlan,
} from "../utils";
import { CuentaRenovacion, PasoRenovacion } from "../types";
import { Plan } from "../../../types";

export function useRenovacion(planesParaRenovacion: Plan[]) {
  const [pasoRenovacion, setPasoRenovacion] = useState<PasoRenovacion>("buscar");
  const [busquedaCuenta, setBusquedaCuenta] = useState("");
  const [buscandoCuenta, setBuscandoCuenta] = useState(false);
  const [errorRenovacion, setErrorRenovacion] = useState("");
  const [cuentaRenovacion, setCuentaRenovacion] = useState<CuentaRenovacion | null>(null);
  const [diasRenovacion, setDiasRenovacion] = useState<number>(7);
  const [dispositivosRenovacion, setDispositivosRenovacion] = useState<number | null>(null);
  const [nombreRenovacion, setNombreRenovacion] = useState("");
  const [emailRenovacion, setEmailRenovacion] = useState("");
  const [procesandoRenovacion, setProcesandoRenovacion] = useState(false);
  const [cuponRenovacion, setCuponRenovacion] = useState<ValidacionCupon["cupon"] | null>(null);
  const [descuentoRenovacion, setDescuentoRenovacion] = useState(0);


  const buscarCuentaDesdeUrl = useCallback(async (username: string) => {
    setBusquedaCuenta(username);
    setBuscandoCuenta(true);
    setErrorRenovacion("");

    try {
      const response = await fetch("/api/renovacion/buscar?tipo=cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: username }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al buscar la cuenta");
      }

      if (!data?.encontrado) {
        setErrorRenovacion("No se encontró ninguna cuenta con ese username");
        return;
      }

      const cuenta: CuentaRenovacion = {
        tipo: data.tipo,
        datos: data.datos,
      };

      setCuentaRenovacion(cuenta);
      setNombreRenovacion(data.datos?.cliente_nombre || "");
      setEmailRenovacion(data.datos?.cliente_email || "");
      setDiasRenovacion(7);
      setDispositivosRenovacion(null);
      setPasoRenovacion("configurar");
    } catch (error: any) {
      setErrorRenovacion(error?.message || "Error al buscar la cuenta");
    } finally {
      setBuscandoCuenta(false);
    }
  }, []);

  const buscarCuentaRenovacion = useCallback(async () => {
    if (!busquedaCuenta.trim()) {
      setErrorRenovacion("Ingresa un email o username");
      return;
    }

    setBuscandoCuenta(true);
    setErrorRenovacion("");

    try {
      const response = await fetch("/api/renovacion/buscar?tipo=cliente", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ busqueda: busquedaCuenta.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Error al buscar la cuenta");
      }

      if (!data?.encontrado) {
        setErrorRenovacion("No se encontró ninguna cuenta con ese email o username");
        return;
      }

      const cuenta: CuentaRenovacion = {
        tipo: data.tipo,
        datos: data.datos,
      };

      setCuentaRenovacion(cuenta);
      setNombreRenovacion(data.datos?.cliente_nombre || "");
      setEmailRenovacion(data.datos?.cliente_email || "");
      setDiasRenovacion(7);
      setDispositivosRenovacion(null);
      setPasoRenovacion("configurar");
    } catch (error: any) {
      setErrorRenovacion(error?.message || "Error al buscar la cuenta");
    } finally {
      setBuscandoCuenta(false);
    }
  }, [busquedaCuenta]);

  const resetRenovacion = useCallback(() => {
    setPasoRenovacion("buscar");
    setBusquedaCuenta("");
    setBuscandoCuenta(false);
    setErrorRenovacion("");
    setCuentaRenovacion(null);
    setDiasRenovacion(7);
    setDispositivosRenovacion(null);
    setNombreRenovacion("");
    setEmailRenovacion("");
    setProcesandoRenovacion(false);
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
  }, []);

  const volverABuscarCuenta = useCallback(() => {
    setPasoRenovacion("buscar");
    setCuentaRenovacion(null);
    setDispositivosRenovacion(null);
    setErrorRenovacion("");
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
  }, []);

  useEffect(() => {
    if (cuponRenovacion) {
      setCuponRenovacion(null);
      setDescuentoRenovacion(0);
    }
  }, [diasRenovacion, dispositivosRenovacion, cuentaRenovacion]);

  const handleCuponRenovacionValidado = useCallback((descuento: number, cuponData: ValidacionCupon["cupon"]) => {
    const descuentoNormalizado = Number.isFinite(descuento) ? Math.round(descuento) : 0;
    setDescuentoRenovacion(descuentoNormalizado);
    setCuponRenovacion(cuponData || null);
  }, []);

  const handleCuponRenovacionRemovido = useCallback(() => {
    setCuponRenovacion(null);
    setDescuentoRenovacion(0);
  }, []);

  const connectionActual = obtenerConnectionActual(cuentaRenovacion);
  const connectionDestino = dispositivosRenovacion ?? connectionActual;

  const precioRenovacionBase = useMemo(
    () => calcularPrecioRenovacion(planesParaRenovacion, cuentaRenovacion, diasRenovacion, connectionDestino),
    [planesParaRenovacion, cuentaRenovacion, diasRenovacion, connectionDestino]
  );

  const precioRenovacionPorDiaBase = useMemo(
    () => calcularPrecioRenovacionPorDia(planesParaRenovacion, cuentaRenovacion, diasRenovacion, connectionDestino),
    [planesParaRenovacion, cuentaRenovacion, diasRenovacion, connectionDestino]
  );

  const precioRenovacionFinal = useMemo(() => Math.max(0, Math.round(precioRenovacionBase - descuentoRenovacion)), [precioRenovacionBase, descuentoRenovacion]);

  const precioRenovacionPorDia = useMemo(() => {
    if (diasRenovacion <= 0) return 0;
    return Math.max(0, Math.round(precioRenovacionFinal / diasRenovacion));
  }, [precioRenovacionFinal, diasRenovacion]);

  const planRenovacionSeleccionado = useMemo(
    () => encontrarPlan(planesParaRenovacion, diasRenovacion, connectionDestino),
    [planesParaRenovacion, diasRenovacion, connectionDestino]
  );

  const puedeProcesar = useMemo(
    () => puedeProcesarRenovacion(pasoRenovacion, cuentaRenovacion, nombreRenovacion, emailRenovacion),
    [pasoRenovacion, cuentaRenovacion, nombreRenovacion, emailRenovacion]
  );

  const getParametrosRenovacion = useCallback(() => {
    if (!puedeProcesar || !cuentaRenovacion) return null;

    const params = crearParametrosRenovacion({
      cuenta: cuentaRenovacion,
      busqueda: busquedaCuenta,
      dias: diasRenovacion,
      precio: precioRenovacionFinal,
      nombre: nombreRenovacion,
      email: emailRenovacion,
      dispositivos: {
        actual: connectionActual,
        destino: connectionDestino,
      },
      precioOriginal: precioRenovacionBase,
      descuentoAplicado: descuentoRenovacion,
      cupon: cuponRenovacion ? { codigo: cuponRenovacion.codigo, id: cuponRenovacion.id } : null,
      planId: undefined,
    });

    return params;
  }, [puedeProcesar, cuentaRenovacion, busquedaCuenta, diasRenovacion, precioRenovacionFinal, nombreRenovacion, emailRenovacion, connectionActual, connectionDestino, precioRenovacionBase, descuentoRenovacion, cuponRenovacion]);

  return {
    pasoRenovacion,
    busquedaCuenta,
    setBusquedaCuenta,
    buscandoCuenta,
    errorRenovacion,
    cuentaRenovacion,
    diasRenovacion,
    setDiasRenovacion,
    dispositivosRenovacion,
    setDispositivosRenovacion,
    nombreRenovacion,
    setNombreRenovacion,
    emailRenovacion,
    setEmailRenovacion,
    procesandoRenovacion,
    cuponRenovacion,
    descuentoRenovacion,
    buscarCuentaDesdeUrl,
    buscarCuentaRenovacion,
    resetRenovacion,
    volverABuscarCuenta,
    handleCuponRenovacionValidado,
    handleCuponRenovacionRemovido,
    puedeProcesar,
    connectionActual,
    connectionDestino,
    precioRenovacionBase,
    precioRenovacionPorDiaBase,
    precioRenovacionFinal,
    precioRenovacionPorDia,
    getParametrosRenovacion,
    setProcesandoRenovacion,
    planRenovacionSeleccionado,
  };
}
