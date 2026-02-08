import { Router, Request, Response } from 'express';
import { SupabaseService } from '../services/supabase.service';

export function crearRutasHelpCenter(supabaseService: SupabaseService): Router {
  const router = Router();

  const bucketName = process.env.SUPABASE_HELP_BUCKET || 'help-center';
  const MAX_UPLOAD_SIZE = Number(process.env.HELP_CENTER_MAX_UPLOAD_BYTES || String(5 * 1024 * 1024)); // 5MB por defecto
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

  // Obtener tutoriales aprobados (público)
  router.get('/tutorials', async (_req: Request, res: Response) => {
    try {
      const client = supabaseService.getClient();
      if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado' });

      const { data, error } = await client
        .from('help_tutorials')
        .select('*')
        .eq('status', 'approved')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('[HelpCenter] Error listando tutoriales:', error);
        return res.status(500).json({ success: false, error: error.message || error });
      }

      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('[HelpCenter] Error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error' });
    }
  });

  // Enviar un tutorial (draft -> pending)
  router.post('/tutorials', async (req: Request, res: Response) => {
    try {
      const {
        title,
        author_name,
        author_email,
        author_phone,
        content,
        links,
        images,
        created_by
      } = req.body;

      // Evitar error TS6133 (variables declaradas pero no usadas) en compilación.
      // Se usan como 'void' para indicar que su no-uso es intencional.
      void content;
      void links;
      void images;

      if (!author_name) {
        return res.status(400).json({ success: false, error: 'Nombre obligatorio' });
      }

      const client = supabaseService.getClient();
      if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado' });

      let finalTitle = title;
      if (!finalTitle) {
        // Try to infer title from uploaded HTML filename
        const htmlUrl = (req.body.content_html_url as string) || '';
        if (htmlUrl) {
          try {
            const dec = decodeURIComponent(htmlUrl);
            const parts = dec.split('/');
            const filename = parts[parts.length - 1] || '';
            finalTitle = filename.replace(/\.[^/.]+$/, '').replace(/[-_]+/g, ' ') || `Tutorial de ${author_name}`;
          } catch (e) {
            finalTitle = `Tutorial de ${author_name}`;
          }
        } else {
          finalTitle = `Tutorial de ${author_name}`;
        }
      }

      const insertPayload: any = {
        title: finalTitle,
        author_name,
        author_email: author_email || null,
        author_phone: author_phone || null,
        content: null,
        content_html_url: (req.body.content_html_url as string) || null,
        links: null,
        images: null,
        created_by: created_by || null
      };

      const { data, error } = await client
        .from('help_tutorials')
        .insert(insertPayload)
        .select('*')
        .single();

      if (error) {
        console.error('[HelpCenter] Error guardando tutorial:', error);
        return res.status(500).json({ success: false, error: error.message || error });
      }

      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      console.error('[HelpCenter] Error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error' });
    }
  });

  // Subir imagen (espera JSON con filename y content_base64)
  router.post('/upload-image', async (req: Request, res: Response) => {
    try {
      const { filename, content_base64 } = req.body;
      if (!filename || !content_base64) {
        return res.status(400).json({ success: false, error: 'filename y content_base64 son requeridos' });
      }

      const client = supabaseService.getClient();
      if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado' });

      const buffer = Buffer.from(content_base64, 'base64');

      // Validación básica: tamaño
      if (buffer.length > MAX_UPLOAD_SIZE) {
        return res.status(413).json({ success: false, error: `Archivo demasiado grande. Máx ${MAX_UPLOAD_SIZE} bytes` });
      }

      // Determinar content type (preferir enviado por cliente)
      let contentType = (req.body.content_type || '').toString();
      if (!contentType) {
        const lower = filename.toLowerCase();
        if (lower.endsWith('.png')) contentType = 'image/png';
        else if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (lower.endsWith('.webp')) contentType = 'image/webp';
        else if (lower.endsWith('.gif')) contentType = 'image/gif';
        else contentType = 'application/octet-stream';
      }

      if (!ALLOWED_TYPES.includes(contentType)) {
        return res.status(400).json({ success: false, error: 'Tipo de archivo no permitido' });
      }

      const key = `tutorials/${Date.now()}_${Math.random().toString(36).slice(2)}_${filename}`;

      const { error: uploadError } = await client.storage
        .from(bucketName)
        .upload(key, buffer, { contentType, upsert: false });

      if (uploadError) {
        console.error('[HelpCenter] Error subiendo imagen:', uploadError);
        return res.status(500).json({ success: false, error: uploadError.message || uploadError });
      }

      const publicUrl = client.storage.from(bucketName).getPublicUrl(key).data.publicUrl;

      // Insertar referencia en tutorial_images (opcional)
      try {
        await client.from('tutorial_images').insert({ storage_path: key, filename, size_bytes: buffer.length });
      } catch (e) {
        console.warn('[HelpCenter] No se pudo guardar referencia en tutorial_images:', e);
      }

      return res.status(201).json({ success: true, url: publicUrl, path: key });
    } catch (error: any) {
      console.error('[HelpCenter] Error subiendo imagen:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error' });
    }
  });

  // Subir archivo HTML (espera JSON con filename y content_base64)
  router.post('/upload-html', async (req: Request, res: Response) => {
    try {
      const { filename, content_base64 } = req.body;
      if (!filename || !content_base64) {
        return res.status(400).json({ success: false, error: 'filename y content_base64 son requeridos' });
      }

      const client = supabaseService.getClient();
      if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado' });

      const buffer = Buffer.from(content_base64, 'base64');

      // Basic validation: size and extension
      if (buffer.length > 2 * 1024 * 1024) { // limit HTML to 2MB
        return res.status(413).json({ success: false, error: `Archivo demasiado grande. Máx 2MB` });
      }

      const lower = filename.toLowerCase();
      if (!lower.endsWith('.html') && !lower.endsWith('.htm')) {
        return res.status(400).json({ success: false, error: 'Sólo se permiten archivos .html' });
      }

      // Quick content check: ensure it looks like a full HTML document
      try {
        const txt = buffer.toString('utf8').toLowerCase();
        if (!txt.includes('<html') && !txt.includes('<!doctype') && !txt.includes('<head') && !txt.includes('<body')) {
          return res.status(400).json({ success: false, error: 'El archivo no parece un documento HTML completo. Asegúrate de incluir <html> y <body>.' });
        }
      } catch (e) {
        // If decoding fails, reject
        return res.status(400).json({ success: false, error: 'No se pudo procesar el archivo HTML' });
      }

      const key = `tutorials/html/${Date.now()}_${Math.random().toString(36).slice(2)}_${filename}`;

      const { error: uploadError } = await client.storage
        .from(bucketName)
        .upload(key, buffer, { contentType: 'text/html', upsert: false });

      if (uploadError) {
        console.error('[HelpCenter] Error subiendo HTML:', uploadError);
        return res.status(500).json({ success: false, error: uploadError.message || uploadError });
      }

      const publicUrl = client.storage.from(bucketName).getPublicUrl(key).data.publicUrl;

      return res.status(201).json({ success: true, url: publicUrl, path: key });
    } catch (error: any) {
      console.error('[HelpCenter] Error subiendo HTML:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error' });
    }
  });

  // Servir HTML (proxy) para evitar problemas de content-type del CDN
  router.get('/html/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const client = supabaseService.getClient();
      if (!client) return res.status(500).send('Supabase no configurado');

      const { data: tutorial, error: fetchError } = await client.from('help_tutorials').select('content_html_url').eq('id', id).single();
      if (fetchError) return res.status(404).send('No encontrado');
      if (!tutorial || !tutorial.content_html_url) return res.status(404).send('No HTML disponible');

      // Extraer path del URL público: /object/public/{bucket}/{path}
      const url: string = tutorial.content_html_url as string;
      const marker = `/object/public/${bucketName}/`;
      let storagePath = null as string | null;
      const idx = url.indexOf(marker);
      if (idx >= 0) storagePath = decodeURIComponent(url.substring(idx + marker.length));
      if (!storagePath) return res.status(400).send('Path inválido');

      const { data, error: dlError } = await client.storage.from(bucketName).download(storagePath);
      if (dlError) {
        console.error('[HelpCenter] Error descargando HTML:', dlError);
        return res.status(500).send('Error descargando HTML');
      }

      // data es un ReadableStream/Blob; convertir a buffer
      const arrayBuffer = await (data as any).arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      res.setHeader('Content-Type', 'text/html; charset=utf-8');
      res.setHeader('X-Content-Type-Options', 'nosniff');
      return res.send(buffer);
    } catch (err: any) {
      console.error('[HelpCenter] Proxy HTML error:', err);
      return res.status(500).send('Error');
    }
  });

  // ----- Endpoints de admin (requieren que el user sea admin en chat_admins) -----

  // Listar tutoriales pendientes (admin)
  router.get('/admin/review', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-supabase-user-id'] || '') as string;
      if (!userId) return res.status(401).json({ success: false, error: 'Header x-supabase-user-id requerido' });
      const allowed = await supabaseService.isChatAdmin(userId);
      if (!allowed) return res.status(403).json({ success: false, error: 'No autorizado' });

      const client = supabaseService.getClient();
      if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado' });

      // Allow filtering by status via query param: pending (default), approved, rejected, all
      const statusQuery = ((req.query.status as string) || 'pending').toLowerCase();
      let query: any = client.from('help_tutorials').select('*').order('created_at', { ascending: true });

      if (statusQuery === 'pending') {
        query = query.in('status', ['pending']);
      } else if (statusQuery === 'approved') {
        query = query.eq('status', 'approved');
      } else if (statusQuery === 'rejected') {
        query = query.eq('status', 'rejected');
      } else if (statusQuery === 'all') {
        // no filter
      } else {
        // unknown filter -> default to pending
        query = query.in('status', ['pending']);
      }

      const { data, error } = await query;

      if (error) return res.status(500).json({ success: false, error: error.message || error });
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('[HelpCenter] Admin review error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error' });
    }
  });

  // ADMIN: listar archivos en storage (temporal) para ayudar a localizar HTML subido
  router.get('/admin/storage-files', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-supabase-user-id'] || '') as string;
      if (!userId) return res.status(401).json({ success: false, error: 'Header x-supabase-user-id requerido' });
      const allowed = await supabaseService.isChatAdmin(userId);
      if (!allowed) return res.status(403).json({ success: false, error: 'No autorizado' });

      const prefix = (req.query.prefix as string) || 'tutorials/html';
      const client = supabaseService.getClient();
      if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado' });

      // list files under prefix
      const { data, error } = await client.storage.from(bucketName).list(prefix, { limit: 100, offset: 0, sortBy: { column: 'name', order: 'desc' } as any });
      if (error) return res.status(500).json({ success: false, error: error.message || error });

      // Build public URLs
      const files = (data || []).map((f: any) => {
        const path = `${prefix}/${f.name}`;
        const publicUrl = client.storage.from(bucketName).getPublicUrl(path).data.publicUrl;
        return { name: f.name, path, size: f.size, updated_at: f.updated_at, publicUrl };
      });

      return res.json({ success: true, data: files });
    } catch (err: any) {
      console.error('[HelpCenter] storage-files error:', err);
      return res.status(500).json({ success: false, error: err.message || 'Error' });
    }
  });

  // Aprobar o rechazar tutorial (admin)
  router.post('/admin/review/:id', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-supabase-user-id'] || '') as string;
      if (!userId) return res.status(401).json({ success: false, error: 'Header x-supabase-user-id requerido' });
      const allowed = await supabaseService.isChatAdmin(userId);
      if (!allowed) return res.status(403).json({ success: false, error: 'No autorizado' });

      const { id } = req.params;
      const { action, admin_notes } = req.body; // action: approve | reject
      if (!['approve', 'reject'].includes(action)) return res.status(400).json({ success: false, error: 'action inválida' });

      const client = supabaseService.getClient();
      if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado' });

      const status = action === 'approve' ? 'approved' : 'rejected';

      const updatePayload: any = {
        status,
        reviewed_by: userId,
        reviewed_at: new Date().toISOString(),
        admin_notes: admin_notes || null,
      };

      // Allow admin to attach/update the stored HTML URL when reviewing
      if (req.body && req.body.content_html_url) {
        updatePayload.content_html_url = req.body.content_html_url;
      }

      const { data, error } = await client
        .from('help_tutorials')
        .update(updatePayload)
        .eq('id', id)
        .select('*')
        .single();

      if (error) return res.status(500).json({ success: false, error: error.message || error });

      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('[HelpCenter] Admin review error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error' });
    }
  });

  // Eliminar tutorial (admin) - borra el registro y opcionalmente los archivos en storage
  router.delete('/admin/review/:id', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-supabase-user-id'] || '') as string;
      if (!userId) return res.status(401).json({ success: false, error: 'Header x-supabase-user-id requerido' });
      const allowed = await supabaseService.isChatAdmin(userId);
      if (!allowed) return res.status(403).json({ success: false, error: 'No autorizado' });

      const { id } = req.params;
      const client = supabaseService.getClient();
      if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado' });

      // Obtener tutorial para eliminar recursos relacionados
      const { data: tutorial, error: fetchError } = await client.from('help_tutorials').select('*').eq('id', id).single();
      if (fetchError) return res.status(500).json({ success: false, error: fetchError.message || fetchError });

      // Intentar eliminar imágenes en storage si vienen como paths
      try {
        if (tutorial && Array.isArray(tutorial.images) && tutorial.images.length > 0) {
          await client.storage.from(bucketName).remove(tutorial.images as string[]);
        }
      } catch (e) {
        console.warn('[HelpCenter] Error eliminando archivos en storage:', e);
      }

      const { error: delError } = await client.from('help_tutorials').delete().eq('id', id);
      if (delError) return res.status(500).json({ success: false, error: delError.message || delError });

      return res.json({ success: true });
    } catch (error: any) {
      console.error('[HelpCenter] Admin delete error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error' });
    }
  });

  // Listar solicitudes de contacto (admin)
  router.get('/admin/contact-requests', async (req: Request, res: Response) => {
    try {
      const userId = (req.headers['x-supabase-user-id'] || '') as string;
      if (!userId) return res.status(401).json({ success: false, error: 'Header x-supabase-user-id requerido' });
      const allowed = await supabaseService.isChatAdmin(userId);
      if (!allowed) return res.status(403).json({ success: false, error: 'No autorizado' });

      const client = supabaseService.getClient();
      if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado' });

      const { data, error } = await client.from('contact_requests').select('*').order('created_at', { ascending: false });
      if (error) return res.status(500).json({ success: false, error: error.message || error });
      return res.json({ success: true, data });
    } catch (error: any) {
      console.error('[HelpCenter] Admin contact list error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error' });
    }
  });

  // Crear solicitud de contacto (público)
  router.post('/contact', async (req: Request, res: Response) => {
    try {
      const { name, email, phone, message, allow_contact } = req.body;
      if (!name) return res.status(400).json({ success: false, error: 'Nombre requerido' });

      const client = supabaseService.getClient();
      if (!client) return res.status(500).json({ success: false, error: 'Supabase no configurado' });

      const { data, error } = await client
        .from('contact_requests')
        .insert({ name, email: email || null, phone: phone || null, message: message || null, allow_contact: allow_contact ?? true })
        .select('*')
        .single();

      if (error) return res.status(500).json({ success: false, error: error.message || error });
      return res.status(201).json({ success: true, data });
    } catch (error: any) {
      console.error('[HelpCenter] Contact create error:', error);
      return res.status(500).json({ success: false, error: error.message || 'Error' });
    }
  });

  return router;
}

export default crearRutasHelpCenter;
