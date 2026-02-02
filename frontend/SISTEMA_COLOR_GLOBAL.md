# Sistema de Color de Fondo Global - Refine.dev

## 🎨 Descripción

Sistema de colores global implementado en toda la aplicación basado en la paleta de Refine.dev. Usa variables CSS nativas para una gestión centralizada y consistente.

## 📁 Archivos Modificados

- ✅ `src/index.css` - Variables CSS globales y estilos base
- ✅ `src/App.tsx` - Aplicación del fondo global
- ✅ `src/pages/HomePage.tsx` - Removido bg redundante

## 🔧 Variables CSS Globales

### Fondos
```css
--bg-primary: #18181b        /* zinc-900 - Fondo principal */
--bg-secondary: #27272a      /* zinc-800 - Fondo secundario */
--bg-tertiary: #3f3f46       /* zinc-700 - Fondo terciario */
```

### Acentos
```css
--accent-primary: #fb923c    /* orange-400 - Acento principal */
--accent-secondary: #f97316  /* orange-500 - Acento secundario */
--accent-hover: #fdba74      /* orange-300 - Estado hover */
```

### Textos
```css
--text-primary: #ffffff      /* white - Texto principal */
--text-secondary: #d4d4d8    /* zinc-300 - Texto secundario */
--text-muted: #a1a1aa        /* zinc-400 - Texto atenuado */
```

### Bordes
```css
--border-primary: #3f3f46    /* zinc-700 - Borde principal */
--border-secondary: #52525b  /* zinc-600 - Borde secundario */
```

## 🎯 Uso de Variables CSS

### En Tailwind
Puedes seguir usando las clases de Tailwind normalmente:
```jsx
<div className="bg-zinc-900 text-white border border-zinc-700">
```

### Con Variables CSS Nativas
Para más flexibilidad, usa las variables directamente:
```jsx
<div style={{ backgroundColor: 'var(--bg-primary)' }}>
```

### Clases de Utilidad Personalizadas
Agregadas clases de utilidad para uso rápido:

#### Fondos
```jsx
<div className="bg-refine-dark">         {/* bg-primary */}
<div className="bg-refine-dark-alt">     {/* bg-secondary */}
<div className="bg-refine-dark-tertiary">{/* bg-tertiary */}
```

#### Textos
```jsx
<p className="text-refine">            {/* text-primary (white) */}
<p className="text-refine-secondary">  {/* text-secondary (zinc-300) */}
<p className="text-refine-muted">      {/* text-muted (zinc-400) */}
<p className="text-refine-accent">     {/* accent-primary (orange-400) */}
```

#### Bordes
```jsx
<div className="border border-refine">           {/* border-primary */}
<div className="border border-refine-secondary"> {/* border-secondary */}
```

#### Botones
```jsx
<button className="btn-refine-primary">   {/* Botón naranja */}
<button className="btn-refine-secondary"> {/* Botón zinc con borde */}
```

## 🌍 Aplicación Global

### HTML y Body
El fondo y color de texto se aplican automáticamente:
```css
html, body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  min-height: 100vh;
}
```

### App.tsx
El contenedor principal usa:
```jsx
<div className="flex flex-col min-h-screen bg-zinc-900 text-white">
```

### Páginas Individuales
Ya NO necesitas aplicar `bg-zinc-900` en cada página porque es global. Simplemente:
```jsx
const MiPagina = () => {
  return (
    <div>
      {/* El fondo ya es zinc-900 globalmente */}
      <h1>Mi contenido</h1>
    </div>
  );
};
```

## 🎨 Scrollbar Personalizada

La barra de scroll usa el esquema de colores Refine.dev:

- **Track**: `bg-secondary` (zinc-800)
- **Thumb**: Gradiente naranja (`orange-400` → `orange-500`)
- **Hover**: Gradiente más claro
- **Active**: Gradiente más oscuro

## 📝 Clases Semánticas Actualizadas

```jsx
<h1 className="text-title">   {/* white */}
<p className="text-body">      {/* zinc-300 */}
<span className="text-accent"> {/* orange-400 */}
```

## 🔄 Ventajas del Sistema Global

### 1. Consistencia
- Un solo lugar para definir colores
- Todos los componentes usan la misma paleta

### 2. Mantenibilidad
- Cambiar un color en un solo lugar afecta toda la app
- Fácil implementar temas claros/oscuros en el futuro

### 3. Performance
- Variables CSS nativas (sin JavaScript)
- No re-renders innecesarios

### 4. DX (Developer Experience)
- Nombres semánticos y descriptivos
- Autocompletado en VSCode
- Menos repetición de código

## 🚀 Migrando Componentes Existentes

### Antes
```jsx
<div className="bg-white text-gray-900">
  <p className="text-gray-600">Texto</p>
</div>
```

### Después (Opción 1 - Tailwind)
```jsx
<div className="bg-zinc-900 text-white">
  <p className="text-zinc-300">Texto</p>
</div>
```

### Después (Opción 2 - Variables CSS)
```jsx
<div className="bg-refine-dark text-refine">
  <p className="text-refine-secondary">Texto</p>
</div>
```

### Después (Opción 3 - Sin clases, usa global)
```jsx
<div>
  {/* Usa los colores globales automáticamente */}
  <p className="text-refine-secondary">Texto</p>
</div>
```

## 🎯 Casos de Uso

### Tarjetas/Cards
```jsx
<div className="bg-zinc-800 border border-zinc-700 rounded-xl p-6">
  <h3 className="text-white">Título</h3>
  <p className="text-zinc-300">Descripción</p>
</div>
```

### Botones Primarios
```jsx
<button className="bg-orange-400 hover:bg-orange-500 text-white px-6 py-3 rounded-lg">
  Acción Principal
</button>
```

### Botones Secundarios
```jsx
<button className="bg-zinc-800 hover:bg-zinc-700 text-white border-2 border-zinc-700 px-6 py-3 rounded-lg">
  Acción Secundaria
</button>
```

### Secciones Alternadas
```jsx
{/* Sección principal */}
<section className="bg-zinc-900 py-16">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-white">Sección 1</h2>
  </div>
</section>

{/* Sección alternativa */}
<section className="bg-zinc-800 py-16">
  <div className="max-w-6xl mx-auto">
    <h2 className="text-white">Sección 2</h2>
  </div>
</section>
```

## 🔮 Futuro: Sistema de Temas

Este sistema está preparado para soportar temas claros/oscuros:

```css
/* Tema oscuro (actual) */
:root {
  --bg-primary: #18181b;
  --text-primary: #ffffff;
}

/* Tema claro (futuro) */
[data-theme="light"] {
  --bg-primary: #ffffff;
  --text-primary: #18181b;
}
```

Uso:
```jsx
<html data-theme="light">
  {/* Automáticamente cambia a tema claro */}
</html>
```

## 📚 Referencias

- **Refine.dev**: https://refine.dev/core/
- **Tailwind Zinc**: https://tailwindcss.com/docs/customizing-colors#color-palette-reference
- **CSS Variables**: https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties

## ✅ Checklist de Implementación

- [x] Variables CSS globales definidas
- [x] Fondo global aplicado en html/body
- [x] App.tsx con bg-zinc-900
- [x] Scrollbar personalizada
- [x] Clases de utilidad creadas
- [x] Clases semánticas actualizadas
- [x] HomePage migrada
- [x] Documentación creada

## 🎨 Próximos Pasos

1. Migrar componentes Header y Footer
2. Actualizar componentes de formulario
3. Revisar modales y overlays
4. Implementar theme switcher (opcional)
