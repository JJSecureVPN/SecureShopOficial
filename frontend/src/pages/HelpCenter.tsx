import { useState, useEffect } from 'react';
import HtmlPreviewModal from '../components/HtmlPreviewModal';

const MAX_HTML_BYTES = 2 * 1024 * 1024; // 2MB

export default function HelpCenter() {
  const [title, setTitle] = useState(''); // optional title
  const [authorName, setAuthorName] = useState(''); // required
  const [authorEmail, setAuthorEmail] = useState(''); // optional
  const [authorPhone, setAuthorPhone] = useState(''); // optional

  const [htmlFile, setHtmlFile] = useState<File | null>(null);
  const [htmlUploading, setHtmlUploading] = useState(false);
  const [htmlError, setHtmlError] = useState<string | null>(null);
  const [htmlUrl, setHtmlUrl] = useState<string | null>(null);
  const [htmlPreviewUrl, setHtmlPreviewUrl] = useState<string | null>(null);
  const [showHtmlPreview, setShowHtmlPreview] = useState(false);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (htmlPreviewUrl) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        try { URL.revokeObjectURL(htmlPreviewUrl); } catch (e) { /* ignore */ }
      }
    };
  }, [htmlPreviewUrl]);

  function onHtmlInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const lower = f.name.toLowerCase();
    if (!lower.endsWith('.html') && !lower.endsWith('.htm')) {
      setHtmlError('Sólo se permiten archivos .html');
      e.currentTarget.value = '';
      return;
    }
    if (f.size > MAX_HTML_BYTES) {
      setHtmlError('Archivo HTML mayor a 2MB');
      e.currentTarget.value = '';
      return;
    }

    setHtmlError(null);
    setHtmlFile(f);
    setHtmlUrl(null);

    (async () => {
      try {
        setHtmlUploading(true);
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

    if (!authorName.trim()) {
      setMessage('El nombre es obligatorio');
      return;
    }

    if (!htmlFile && !htmlUrl) {
      setMessage('Debes subir un archivo HTML para el tutorial');
      return;
    }

    setLoading(true);

    try {
      // If there is a selected file and not yet uploaded, ensure it's uploaded
      if (htmlFile && !htmlUrl) {
        setHtmlUploading(true);
        const r = await uploadHtmlToServer(htmlFile);
        setHtmlUploading(false);
        if (r.error) {
          setHtmlError(r.error);
          setLoading(false);
          return;
        }
        setHtmlUrl(r.url || null);
      }

      const payload = {
        title: title.trim() || null,
        author_name: authorName.trim(),
        author_email: authorEmail.trim() || null,
        author_phone: authorPhone.trim() || null,
        content_html_url: htmlUrl || null,
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

      <div className="mb-6 p-4 bg-zinc-800 rounded-md border border-zinc-700">
        <div className="flex items-start gap-3">
          <div className="text-2xl">📄</div>
          <div>
            <div className="text-sm text-zinc-300 font-semibold">Minitutorial (1 minuto)</div>
            <ul className="mt-2 text-sm text-zinc-400 list-disc list-inside space-y-1">
              <li>Crea un archivo <code>.html</code> completo (con &lt;html&gt;, &lt;head&gt; y &lt;body&gt;).</li>
              <li>Incluye estilos y scripts inline o usa URLs públicas para recursos (no se suben assets aparte).</li>
              <li>Sube el archivo aquí y revisaremos antes de publicarlo.</li>
              <li>Si no pones título, se usará el nombre del archivo o "Tutorial de &lt;tu nombre&gt;".</li>
            </ul>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Título (opcional)</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700" placeholder="Puedes dejar vacío para usar el nombre del archivo" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tu nombre <span className="text-rose-400">*</span></label>
          <input value={authorName} onChange={(e) => setAuthorName(e.target.value)} className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700" placeholder="Nombre o alias (obligatorio)" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email (opcional)</label>
            <input value={authorEmail} onChange={(e) => setAuthorEmail(e.target.value)} className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700" placeholder="tu@correo.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Teléfono (opcional)</label>
            <input value={authorPhone} onChange={(e) => setAuthorPhone(e.target.value)} className="w-full p-3 rounded-md bg-zinc-800 border border-zinc-700" placeholder="+54 9 11 ..." />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Archivo HTML <span className="text-rose-400">*</span></label>
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
          <button type="button" onClick={() => { setTitle(''); setAuthorName(''); setAuthorEmail(''); setAuthorPhone(''); setHtmlFile(null); setHtmlUrl(null); }} className="px-3 py-2 bg-zinc-700 rounded-md">Limpiar</button>
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
