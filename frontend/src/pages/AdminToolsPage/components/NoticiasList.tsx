import { Edit2, Trash2, Eye, EyeOff, Star } from 'lucide-react';
import type { Noticia } from '../../../types';

interface NoticiasListProps {
  noticias: Noticia[];
  onEdit: (noticia: Noticia) => void;
  onDelete: (id: string) => void;
  onChangeEstado: (id: string, estado: string) => void;
}

export default function NoticiasList({
  noticias,
  onEdit,
  onDelete,
  onChangeEstado,
}: NoticiasListProps) {
  return (
    <div className="space-y-3">
      {noticias.map((noticia) => (
        <div
          key={noticia.id}
          className="p-4 border border-neutral-700 rounded-lg hover:border-neutral-600 transition"
        >
          <div className="flex gap-4">
            {/* Imagen */}
            {noticia.imagen_url && (
              <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border border-neutral-700">
                <img
                  src={noticia.imagen_url}
                  alt={noticia.imagen_alt || noticia.titulo}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Contenido */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start gap-2">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {noticia.titulo}
                  </h3>
                  <p className="text-sm text-neutral-400 line-clamp-2">
                    {noticia.descripcion}
                  </p>
                </div>

                {/* Badge destacada */}
                {noticia.destacada && (
                  <div className="flex-shrink-0 bg-yellow-900/30 text-yellow-300 px-2 py-1 rounded text-xs font-medium flex items-center gap-1">
                    <Star className="w-3 h-3" />
                    Destacada
                  </div>
                )}
              </div>

              {/* Meta información */}
              <div className="flex flex-wrap gap-4 mt-3 text-xs text-neutral-400">
                <span className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded">
                  {noticia.categoria_nombre || 'Sin categoría'}
                </span>
                {noticia.visible_para === 'vpn' && (
                  <span className="px-2 py-1 bg-purple-900 text-purple-300 rounded">
                    VPN
                  </span>
                )}
                <span className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded">
                  {noticia.estado === 'publicada' ? '✓ Publicada' : noticia.estado}
                </span>
                {noticia.fecha_publicacion && (
                  <span className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded">
                    {new Date(noticia.fecha_publicacion).toLocaleDateString('es-AR')}
                  </span>
                )}
                {noticia.total_vistas !== undefined && (
                  <span className="px-2 py-1 bg-neutral-800 text-neutral-300 rounded">
                    👁️ {noticia.total_vistas} vistas
                  </span>
                )}
              </div>
            </div>

            {/* Acciones */}
            <div className="flex items-center gap-2 ml-4">
              <button
                onClick={() => onEdit(noticia)}
                title="Editar"
                className="p-2 text-neutral-400 hover:text-blue-400 hover:bg-blue-900/20 rounded transition"
              >
                <Edit2 className="w-4 h-4" />
              </button>

              {/* Cambiar visibilidad */}
              <div className="relative group">
                <button
                  title="Cambiar visibilidad"
                  className="p-2 text-neutral-400 hover:text-purple-400 hover:bg-purple-900/20 rounded transition"
                >
                  {noticia.estado === 'publicada' ? (
                    <Eye className="w-4 h-4" />
                  ) : (
                    <EyeOff className="w-4 h-4" />
                  )}
                </button>
                <div className="absolute right-0 mt-1 w-32 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition z-10">
                  {['publicada', 'pausada', 'borrador', 'archivada'].map((estado) => (
                    <button
                      key={estado}
                      onClick={() => onChangeEstado(noticia.id, estado)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-neutral-700 transition ${
                        noticia.estado === estado ? 'text-blue-400 font-semibold' : 'text-neutral-300'
                      }`}
                    >
                      {estado.charAt(0).toUpperCase() + estado.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onDelete(noticia.id)}
                title="Eliminar"
                className="p-2 text-neutral-400 hover:text-red-400 hover:bg-red-900/20 rounded transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
