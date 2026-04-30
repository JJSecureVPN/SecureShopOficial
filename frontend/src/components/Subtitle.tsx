import { ReactNode } from 'react';
import { protonColors } from '../styles/colors';
import { fontFamily, fontSize, lineHeight as lh } from '../styles/typography';

type SubtitleSize = 'base' | 'lg' | 'sm';

interface SubtitleProps {
  children: ReactNode;
  size?: SubtitleSize;
  className?: string;
  center?: boolean;
}

// Tamaños del sistema de tipografía
const sizeStyles: Record<SubtitleSize, { fontSize: string; lineHeight: string }> = {
  sm: {
    fontSize: fontSize.sm,
    lineHeight: lh.loose,
  },
  base: {
    fontSize: fontSize.base,
    lineHeight: lh.loose,
  },
  lg: {
    fontSize: fontSize.lg,
    lineHeight: lh.relaxed,
  },
};

export function Subtitle({ children, size = 'base', className = '', center = false }: SubtitleProps) {
  return (
    <p
      className={`${center ? 'text-center' : ''} ${className}`}
      style={{
        fontFamily: fontFamily.sans,
        fontSize: sizeStyles[size].fontSize,
        lineHeight: sizeStyles[size].lineHeight,
        color: protonColors.gray[600],
      }}
    >
      {children}
    </p>
  );
}
