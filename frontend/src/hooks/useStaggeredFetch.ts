import { useEffect, useRef } from 'react';

/**
 * Hook para serializar peticiones HTTP y evitar errores 429 de rate limiting.
 * Todas las peticiones pasan por una cola global que garantiza un intervalo mínimo
 * entre ejecuciones, incluso cuando múltiples hooks hacen solicitudes en paralelo.
 */

type QueueItem = {
  key: string;
  run: () => Promise<void>;
  isActive: () => boolean;
  resolve: () => void;
  reject: (reason?: unknown) => void;
};

const GLOBAL_MIN_INTERVAL = 1800; // ms mínimos entre peticiones consecutivas
const queue: QueueItem[] = [];
let lastExecution = 0;
let processing = false;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function processQueue(): Promise<void> {
  if (processing) return;
  processing = true;

  while (queue.length > 0) {
    const item = queue.shift()!;

    if (!item.isActive()) {
      item.resolve();
      continue;
    }

    const now = Date.now();
    const waitTime = Math.max(0, lastExecution + GLOBAL_MIN_INTERVAL - now);

    if (waitTime > 0) {
      await sleep(waitTime);
    }

    if (!item.isActive()) {
      item.resolve();
      continue;
    }

    try {
      await item.run();
      item.resolve();
    } catch (error) {
      item.reject(error);
    } finally {
      lastExecution = Date.now();
    }
  }

  processing = false;
}

function enqueue(item: Omit<QueueItem, 'resolve' | 'reject'>): Promise<void> {
  return new Promise((resolve, reject) => {
    queue.push({ ...item, resolve, reject });
    processQueue().catch(() => {
      // Si el procesamiento falla, limpiamos el estado para evitar bloqueos
      processing = false;
      resolve();
    });
  });
}

export function useStaggeredFetch(
  fetchKey: string,
  fetchFn: () => Promise<void>,
  interval: number = 5000
): void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);
  const initialDelayRef = useRef(Math.random() * 600); // pequeño desfase aleatorio

  useEffect(() => {
    mountedRef.current = true;

    const scheduleFetch = (delay: number) => {
      if (!mountedRef.current) return;

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        enqueue({
          key: fetchKey,
          isActive: () => mountedRef.current,
          run: async () => {
            if (!mountedRef.current) return;
            await fetchFn();
          },
        })
          .catch(() => {
            // El hook maneja sus propios errores, aquí solo evitamos rechazos no controlados
          })
          .finally(() => {
            if (mountedRef.current) {
              scheduleFetch(interval);
            }
          });
      }, delay);
    };

    // Programar la primera ejecución con un leve desfase
    scheduleFetch(initialDelayRef.current);

    return () => {
      mountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [fetchKey, fetchFn, interval]);
}
