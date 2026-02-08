import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RefreshCw, ExternalLink, ArrowLeft, FileText, Calendar, User, Mail, Phone } from 'lucide-react';

interface Tutorial {
  id: string;
  title: string;
  author_name: string;
  author_email?: string | null;
  author_phone?: string | null;
  content_html_url?: string | null;
  created_at?: string | null;
}

export default function HelpHtmlView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState<Tutorial | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/help-center/tutorials');
        const json = await res.json();
        if (!json.success) throw new Error(json.error || 'Error fetching');
        const found = (json.data || []).find((t: any) => t.id === id) || null;
        if (!found) {
          setError('Tutorial no encontrado');
        } else {
          setTutorial(found);
        }
      } catch (e: any) {
        setError(e?.message || String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-zinc-300 font-medium">Cargando tutorial...</p>
        </div>
      </div>
    );
  }

  if (error || !tutorial) {
    return (
      <div className="min-h-screen bg-zinc-900 text-zinc-100">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mx-auto bg-zinc-800/30 rounded-[12px] border border-zinc-700/50 p-6">
            <div className="flex items-center gap-3 mb-6">
              <button 
                onClick={() => navigate(-1)} 
                className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Volver</span>
              </button>
            </div>

            <div className="flex items-start gap-3 mb-4">
              <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-700">
                <FileText className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-zinc-100 mb-1">Tutorial no encontrado</h1>
                <p className="text-zinc-400">{error || 'Tutorial inválido o no disponible'}</p>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-zinc-700/40">
              <Link 
                to="/ayuda" 
                className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
              >
                Volver al Centro de Ayuda
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const iframeSrc = `/api/help-center/html/${tutorial.id}`;

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Previsualización de Tutorial</h1>
              <p className="text-zinc-400 mt-1">Vista mejorada para HTML subidos — estilo Estado del Sistema</p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => navigate(-1)} className="px-3 py-2 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-100">Volver</button>
              <a href={iframeSrc} target="_blank" rel="noreferrer" className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 rounded text-white inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Abrir
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="mx-auto bg-zinc-800/30 rounded-[12px] lg:rounded-[20px] border border-zinc-700/50 pt-6 px-6 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Info Cards */}
            <div className="lg:col-span-1 space-y-4">
              <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-5 sticky top-24">
                <h2 className="text-sm font-semibold text-zinc-100 mb-4 uppercase tracking-wide">Información</h2>

                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                      <User className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-zinc-400 mb-0.5">Autor</p>
                      <p className="text-sm font-medium text-zinc-100 truncate">{tutorial.author_name}</p>
                    </div>
                  </div>

                  {tutorial.author_email && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                        <Mail className="w-4 h-4 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-400 mb-0.5">Email</p>
                        <p className="text-sm text-zinc-200 truncate">{tutorial.author_email}</p>
                      </div>
                    </div>
                  )}

                  {tutorial.author_phone && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                        <Phone className="w-4 h-4 text-teal-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-400 mb-0.5">Teléfono</p>
                        <p className="text-sm text-zinc-200">{tutorial.author_phone}</p>
                      </div>
                    </div>
                  )}

                  {tutorial.created_at && (
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-700 flex items-center justify-center">
                        <Calendar className="w-4 h-4 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-zinc-400 mb-0.5">Fecha</p>
                        <p className="text-sm text-zinc-200">{new Date(tutorial.created_at).toLocaleDateString('es-AR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric'
                        })}</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 pt-6 border-t border-zinc-700/40">
                  <div className="flex items-start gap-2 text-xs text-zinc-400">
                    <FileText className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-400" />
                    <p>Contenido en entorno sandbox</p>
                  </div>
                </div>
              </div>

              {/* Small action card */}
              <div className="bg-zinc-800 rounded-2xl border border-zinc-700 p-4">
                <p className="text-sm text-zinc-200 font-medium">Acciones</p>
                <div className="mt-3 flex flex-col gap-2">
                  <a href={iframeSrc} target="_blank" rel="noreferrer" className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded text-sm text-emerald-400 text-center">Abrir HTML</a>
                  <button onClick={() => navigator.clipboard.writeText(iframeSrc)} className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 rounded text-sm text-zinc-200">Copiar URL</button>
                </div>
              </div>
            </div>

            {/* Main viewer */}
            <div className="lg:col-span-3">
              <div className="bg-zinc-800 rounded-2xl border border-zinc-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-zinc-700 bg-zinc-900/40">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-zinc-900 rounded-lg shadow-sm border border-zinc-700">
                      <FileText className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-100">{tutorial.title}</h2>
                      <p className="text-sm text-zinc-400">Contenido del tutorial</p>
                    </div>
                  </div>
                </div>

                <div className="relative bg-zinc-900" style={{ height: 'calc(100vh - 280px)', minHeight: '500px' }}>
                  <iframe 
                    src={iframeSrc} 
                    title={tutorial.title || 'Tutorial'} 
                    className="w-full h-full border-0 bg-white"
                    sandbox="allow-forms allow-scripts allow-popups allow-modals allow-same-origin"
                  />
                </div>

                <div className="px-6 py-3 border-t border-zinc-700 bg-zinc-900/30">
                  <div className="flex items-center gap-2 text-sm text-zinc-300">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                    <span>Contenido cargado correctamente</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}