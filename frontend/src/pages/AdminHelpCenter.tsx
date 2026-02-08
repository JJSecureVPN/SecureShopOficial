import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { ThumbsUp, ThumbsDown, X } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AdminHelpCenter() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'approved' | 'all'>('pending');
  const initialUserId = (() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem('admin_help_user_id') : null;
      if (stored) return stored;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (e) {
      // ignore
    }
    // Allow override from Vite env or fallback to known admin ID for this deploy
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
      else alert(json.error || 'Error');
    } catch (e) {
      console.error(e);
      alert('Error cargando pendientes');
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
        alert(json.error || 'Error');
      }
    } catch (e) {
      console.error(e);
      alert('Error al revisar');
    }
  }

  async function removeTutorial(id: string) {
    try {
      if (!confirm('¿Eliminar este tutorial permanentemente? Esta acción no se puede deshacer.')) return;
      const res = await fetch(`/api/help-center/admin/review/${id}`, {
        method: 'DELETE',
        headers: { 'x-supabase-user-id': userId },
      });
      const json = await res.json();
      if (json.success) {
        setPending((p) => p.filter((t) => t.id !== id));
        alert('Tutorial eliminado');
      } else {
        alert(json.error || 'Error eliminando');
      }
    } catch (e) {
      console.error(e);
      alert('Error eliminando tutorial');
    }
  }

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedTitle, setSelectedTitle] = useState<string | null>(null);
  const [selectedHtmlUrl, setSelectedHtmlUrl] = useState<string | null>(null);

  // Bloquear scroll del body cuando cualquiera de los modales esté abierto
  useEffect(() => {
    const open = !!selectedImage || !!selectedHtmlUrl;
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = 'unset';
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedImage, selectedHtmlUrl]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin — Revisión de Tutoriales</h1>

      <div className="flex items-center gap-3 mb-4">
        <label className="text-sm">Tu Supabase User ID (header `x-supabase-user-id`)</label>
        <input
          value={userId}
          onChange={(e) => { setUserId(e.target.value); try { localStorage.setItem('admin_help_user_id', e.target.value); } catch { /* empty */ } }}
          className="p-2 rounded bg-zinc-800 text-zinc-100 w-96"
        />
        <select value={filter} onChange={(e) => setFilter(e.target.value as any)} className="p-2 rounded bg-zinc-800 text-zinc-100">
          <option value="pending">Pendientes</option>
          <option value="approved">Aprobados</option>
          <option value="all">Todos</option>
        </select>
        <button onClick={loadPending} disabled={!userId || loading} className="px-3 py-2 bg-emerald-600 rounded text-white">Cargar</button>
      </div>

      <div>
        {pending.length === 0 && <p className="text-zinc-400">No hay tutoriales para el filtro seleccionado</p>}
        <div className="space-y-4">
          {pending.map((t) => (
            <div key={t.id} className="bg-zinc-800 p-4 rounded border border-zinc-700">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{t.title}</h3>
                  <p className="text-sm text-zinc-400">Por {t.author_name}{t.author_email ? ` • ${t.author_email}` : ''}{t.author_phone ? ` • ${t.author_phone}` : ''}</p>
                  {t.created_at && <p className="text-xs text-zinc-500">{new Date(t.created_at).toLocaleString()}</p>}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => review(t.id, 'approve')} title="Aprobar" className="flex items-center gap-2 px-3 py-2 bg-emerald-600 rounded text-white">
                    <ThumbsUp className="w-4 h-4" /> OK
                  </button>
                  <button onClick={() => review(t.id, 'reject')} title="Rechazar" className="flex items-center gap-2 px-3 py-2 bg-rose-600 rounded text-white">
                    <ThumbsDown className="w-4 h-4" /> No
                  </button>
                  <button onClick={() => removeTutorial(t.id)} title="Eliminar" className="flex items-center gap-2 px-3 py-2 bg-zinc-700 rounded text-white">
                    Eliminar
                  </button>
                </div>
              </div>

              <div className="mt-3 text-sm text-zinc-200 white-space-pre-wrap">{t.content}</div>

              {t.content_html_url && (
                <div className="mt-3">
                  <Link to={`/ayuda/tutoriales/view/${t.id}`} className="px-2 py-1 bg-zinc-700 rounded text-sm">Previsualizar</Link>
                </div>
              )}

              {t.images && t.images.length > 0 && (
                <div className="mt-3 flex gap-2 flex-wrap">
                  {t.images.map((img: string, idx: number) => {
                    const bucket = (import.meta.env.VITE_SUPABASE_HELP_BUCKET as string) || 'help-center';
                    const url = supabase.storage.from(bucket).getPublicUrl(img).data.publicUrl;
                    return (
                      <button key={idx} onClick={() => { setSelectedImage(url); setSelectedTitle(t.title); }} className="focus:outline-none">
                        <img src={url} alt={t.title} className="w-24 h-16 object-cover rounded border border-zinc-700" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal imagen */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 hide-scrollbar" onClick={() => setSelectedImage(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden rounded-md hide-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 p-3 bg-zinc-900">
              <div className="text-sm font-semibold text-zinc-100">{selectedTitle}</div>
              <button onClick={() => setSelectedImage(null)} className="text-zinc-300 hover:text-white"><X /></button>
            </div>
            <div className="flex-1 overflow-auto bg-zinc-800 p-4 rounded-b-md hide-scrollbar min-h-0 flex items-center justify-center">
              <img src={selectedImage} alt={selectedTitle || 'Imagen'} className="max-w-full max-h-[80vh] object-contain rounded" />
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal HTML preview (sandboxed iframe) */}
      {selectedHtmlUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 hide-scrollbar" onClick={() => setSelectedHtmlUrl(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-4xl w-full h-[80vh] flex flex-col overflow-hidden rounded-md hide-scrollbar" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between gap-4 p-3 bg-zinc-900">
              <div className="text-sm font-semibold text-zinc-100">Previsualización HTML</div>
              <button onClick={() => setSelectedHtmlUrl(null)} className="text-zinc-300 hover:text-white"><X /></button>
            </div>
            <div className="flex-1 overflow-auto bg-zinc-800 p-2 rounded-b-md hide-scrollbar min-h-0">
              <iframe src={selectedHtmlUrl || undefined} title="HTML Preview" className="w-full h-full border-0 min-h-0" sandbox="allow-forms allow-popups allow-modals allow-orientation-lock allow-pointer-lock"></iframe>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
