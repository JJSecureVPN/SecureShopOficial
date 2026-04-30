import { useCallback, useMemo, useState } from 'react';
import { supabase, SupportTicket, SupportTicketMessage } from '../lib/supabase';

export function useSupportTickets(userId: string | null) {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [ticketsLoading, setTicketsLoading] = useState(false);
  const [ticketsError, setTicketsError] = useState<string | null>(null);

  const [messages, setMessages] = useState<SupportTicketMessage[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);

  const canUse = useMemo(() => !!userId, [userId]);

  const fetchTickets = useCallback(async () => {
    if (!canUse) return;

    setTicketsLoading(true);
    setTicketsError(null);

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .order('last_message_at', { ascending: false });

      if (error) {
        setTicketsError(error.message);
        return;
      }

      setTickets((data ?? []) as SupportTicket[]);
    } catch (err: any) {
      setTicketsError(err?.message ?? 'Error cargando tickets');
    } finally {
      setTicketsLoading(false);
    }
  }, [canUse]);

  const createTicket = useCallback(
    async (input: { asunto: string; descripcion?: string }) => {
      if (!userId) return { ticketId: null as string | null, error: 'No hay usuario autenticado' };

      const asunto = input.asunto.trim();
      const descripcion = (input.descripcion ?? '').trim();

      if (!asunto) {
        return { ticketId: null as string | null, error: 'El asunto es obligatorio' };
      }

      try {
        const { data, error } = await supabase
          .from('support_tickets')
          .insert({
            user_id: userId,
            asunto,
            descripcion: descripcion || null,
          })
          .select('id')
          .single();

        if (error) {
          return { ticketId: null as string | null, error: error.message };
        }

        await fetchTickets();
        return { ticketId: (data as any)?.id ?? null, error: null as string | null };
      } catch (err: any) {
        return { ticketId: null as string | null, error: err?.message ?? 'Error creando ticket' };
      }
    },
    [fetchTickets, userId]
  );

  const fetchMessages = useCallback(async (ticketId: string) => {
    if (!canUse) return;

    setMessagesLoading(true);
    setMessagesError(null);

    try {
      const { data, error } = await supabase
        .from('support_ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) {
        setMessagesError(error.message);
        return;
      }

      setMessages((data ?? []) as SupportTicketMessage[]);
    } catch (err: any) {
      setMessagesError(err?.message ?? 'Error cargando mensajes');
    } finally {
      setMessagesLoading(false);
    }
  }, [canUse]);

  const sendMessage = useCallback(
    async (input: { ticketId: string; content: string }) => {
      if (!userId) return { ok: false, error: 'No hay usuario autenticado' };

      const content = input.content.trim();
      if (!content) return { ok: false, error: 'Escribe un mensaje' };

      try {
        const { error } = await supabase
          .from('support_ticket_messages')
          .insert({
            ticket_id: input.ticketId,
            user_id: userId,
            content,
            is_internal: false,
          });

        if (error) return { ok: false, error: error.message };

        await Promise.all([fetchMessages(input.ticketId), fetchTickets()]);
        return { ok: true, error: null as string | null };
      } catch (err: any) {
        return { ok: false, error: err?.message ?? 'Error enviando mensaje' };
      }
    },
    [fetchMessages, fetchTickets, userId]
  );

  return {
    tickets,
    ticketsLoading,
    ticketsError,
    fetchTickets,
    createTicket,

    messages,
    messagesLoading,
    messagesError,
    fetchMessages,
    sendMessage,

    setMessages,
  };
}
