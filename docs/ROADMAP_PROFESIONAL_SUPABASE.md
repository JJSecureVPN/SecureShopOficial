# Roadmap Profesional (Supabase-first)

Fecha: 2025-12-19

Este documento prioriza mejoras para que SecureShop VPN se sienta como un producto “completo” (confianza, autoservicio, soporte, operación) sin salirnos del stack actual.

## Base actual (ya existente)
- Tienda planes VPN + reventa, checkout y renovaciones (backend + Servex + MercadoPago)
- Perfil + historial de compras (Supabase: `profiles`, `purchase_history` + sync desde backend)
- Referidos + wallet/saldo (Supabase: `referrals`, `saldo_transacciones`, `referral_settings`, columnas en `profiles`)
- Chat en vivo (Supabase: `chat_*` + Realtime)
- Noticias + comentarios (Supabase: `noticias_*`)
- Cupones / promos (backend config + endpoints)

## Top 5 (máximo impacto para web “pro”)
1) **Centro de ayuda + FAQ (Supabase)**
   - Objetivo: reducir soporte y aumentar conversión (“¿cómo instalo?”, “¿qué plan me conviene?”, “¿cómo renuevo?”).
   - Entregables: categorías + artículos publicados; búsqueda simple; guía por plataforma.

2) **Soporte con Tickets (Supabase)**
   - Objetivo: canal formal además del chat; trazabilidad, tiempos, historial.
   - Entregables: creación de ticket, mensajes, estados (open/pending/closed), prioridad.

3) **Página de Estado (Supabase)**
   - Objetivo: confianza + comunicación en incidentes; baja tickets por “¿se cayó?”
   - Entregables: incidentes públicos, timeline de updates, componentes afectados (opcional).

4) **Seguridad de cuenta / sesiones (Supabase)**
   - Objetivo: producto serio: “cerrar sesiones”, “avisos por login”, (ideal) 2FA.
   - Entregables: registro de eventos, panel de sesiones, cierre remoto.
   - Nota: 2FA depende de Supabase Auth (se puede planificar en fase 2).

5) **Políticas completas de compra (contenido + compliance)**
   - Objetivo: evitar conflictos y reclamos: reembolsos, cancelación, renovaciones, condiciones de reventa.
   - Entregables: páginas (contenido) + logging mínimo de aceptación (Supabase) si querés auditoría.

## Priorización Impacto vs Esfuerzo

### Quick wins (alto impacto, bajo/medio esfuerzo)
- FAQ / Centro de ayuda (Supabase) + guías de instalación.
- Estado: incidentes básicos (Supabase) + una página pública simple.
- Soporte: tickets mínimos (Supabase) + notificación por email (fase 2).

### Medio plazo (alto impacto, mayor esfuerzo)
- Portal de suscripción real (cambiar/renovar/cancelar) con estado único fuente de verdad.
- Sesiones / dispositivos / seguridad de cuenta.
- Panel admin consolidado (gestión de noticias, tickets, estado, cupones, promos).

## Principios “Supabase-first” para lo nuevo
- Datos nuevos viven en Supabase (Postgres + RLS).
- Lectura pública: tablas con RLS `SELECT` para `anon` solo cuando aplica (FAQ/Estado/Noticias).
- Escrituras sensibles (admin): preferir backend con `service_role` o Supabase (Dashboard) con cuentas admin.
- Reusar `public.is_chat_admin(auth.uid())` como “rol admin” para políticas nuevas (rápido y consistente).

## Siguiente entrega sugerida (MVP profesional)
- Migraciones Supabase:
  - `011_support_tickets.sql`
  - `012_status_page.sql`
  - `013_help_center_faq.sql`
- Frontend:
  - Página Help/FAQ
  - Página Status
  - Sección Tickets dentro de Perfil (crear/ver conversas)

---

Si querés, en el próximo paso también puedo:
- Crear endpoints backend mínimos para admin (cerrar ticket, publicar incidente) usando `SUPABASE_SERVICE_KEY`.
- Mapear rutas UI exactas para que quede consistente con tu navegación actual.
