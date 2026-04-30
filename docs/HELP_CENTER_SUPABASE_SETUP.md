# Centro de Ayuda / Tutoriales — Setup en Supabase

Resumen rápido: crear tablas (usar la migración `supabase/migrations/018_help_center_tutorials.sql`), crear un bucket de storage para imágenes (`help-center`), configurar RLS/policies y variables de entorno en backend/frontend.

Pasos (ordenados):

1) Ejecutar la migración
- Si usas Supabase CLI en local con el proyecto conectado: `supabase db remote commit` o `supabase db push` según flujo.
- Alternativa: ejecutar el SQL del archivo `supabase/migrations/018_help_center_tutorials.sql` en la DB (psql o en SQL Editor de Supabase).

2) Crear bucket de Storage
- Nombre recomendado: `help-center` (o ajustar `SUPABASE_HELP_BUCKET`).
- Permisos: público (si quieres que las imágenes sean públicas). Para mayor seguridad, usa URLs firmadas y mantén el bucket privado.

3) Asegurar tabla `chat_admins`
- Las políticas de admin en la migración usan `chat_admins(user_id)`. Si no existe, crear una tabla simple:

```
CREATE TABLE IF NOT EXISTS public.chat_admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);
```

4) Revisar y ajustar RLS/policies
- La migración crea políticas mínimas: lectura pública sólo de `status='approved'` y control admin para reviews.
- En producción confirma que `auth` está funcionando (usuarios de Supabase) y ajusta `auth.role()` si es necesario.

5) Variables de entorno en backend
- En tu servidor de Node (archivo `.env` o sistema de configuración), agregar:
  - `SUPABASE_URL` -> URL del proyecto Supabase
  - `SUPABASE_SERVICE_KEY` -> Service Role Key (SECRETO) para el backend
  - `SUPABASE_HELP_BUCKET` -> (opcional) nombre del bucket (por defecto `help-center`)

6) Frontend
- Añadir las nuevas páginas `frontend/src/pages/HelpCenter.tsx` y `frontend/src/pages/AdminHelpCenter.tsx` a tu enrutador (por ejemplo en `App.tsx` o donde manejes rutas).
- Para permitir uploads directos desde frontend (opcional): configura una política de Storage o usa signed uploads. El ejemplo implementa upload vía backend (POST `/api/help-center/upload-image`).

7) Seguridad y producción (checklist)
- Validar tipo y tamaño de archivos en backend (ej. 5MB por imagen).
- Considerar usar uploads firmados (client-side) para reducir carga en el backend.
- Hacer escaneo de virus/malware antes de publicar si es crítico.
- Agregar moderación adicional: notificaciones a admin, historial de revisiones, ediciones por autores.
- Limitar rate (rate limit) para endpoints de upload y creación.
- Si las imágenes se exponen públicamente, configurar CDN y CORS.

8) Notificaciones y workflow
- Opcional: añadir webhook o función que notifique a admins (email / Slack) cuando llegue un tutorial pendiente.
- En `AdminTools` (panel de administración ya existente), añadir link para revisar/aprobar tutoriales usando endpoint `/api/help-center/admin/review`.

Comandos útiles
- Ejecutar migración con psql (si tienes PG URL):

```
psql "postgres://USER:PASS@HOST:PORT/dbname" -f supabase/migrations/018_help_center_tutorials.sql
```

- Usar Supabase SQL editor: copiar/pegar el contenido de la migración y ejecutar.

Notas finales
- El backend actual contiene `SupabaseService` y las nuevas rutas usan ese servicio; asegúrate de reiniciar el backend con las variables de entorno y la `SUPABASE_SERVICE_KEY`.
- Para pruebas locale: puedes usar la `SUPABASE_SERVICE_KEY` desde el panel (service_role) temporalmente, pero NO la publiques en el frontend.
