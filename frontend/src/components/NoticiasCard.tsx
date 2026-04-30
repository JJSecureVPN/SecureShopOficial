import React, { useMemo, useState } from 'react';
import { Calendar, Eye, Star } from 'lucide-react';
import type { Noticia } from '../types';
import { protonColors } from '../styles/colors';

interface NoticiasCardProps {
  noticia: Noticia;
  onClick?: (noticia: Noticia) => void;
  variant?: 'default' | 'highlight' | 'compact';
}

export default function NoticiasCardClean({ noticia, onClick, variant = 'default' }: NoticiasCardProps) {
  const [isPortrait, setIsPortrait] = useState<boolean | null>(null);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short', year: 'numeric' });

  const categoriaStyle = useMemo(() => {
    const color = noticia.categoria_color || protonColors.purple[500];
    return { backgroundColor: color + '20', color };
  }, [noticia.categoria_color]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (!img.naturalWidth || !img.naturalHeight) return;
    setIsPortrait(img.naturalHeight > img.naturalWidth);
  };

  const imageAlt = noticia.imagen_alt || noticia.titulo;

  const BaseCard = ({ children }: { children: React.ReactNode }) => (
    <div
      onClick={() => onClick?.(noticia)}
      className="bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden hover:border-zinc-600 hover:shadow-lg transition-all cursor-pointer"
    >
      {children}
    </div>
  );

  if (variant === 'compact') {
    return (
      <BaseCard>
        <div className="p-3 flex gap-3 items-center">
          {noticia.imagen_url && (
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-700 flex items-center justify-center">
              <img
                src={noticia.imagen_url}
                alt={imageAlt}
                onLoad={handleImageLoad}
                className={`w-full h-full ${isPortrait ? 'object-contain p-1' : 'object-cover'}`}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold line-clamp-2 text-zinc-100">{noticia.titulo}</h4>
            </div>
            <p className="text-xs text-zinc-400 line-clamp-1">{noticia.descripcion}</p>
            <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
              <Calendar className="w-3 h-3 text-emerald-400" />
              {formatDate(noticia.fecha_publicacion || noticia.created_at)}
            </div>
          </div>
        </div>
      </BaseCard>
    );
  }

  if (variant === 'highlight') {
    return (
      <BaseCard>
        {noticia.imagen_url && (
          <div className={`relative ${isPortrait ? 'bg-zinc-700' : ''}`}>
            <img
              src={noticia.imagen_url}
              alt={imageAlt}
              onLoad={handleImageLoad}
              className={isPortrait ? 'w-full h-auto object-contain' : 'w-full h-48 object-cover'}
            />
          </div>
        )}
        <div className="p-5">
          {noticia.categoria_nombre && (
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-2" style={categoriaStyle}>
              <span>{noticia.categoria_icono === 'Gift' ? '🎁' : '📰'}</span>
              {noticia.categoria_nombre}
            </div>
          )}
          <h3 className="text-lg font-semibold mb-2 text-zinc-100">{noticia.titulo}</h3>
          <p className="text-sm text-zinc-400 mb-4">{noticia.descripcion}</p>
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <div className="flex items-center gap-2">
              <Calendar className="w-3 h-3 text-emerald-400" />
              {formatDate(noticia.fecha_publicacion || noticia.created_at)}
            </div>
            {noticia.total_vistas !== undefined && (
              <div className="flex items-center gap-1">
                <Eye className="w-3 h-3 text-emerald-400" />
                {noticia.total_vistas}
              </div>
            )}
          </div>
        </div>
      </BaseCard>
    );
  }

  return (
    <BaseCard>
      {noticia.imagen_url && (
        <div className={`relative ${isPortrait ? 'bg-zinc-700' : ''}`}>
          <img
            src={noticia.imagen_url}
            alt={imageAlt}
            onLoad={handleImageLoad}
            className={isPortrait ? 'w-full h-auto object-contain max-h-[32rem]' : 'w-full h-56 object-cover'}
          />
          {noticia.destacada && (
            <div className="absolute top-3 right-3 bg-yellow-500 text-white p-2 rounded-full shadow-lg">
              <Star className="w-4 h-4" />
            </div>
          )}
        </div>
      )}

      <div className="p-5">
        {noticia.categoria_nombre && (
          <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3" style={categoriaStyle}>
            {noticia.categoria_icono === 'Gift' ? '🎁' : '📰'}
            {noticia.categoria_nombre}
          </div>
        )}

        <h3 className="text-lg font-semibold mb-2 text-zinc-100">{noticia.titulo}</h3>
        <p className="text-sm mb-4 text-zinc-400">{noticia.descripcion}</p>

        <div className="flex items-center justify-between text-xs border-t pt-3 border-zinc-700 text-zinc-400">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3 text-emerald-400" />
            {formatDate(noticia.fecha_publicacion || noticia.created_at)}
          </div>
          {noticia.total_vistas !== undefined && (
            <div className="flex items-center gap-1">
              <Eye className="w-3 h-3 text-emerald-400" />
              {noticia.total_vistas}
            </div>
          )}
        </div>
      </div>
    </BaseCard>
  );
}
