import { Edit2, Trash2, Eye, EyeOff, Star, Clock } from 'lucide-react';
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
    <div className="grid grid-cols-1 gap-6">
      {noticias.map((noticia) => (
        <div
          key={noticia.id}
          className="group relative flex flex-col md:flex-row gap-6 p-6 rounded-[2rem] bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 hover:border-orange-500/30 transition-all duration-500 shadow-xl overflow-hidden active:scale-[0.99]"
        >
          {/* Subtle Glow Background */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-[40px] rounded-full translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />

          {/* Imagen de Portada con Overlay */}
          <div className="relative w-full md:w-48 h-48 md:h-auto rounded-3xl overflow-hidden border border-zinc-800/50 shrink-0 group/img shadow-2xl">
            {noticia.imagen_url ? (
              <img
                src={noticia.imagen_url}
                alt={noticia.imagen_alt || noticia.titulo}
                className="w-full h-full object-cover transition-transform duration-1000 group-hover/img:scale-110"
              />
            ) : (
              <div className="w-full h-full bg-zinc-950 flex flex-col items-center justify-center gap-3">
                 <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
                    <EyeOff className="w-5 h-5 text-zinc-700" />
                 </div>
                 <span className="text-[9px] font-black text-zinc-800 uppercase tracking-widest">Sin Archivo Visual</span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-60 group-hover/img:opacity-40 transition-opacity" />
            
            {/* Badge de Categoría Flotante */}
            <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-zinc-950/80 backdrop-blur-md border border-zinc-800/50 shadow-xl">
               <span className="text-[9px] font-black text-orange-500 uppercase tracking-[0.1em]">{noticia.categoria_nombre || 'General'}</span>
            </div>
          </div>

          {/* Bloque de Información Central */}
          <div className="flex-1 flex flex-col justify-between py-2">
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-orange-400 transition-colors duration-300 leading-tight">
                    {noticia.titulo}
                  </h3>
                  <div className="flex items-center gap-3">
                    {noticia.fecha_publicacion && (
                      <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        {new Date(noticia.fecha_publicacion).toLocaleDateString('es-CO', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    <span className="w-1 h-1 rounded-full bg-zinc-800" />
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">
                      {noticia.total_vistas || 0} Impactos
                    </span>
                  </div>
                </div>

                {noticia.destacada && (
                  <div className="px-3 py-1.5 rounded-xl bg-orange-500 shadow-[0_4px_15px_rgba(249,115,22,0.3)] text-white flex items-center gap-2">
                    <Star className="w-3.5 h-3.5 fill-current" />
                    <span className="text-[9px] font-black uppercase tracking-widest">Prioridad Alta</span>
                  </div>
                )}
              </div>

              <p className="text-sm text-zinc-500 font-medium leading-relaxed line-clamp-2 max-w-2xl">
                {noticia.descripcion}
              </p>
            </div>

            {/* Fila de Status y Tags */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              <div className={`px-4 py-1.5 rounded-xl border text-[9px] font-black uppercase tracking-[0.15em] transition-colors ${
                noticia.estado === 'publicada' 
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                  : 'bg-zinc-800/10 border-zinc-800 text-zinc-600'
              }`}>
                Estado: {noticia.estado}
              </div>
              
              <div className="px-4 py-1.5 rounded-xl bg-zinc-950/40 border border-zinc-800/80 text-[9px] font-black uppercase tracking-[0.15em] text-zinc-500">
                Acceso: {noticia.visible_para || 'Universal'}
              </div>

              {noticia.allow_comentarios && (
                <div className="px-4 py-1.5 rounded-xl bg-blue-500/5 border border-blue-500/20 text-[9px] font-black uppercase tracking-[0.15em] text-blue-400">
                  Debate Habilitado
                </div>
              )}
            </div>
          </div>

          {/* Panel de Acciones Vertical */}
          <div className="flex md:flex-col items-center justify-center gap-3 bg-zinc-950/20 border-t md:border-t-0 md:border-l border-zinc-800/50 p-4 -m-6 md:m-0 ml-0 md:ml-6 mt-6 md:mt-0">
            <button
              onClick={() => onEdit(noticia)}
              className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-white hover:border-orange-500/50 hover:bg-zinc-800 transition-all active:scale-90"
              title="Ajustar Contenido"
            >
              <Edit2 className="w-4 h-4" />
            </button>

            <div className="relative group/menu">
               <button
                className={`p-3.5 rounded-2xl border transition-all active:scale-90 ${
                  noticia.estado === 'publicada' 
                    ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white' 
                    : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                {noticia.estado === 'publicada' ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
              
              <div className="absolute right-0 bottom-full md:bottom-auto md:top-0 mb-3 md:mb-0 md:mr-3 w-36 py-2 rounded-2xl bg-zinc-950 border border-zinc-800 shadow-2xl opacity-0 invisible group-hover/menu:opacity-100 group-hover/menu:visible transition-all duration-300 z-20 scale-90 group-hover/menu:scale-100 origin-bottom md:origin-right">
                {['publicada', 'pausada', 'borrador', 'archivada'].map((estado) => (
                  <button
                    key={estado}
                    onClick={() => onChangeEstado(noticia.id, estado)}
                    className={`w-full text-left px-5 py-2.5 text-[9px] font-black uppercase tracking-widest transition-all ${
                      noticia.estado === estado 
                        ? 'text-orange-500 bg-orange-500/5' 
                        : 'text-zinc-600 hover:text-white hover:bg-zinc-900'
                    }`}
                  >
                    {estado}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => onDelete(noticia.id)}
              className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-red-400 hover:border-red-500/50 hover:bg-red-500/5 transition-all active:scale-90"
              title="Eliminar Registro"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
