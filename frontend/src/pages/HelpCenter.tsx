import { useState, useRef, useEffect } from 'react';
import HtmlPreviewModal from '../components/HtmlPreviewModal';

type UploadFile = {
  file: File;
  preview: string;
  uploading: boolean;
  error?: string | null;
};

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export default function HelpCenter() {
  const [title, setTitle] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorEmail, setAuthorEmail] = useState('');
  const [authorPhone, setAuthorPhone] = useState('');
  const [content, setContent] = useState('');
  const [links, setLinks] = useState<string[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [htmlUploading, setHtmlUploading] = useState(false);
  const [htmlError, setHtmlError] = useState<string | null>(null);
  const [htmlUrl, setHtmlUrl] = useState<string | null>(null);
  const [htmlPreviewUrl, setHtmlPreviewUrl] = useState<string | null>(null);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);
  // iframeLoading removed — modal handles iframe loading state
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const dropRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = dropRef.current;
    if (!el) return;

    const onDragOver = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.add('drag-over');
    };

    const onDragLeave = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove('drag-over');
    };

    const onDrop = (e: DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.remove('drag-over');
      const dt = e.dataTransfer;
      if (!dt) return;
      const dropped = Array.from(dt.files || []);
      handleNewFiles(dropped as File[]);
    };

    el.addEventListener('dragover', onDragOver as any);
    el.addEventListener('dragleave', onDragLeave as any);
    el.addEventListener('drop', onDrop as any);

    return () => {
      el.removeEventListener('dragover', onDragOver as any);
      el.removeEventListener('dragleave', onDragLeave as any);
      el.removeEventListener('drop', onDrop as any);
    };
  }, []);



  useEffect(() => {
    return () => {
      if (htmlPreviewUrl) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        try { URL.revokeObjectURL(htmlPreviewUrl); } catch (e) { /* ignore */ }
      }
    };
  }, [htmlPreviewUrl]);

  function handleNewFiles(newFiles: File[]) {
    const next: UploadFile[] = [];
    for (const f of newFiles) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        next.push({ file: f, preview: '', uploading: false, error: 'Tipo no permitido' });
        continue;
      }
      if (f.size > MAX_FILE_SIZE) {
        next.push({ file: f, preview: '', uploading: false, error: 'Archivo mayor a 5MB' });
        continue;
      }
      const preview = URL.createObjectURL(f);
      next.push({ file: f, preview, uploading: false, error: null });
    }
    setFiles((s) => [...s, ...next]);
  }

  function onFileInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const list = Array.from(e.target.files || []);
    handleNewFiles(list);
    e.currentTarget.value = '';
  }

  function onHtmlInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const lower = f.name.toLowerCase();
    if (!lower.endsWith('.html') && !lower.endsWith('.htm')) {
      setHtmlError('Sólo se permiten archivos .html');
      e.currentTarget.value = '';
      return;
    }
    if (f.size > 2 * 1024 * 1024) {
      setHtmlError('Archivo HTML mayor a 2MB');
      e.currentTarget.value = '';
      return;
    }
    setHtmlError(null);
    setHtmlFile(f);
    setHtmlUrl(null);
    // Start immediate upload and create local preview
    (async () => {
      try {
        setHtmlUploading(true);
        // create preview blob url
        const blobUrl = URL.createObjectURL(f);
        setHtmlPreviewUrl(blobUrl);

        const r = await uploadHtmlToServer(f);
        if (r.error) {
          setHtmlError(r.error);
          setHtmlUrl(null);
        } else {
          setHtmlUrl(r.url || null);
        }
      } catch (err: any) {
        setHtmlError(err?.message || String(err));
        setHtmlUrl(null);
      } finally {
        setHtmlUploading(false);
      }
    })();
    e.currentTarget.value = '';
  }

  function removeFile(index: number) {
    setFiles((s) => {
      const copy = [...s];
      const f = copy.splice(index, 1)[0];
      if (f && f.preview) URL.revokeObjectURL(f.preview);
      return copy;
    });
  }

  function addLink() {
    const url = linkInput.trim();
    if (!url) return;
    setLinks((s) => [...s, url]);
    setLinkInput('');
  }

  function removeLink(i: number) {
    setLinks((s) => s.filter((_, idx) => idx !== i));
  }

  async function uploadFileToServer(f: UploadFile): Promise<{ path?: string; error?: string }> {
    try {
      const reader = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string).split(',')[1]);
        r.onerror = () => reject('read error');
        r.readAsDataURL(f.file);
      });

      const res = await fetch('/api/help-center/upload-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: f.file.name, content_base64: reader, content_type: f.file.type }),
      });
      const json = await res.json();
      if (!json.success) return { error: json.error || 'upload failed' };
      return { path: json.path };
    } catch (err: any) {
      return { error: err?.message || String(err) };
    }
  }

  async function uploadHtmlToServer(f: File): Promise<{ path?: string; url?: string; error?: string }> {
    try {
      const reader = await new Promise<string>((resolve, reject) => {
        const r = new FileReader();
        r.onload = () => resolve((r.result as string).split(',')[1]);
        r.onerror = () => reject('read error');
        r.readAsDataURL(f);
      });

      const res = await fetch('/api/help-center/upload-html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: f.name, content_base64: reader }),
      });
      const json = await res.json();
      if (!json.success) return { error: json.error || 'upload failed' };
      return { path: json.path, url: json.url };
    } catch (err: any) {
      return { error: err?.message || String(err) };
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!title.trim() || !authorName.trim()) {
      setMessage('Título y nombre son obligatorios');
      return;
    }

    setLoading(true);

    try {
      // If user provided an HTML file, upload it first
      if (htmlFile) {
        setHtmlUploading(true);
        const r = await uploadHtmlToServer(htmlFile);
        setHtmlUploading(false);
        if (r.error) {
          setHtmlError(r.error);
        } else {
          setHtmlUrl(r.url || null);
        }
      }

      // Upload files sequentially and collect paths
      const uploadedPaths: string[] = [];
      for (let i = 0; i < files.length; i++) {
        setFiles((s) => s.map((it, idx) => idx === i ? { ...it, uploading: true } : it));
        const result = await uploadFileToServer(files[i]);
        if (result.error) {
          setFiles((s) => s.map((it, idx) => idx === i ? { ...it, uploading: false, error: result.error } : it));
          console.warn('Upload error', result.error);
          continue; // no abort, allow partial
        }
        uploadedPaths.push(result.path!);
        setFiles((s) => s.map((it, idx) => idx === i ? { ...it, uploading: false, error: null } : it));
      }

      const payload = {
        title: title.trim(),
        author_name: authorName.trim(),
        author_email: authorEmail.trim() || null,
        author_phone: authorPhone.trim() || null,
        content: content || null,
        content_html_url: htmlUrl || null,
        links: links.length ? links : null,
        images: uploadedPaths.length ? uploadedPaths : null,
      };

      const res = await fetch('/api/help-center/tutorials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Error al enviar');

      setMessage('Tutorial enviado para revisión. Gracias.');
      setTitle('');
      setAuthorName('');
      setAuthorEmail('');
      setAuthorPhone('');
      setContent('');
      setLinks([]);
      setFiles([]);
      setHtmlFile(null);
      setHtmlUrl(null);
      setHtmlError(null);
    } catch (err: any) {
      console.error(err);
      setMessage(err?.message || 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Crear Tutorial</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título <span className="text-rose-400">*</span></label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700" placeholder="Título descriptivo" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tu nombre <span className="text-rose-400">*</span></label>
            <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700" placeholder="Nombre o alias" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email (opcional)</label>
            <input value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)} className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700" placeholder="tu@correo.com" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Teléfono (opcional)</label>
          <input value={authorPhone} onChange={(e) => setAuthorPhone(e.target.value)} className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700" placeholder="+54 9 11 ..." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Contenido</label>
          <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={8} className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700" placeholder="Explica paso a paso... Puedes añadir enlaces y subir imágenes." />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Enlaces (opcional)</label>
          <div className="flex gap-2">
            <input value={linkInput} onChange={(e) => setLinkInput(e.target.value)} className="flex-1 p-2 rounded-md bg-zinc-800 border border-zinc-700" placeholder="https://..." />
            <button type="button" onClick={addLink} className="px-3 py-2 bg-emerald-600 rounded-md">Añadir</button>
          </div>
          <div className="mt-2 flex gap-2 flex-wrap">
            {links.map((l, i) => (
              <span key={i} className="inline-flex items-center gap-2 bg-zinc-800 border border-zinc-700 px-3 py-1 rounded-md text-sm">
                <a href={l} target="_blank" rel="noreferrer" className="text-emerald-400">{l}</a>
                <button type="button" onClick={() => removeLink(i)} className="text-zinc-400 hover:text-rose-400">✕</button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Imágenes (arrastrar o seleccionar)</label>
          <div ref={dropRef} className="border-2 border-dashed border-zinc-700 rounded-md p-4 text-center bg-zinc-900">
            <p className="text-sm text-zinc-400">Suelta imágenes aquí o usa el botón de seleccionar. Máx 5MB por imagen. Tipos: jpg, png, webp, gif.</p>
            <div className="mt-2">
              <input type="file" accept="image/*" multiple onChange={onFileInputChange} />
            </div>
          </div>

          {files.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2">
              {files.map((f, idx) => (
                <div key={idx} className="relative bg-zinc-800 rounded-md overflow-hidden">
                  {f.preview ? <img src={f.preview} alt={f.file.name} className="w-full h-28 object-cover" /> : <div className="w-full h-28 flex items-center justify-center text-sm text-zinc-500">{f.file.name}</div>}
                  <button type="button" onClick={() => removeFile(idx)} className="absolute top-1 right-1 bg-black/40 text-white rounded-full px-2">✕</button>
                  {f.uploading && <div className="absolute bottom-0 left-0 right-0 h-1 bg-emerald-500 animate-pulse" />}
                  {f.error && <div className="p-1 text-xs text-rose-400">{f.error}</div>}
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Archivo HTML (opcional)</label>
          <div className="p-2 bg-zinc-900 rounded-md border border-zinc-700">
            <input type="file" accept=".html,.htm" onChange={onHtmlInputChange} />
            {htmlFile && <div className="mt-2 text-sm">Seleccionado: {htmlFile.name} ({Math.round(htmlFile.size/1024)} KB)</div>}
            {htmlUploading && <div className="text-sm text-emerald-400">Subiendo HTML...</div>}
            {htmlError && <div className="text-sm text-rose-400">{htmlError}</div>}
            {htmlUrl && (
              <div className="text-sm text-emerald-400">HTML subido
                <button type="button" onClick={() => setShowHtmlPreview(true)} className="ml-3 px-2 py-1 bg-zinc-700 rounded text-sm">Previsualizar</button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button type="submit" disabled={loading} className="px-4 py-2 bg-emerald-600 rounded-md">{loading ? 'Enviando...' : 'Enviar para revisión'}</button>
          <button type="button" onClick={() => { setTitle(''); setAuthorName(''); setAuthorEmail(''); setAuthorPhone(''); setContent(''); setLinks([]); setFiles([]); }} className="px-3 py-2 bg-zinc-700 rounded-md">Limpiar</button>
        </div>

        {message && <div className="mt-2 text-sm text-zinc-200">{message}</div>}
      </form>

      <HtmlPreviewModal
        open={showHtmlPreview}
        title={`Previsualización: ${htmlFile?.name || 'HTML'}`}
        htmlPreviewUrl={htmlPreviewUrl || htmlUrl}
        loading={htmlUploading}
        onClose={() => {
          setShowHtmlPreview(false);
          // revoke local preview if any
          if (htmlPreviewUrl) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            try { URL.revokeObjectURL(htmlPreviewUrl); } catch (e) { /* ignore */ }
            setHtmlPreviewUrl(null);
          }
        }}
      />
    </div>
  );
}
