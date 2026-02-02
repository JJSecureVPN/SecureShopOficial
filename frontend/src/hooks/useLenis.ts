import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { useLocation } from 'react-router-dom';

/**
 * Hook personalizado para implementar smooth scroll con Lenis
 * Lenis es una librería de scroll suave moderna utilizada por sitios web de alto nivel
 * 
 * Características:
 * - Scroll suave y natural con física realista
 * - Optimizado para rendimiento
 * - Compatible con todos los navegadores modernos
 * - Manejo automático de enlaces de anclaje (#)
 * - Sincronización con cambios de ruta
 * @param isLoading - Estado de carga para detener el scroll durante transiciones
 */
export const useLenis = (isLoading?: boolean) => {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // Inicializar Lenis con configuración optimizada
    const lenis = new Lenis({
      duration: 1.2,           // Duración del scroll (en segundos)
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Easing function suave
      orientation: 'vertical', // Dirección del scroll
      gestureOrientation: 'vertical', // Orientación de gestos
      smoothWheel: true,       // Scroll suave con rueda del mouse
      wheelMultiplier: 1,      // Multiplicador de velocidad de rueda
      touchMultiplier: 2,      // Multiplicador para eventos touch
      infinite: false,         // Sin scroll infinito
    });

    lenisRef.current = lenis;

    // Función de animación RAF (RequestAnimationFrame)
    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }

    rafId = requestAnimationFrame(raf);

    // Manejar clics en enlaces de anclaje para scroll suave
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      
      if (anchor) {
        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href && href !== '#') {
          const element = document.querySelector(href);
          if (element) {
            lenis.scrollTo(element as HTMLElement, {
              offset: -80, // Offset para header fijo
              duration: 1.5,
            });
          }
        }
      }
    };

    document.addEventListener('click', handleAnchorClick);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      document.removeEventListener('click', handleAnchorClick);
    };
  }, []);

  // Detener scroll durante las transiciones de página
  useEffect(() => {
    if (lenisRef.current) {
      if (isLoading) {
        lenisRef.current.stop();
        // Forzar scroll al tope inmediatamente
        window.scrollTo(0, 0);
      } else {
        lenisRef.current.start();
      }
    }
  }, [isLoading]);

  // Scroll al inicio en cambios de ruta (sin animación para evitar parpadeos)
  useEffect(() => {
    if (lenisRef.current && !isLoading) {
      // Usar scrollTo de Lenis con immediate para evitar conflictos
      lenisRef.current.scrollTo(0, { immediate: true, lock: true });
    }
  }, [location.pathname, isLoading]);
};
