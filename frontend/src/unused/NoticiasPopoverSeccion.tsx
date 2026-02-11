import { useRef, useEffect } from 'react';
import { X } from 'lucide-react';
import { useNoticias } from '../hooks/useNoticiasDB';

interface NoticiasPopoverSeccionProps {
  isOpen: boolean;
  onClose: () => void;
  onViewAll?: () => void;
}

export default function NoticiasPopoverSeccion({
  isOpen,
  onClose,
  onViewAll,
}: NoticiasPopoverSeccionProps) {
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { noticias, loading } = useNoticias();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const noticiasAMostrar = noticias.slice(0, 5);
  const noticiasDestacadas = noticias
    .filter((n) => n.destacada)
    .slice(0, 3);

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-screen sm:w-96 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-xl shadow-xl z-50 max-h-[80vh] overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 flex items-center justify-between p-4 border-b border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">
          Noticias
        </h3>
        <button
          onClick={onClose}
          className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Contenido */}
      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-blue-600" />
            <p className="text-neutral-600 dark:text-neutral-400 text-sm mt-2">
              Cargando noticias...
            </p>
          </div>
        </div>
      ) : noticiasAMostrar.length === 0 ? (
        <div className="text-center py-12 px-4">
          <p className="text-neutral-600 dark:text-neutral-400">
            No hay noticias disponibles en este momento
          </p>
        </div>
      ) : (
        <div className="space-y-0">
          {/* Noticias Destacadas */}
          {noticiasDestacadas.length > 0 && (
            <div>
              <h4 className="px-4 pt-4 pb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
                Destacadas
              </h4>
              <div className="px-4 space-y-2">
                {noticiasDestacadas.map((noticia) => (
                  <div
                    key={noticia.id}
                    className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition"
                  >
                    <h5 className="font-semibold text-sm text-neutral-900 dark:text-white line-clamp-1">
                      ⭐ {noticia.titulo}
                    </h5>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">
                      {noticia.descripcion}
                    </p>
                  </div>
                ))}
              </div>
              <div className="border-t border-neutral-200 dark:border-neutral-700 my-2" />
            </div>
          )}

          {/* Todas las Noticias */}
          <div>
            <h4 className="px-4 pt-4 pb-2 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase">
              Últimas Noticias
            </h4>
            <div className="px-4 pb-4 space-y-3">
              {noticiasAMostrar.map((noticia) => (
                <div
                  key={noticia.id}
                  className="p-3 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:border-blue-500 hover:shadow-md transition"
                >
                  <div className="flex gap-3">
                    {noticia.imagen_url && (
                      <img
                        src={noticia.imagen_url}
                        alt={noticia.titulo}
                        className="w-14 h-14 rounded object-cover flex-shrink-0"
                      />
                    )}
                    <div className="flex-1 min-w-0">
                      <h5 className="font-semibold text-sm text-neutral-900 dark:text-white line-clamp-1">
                        {noticia.titulo}
                      </h5>
                      <p className="text-xs text-neutral-600 dark:text-neutral-400 line-clamp-1">
                        {noticia.descripcion}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-neutral-500">
                        {noticia.categoria_nombre && (
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor:
                                (noticia.categoria_color || '#3B82F6') +
                                '20',
                              color:
                                noticia.categoria_color || '#3B82F6',
                            }}
                          >
                            {noticia.categoria_nombre}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      {noticias.length > 0 && (
        <div className="sticky bottom-0 p-4 border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <button
            onClick={() => {
              onViewAll?.();
              onClose();
            }}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium text-sm"
          >
            Ver Todas las Noticias
          </button>
        </div>
      )}
    </div>
  );
}
