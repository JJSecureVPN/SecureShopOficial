/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // ============================================
      // SISTEMA DE FUENTES - Inspirado en Refine.dev
      // ============================================
      fontFamily: {
        // Geist - Modern Geometric Sans (CodePen Aesthetic)
        sans: ['Geist', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        // Geist Mono - Clean Technical Mono
        mono: ['Geist Mono', 'JetBrains Mono', 'ui-monospace', 'monospace'],
        // Geist also used for Titles to maintain sharp geometric feel
        title: ['Geist', 'sans-serif'],
        display: ['Geist', 'sans-serif'],
      },
      fontSize: {
        // Tamaños exactos de ProtonVPN con line-heights optimizados
        'xs': ['0.75rem', { lineHeight: '1.5' }],
        'sm': ['0.875rem', { lineHeight: '1.625' }],
        'base': ['1rem', { lineHeight: '1.625' }],
        'lg': ['1.125rem', { lineHeight: '1.55' }],
        'xl': ['1.25rem', { lineHeight: '1.5' }],
        '2xl': ['1.5rem', { lineHeight: '1.34' }],
        '3xl': ['1.875rem', { lineHeight: '1.13' }],
        '4xl': ['2.25rem', { lineHeight: '1.11' }],
        '5xl': ['3rem', { lineHeight: '1.125' }],
        '6xl': ['3.75rem', { lineHeight: '1.1' }],
        '7xl': ['4.5rem', { lineHeight: '1.08' }],
      },
      lineHeight: {
        'tight': '1.08',      // Títulos hero
        'snug': '1.125',      // Títulos sección  
        'normal': '1.34',     // Subtítulos
        'relaxed': '1.5',     // Texto grande
        'loose': '1.625',     // Texto cuerpo
      },
      letterSpacing: {
        'tighter': '-0.02em',
        'tight': '-0.01em',
        'normal': '0',
        'wide': '0.01em',
        'wider': '0.025em',
      },
      colors: {
        // ============================================
        // PALETA DE COLORES - Inspirada en Refine.dev
        // ============================================
        
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        
        // Zinc - Colores principales de Refine.dev (fondos oscuros)
        zinc: {
          50: '#fafafa',
          100: '#f4f4f5',
          200: '#e4e4e7',
          300: '#d4d4d8',
          400: '#a1a1aa',
          500: '#71717a',
          600: '#52525b',
          700: '#27272a',  // Ajustado para contraste en fondo negro
          800: '#131417',  // Sidebar CodePen
          900: '#18181b',  // Zinc-900 (Matching Hero)
          950: '#09090b',
        },
        
        // Orange - Color de acento de Refine.dev
        orange: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',  // Acento principal Refine
          500: '#f97316',  // Acento secundario Refine
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        },
        
        // Colores de marca Refine
        refine: {
          dark: '#060606',        // CodePen Black
          darkAlt: '#131417',     // CodePen Sidebar
          orange: '#fb923c',      // orange-400
          orangeAlt: '#f97316',   // orange-500
          text: '#ffffff',
          textMuted: '#a1a1aa',   // zinc-400
          border: '#27272a',      // zinc-700
        },
        
        neutral: {
          850: '#1a202c',
        },
        
        // Mantenemos los colores de ProtonVPN para compatibilidad
        purple: {
          50: '#F8F7FF',
          100: '#EFEAFF',
          200: '#DED5FF',
          300: '#C4B5FF',
          400: '#A78BFF',
          500: '#6D4AFF',
          600: '#5B3FD6',
          700: '#4A32AD',
          800: 'rgb(55, 37, 128)',
          900: '#240053',
        },
        
        gray: {
          50: '#f9fafb',
          100: '#f3f4f6',
          200: '#e5e7eb',
          300: '#d1d5db',
          400: '#9ca3af',
          500: '#6b7280',
          600: '#4b5563',
          700: '#374151',
          800: '#1f2937',
          900: '#111827',
        },
        
        proton: {
          purple: '#6D4AFF',
          darkPurple: '#372580',
          light: '#F8F7FF',
        },
        
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6',
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
        },
      },
    },
  },
  plugins: [],
}
