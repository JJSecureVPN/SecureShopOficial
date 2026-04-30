/**
 * Sistema de Colores ProtonVPN
 * 
 * Colores extraídos directamente de protonvpn.com
 * Usar estos valores para mantener consistencia en toda la aplicación
 */

export const protonColors = {
  // === PÚRPURAS (Colores principales de marca) ===
  purple: {
    50: 'rgb(247, 245, 255)',   // Fondo muy claro (cards, sections)
    100: 'rgb(237, 233, 254)',  // Fondo claro hover
    200: 'rgb(221, 214, 254)',  // Bordes claros
    300: 'rgb(196, 181, 253)',  // Bordes hover
    500: 'rgb(109, 74, 255)',   // Acento, hover, botones secundarios
    700: 'rgb(76, 51, 179)',    // Hover en botones primarios
    800: 'rgb(55, 37, 128)',    // Texto principal, títulos, links
    900: 'rgb(44, 29, 102)',    // Texto más oscuro, emphasis
  },

  // === VERDES (Verde lima fosforescente ProtonVPN Black Friday) ===
  green: {
    300: 'rgb(212, 255, 0)',    // Verde lima neón/fosforescente principal (#d4ff00)
    400: 'rgb(190, 230, 0)',    // Verde lima hover
    500: 'rgb(168, 204, 0)',    // Verde lima más oscuro
    600: 'rgb(140, 170, 0)',    // Verde hover intenso
    700: 'rgb(110, 135, 0)',    // Verde oscuro
  },

  // === GRISES (Texto secundario y fondos) ===
  gray: {
    50: 'rgb(249, 250, 251)',   // Fondo muy claro
    100: 'rgb(243, 244, 246)',  // Fondo claro
    200: 'rgb(229, 231, 235)',  // Bordes claros
    300: 'rgb(209, 213, 219)',  // Bordes medios
    400: 'rgb(156, 163, 175)',  // Texto deshabilitado
    500: 'rgb(107, 114, 128)',  // Texto terciario, placeholders
    600: 'rgb(75, 85, 99)',     // Texto secundario, descripciones, subtítulos
    700: 'rgb(55, 65, 81)',     // Texto más oscuro
    800: 'rgb(31, 41, 55)',     // Fondos oscuros
    900: 'rgb(17, 24, 39)',     // Fondos muy oscuros
  },

  // === BLANCOS Y FONDOS ===
  white: 'rgb(255, 255, 255)',
  background: {
    light: 'rgb(255, 255, 255)',
    subtle: 'rgb(249, 250, 251)',  // gray-50
    muted: 'rgb(243, 244, 246)',   // gray-100
    purpleLight: 'rgb(247, 245, 255)', // purple-50 para secciones
  },

  // === ESTADOS Y FEEDBACK ===
  success: {
    500: 'rgb(34, 197, 94)',    // Verde éxito
    600: 'rgb(22, 163, 74)',    // Verde hover
  },
  error: {
    500: 'rgb(239, 68, 68)',    // Rojo error
    600: 'rgb(220, 38, 38)',    // Rojo hover
  },
  warning: {
    500: 'rgb(245, 158, 11)',   // Amarillo advertencia
  },
} as const;

/**
 * Tokens semánticos - Usar estos para componentes específicos
 * Facilita cambios globales de diseño
 */
export const semanticColors = {
  // Texto
  text: {
    primary: protonColors.purple[800],      // Títulos, headings, links principales
    secondary: protonColors.gray[600],      // Subtítulos, descripciones, párrafos
    tertiary: protonColors.gray[500],       // Placeholders, texto menos importante
    accent: protonColors.purple[500],       // Hover, elementos destacados
    inverse: protonColors.white,            // Texto sobre fondos oscuros
  },

  // Interactivos (botones, links)
  interactive: {
    primary: protonColors.purple[500],      // Botones primarios
    primaryHover: protonColors.purple[700], // Hover en botones primarios
    secondary: protonColors.purple[800],    // Links, botones secundarios
    secondaryHover: protonColors.purple[500], // Hover en links
    cta: protonColors.green[500],           // Botones CTA (verde ProtonVPN)
    ctaHover: protonColors.green[600],      // Hover en CTA
  },

  // Bordes
  border: {
    default: 'rgba(147, 51, 234, 0.2)',     // Bordes sutiles (purple con transparencia)
    hover: 'rgba(147, 51, 234, 0.4)',       // Bordes en hover
    focus: protonColors.purple[500],         // Bordes en focus
    highlight: protonColors.green[500],      // Borde de tarjeta destacada
  },

  // Fondos de componentes
  surface: {
    primary: protonColors.white,
    secondary: 'rgba(255, 255, 255, 0.7)',  // Fondos semi-transparentes
    hover: 'rgba(147, 51, 234, 0.05)',      // Hover sutil
    active: 'rgba(147, 51, 234, 0.1)',      // Estado activo
    card: protonColors.purple[50],          // Fondo de tarjetas
    cardHover: protonColors.purple[100],    // Hover en tarjetas
  },

  // Planes/Pricing específico
  plans: {
    cardBg: protonColors.purple[50],        // Fondo de tarjeta de plan
    cardBorder: protonColors.purple[200],   // Borde de tarjeta
    highlightBg: protonColors.green[500],   // Badge "Más popular"
    highlightText: protonColors.white,      // Texto en badges
    pricePrimary: protonColors.purple[800], // Precio principal
    priceSecondary: protonColors.gray[600], // Precio tachado/secundario
  },
} as const;

/**
 * Estilos inline reutilizables
 * Para usar directamente en style={{}}
 */
export const protonStyles = {
  // Texto
  textPrimary: { color: protonColors.purple[800] },
  textSecondary: { color: protonColors.gray[600] },
  textAccent: { color: protonColors.purple[500] },
  textWhite: { color: protonColors.white },
  textGreen: { color: protonColors.green[500] },

  // Fondos
  bgPrimary: { backgroundColor: protonColors.purple[500] },
  bgPrimaryHover: { backgroundColor: protonColors.purple[700] },
  bgSecondary: { backgroundColor: protonColors.purple[800] },
  bgCard: { backgroundColor: protonColors.purple[50] },
  bgGreen: { backgroundColor: protonColors.green[500] },
  bgGreenHover: { backgroundColor: protonColors.green[600] },

  // Fondos de secciones
  bgSection: { backgroundColor: protonColors.purple[50] },
  bgSectionAlt: { backgroundColor: protonColors.background.purpleLight },
} as const;

/**
 * Hook helper para manejar hover en elementos con colores Proton
 * Uso: onMouseEnter={protonHover.linkEnter} onMouseLeave={protonHover.linkLeave}
 */
export const protonHover = {
  // Para links (purple-800 -> purple-500)
  linkEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = protonColors.purple[500];
  },
  linkLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = protonColors.purple[800];
  },

  // Para texto secundario (gray-600 -> purple-500)
  subtleEnter: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = protonColors.purple[500];
  },
  subtleLeave: (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.color = protonColors.gray[600];
  },
} as const;

// Exportar todo como default también para imports más simples
export default {
  colors: protonColors,
  semantic: semanticColors,
  styles: protonStyles,
  hover: protonHover,
};
