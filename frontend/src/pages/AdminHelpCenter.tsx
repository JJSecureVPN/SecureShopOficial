import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ThumbsUp, ThumbsDown, X, BookOpen, RefreshCw, Users, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminHelpCenter() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const initialUserId = (() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('admin_help_user_id') : null;
      if (stored) return stored;
    } catch (e) { /* ignore */ }
    return (import.meta.env.VITE_ADMIN_HELP_USER_ID as string) || 'd5c78366-ab1e-43ae-be99-417260fcfd73';
  })();

  const [userId, setUserId] = useState(initialUserId);

  async function loadPending() {
    setLoading(true);
    try {
      const res = await fetch(`/api/help-center/admin/review?status=${filter}`, {
        headers: { 'x-supabase-user-id': userId }
      });
      const json = await res.json();
      if (json.success) setPending(json.data || []);
      else alert(json.error || 'Error de sincronización');
    } catch (e) {
      console.error(e);
      alert('Error en el enlace con el servidor de tutoriales');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (userId) loadPending();
  }, [userId, filter]);

  async function review(id: string, action: 'approve' | 'reject') {
    try {
      const res = await fetch(`/api/help-center/admin/review/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-supabase-user-id': userId },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (json.success) {
        setPending((p) => p.filter((t) => t.id !== id));
      } else {
        alert(json.error || 'Fallo en la validación');
      }
    } catch (e) {
      console.error(e);
      alert('Error en el protocolo de revisión');
    }
  }

  async function removeTutorial(id: string) {
    try {
      if (!confirm('¿DESVINCULAR ESTE CONTENIDO PERMANENTEMENTE?')) return;
      const res = await fetch(`/api/help-center/admin/review/${id}`, {
        method: 'DELETE',
        headers: { 'x-supabase-user-id': userId },
      });
      const json = await res.json();
      if (json.success) {
        setPending((p) => p.filter((t) => t.id !== id));
      } else {
        alert(json.error || 'Fallo en la eliminación');
      }
    } catch (e) {
      console.error(e);
      alert('Error en la purga de datos');
    }
  }

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedHtmlUrl, setSelectedHtmlUrl] = useState<string | null>(null);

  useEffect(() => {
    const open = !!selectedImage || !!selectedHtmlUrl;
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage, selectedHtmlUrl]);

  return (
    <div className="space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Estelar */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900/20 backdrop-blur-3xl border border-zinc-800/50 p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-500/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div className="flex items-start gap-6">
            <div className="w-16 h-16 rounded-[1.5rem] bg-orange-500/10 border border-orange-500/30 flex items-center justify-center shadow-2xl shadow-orange-500/10">
               <BookOpen className="w-8 h-8 text-orange-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white tracking-tight uppercase">Cámara de Tutoriales</h2>
              <p className="text-zinc-500 font-medium mt-1 text-sm max-w-xl">
                Centro de validación y curaduría de contenido instruccional. Revisa, aprueba o depura las contribuciones de la red.
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-3 shrink-0">
             <div className="px-4 py-2 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 backdrop-blur-xl">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest flex items-center gap-3">
                   Nodos Pendientes: <span className="text-orange-400">{pending.length}</span>
                </span>
             </div>
          </div>
        </div>
      </div>

      {/* Control Panel */}
      <div className="rounded-[2rem] bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 p-6 md:p-8 shadow-xl">
        <div className="grid lg:grid-cols-12 gap-6 items-end">
          <div className="lg:col-span-6 space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Credencial de Autoridad (Supabase ID)</label>
            <input
              value={userId}
              onChange={(e) => { setUserId(e.target.value); try { localStorage.setItem('admin_help_user_id', e.target.value); } catch { /* empty */ } }}
              className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-5 text-xs font-bold text-zinc-300 focus:outline-none focus:border-orange-500/50 transition-all font-mono"
              placeholder="00000000-0000-0000-0000-000000000000"
            />
          </div>
          <div className="lg:col-span-3 space-y-3">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Filtrar Estado</label>
            <select 
              value={filter} 
              onChange={(e) => setFilter(e.target.value as any)} 
              className="w-full h-12 rounded-xl bg-zinc-950 border border-zinc-800 px-5 text-xs font-black uppercase tracking-widest text-orange-500 focus:outline-none focus:border-orange-500/50 transition-all cursor-pointer"
            >
              <option value="pending">Pendientes</option>
              <option value="approved">Aprobados</option>
              <option value="all">Todos</option>
            </select>
          </div>
          <div className="lg:col-span-3">
            <button 
              onClick={loadPending} 
              disabled={!userId || loading} 
              className="w-full h-12 rounded-xl bg-orange-500 text-[10px] font-black uppercase tracking-widest text-white hover:bg-orange-400 hover:shadow-[0_0_20px_rgba(249,115,22,0.3)] transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Sincronizar Datos
            </button>
          </div>
        </div>
      </div>

      {/* Feed de Tutoriales */}
      <div className="space-y-8">
        {pending.length === 0 && !loading && (
          <div className="py-24 text-center border border-dashed border-zinc-800 rounded-[2.5rem] bg-zinc-900/10">
            <div className="w-16 h-16 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center mx-auto mb-6">
               <BookOpen className="w-6 h-6 text-zinc-700" />
            </div>
            <p className="text-sm font-black text-zinc-600 uppercase tracking-widest italic">Archivo de Tutoriales Vacío</p>
            <p className="text-[11px] text-zinc-700 font-medium mt-2">No se han detectado envíos en el canal seleccionado.</p>
          </div>
        )}

        <div className="grid gap-8">
          {pending.map((t) => (
            <div key={t.id} className="group relative overflow-hidden rounded-[2.5rem] bg-zinc-900/30 backdrop-blur-xl border border-zinc-800 p-8 shadow-xl transition-all duration-500 hover:border-orange-500/30 animate-in fade-in slide-in-from-bottom-4">
              <div className="flex flex-col xl:flex-row gap-8 justify-between">
                <div className="flex-1 space-y-6">
                  <div className="flex items-start gap-5">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-[10px] font-black text-zinc-600 group-hover:text-orange-500 group-hover:border-orange-500/30 transition-all">
                       {t.author_name?.charAt(0) || 'U'}
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight group-hover:text-orange-400 transition-colors">{t.title}</h3>
                      <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                         <span className="flex items-center gap-1.5"><Users className="w-3 h-3 text-zinc-600" /> {t.author_name}</span>
                         {t.author_email && (
                           <>
                             <span className="w-1 h-1 rounded-full bg-zinc-800" />
                             <span className="text-zinc-600">{t.author_email}</span>
                           </>
                         )}
                         <span className="w-1 h-1 rounded-full bg-zinc-800" />
                         <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-zinc-600" /> {new Date(t.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 text-sm leading-relaxed text-zinc-400 font-medium whitespace-pre-wrap">
                    {t.content}
                  </div>

                  {t.content_html_url && (
                    <div className="flex justify-start">
                      <Link to={`/ayuda/tutoriales/view/${t.id}`} className="px-5 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[9px] font-black uppercase tracking-widest text-orange-400 hover:bg-orange-500 hover:text-white transition-all shadow-2xl shadow-orange-500/5">
                        Previsualizar Estructura
                      </Link>
                    </div>
                  )}

                  {t.images && t.images.length > 0 && (
                    <div className="flex gap-3 flex-wrap pt-2">
                      {t.images.map((img: string, idx: number) => {
                        const bucket = (import.meta.env.VITE_SUPABASE_HELP_BUCKET as string) || 'help-center';
                        const url = supabase.storage.from(bucket).getPublicUrl(img).data.publicUrl;
                        return (
                          <button 
                            key={idx} 
                            onClick={() => { setSelectedImage(url); setSelectedTitle(t.title); }} 
                            className="group/img relative w-24 h-24 rounded-2xl overflow-hidden border border-zinc-800 hover:border-orange-500/50 transition-all"
                          >
                            <img src={url} alt={t.title} className="w-full h-full object-cover opacity-60 group-hover/img:opacity-100 group-hover/img:scale-110 transition-all duration-500" />
                            <div className="absolute inset-0 bg-orange-500/10 opacity-0 group-hover/img:opacity-100 transition-opacity" />
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="xl:w-48 flex flex-col gap-3 shrink-0">
                   <div className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2 px-1">Comandos de Acción</div>
                   <button 
                     onClick={() => review(t.id, 'approve')} 
                     className="h-12 w-full rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/5"
                   >
                     <ThumbsUp className="w-4 h-4" /> Autorizar
                   </button>
                   <button 
                     onClick={() => review(t.id, 'reject')} 
                     className="h-12 w-full rounded-2xl bg-rose-500/10 border border-rose-500/20 text-[9px] font-black uppercase tracking-widest text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-3 shadow-2xl shadow-rose-500/5"
                   >
                     <ThumbsDown className="w-4 h-4" /> Descartar
                   </button>
                   <button 
                     onClick={() => removeTutorial(t.id)} 
                     className="h-12 w-full rounded-2xl bg-zinc-950 border border-zinc-800 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 flex items-center justify-center gap-3 shadow-inner"
                   >
                     <X className="w-4 h-4" /> Eliminar
                   </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Imagen */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-10" onClick={() => setSelectedImage(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative max-w-5xl w-full max-h-full flex flex-col" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute top-[-4rem] right-0 flex items-center gap-6">
               <div className="text-sm font-black text-white uppercase tracking-widest">{selectedTitle}</div>
               <button onClick={() => setSelectedImage(null)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"><X /></button>
            </div>
            <img src={selectedImage} alt={selectedTitle || 'Imagen'} className="w-full h-full object-contain rounded-3xl shadow-2xl" />
          </motion.div>
        </div>
      )}

      {/* Modal HTML UI */}
      {selectedHtmlUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl p-4 sm:p-10" onClick={() => setSelectedHtmlUrl(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} 
            animate={{ opacity: 1, scale: 1 }} 
            className="relative max-w-6xl w-full h-full flex flex-col bg-zinc-950 rounded-[2.5rem] border border-zinc-800 overflow-hidden shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-4 p-8 border-b border-zinc-800 bg-zinc-950">
              <div className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                 <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                 Previsualización de Estructura Dinámica
              </div>
              <button onClick={() => setSelectedHtmlUrl(null)} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all"><X /></button>
            </div>
            <div className="flex-1 bg-white">
              <iframe 
                src={selectedHtmlUrl || undefined} 
                title="HTML Preview" 
                className="w-full h-full border-0" 
                sandbox="allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock"
              />
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
