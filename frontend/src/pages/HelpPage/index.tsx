import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, BookOpen, HelpCircle, MessageCircle, RefreshCw, ExternalLink, Eye } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Tutorial {
  id: string;
  title: string;
  author_name: string;
  author_email?: string | null;
  author_phone?: string | null;
  content?: string | null;
  content_html_url?: string | null;
  images?: string[] | null;
  created_at?: string | null;
}

// platformGuides removed (no se usan)

export default function HelpPage() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedHtmlUrl, setSelectedHtmlUrl] = useState<string | null>(null);
  const [selectedHtmlTitle, setSelectedHtmlTitle] = useState<string | null>(null);
  // Bloquear scroll del body cuando un modal esté abierto
  useEffect(() => {
    const open = !!selectedImage || !!selectedHtmlUrl;
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage, selectedHtmlUrl]);
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await supabase
          .from('help_tutorials')
          .select('*')
          .eq('status', 'approved')
          .order('created_at', { ascending: false });

        setTutorials((data as Tutorial[] ) || []);
      } catch (error) {
        console.error('Error fetching tutorials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);
  // Filter tutorials by search (title/content)
  const filteredTutorials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tutorials;
    return tutorials.filter(t => (t.title || '').toLowerCase().includes(q) || (t.content || '').toLowerCase().includes(q));
  }, [searchQuery, tutorials]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-zinc-100">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  return (
    <>
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Header */}
      <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white">
        <div className="max-w-5xl mx-auto px-4 py-16 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-80 text-emerald-400" />
            <h1 className="text-4xl font-bold mb-3">Centro de Ayuda</h1>
            <p className="text-zinc-300 text-lg max-w-2xl mx-auto">
              Encuentra respuestas rápidas a tus preguntas o contacta con nuestro equipo de soporte
            </p>
          </motion.div>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="max-w-xl mx-auto mt-8"
          >
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar en preguntas frecuentes..."
                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-zinc-800 text-zinc-100 placeholder-zinc-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="mt-4 text-center">
              <Link to="/ayuda/tutoriales" className="inline-block px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded-full text-sm font-semibold">Crear un tutorial</Link>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">
        {/* (Se quitaron guías y categorías hardcodeadas; sólo se muestran tutoriales de la comunidad) */}

        {/* Tutoriales de la comunidad (desde Supabase) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-zinc-100 mb-4">Tutoriales de la Comunidad</h2>

          {filteredTutorials.length === 0 ? (
            <div className="bg-zinc-800 rounded-2xl p-8 text-center border border-zinc-700">
              <HelpCircle className="w-12 h-12 text-zinc-400 mx-auto mb-3" />
              <p className="text-zinc-300">No hay tutoriales publicados todavía.</p>
              <p className="text-sm text-zinc-400 mt-1">Puedes ser el primero en crear uno.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredTutorials.map((t) => (
                <div key={t.id} className="bg-zinc-800 rounded-2xl border border-zinc-700 shadow-sm overflow-hidden p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-lg font-semibold text-zinc-100">{t.title}</h3>
                      <p className="text-sm text-zinc-400">Por {t.author_name}{t.author_email ? ` • ${t.author_email}` : ''}</p>
                      {t.created_at && <p className="text-xs text-zinc-500 mt-1">{new Date(t.created_at).toLocaleString()}</p>}
                    </div>
                  </div>

                  {t.images && t.images.length > 0 && (
                    <div className="mt-3 flex gap-3 flex-wrap">
                      {t.images.map((img, idx) => {
                        const bucket = (import.meta.env.VITE_SUPABASE_HELP_BUCKET as string) || 'help-center';
                        const url = supabase.storage.from(bucket).getPublicUrl(img).data.publicUrl;
                        return (
                          <button
                            key={idx}
                            onClick={() => { setSelectedImage(url); setSelectedTitle(t.title); }}
                            className="focus:outline-none"
                            aria-label={`Abrir imagen ${t.title}`}>
                            <img src={url} alt={t.title} className="w-28 h-20 object-cover rounded-md border border-zinc-700" />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {t.content_html_url ? (
                    <div className="mt-3">
                      <button
                        onClick={() => { setSelectedHtmlUrl(`/api/help-center/html/${t.id}`); setSelectedHtmlTitle(t.title); }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-md transition-all duration-200"
                      >
                        <Eye className="w-4 h-4" />
                        Visualizar
                      </button>
                    </div>
                  ) : (
                    <p className="mt-3 text-zinc-300 text-sm">{(t.content || '').slice(0, 300)}{(t.content || '').length > 300 ? '…' : ''}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Contact Support CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-8 text-center text-zinc-100"
        >
          <MessageCircle className="w-12 h-12 mx-auto mb-4 opacity-80 text-emerald-400" />
          <h3 className="text-2xl font-bold mb-2">¿No encontraste lo que buscabas?</h3>
          <p className="text-zinc-300 mb-6">Nuestro equipo de soporte está disponible para ayudarte</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/chat"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-zinc-800 text-zinc-100 rounded-xl font-semibold hover:bg-zinc-700 transition-colors"
            >
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              Chat en vivo
            </a>
            <a
              href="/perfil?section=support"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              Crear ticket
            </a>
          </div>
        </motion.div>
      </div>
    </div>
    {/* Modal - imagen ampliada */}
    {selectedImage && (
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 hide-scrollbar"
        onClick={() => { setSelectedImage(null); setSelectedTitle(null); }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden rounded-md hide-scrollbar"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between gap-4 p-3 bg-zinc-900">
            <div className="text-sm font-semibold text-zinc-100">{selectedTitle}</div>
            <button onClick={() => { setSelectedImage(null); setSelectedTitle(null); }} className="text-zinc-300 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-auto bg-zinc-800 p-4 rounded-b-md hide-scrollbar min-h-0 flex items-center justify-center">
            <img src={selectedImage} alt={selectedTitle || 'Imagen'} className="max-w-full max-h-[80vh] object-contain rounded" />
          </div>
        </motion.div>
      </div>
    )}
  
    {/* Modal HTML preview (sandboxed iframe) */}
    {selectedHtmlUrl && (
      <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 hide-scrollbar" onClick={() => { setSelectedHtmlUrl(null); setSelectedHtmlTitle(null); }}>
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden rounded-md hide-scrollbar" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between gap-4 p-3 bg-zinc-900">
            <div className="text-sm font-semibold text-zinc-100">{selectedHtmlTitle || 'Previsualización'}</div>
            <button onClick={() => { setSelectedHtmlUrl(null); setSelectedHtmlTitle(null); }} className="text-zinc-300 hover:text-white">✕</button>
          </div>
          <div className="flex-1 overflow-auto bg-zinc-800 p-2 rounded-b-md hide-scrollbar min-h-0">
            <iframe src={selectedHtmlUrl || undefined} title="HTML Preview" className="w-full h-full border-0 min-h-0" sandbox="allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock"></iframe>
          </div>
        </motion.div>
      </div>
    )}
    </>
  );
}
