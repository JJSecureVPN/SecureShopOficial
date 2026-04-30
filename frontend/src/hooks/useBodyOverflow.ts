import { useEffect } from 'react';

/**
 * Hook para bloquear scroll del body cuando un modal está abierto
 * @param isOpen - Si el modal/componente está abierto
 */
export const useBodyOverflow = (isOpen: boolean) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
};
