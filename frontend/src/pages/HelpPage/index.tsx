import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  BookOpen, 
  HelpCircle, 
  MessageCircle, 
  RefreshCw, 
  ExternalLink, 
  Eye, 
  X,
  Calendar,
  User,
  Mail,
  Image as ImageIcon,
  FileText,
  Sparkles
} from 'lucide-react';
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
  // Bloquear scroll del body cuando un modal esté abierto
  useEffect(() => {
    if (selectedImage) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage]);
  

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
  // Filter tutorials by search (title/content/author)
  const filteredTutorials = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return tutorials;
    return tutorials.filter(t => 
      (t.title || '').toLowerCase().includes(q) || 
      (t.content || '').toLowerCase().includes(q) ||
      (t.author_name || '').toLowerCase().includes(q)
    );
  }, [searchQuery, tutorials]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center text-zinc-100">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin" />
          <p className="text-zinc-300 font-medium">Cargando tutoriales...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100">
        {/* Header Hero */}
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-zinc-100 relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute inset-0 bg-black/20 bg-[size:20px_20px] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-700/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-700/8 rounded-full blur-3xl" />
          
          <div className="relative max-w-6xl mx-auto px-6 py-20">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-2xl mb-6 shadow-xl">
                <BookOpen className="w-10 h-10 text-emerald-400" />
              </div>
              <h1 className="text-5xl font-bold mb-4 text-zinc-100">
                Centro de Ayuda
              </h1>
              <p className="text-zinc-300 text-lg max-w-2xl mx-auto leading-relaxed">
                Encuentra respuestas rápidas a tus preguntas o contacta con nuestro equipo de soporte
              </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="max-w-2xl mx-auto mt-10"
            >
              <div className="relative">
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-5 h-5 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar tutoriales, temas o autores..."
                  className="w-full pl-14 pr-6 py-5 rounded-2xl bg-zinc-800 text-zinc-100 placeholder-zinc-500 shadow-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-5 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link 
                  to="/ayuda/tutoriales" 
                  className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all"
                >
                  <Sparkles className="w-5 h-5" />
                  Crear un tutorial
                </Link>
                <span className="text-zinc-300 text-sm">
                  Comparte tu conocimiento con la comunidad
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 py-12">
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
          >
            <div className="bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-700 rounded-xl">
                  <FileText className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-100">{tutorials.length}</p>
                  <p className="text-sm text-zinc-400">Tutoriales disponibles</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-700 rounded-xl">
                  <User className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-100">
                    {new Set(tutorials.map(t => t.author_name)).size}
                  </p>
                  <p className="text-sm text-zinc-400">Contribuidores</p>
                </div>
              </div>
            </div>

            <div className="bg-zinc-800 rounded-2xl p-6 shadow-sm border border-zinc-700">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-zinc-700 rounded-xl">
                  <ImageIcon className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-zinc-100">
                    {tutorials.reduce((acc, t) => acc + (t.images?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-zinc-400">Recursos visuales</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Tutorials Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-zinc-100">Tutoriales de la Comunidad</h2>
                <p className="text-zinc-400 mt-1">
                  {filteredTutorials.length} {filteredTutorials.length === 1 ? 'tutorial encontrado' : 'tutoriales encontrados'}
                </p>
              </div>
            </div>

            {filteredTutorials.length === 0 ? (
              <div className="bg-zinc-800 rounded-2xl p-12 text-center border border-zinc-700 shadow-sm">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-2xl mb-4">
                  <HelpCircle className="w-8 h-8 text-zinc-400" />
                </div>
                <h3 className="text-xl font-semibold text-zinc-100 mb-2">
                  {searchQuery ? 'No se encontraron resultados' : 'No hay tutoriales disponibles'}
                </h3>
                <p className="text-zinc-400 mb-6">
                  {searchQuery 
                    ? 'Intenta con otros términos de búsqueda'
                    : 'Sé el primero en compartir tu conocimiento con la comunidad'
                  }
                </p>
                {!searchQuery && (
                  <Link
                    to="/ayuda/tutoriales"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-colors"
                  >
                    <Sparkles className="w-5 h-5" />
                    Crear primer tutorial
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredTutorials.map((tutorial, index) => (
                    <motion.div
                      key={tutorial.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-zinc-800 rounded-2xl border border-zinc-700 shadow-sm hover:shadow-md transition-all overflow-hidden"
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold text-zinc-100 mb-2 line-clamp-2">
                              {tutorial.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                              <div className="flex items-center gap-2">
                                <User className="w-4 h-4 text-emerald-400" />
                                <span>{tutorial.author_name}</span>
                              </div>
                              {tutorial.author_email && (
                                <div className="flex items-center gap-2">
                                  <Mail className="w-4 h-4 text-purple-400" />
                                  <span className="truncate max-w-[200px]">{tutorial.author_email}</span>
                                </div>
                              )}
                              {tutorial.created_at && (
                                <div className="flex items-center gap-2">
                                  <Calendar className="w-4 h-4 text-emerald-400" />
                                  <span>
                                    {new Date(tutorial.created_at).toLocaleDateString('es-AR', {
                                      day: '2-digit',
                                      month: 'short',
                                      year: 'numeric'
                                    })}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Content Preview */}
                        {!tutorial.content_html_url && tutorial.content && (
                          <p className="text-zinc-300 text-sm leading-relaxed line-clamp-3 mb-4">
                            {tutorial.content}
                          </p>
                        )}

                        {/* Images Gallery */}
                        {tutorial.images && tutorial.images.length > 0 && (
                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-3">
                              <ImageIcon className="w-4 h-4 text-zinc-400" />
                              <span className="text-sm font-medium text-zinc-300">
                                {tutorial.images.length} {tutorial.images.length === 1 ? 'imagen' : 'imágenes'}
                              </span>
                            </div>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                              {tutorial.images.map((img, idx) => {
                                const bucket = (import.meta.env.VITE_SUPABASE_HELP_BUCKET as string) || 'help-center';
                                const url = supabase.storage.from(bucket).getPublicUrl(img).data.publicUrl;
                                return (
                                  <button
                                    key={idx}
                                    onClick={() => { 
                                      setSelectedImage(url); 
                                      setSelectedTitle(tutorial.title); 
                                    }}
                                    className="group relative aspect-video rounded-xl overflow-hidden border-2 border-zinc-700 hover:border-emerald-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                  >
                                    <img 
                                      src={url} 
                                      alt={`${tutorial.title} - imagen ${idx + 1}`} 
                                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    />
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                      <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center gap-3 pt-4 border-t border-zinc-700">
                          {tutorial.content_html_url ? (
                            <Link
                              to={`/ayuda/tutoriales/view/${tutorial.id}`}
                              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold shadow-sm hover:shadow transition-all"
                            >
                              <Eye className="w-4 h-4" />
                              Ver tutorial completo
                            </Link>
                          ) : (
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-zinc-700 text-zinc-300 rounded-xl text-sm">
                              <FileText className="w-4 h-4" />
                              Tutorial de texto
                            </div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>

          {/* Contact Support CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-16 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-2xl p-10 text-center text-zinc-100 shadow-xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-black/20 pointer-events-none" />
            <div className="relative">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-2xl mb-6">
                <MessageCircle className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-3xl font-bold mb-3">¿No encontraste lo que buscabas?</h3>
              <p className="text-zinc-300 text-lg mb-8 max-w-2xl mx-auto">
                Nuestro equipo de soporte está disponible para ayudarte en cualquier momento
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/chat"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all shadow-lg hover:shadow-xl"
                >
                  <MessageCircle className="w-5 h-5" />
                  Chat en vivo
                </a>
                <a
                  href="/perfil?section=support"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-transparent text-zinc-100 rounded-xl font-semibold hover:bg-white/5 transition-all border border-zinc-700"
                >
                  <ExternalLink className="w-5 h-5" />
                  Crear ticket
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Modal - Imagen ampliada */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={() => { 
              setSelectedImage(null); 
              setSelectedTitle(null); 
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="max-w-6xl w-full max-h-[90vh] flex flex-col overflow-hidden rounded-2xl shadow-2xl bg-zinc-900"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-zinc-900 to-zinc-800 text-zinc-100">
                <div className="flex items-center gap-3">
                  <ImageIcon className="w-5 h-5" />
                  <h3 className="font-semibold truncate">{selectedTitle}</h3>
                </div>
                <button 
                  onClick={() => { 
                    setSelectedImage(null); 
                    setSelectedTitle(null); 
                  }} 
                  className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                  aria-label="Cerrar"
                >
                  <X className="w-5 h-5 text-zinc-200" />
                </button>
              </div>

              {/* Image Container */}
              <div className="flex-1 overflow-auto bg-zinc-800 p-6 flex items-center justify-center min-h-0">
                <img 
                  src={selectedImage} 
                  alt={selectedTitle || 'Imagen ampliada'} 
                  className="max-w-full max-h-full object-contain rounded-lg shadow-lg"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
