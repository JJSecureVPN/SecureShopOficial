/**
 * Sistema de Tipografía - SecureShop VPN
 * Constantes y utilidades para fuentes consistentes en todo el proyecto
 * Inspirado en Proton VPN con alternativas gratuitas
 */

// ===========================================
// FAMILIAS DE FUENTES
// ===========================================

export const fontFamily = {
  /** Inter - Textos generales, UI, botones */
  sans: "'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  
  /** Fraunces - Títulos y headings (alternativa gratuita a ABC Arizona) */
  serif: "'Fraunces', ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
  
  /** Syne - Acentos, precios, elementos destacados */
  display: "'Syne', ui-sans-serif, system-ui, sans-serif",
  
  /** Monospace - Código */
  mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
} as const;

// ===========================================
// TAMAÑOS DE FUENTE
// ===========================================

export const fontSize = {
  xs: '0.75rem',      // 12px
  sm: '0.875rem',     // 14px
  base: '1rem',       // 16px
  lg: '1.125rem',     // 18px
  xl: '1.25rem',      // 20px
  '2xl': '1.5rem',    // 24px
  '3xl': '1.875rem',  // 30px
  '4xl': '2.25rem',   // 36px
  '5xl': '3rem',      // 48px
  '6xl': '3.75rem',   // 60px
  '7xl': '4.5rem',    // 72px
} as const;

// ===========================================
// PESOS DE FUENTE
// ===========================================

export const fontWeight = {
  light: 300,
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
  extrabold: 800,
  black: 900,
} as const;

// ===========================================
// LINE HEIGHTS (como Proton VPN)
// ===========================================

export const lineHeight = {
  none: '1',
  tight: '1.08',      // Títulos hero
  snug: '1.125',      // Títulos de sección
  normal: '1.34',     // Subtítulos
  relaxed: '1.5',     // Texto grande
  loose: '1.625',     // Texto de cuerpo
} as const;

// ===========================================
// ESTILOS PREDEFINIDOS (para usar con style={})
// ===========================================

export const textStyles = {
  /** Título principal Hero - H1 grande */
  heroTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 'clamp(2.25rem, 5vw + 1rem, 4.5rem)',
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.tight,
    letterSpacing: '-0.02em',
  },

  /** Título de sección - H2 */
  sectionTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 'clamp(1.875rem, 3vw + 0.5rem, 3rem)',
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.snug,
    letterSpacing: '-0.01em',
  },

  /** Subtítulo - H3 */
  subsectionTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 'clamp(1.5rem, 2vw + 0.5rem, 2.25rem)',
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
  },

  /** Título de card - H4 */
  cardTitle: {
    fontFamily: fontFamily.serif,
    fontSize: 'clamp(1.25rem, 1.5vw + 0.5rem, 1.5rem)',
    fontWeight: fontWeight.medium,
    lineHeight: lineHeight.normal,
  },

  /** Texto de cuerpo principal */
  body: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.loose,
  },

  /** Texto grande para intros */
  bodyLarge: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.lg,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.relaxed,
  },

  /** Texto pequeño */
  bodySmall: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.sm,
    fontWeight: fontWeight.normal,
    lineHeight: lineHeight.loose,
  },

  /** Labels y captions */
  label: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.semibold,
    lineHeight: lineHeight.normal,
    letterSpacing: '0.025em',
    textTransform: 'uppercase' as const,
  },

  /** Texto de botón */
  button: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.base,
    fontWeight: fontWeight.semibold,
    lineHeight: '1',
    letterSpacing: '0.01em',
  },

  /** Precios con Syne */
  price: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.bold,
    lineHeight: '1',
    letterSpacing: '-0.02em',
  },

  /** Tags y badges */
  tag: {
    fontFamily: fontFamily.sans,
    fontSize: fontSize.xs,
    fontWeight: fontWeight.bold,
    lineHeight: '1',
  },

  /** Texto destacado con Syne */
  accent: {
    fontFamily: fontFamily.display,
    fontWeight: fontWeight.semibold,
  },
} as const;

// ===========================================
// CLASES DE TAILWIND PARA TIPOGRAFÍA
// ===========================================

export const textClasses = {
  /** Título Hero */
  heroTitle: 'font-serif text-4xl md:text-5xl lg:text-7xl font-normal leading-tight tracking-tight',
  
  /** Título de sección */
  sectionTitle: 'font-serif text-3xl md:text-4xl lg:text-5xl font-normal leading-snug',
  
  /** Subtítulo */
  subsectionTitle: 'font-serif text-2xl md:text-3xl lg:text-4xl font-medium leading-normal',
  
  /** Título de card */
  cardTitle: 'font-serif text-xl md:text-2xl font-medium leading-normal',
  
  /** Texto de cuerpo */
  body: 'font-sans text-base font-normal leading-relaxed',
  
  /** Texto grande */
  bodyLarge: 'font-sans text-lg font-normal leading-relaxed',
  
  /** Texto pequeño */
  bodySmall: 'font-sans text-sm font-normal leading-relaxed',
  
  /** Label */
  label: 'font-sans text-xs font-semibold uppercase tracking-wide',
  
  /** Botón */
  button: 'font-sans text-base font-semibold',
  
  /** Precio */
  price: 'font-display font-bold tracking-tight',
  
  /** Tag */
  tag: 'font-sans text-xs font-bold',
  
  /** Acento */
  accent: 'font-display font-semibold',
} as const;

// ===========================================
// TIPOS
// ===========================================

export type FontFamily = keyof typeof fontFamily;
export type FontSize = keyof typeof fontSize;
export type FontWeight = keyof typeof fontWeight;
export type LineHeight = keyof typeof lineHeight;
export type TextStyle = keyof typeof textStyles;
export type TextClass = keyof typeof textClasses;
