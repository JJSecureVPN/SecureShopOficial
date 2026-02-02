import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
// import Lenis from 'lenis';
// import 'lenis/dist/lenis.css';
import App from './App';
import './index.css';

AOS.init({
  duration: 800,
  easing: 'ease-in-out',
  once: false,
});

// // Inicializar Lenis para smooth scrolling
// const lenis = new Lenis({
//   duration: 1.2,
//   easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
//   smoothWheel: true,
//   smoothTouch: false, // Mejor para móviles
// });

// function raf(time: number) {
//   lenis.raf(time);
//   requestAnimationFrame(raf);
// }

// requestAnimationFrame(raf);

// Prevenir que el navegador restaure la posición de scroll
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
