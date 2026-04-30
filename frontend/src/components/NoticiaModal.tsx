import { useEffect, useMemo, useRef, useState } from 'react';
import { X, Calendar, Send } from 'lucide-react';
import { Title } from './Title';
import { Subtitle } from './Subtitle';
import { protonColors } from '../styles/colors';
import type { CrearNoticiaComentario, Noticia, NoticiaComentario } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface NoticiaModalProps {
  noticiaId: string;
  noticiaPreview?: Noticia;
  onClose: () => void;
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('es-AR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function NoticiaModal({ noticiaId, noticiaPreview, onClose }: NoticiaModalProps) {
  const { user, profile } = useAuth();

  // Robust lock of background scroll while modal is open (preserve scroll position)
  useEffect(() => {
    const scrollY = window.scrollY || document.documentElement.scrollTop;
    const prevPosition = document.body.style.position;
    const prevTop = document.body.style.top;
    const prevLeft = document.body.style.left;
    const prevRight = document.body.style.right;
    const prevWidth = document.body.style.width;

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';

    return () => {
      document.body.style.position = prevPosition || '';
      document.body.style.top = prevTop || '';
      document.body.style.left = prevLeft || '';
      document.body.style.right = prevRight || '';
      document.body.style.width = prevWidth || '';
      window.scrollTo(0, scrollY);
    };
  }, []);
  const [noticia, setNoticia] = useState<Noticia | null>(noticiaPreview ?? null);
  const [loadingNoticia, setLoadingNoticia] = useState(true);
  const [errorNoticia, setErrorNoticia] = useState<string | null>(null);

  const [comentarios, setComentarios] = useState<NoticiaComentario[]>([]);
  const [loadingComentarios, setLoadingComentarios] = useState(false);
  const [errorComentarios, setErrorComentarios] = useState<string | null>(null);

  const [form, setForm] = useState<CrearNoticiaComentario>(() => {
    const nombre = profile?.nombre || user?.user_metadata?.full_name || '';
    return {
      nombre,
      email: user?.email || '',
      contenido: '',
      user_id: user?.id,
    };
  });

  const [sending, setSending] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const categoriaStyle = useMemo(() => {
    const categoriaColor = noticia?.categoria_color || protonColors.purple[500];
    return {
      backgroundColor: categoriaColor + '20',
      color: categoriaColor,
    };
  }, [noticia?.categoria_color]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  useEffect(() => {
    let mounted = true;

    async function loadNoticia() {
      setLoadingNoticia(true);
      setErrorNoticia(null);
      try {
        const resp = await fetch(`/api/noticias/${noticiaId}`);
        const json = await resp.json();
        if (!resp.ok || !json?.success) {
          throw new Error(json?.error || 'No se pudo cargar la noticia');
        }
        if (mounted) setNoticia(json.data);
      } catch (e: any) {
        if (mounted) setErrorNoticia(e?.message || 'Error cargando la noticia');
      } finally {
        if (mounted) setLoadingNoticia(false);
      }
    }

    loadNoticia();
    return () => {
      mounted = false;
    };
  }, [noticiaId]);

  useEffect(() => {
    let mounted = true;

    async function loadComentarios() {
      if (!noticia?.allow_comentarios) return;

      setLoadingComentarios(true);
      setErrorComentarios(null);
      try {
        const resp = await fetch(`/api/noticias/${noticiaId}/comentarios`);
        const json = await resp.json();
        if (!resp.ok || !json?.success) {
          throw new Error(json?.error || 'No se pudieron cargar los comentarios');
        }
        if (mounted) setComentarios(json.data || []);
      } catch (e: any) {
        if (mounted) setErrorComentarios(e?.message || 'Error cargando comentarios');
      } finally {
        if (mounted) setLoadingComentarios(false);
      }
    }

    loadComentarios();
    return () => {
      mounted = false;
    };
  }, [noticia?.allow_comentarios, noticiaId]);

  const handleSubmit = async () => {
    setSendError(null);

    const nombre = (form.nombre || '').trim();
    const contenido = (form.contenido || '').trim();
    const email = (form.email || '').trim();

    if (!nombre) {
      setSendError('Ingresá tu nombre.');
      return;
    }
    if (!contenido) {
      setSendError('Escribí un comentario.');
      return;
    }

    setSending(true);
    try {
      const resp = await fetch(`/api/noticias/${noticiaId}/comentarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre,
          email: email || undefined,
          contenido,
          user_id: user?.id,
        }),
      });
      const json = await resp.json();
      if (!resp.ok || !json?.success) {
        throw new Error(json?.error || 'No se pudo enviar el comentario');
      }

      setForm((prev) => ({ ...prev, contenido: '' }));

      // Insertar al principio (orden DESC)
      if (json.data) {
        setComentarios((prev) => [json.data as NoticiaComentario, ...prev]);
      } else {
        // fallback: recargar
        const reload = await fetch(`/api/noticias/${noticiaId}/comentarios`);
        const reloadJson = await reload.json();
        if (reload.ok && reloadJson?.success) setComentarios(reloadJson.data || []);
      }
    } catch (e: any) {
      setSendError(e?.message || 'Error enviando comentario');
    } finally {
      setSending(false);
    }
  };

  const titulo = noticia?.titulo || 'Noticia';
  const descripcion = noticia?.descripcion || '';
  const contenido = noticia?.contenido_completo || '';
  const fecha = noticia?.fecha_publicacion || noticia?.created_at;
  const imageAlt = noticia?.imagen_alt || titulo;

  const touchStartY = useRef<number | null>(null);

  // Handle wheel events so modal content scrolls with mouse wheel/trackpad
  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLElement;
    if (!el) return;
    const delta = e.deltaY;
    const scrollTop = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;

    const atTop = scrollTop <= 0;
    const atBottom = scrollTop >= maxScroll - 1;

    // If trying to scroll past top or bottom, prevent propagation to background
    if ((atTop && delta < 0) || (atBottom && delta > 0)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // allow native scrolling but stop propagation so background doesn't react
    e.stopPropagation();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    touchStartY.current = e.touches[0]?.clientY ?? null;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const el = e.currentTarget as HTMLElement;
    if (!touchStartY.current) return;
    const currentY = e.touches[0]?.clientY ?? 0;
    const delta = touchStartY.current - currentY;
    const scrollTop = el.scrollTop;
    const maxScroll = el.scrollHeight - el.clientHeight;
    const atTop = scrollTop <= 0;
    const atBottom = scrollTop >= maxScroll - 1;

    if ((atTop && delta < 0) || (atBottom && delta > 0)) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    e.stopPropagation();
    touchStartY.current = currentY;
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 pt-20"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-zinc-900 text-zinc-100 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] border border-zinc-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-zinc-800 p-6 flex items-start justify-between gap-4 flex-shrink-0">
          <div className="min-w-0">
            {noticia?.categoria_nombre && (
              <div
                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold mb-3"
                style={categoriaStyle}
              >
                {noticia.categoria_icono === 'Gift' ? '🎁' : '📰'}
                {noticia.categoria_nombre}
              </div>
            )}
            <Title as="h2" className="!text-[1.75rem] !leading-tight">
              {titulo}
            </Title>
            {fecha && (
              <div className="flex items-center gap-2 mt-2 text-xs text-zinc-400">
                <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                {formatDate(fecha)}
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 transition-colors flex-shrink-0"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div
          className="p-6 space-y-6 overflow-y-auto flex-1"
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          style={{ touchAction: 'pan-y', overscrollBehavior: 'contain' }}
        >
          {loadingNoticia && (
            <div className="bg-zinc-800/40 backdrop-blur-sm border border-zinc-700 rounded-2xl p-6">
              <Subtitle>Cargando noticia…</Subtitle>
            </div>
          )}

          {!loadingNoticia && errorNoticia && (
            <div className="bg-zinc-800/40 backdrop-blur-sm border border-zinc-700 rounded-2xl p-6">
              <Subtitle className="text-red-500">{errorNoticia}</Subtitle>
            </div>
          )}

          {!loadingNoticia && !errorNoticia && noticia && (
            <>
              {noticia.imagen_url && (
                <div className="bg-zinc-800 border border-zinc-800 rounded-2xl overflow-hidden">
                  <img
                    src={noticia.imagen_url}
                    alt={imageAlt}
                    className="w-full h-auto object-contain max-h-[32rem] mx-auto"
                    loading="lazy"
                  />
                </div>
              )}

              {descripcion && <Subtitle className="text-base text-zinc-100">{descripcion}</Subtitle>}

              {contenido && (
                <div className="text-sm whitespace-pre-wrap text-zinc-300">{contenido}</div>
              )}

              {/* Comentarios */}
              {noticia.allow_comentarios && (
                <div className="pt-2">
                  <Title as="h3" className="!text-[1.5rem]">Comentarios</Title>
                  <Subtitle className="mt-1 text-zinc-400">Dejá tu comentario abajo.</Subtitle>

                  <div className="mt-4 bg-zinc-800/40 backdrop-blur-sm border border-zinc-700 rounded-2xl p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        value={form.nombre}
                        onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
                        placeholder="Tu nombre"
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-zinc-100"
                      />
                      <input
                        value={form.email || ''}
                        onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                        placeholder="Email (opcional)"
                        className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-zinc-100"
                      />
                    </div>

                    <textarea
                      value={form.contenido}
                      onChange={(e) => setForm((p) => ({ ...p, contenido: e.target.value }))}
                      placeholder="Escribí tu comentario…"
                      rows={4}
                      className="mt-3 w-full px-4 py-3 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm text-zinc-100"
                    />

                    {sendError && <p className="text-sm text-red-500 mt-2">{sendError}</p>}

                    <button
                      onClick={handleSubmit}
                      disabled={sending}
                      className="mt-3 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      {sending ? 'Enviando…' : 'Enviar comentario'}
                    </button>
                  </div>

                  <div className="mt-4">
                    {loadingComentarios && <Subtitle>Cargando comentarios…</Subtitle>}
                    {!loadingComentarios && errorComentarios && <Subtitle className="text-red-500">{errorComentarios}</Subtitle>}
                    {!loadingComentarios && !errorComentarios && comentarios.length === 0 && (
                      <Subtitle className="text-zinc-400">Todavía no hay comentarios.</Subtitle>
                    )}

                    {!loadingComentarios && !errorComentarios && comentarios.length > 0 && (
                      <div className="space-y-3">
                        {comentarios.map((c) => (
                          <div key={c.id} className="bg-zinc-800/40 border border-zinc-700 rounded-2xl p-4">
                            <div className="flex items-center justify-between gap-4">
                              <p className="text-sm font-semibold text-zinc-100">{c.nombre}</p>
                              <p className="text-xs text-zinc-400">{formatDate(c.created_at)}</p>
                            </div>
                            <p className="text-sm mt-2 whitespace-pre-wrap text-zinc-300">{c.contenido}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
