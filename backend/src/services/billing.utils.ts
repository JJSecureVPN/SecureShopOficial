/**
 * Utilidades para el cálculo de facturación y precios
 */

/**
 * Calcula el precio base (30 días) para una cantidad de usuarios descomponiéndola
 * en los planes más grandes disponibles (Greedy).
 * 
 * @param cantidad Cantidad de usuarios o créditos a calcular
 * @param planes Lista de planes disponibles (ya filtrados por tipo)
 * @returns Objeto con el precio total redondeado y la composición del cálculo
 */
export function calcularPrecioResellerDecompuesto(
  cantidad: number,
  planes: any[]
): { precio: number; composicion: string[] } {
  if (cantidad <= 0) {
    return { precio: 0, composicion: [] };
  }

  // Filtrar planes válidos y ordenar por max_users descendente
  const planesOrdenados = [...planes]
    .filter((p) => p.max_users > 0 && p.activo !== 0 && p.activo !== false)
    .sort((a, b) => b.max_users - a.max_users);

  if (planesOrdenados.length === 0) {
    console.warn("[BillingUtils] No hay planes disponibles para calcular el precio.");
    return { precio: 0, composicion: ["Sin planes disponibles"] };
  }

  let restante = cantidad;
  let precioTotal = 0;
  const composicion: string[] = [];

  // Algoritmo Greedy: elegir el plan más grande que quepa en el restante
  let iteraciones = 0;
  const MAX_ITERACIONES = 100; // Seguridad para evitar bucles infinitos

  while (restante > 0 && iteraciones < MAX_ITERACIONES) {
    iteraciones++;
    
    const plan = planesOrdenados.find((p) => p.max_users <= restante);
    
    if (plan) {
      precioTotal += Number(plan.precio);
      restante -= plan.max_users;
      composicion.push(`Plan ${plan.max_users} ($${plan.precio})`);
    } else {
      // Si no queda ningún plan que quepa (restante < plan mínimo)
      // Aplicar precio proporcional basado en el plan más pequeño disponible
      const planMinimo = planesOrdenados[planesOrdenados.length - 1];
      const precioPorUnidad = Number(planMinimo.precio) / planMinimo.max_users;
      const precioExtra = restante * precioPorUnidad;
      
      precioTotal += precioExtra;
      composicion.push(`${restante} usuarios prop. del plan ${planMinimo.max_users} ($${Math.round(precioExtra)})`);
      restante = 0;
    }
  }

  if (iteraciones >= MAX_ITERACIONES) {
    console.error("[BillingUtils] Máximo de iteraciones alcanzado en descomposición de planes.");
  }

  return {
    precio: Math.round(precioTotal),
    composicion
  };
}
