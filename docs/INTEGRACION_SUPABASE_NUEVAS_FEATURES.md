# Integración Supabase (Nuevas Features)

Este documento explica cómo consumir las nuevas tablas Supabase creadas en las migraciones 011–013.

## Prerrequisitos
- Ejecutar migraciones en orden (ver `supabase/README.md`).
- Frontend: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` configuradas.
- Admin: se reutiliza el rol existente del chat.

## Admin (reusar chat_admins)
Las políticas de Tickets/Status/Help Center usan `public.is_chat_admin(auth.uid())`.

Para dar permisos admin a un usuario:
```sql
INSERT INTO public.chat_admins (user_id)
SELECT id FROM public.profiles WHERE email = 'admin@tudominio.com'
ON CONFLICT (user_id) DO NOTHING;
```

## Centro de Ayuda / FAQ (público)
Tablas:
- `help_categories` (lectura pública si `activo = true`)
- `help_articles` (lectura pública si `estado = 'publicado'` y `visible_para = 'todos'`)

Ejemplos (frontend):
- Categorías:
  - `supabase.from('help_categories').select('*').order('orden')`
- Artículos públicos:
  - `supabase.from('help_articles').select('*').eq('estado','publicado').eq('visible_para','todos')`

Para artículos visibles solo a clientes (requiere sesión):
- `visible_para IN ('todos','clientes')` (ya hay policy `help_articles_select_clientes`).

## Status Page (público)
Tablas:
- `status_components` (lectura pública si `is_active = true`)
- `status_incidents` (lectura pública si `is_public = true`)
- `status_incident_updates` (lectura pública si update e incidente son públicos)

Ejemplos (frontend):
- Últimos incidentes:
  - `supabase.from('status_incidents').select('*').eq('is_public', true).order('started_at', { ascending: false })`
- Updates de un incidente:
  - `supabase.from('status_incident_updates').select('*').eq('incident_id', incidentId).order('created_at', { ascending: true })`

## Tickets de Soporte (requiere login)
Tablas:
- `support_tickets`
- `support_ticket_messages`

RLS:
- El usuario ve solo sus tickets.
- Mensajes `is_internal=true` solo son visibles para admin.
- El usuario puede insertar mensajes en su ticket (siempre `is_internal=false`).

Ejemplos (frontend):
- Crear ticket:
  - `supabase.from('support_tickets').insert({ user_id: session.user.id, asunto, descripcion })`
- Listar tickets:
  - `supabase.from('support_tickets').select('*').order('last_message_at', { ascending: false })`
- Mensajes de un ticket:
  - `supabase.from('support_ticket_messages').select('*').eq('ticket_id', ticketId).order('created_at', { ascending: true })`
- Enviar mensaje:
  - `supabase.from('support_ticket_messages').insert({ ticket_id: ticketId, user_id: session.user.id, content, is_internal: false })`

## Notificaciones por email (Tickets)
Si querés que te llegue un email cuando un usuario crea un ticket, se agregó un webhook en el backend:

- Endpoint: `POST https://shop.jhservices.com.ar/api/support/webhook`
- Eventos recomendados:
  - `INSERT` en `public.support_tickets`
  - `INSERT` en `public.support_ticket_messages`

### Variables de entorno (backend)
- `SUPABASE_WEBHOOK_SECRET`: secreto compartido para validar el webhook.
- `SUPPORT_NOTIFY_EMAIL` (opcional): email destino.
  - Si no está seteado, cae a `ADMIN_EMAIL` y como último fallback al email usado por notificaciones internas.

### Configuración en Supabase
En Supabase Dashboard:
1) Database → Webhooks (Database Webhooks)
2) Create webhook

#### Webhook 1: creación de ticket
3) Table: `support_tickets`
4) Events: `INSERT`
5) URL: `https://shop.jhservices.com.ar/api/support/webhook`
6) Secret/Header: usar el mismo valor que `SUPABASE_WEBHOOK_SECRET`

#### Webhook 2: nuevos mensajes
3) Table: `support_ticket_messages`
4) Events: `INSERT`
5) URL: `https://shop.jhservices.com.ar/api/support/webhook`
6) Secret/Header: usar el mismo valor que `SUPABASE_WEBHOOK_SECRET`

Notas:
- El endpoint responde 200 incluso si falla el envío de email para evitar reintentos agresivos.
- Reglas de notificación implementadas:
  - Si `is_internal=true` → no se envía email.
  - Si escribe un admin (según `chat_admins`) → email al usuario dueño del ticket.
  - Si escribe el usuario → email al admin (`SUPPORT_NOTIFY_EMAIL` / `ADMIN_EMAIL`).

## Recomendación de arquitectura
- Lecturas públicas (FAQ/Status/Noticias): directo desde frontend con `anon key`.
- Escrituras admin (publicar artículos, crear incidentes, cerrar tickets):
  - O desde Supabase Dashboard (manual)
  - O por backend con `SUPABASE_SERVICE_KEY` (automatizable, auditable)

## Próximo paso sugerido
Si querés que lo deje funcionando end-to-end en UI:
1) Agregar página `Status`
2) Agregar página `Ayuda`
3) Agregar sección `Tickets` dentro de Perfil

(Decime si preferís rutas nuevas o integrarlo en el menú actual.)
