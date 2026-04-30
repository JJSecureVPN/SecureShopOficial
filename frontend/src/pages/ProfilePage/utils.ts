// Formatear fecha en español
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Formatear moneda en pesos argentinos
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
  }).format(amount);
};

// Calcular días restantes hasta una fecha
export const calcularDiasRestantes = (fechaExpiracion: string): number => {
  const hoy = new Date();
  const expira = new Date(fechaExpiracion);
  const diff = expira.getTime() - hoy.getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

// Obtener icono de estado
export const getStatusClass = (estado: string): string => {
  switch (estado) {
    case 'aprobado':
      return 'bg-green-100 text-green-700 border-green-200';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-red-100 text-red-700 border-red-200';
  }
};

// Obtener texto de estado
export const getStatusText = (estado: string): string => {
  switch (estado) {
    case 'aprobado':
      return 'Aprobado';
    case 'pendiente':
      return 'Pendiente';
    case 'rechazado':
      return 'Rechazado';
    case 'cancelado':
      return 'Cancelado';
    default:
      return estado;
  }
};
