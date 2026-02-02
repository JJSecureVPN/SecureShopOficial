import { useCallback, useState } from 'react';
import { supabase, SupportTicket, SupportTicketMessage } from '../lib/supabase';

export interface TicketWithUser extends SupportTicket {
  user_email: string;
  user_nombre: string | null;
}

export interface MessageWithUser extends SupportTicketMessage {
  user_email: string;
  user_nombre: string | null;
}

export function useAdminSupportTickets() {
  const [tickets, setTickets] = useState<TicketWithUser[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const [messages, setMessages] = useState<MessageWithUser[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  // Cargar todos los tickets (admin ve todos por RLS)
  const fetchTickets = useCallback(async (statusFilter?: 'open' | 'pending' | 'closed' | 'all') => {
    setTicketsLoading(true);
    setTicketsError(null);

    try {
      let query = supabase
        .from('support_tickets')
        .select(`
          *,
          profiles:user_id (
            email,
            nombre
          )
        `)
        .order('last_message_at', { ascending: false });

      if (statusFilter && statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) {
        setTicketsError(error.message);
        return;
      }

      // Mapear a TicketWithUser
      const mapped: TicketWithUser[] = (data ?? []).map((t: any) => ({
        id: t.id,
        user_id: t.user_id,
        asunto: t.asunto,
        descripcion: t.descripcion,
        status: t.status,
        priority: t.priority,
        last_message_at: t.last_message_at,
        created_at: t.created_at,
        updated_at: t.updated_at,
        user_email: t.profiles?.email ?? '(sin email)',
        user_nombre: t.profiles?.nombre ?? null,
      }));

      setTickets(mapped);
    } catch (err: any) {
      setTicketsError(err?.message ?? 'Error cargando tickets');
    } finally {
      setTicketsLoading(false);
    }
  }, []);

  // Cargar mensajes de un ticket
  const fetchMessages = useCallback(async (ticketId: string) => {
    setMessagesLoading(true);
    setMessagesError(null);

    try {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select(`
          *,
          profiles:user_id (
            email,
            nombre
          )
        `)
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        setMessagesError(error.message);
        return;
      }

      const mapped: MessageWithUser[] = (data ?? []).map((m: any) => ({
        id: m.id,
        ticket_id: m.ticket_id,
        user_id: m.user_id,
        content: m.content,
        is_internal: m.is_internal,
        created_at: m.created_at,
        user_email: m.profiles?.email ?? '(sin email)',
        user_nombre: m.profiles?.nombre ?? null,
      }));

      setMessages(mapped);
    } catch (err: any) {
      setMessagesError(err?.message ?? 'Error cargando mensajes');
    } finally {
      setMessagesLoading(false);
    }
  }, []);

  // Enviar mensaje como admin
  const sendMessage = useCallback(
    async (input: { ticketId: string; content: string; isInternal?: boolean }, adminUserId: string) => {
      const content = input.content.trim();
      if (!content) return { ok: false, error: 'Escribe un mensaje' };

      try {
        const { error } = await supabase
          .from('support_ticket_messages')
          .insert({
            ticket_id: input.ticketId,
            user_id: adminUserId,
            content,
            is_internal: input.isInternal ?? false,
          });

        if (error) return { ok: false, error: error.message };

        await fetchMessages(input.ticketId);
        await fetchTickets();
        return { ok: true, error: null as string | null };
      } catch (err: any) {
        return { ok: false, error: err?.message ?? 'Error enviando mensaje' };
      }
    },
    [fetchMessages, fetchTickets]
  );

  // Actualizar status del ticket
  const updateTicketStatus = useCallback(
    async (ticketId: string, status: 'open' | 'pending' | 'closed') => {
      try {
        const { error } = await supabase
          .from('support_tickets')
          .update({ status })
          .eq('id', ticketId);

        if (error) return { ok: false, error: error.message };

        await fetchTickets();
        return { ok: true, error: null as string | null };
      } catch (err: any) {
        return { ok: false, error: err?.message ?? 'Error actualizando ticket' };
      }
    },
    [fetchTickets]
  );

  // Actualizar prioridad del ticket
  const updateTicketPriority = useCallback(
    async (ticketId: string, priority: 'low' | 'normal' | 'high') => {
      try {
        const { error } = await supabase
          .from('support_tickets')
          .update({ priority })
          .eq('id', ticketId);

        if (error) return { ok: false, error: error.message };

        await fetchTickets();
        return { ok: true, error: null as string | null };
      } catch (err: any) {
        return { ok: false, error: err?.message ?? 'Error actualizando prioridad' };
      }
    },
    [fetchTickets]
  );

  return {
    tickets,
    ticketsLoading,
    ticketsError,
    fetchTickets,

    messages,
    messagesLoading,
    messagesError,
    fetchMessages,
    setMessages,

    sendMessage,
    updateTicketStatus,
    updateTicketPriority,
  };
}
