import { Plan } from "../../types";
import { PRECIOS_POR_DIA } from "./constants";
import { CuentaRenovacion, PasoRenovacion } from "./types";

export const obtenerDiasDisponibles = (planes: Plan[]): number[] =>
  Array.from(new Set(planes.map((plan) => plan.dias))).sort((a, b) => a - b);

export const obtenerDispositivosDisponibles = (planes: Plan[]): number[] =>
  Array.from(new Set(planes.map((plan) => plan.connection_limit))).sort((a, b) => a - b);

export const encontrarPlan = (
  planes: Plan[],
  diasSeleccionados: number,
  dispositivosSeleccionados: number
): Plan | undefined =>
  planes.find(
    (plan) => plan.dias === diasSeleccionados && plan.connection_limit === dispositivosSeleccionados
  );

export const calcularPrecioDiario = (plan?: Plan): string => {
  if (!plan) {
    return "0";
  }

  return (plan.precio / plan.dias).toFixed(0);
};

export const obtenerConnectionActual = (cuenta?: CuentaRenovacion | null): number =>
  cuenta?.datos.connection_limit ?? 1;

export const calcularPrecioRenovacion = (
  planes: Plan[],
  cuenta: CuentaRenovacion | null,
  dias: number,
  connectionDestino: number
): number => {
  if (!cuenta) {
    return 0;
  }

  // 1. Intentar coincidencia exacta (si hay 2x1 activo, connection_limit ya viene duplicado en la lista)
  const planCoincidente = planes.find(
    (plan) => plan.dias === dias && plan.connection_limit === connectionDestino
  );

  if (planCoincidente) {
    return planCoincidente.precio;
  }

  // 2. DETECCIÓN DE 2x1: Si no hubo coincidencia exacta, puede ser que el usuario tenga 20 dispositivos 
  // pero no haya un plan de 20 (porque el 2x1 está desactivado en la lista actual).
  if (connectionDestino % 2 === 0) {
    const halfLimit = connectionDestino / 2;
    // Buscamos el plan base que al duplicarse daría la cantidad del usuario
    const planBase = planes.find(
      (plan) => plan.dias === dias && plan.connection_limit === halfLimit
    );

    if (planBase) {
      // Si el plan base no está en oferta 2x1 actualmente, pero el usuario tiene el doble, 
      // asumimos que debe pagar el doble para mantener esa cantidad.
      if (!planBase.en_oferta_2x1) {
        return Math.round(planBase.precio * 2);
      } else {
        // Si el plan base SI está en oferta 2x1, debería haber coincidido arriba,
        // pero por seguridad devolvemos su precio.
        return planBase.precio;
      }
    }
  }

  // 3. Fallback basado en plan de 30 días (Igual que en el backend)
  const planReferencia = planes.find(
    (plan) => plan.dias === 30 && plan.connection_limit === connectionDestino
  );

  if (planReferencia) {
    const precioPorDia = planReferencia.precio / 30;
    return Math.round(dias * precioPorDia);
  }

  // Fallback genérico mejorado si no se encuentra absolutamente nada (estimación conservadora)
  // Usamos 8000 como base estimada por dispositivo si no hay referencia
  const precioBaseEstimado = connectionDestino * 8000;
  const factorDias = dias / 30;
  return Math.round(precioBaseEstimado * factorDias);
};

export const calcularPrecioRenovacionPorDia = (
  planes: Plan[],
  cuenta: CuentaRenovacion | null,
  dias: number,
  connectionDestino: number
): number => {
  if (!cuenta) {
    return PRECIOS_POR_DIA[connectionDestino] ?? PRECIOS_POR_DIA[1];
  }

  const precioTotal = calcularPrecioRenovacion(planes, cuenta, dias, connectionDestino);
  
  if (precioTotal > 0 && dias > 0) {
    return Math.round(precioTotal / dias);
  }

  return PRECIOS_POR_DIA[connectionDestino] ?? PRECIOS_POR_DIA[1];
};

export const puedeProcesarRenovacion = (
  pasoRenovacion: PasoRenovacion,
  cuentaRenovacion: CuentaRenovacion | null,
  nombre: string,
  email: string
): boolean =>
  pasoRenovacion === "configurar" &&
  !!cuentaRenovacion &&
  nombre.trim().length > 0 &&
  email.trim().length > 0;

interface CrearParametrosRenovacionArgs {
  cuenta: CuentaRenovacion;
  busqueda: string;
  dias: number;
  precio: number;
  nombre: string;
  email: string;
  dispositivos?: {
    actual: number;
    destino: number;
  };
  precioOriginal?: number;
  descuentoAplicado?: number;
  cupon?: {
    codigo: string;
    id?: number;
  } | null;
  planId?: number;
  codigoReferido?: string | null;
  saldoUsado?: number;
}

export const crearParametrosRenovacion = ({
  cuenta,
  busqueda,
  dias,
  precio,
  nombre,
  email,
  dispositivos,
  precioOriginal,
  descuentoAplicado,
  cupon,
  planId,
  codigoReferido,
  saldoUsado,
}: CrearParametrosRenovacionArgs): URLSearchParams => {
  const params = new URLSearchParams({
    tipo: cuenta.tipo,
    busqueda: busqueda.trim(),
    dias: dias.toString(),
    precio: precio.toString(),
    nombre: nombre.trim(),
    email: email.trim(),
  });

  const username = cuenta.datos.servex_username;
  if (username) {
    params.set("username", username);
  }

  if (cuenta.datos.plan_nombre) {
    params.set("planNombre", cuenta.datos.plan_nombre);
  }

  if (cuenta.tipo === "cliente" && dispositivos) {
    params.set("connectionActual", dispositivos.actual.toString());

    if (dispositivos.destino !== dispositivos.actual) {
      params.set("nuevoConnectionLimit", dispositivos.destino.toString());
    }
  }

  if (precioOriginal && precioOriginal > 0) {
    params.set("precioOriginal", precioOriginal.toString());
  }

  if (descuentoAplicado && descuentoAplicado > 0) {
    params.set("descuento", descuentoAplicado.toString());
  }

  if (cupon?.codigo) {
    params.set("codigoCupon", cupon.codigo);
  }

  if (cupon?.id) {
    params.set("cuponId", cupon.id.toString());
  }

  if (planId) {
    params.set("planId", planId.toString());
  }
  
  if (codigoReferido) {
    params.set("codigoReferido", codigoReferido);
  }

  if (saldoUsado && saldoUsado > 0) {
    params.set("saldoUsado", saldoUsado.toString());
  }

  return params;
};
