import { ReactNode } from 'react';
import { semanticColors } from '../styles/colors';
import { fontFamily, lineHeight as lh } from '../styles/typography';

type TitleSize = 'h1' | 'h2' | 'h3';

interface TitleProps {
  children: ReactNode;
  as?: TitleSize;
  className?: string;
  center?: boolean;
}

// Tamaños inspirados en ProtonVPN
const sizeStyles: Record<TitleSize, { fontSize: string; lineHeight: string }> = {
  h1: {
    fontSize: 'clamp(2.25rem, 5vw + 1rem, 4.5rem)',
    lineHeight: lh.tight,
  },
  h2: {
    fontSize: 'clamp(1.875rem, 3vw + 0.5rem, 3rem)',
    lineHeight: lh.snug,
  },
  h3: {
    fontSize: 'clamp(1.5rem, 2vw + 0.5rem, 2.25rem)',
    lineHeight: lh.normal,
  },
};

export function Title({ children, as = 'h1', className = '', center = false }: TitleProps) {
  const Tag = as;
  const styles = sizeStyles[as];

  return (
    <Tag
      className={`${center ? 'text-center' : ''} ${className}`}
      style={{
        fontFamily: fontFamily.serif,
        fontSize: styles.fontSize,
        lineHeight: styles.lineHeight,
        fontWeight: 400,
        letterSpacing: '-0.02em',
        color: semanticColors.text.inverse,
      }}
    >
      {children}
    </Tag>
  );
}
