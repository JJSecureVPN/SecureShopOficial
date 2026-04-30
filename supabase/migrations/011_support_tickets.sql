-- ============================================
-- MIGRACIÓN 011: SISTEMA DE SOPORTE (TICKETS)
-- ============================================
-- Objetivo: canal formal de soporte con trazabilidad.
-- Reusa `public.is_chat_admin(auth.uid())` como rol admin.
-- ============================================

-- ============================================
-- 1. TABLA DE TICKETS
-- ============================================

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  asunto TEXT NOT NULL,
  descripcion TEXT,

  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'pending', 'closed')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),

  last_message_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_support_tickets_user_id ON public.support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON public.support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_last_message ON public.support_tickets(last_message_at DESC);

-- Trigger updated_at (usa función creada en 003_triggers_functions.sql)
DROP TRIGGER IF EXISTS trigger_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trigger_support_tickets_updated_at
BEFORE UPDATE ON public.support_tickets
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 2. TABLA DE MENSAJES DEL TICKET
-- ============================================

CREATE TABLE IF NOT EXISTS public.support_ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,

  content TEXT NOT NULL,
  is_internal BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_ticket_id ON public.support_ticket_messages(ticket_id);
CREATE INDEX IF NOT EXISTS idx_support_ticket_messages_created_at ON public.support_ticket_messages(created_at DESC);

-- Mantener `last_message_at` del ticket al insertar mensaje
CREATE OR REPLACE FUNCTION public.bump_support_ticket_last_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.support_tickets
  SET last_message_at = NOW(),
      -- Si el usuario escribe, por defecto lo dejamos en open/pending según estado actual
      status = CASE
        WHEN status = 'closed' THEN 'open'
        ELSE status
      END
  WHERE id = NEW.ticket_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_support_ticket_bump_last_message ON public.support_ticket_messages;
CREATE TRIGGER trigger_support_ticket_bump_last_message
AFTER INSERT ON public.support_ticket_messages
FOR EACH ROW
EXECUTE FUNCTION public.bump_support_ticket_last_message();

-- ============================================
-- 3. ROW LEVEL SECURITY (RLS)
-- ============================================

ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_ticket_messages ENABLE ROW LEVEL SECURITY;

-- Tickets: lectura dueño o admin
DROP POLICY IF EXISTS support_tickets_select_own_or_admin ON public.support_tickets;
CREATE POLICY "support_tickets_select_own_or_admin"
ON public.support_tickets FOR SELECT
USING (
  auth.uid() = user_id
  OR public.is_chat_admin(auth.uid())
);

-- Tickets: creación solo del dueño
DROP POLICY IF EXISTS support_tickets_insert_own ON public.support_tickets;
CREATE POLICY "support_tickets_insert_own"
ON public.support_tickets FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Tickets: actualización solo admin
DROP POLICY IF EXISTS support_tickets_update_admin ON public.support_tickets;
CREATE POLICY "support_tickets_update_admin"
ON public.support_tickets FOR UPDATE
USING (public.is_chat_admin(auth.uid()))
WITH CHECK (public.is_chat_admin(auth.uid()));

-- Tickets: borrado solo admin
DROP POLICY IF EXISTS support_tickets_delete_admin ON public.support_tickets;
CREATE POLICY "support_tickets_delete_admin"
ON public.support_tickets FOR DELETE
USING (public.is_chat_admin(auth.uid()));

-- Mensajes: lectura (admin ve todo; usuario solo no-internos de sus tickets)
DROP POLICY IF EXISTS support_ticket_messages_select ON public.support_ticket_messages;
CREATE POLICY "support_ticket_messages_select"
ON public.support_ticket_messages FOR SELECT
USING (
  public.is_chat_admin(auth.uid())
  OR (
    is_internal = false
    AND EXISTS (
      SELECT 1
      FROM public.support_tickets t
      WHERE t.id = support_ticket_messages.ticket_id
        AND t.user_id = auth.uid()
    )
  )
);

-- Mensajes: inserción (usuario en su ticket, no-interno; admin en cualquiera)
DROP POLICY IF EXISTS support_ticket_messages_insert ON public.support_ticket_messages;
CREATE POLICY "support_ticket_messages_insert"
ON public.support_ticket_messages FOR INSERT
WITH CHECK (
  (
    public.is_chat_admin(auth.uid())
    AND auth.uid() = user_id
  )
  OR (
    auth.uid() = user_id
    AND is_internal = false
    AND EXISTS (
      SELECT 1
      FROM public.support_tickets t
      WHERE t.id = support_ticket_messages.ticket_id
        AND t.user_id = auth.uid()
    )
  )
);

-- Mensajes: update/delete solo admin
DROP POLICY IF EXISTS support_ticket_messages_update_admin ON public.support_ticket_messages;
CREATE POLICY "support_ticket_messages_update_admin"
ON public.support_ticket_messages FOR UPDATE
USING (public.is_chat_admin(auth.uid()))
WITH CHECK (public.is_chat_admin(auth.uid()));

DROP POLICY IF EXISTS support_ticket_messages_delete_admin ON public.support_ticket_messages;
CREATE POLICY "support_ticket_messages_delete_admin"
ON public.support_ticket_messages FOR DELETE
USING (public.is_chat_admin(auth.uid()));

-- ============================================
-- ✅ MIGRACIÓN COMPLETADA
-- ============================================
