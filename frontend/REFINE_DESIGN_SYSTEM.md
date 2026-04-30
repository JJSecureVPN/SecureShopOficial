# Sistema de Diseño de Refine.dev

Este documento detalla la paleta de colores y tipografía extraída de https://refine.dev/core/ para su implementación en nuestro proyecto.

## 🎨 Paleta de Colores

### Colores Base (Zinc)
Refine.dev utiliza la escala **Zinc** de Tailwind para sus fondos oscuros:

- **Fondo Principal**: `zinc-900` (#18181b)
- **Fondo Secundario**: `zinc-800` (#27272a)
- **Bordes**: `zinc-700` (#3f3f46)
- **Texto Secundario**: `zinc-400` (#a1a1aa) / `zinc-300` (#d4d4d8)
- **Texto Principal**: `white` (#ffffff)

### Color de Acento (Orange)
El naranja es el color de marca y acento principal:

- **Acento Principal**: `orange-400` (#fb923c)
- **Acento Secundario**: `orange-500` (#f97316)
- **Hover States**: `orange-300` (#fdba74)
- **Fondo Sutil**: `orange-50` (#fff7ed)

### Colores Refine (Custom)
Se agregó un objeto `refine` con los colores clave:

```javascript
refine: {
  dark: '#18181b',        // Fondo principal
  darkAlt: '#27272a',     // Fondo secundario
  orange: '#fb923c',      // Acento principal
  orangeAlt: '#f97316',   // Acento secundario
  text: '#ffffff',        // Texto blanco
  textMuted: '#a1a1aa',   // Texto secundario
  border: '#3f3f46',      // Bordes
}
```

## 📝 Tipografía

### Fuentes

#### Inter (Sans-serif principal)
- **Uso**: Textos generales, UI, navegación
- **Implementación**: `font-sans`
- **Notas**: Es la fuente principal de Refine.dev para toda la interfaz

#### JetBrains Mono (Monospace)
- **Uso**: Código, comandos, elementos técnicos
- **Implementación**: `font-mono`
- **Notas**: Reemplaza a la fuente genérica monospace, ideal para snippets de código

#### Fraunces (Serif)
- **Uso**: Títulos especiales, elementos decorativos
- **Implementación**: `font-serif`
- **Notas**: Se mantiene como alternativa para títulos destacados

### Jerarquía de Tamaños

Los tamaños de fuente con sus line-heights optimizados:

```javascript
'xs':   '0.75rem'  (12px)  - line-height: 1.5
'sm':   '0.875rem' (14px)  - line-height: 1.625
'base': '1rem'     (16px)  - line-height: 1.625
'lg':   '1.125rem' (18px)  - line-height: 1.55
'xl':   '1.25rem'  (20px)  - line-height: 1.5
'2xl':  '1.5rem'   (24px)  - line-height: 1.34
'3xl':  '1.875rem' (30px)  - line-height: 1.13
'4xl':  '2.25rem'  (36px)  - line-height: 1.11
'5xl':  '3rem'     (48px)  - line-height: 1.125
'6xl':  '3.75rem'  (60px)  - line-height: 1.1
'7xl':  '4.5rem'   (72px)  - line-height: 1.08
```

## 🎯 Ejemplos de Uso

### Fondos
```jsx
// Fondo principal oscuro
<div className="bg-zinc-900">

// Fondo secundario (tarjetas, secciones)
<div className="bg-zinc-800">

// Fondo con acento
<div className="bg-orange-400">
```

### Textos
```jsx
// Texto principal
<h1 className="text-white font-sans">

// Texto secundario/muted
<p className="text-zinc-400 font-sans">

// Texto de código
<code className="text-orange-400 font-mono">
```

### Botones
```jsx
// Botón primario
<button className="bg-orange-400 hover:bg-orange-500 text-white">

// Botón secundario
<button className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700">

// Botón ghost
<button className="text-orange-400 hover:text-orange-300">
```

### Bordes
```jsx
// Borde sutil
<div className="border border-zinc-700">

// Borde destacado
<div className="border-2 border-orange-400">
```

## 🔄 Comparación con Proton VPN

Se mantuvieron los colores de ProtonVPN para compatibilidad con componentes existentes:

| Elemento | Proton VPN | Refine.dev |
|----------|------------|------------|
| Fondo Oscuro | `gray-900` | `zinc-900` |
| Acento | `purple-500` | `orange-400` |
| Fuente Principal | Inter | Inter |
| Fuente Display | Syne | Inter |
| Fuente Mono | Generic | JetBrains Mono |

## 📦 Instalación de Fuentes

Para usar JetBrains Mono, agrega a tu HTML o importa en CSS:

```html
<!-- Google Fonts -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
```

O en tu archivo CSS principal:

```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');
```

## 🎨 Modo Oscuro por Defecto

El diseño de Refine.dev está optimizado para modo oscuro. Los colores base son:

- **Fondo**: zinc-900
- **Superficie**: zinc-800
- **Texto**: white
- **Texto Muted**: zinc-400
- **Bordes**: zinc-700
- **Acento**: orange-400

## 📚 Referencias

- **Sitio Web**: https://refine.dev/core/
- **Documentación Tailwind**: https://tailwindcss.com/docs
- **Google Fonts - JetBrains Mono**: https://fonts.google.com/specimen/JetBrains+Mono
