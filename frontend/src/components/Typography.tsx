import React from 'react';
import { textClasses, textStyles, TextStyle } from '../styles/typography';

/**
 * Componentes de Tipografía Reutilizables
 * Sistema consistente de textos para SecureShop VPN
 */

// ===========================================
// TIPOS
// ===========================================

interface BaseTextProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

interface HeadingProps extends BaseTextProps {
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

// ===========================================
// COMPONENTES DE TÍTULOS
// ===========================================

/**
 * Título Hero - Para encabezados principales de página
 * Usa Inter (igual que Refine.dev) con font-bold
 */
export const HeroTitle: React.FC<HeadingProps> = ({ 
  children, 
  className = '', 
  as: Component = 'h1',
  ...props 
}) => (
  <Component 
    className={`font-sans font-bold text-white ${className}`}
    {...props}
  >
    {children}
  </Component>
);

/**
 * Título de Sección - Para H2 y divisiones principales
 */
export const SectionTitle: React.FC<HeadingProps> = ({ 
  children, 
  className = '', 
  as: Component = 'h2',
  ...props 
}) => (
  <Component 
    className={`font-sans font-semibold text-white ${className}`}
    {...props}
  >
    {children}
  </Component>
);

/**
 * Subtítulo - Para H3 y subdivisiones
 */
export const SubsectionTitle: React.FC<HeadingProps> = ({ 
  children, 
  className = '', 
  as: Component = 'h3',
  ...props 
}) => (
  <Component 
    className={`font-sans font-semibold text-white ${className}`}
    {...props}
  >
    {children}
  </Component>
);

/**
 * Título de Card - Para títulos dentro de tarjetas
 */
export const CardTitle: React.FC<HeadingProps> = ({ 
  children, 
  className = '', 
  as: Component = 'h4',
  ...props 
}) => (
  <Component 
    className={`font-sans font-medium text-white ${className}`}
    {...props}
  >
    {children}
  </Component>
);

// ===========================================
// COMPONENTES DE TEXTO
// ===========================================

/**
 * Texto de cuerpo principal
 */
export const BodyText: React.FC<BaseTextProps & { as?: 'p' | 'span' | 'div' }> = ({ 
  children, 
  className = '', 
  as: Component = 'p',
  ...props 
}) => (
  <Component 
    className={`${textClasses.body} text-zinc-400 ${className}`}
    {...props}
  >
    {children}
  </Component>
);

/**
 * Texto grande para introducciones
 */
export const LeadText: React.FC<BaseTextProps & { as?: 'p' | 'span' | 'div' }> = ({ 
  children, 
  className = '', 
  as: Component = 'p',
  ...props 
}) => (
  <Component 
    className={`${textClasses.bodyLarge} text-zinc-300 ${className}`}
    {...props}
  >
    {children}
  </Component>
);

/**
 * Texto pequeño
 */
export const SmallText: React.FC<BaseTextProps & { as?: 'p' | 'span' | 'div' }> = ({ 
  children, 
  className = '', 
  as: Component = 'span',
  ...props 
}) => (
  <Component 
    className={`${textClasses.bodySmall} text-zinc-500 ${className}`}
    {...props}
  >
    {children}
  </Component>
);

/**
 * Label / Caption
 */
export const Label: React.FC<BaseTextProps & { as?: 'span' | 'label' | 'div' }> = ({ 
  children, 
  className = '', 
  as: Component = 'span',
  ...props 
}) => (
  <Component 
    className={`${textClasses.label} text-gray-500 ${className}`}
    {...props}
  >
    {children}
  </Component>
);

// ===========================================
// COMPONENTES ESPECIALES
// ===========================================

/**
 * Texto de precio con Syne
 */
export const PriceText: React.FC<BaseTextProps & { 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  as?: 'span' | 'div' | 'p';
}> = ({ 
  children, 
  className = '', 
  size = 'md',
  as: Component = 'span',
  ...props 
}) => {
  const sizeClasses = {
    sm: 'text-lg',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-5xl',
  };

  return (
    <Component 
      className={`${textClasses.price} ${sizeClasses[size]} text-purple-500 ${className}`}
      {...props}
    >
      {children}
    </Component>
  );
};

/**
 * Tag / Badge text
 */
export const TagText: React.FC<BaseTextProps> = ({ 
  children, 
  className = '', 
  ...props 
}) => (
  <span 
    className={`${textClasses.tag} ${className}`}
    {...props}
  >
    {children}
  </span>
);

/**
 * Texto destacado con Syne
 */
export const AccentText: React.FC<BaseTextProps & { as?: 'span' | 'div' | 'p' }> = ({ 
  children, 
  className = '', 
  as: Component = 'span',
  ...props 
}) => (
  <Component 
    className={`${textClasses.accent} text-purple-500 ${className}`}
    {...props}
  >
    {children}
  </Component>
);

// ===========================================
// COMPONENTE GENÉRICO TEXT
// ===========================================

interface TextProps extends BaseTextProps {
  variant?: TextStyle;
  as?: React.ElementType;
  color?: string;
}

/**
 * Componente Text genérico con variantes
 * Permite usar cualquier estilo predefinido
 * 
 * @example
 * <Text variant="heroTitle">Mi título</Text>
 * <Text variant="body" as="span">Texto inline</Text>
 */
export const Text: React.FC<TextProps> = ({ 
  children, 
  variant = 'body',
  as: Component = 'span',
  className = '',
  color,
  style,
  ...props 
}) => {
  const variantStyle = textStyles[variant];
  
  return (
    <Component 
      className={className}
      style={{ 
        ...variantStyle, 
        color,
        ...style 
      }}
      {...props}
    >
      {children}
    </Component>
  );
};

// ===========================================
// EXPORT DEFAULT
// ===========================================

export default {
  HeroTitle,
  SectionTitle,
  SubsectionTitle,
  CardTitle,
  BodyText,
  LeadText,
  SmallText,
  Label,
  PriceText,
  TagText,
  AccentText,
  Text,
};
