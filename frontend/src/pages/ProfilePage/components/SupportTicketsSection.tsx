import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Plus, LifeBuoy, Send, MessageSquare, HelpCircle, ArrowRight, ChevronDown, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { SectionTitle, BodyText } from '../../../components/Typography';
import { Button } from '../../../components/Button';
import { SupportTicket } from '../../../lib/supabase';
import { useSupportTickets } from '../../../hooks/useSupportTickets';
import { formatDate } from '../utils';

function getTicketStatusLabel(status: SupportTicket['status']) {
  switch (status) {
    case 'open':
      return 'Abierto';
    case 'pending':
      return 'En revisión';
    case 'closed':
      return 'Cerrado';
    default:
      return status;
  }
}

function getTicketStatusClass(status: SupportTicket['status']) {
  switch (status) {
    case 'open':
      return 'bg-green-500/20 text-green-400 border-green-500/30';
    case 'pending':
      return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
    case 'closed':
      return 'bg-zinc-700/50 text-zinc-400 border-zinc-600';
    default:
      return 'bg-zinc-700/50 text-zinc-400 border-zinc-600';
  }
}

export function SupportTicketsSection({ userId }: { userId: string }) {
  const {
    tickets,
    ticketsLoading,
    ticketsError,
    fetchTickets,
    createTicket,
    messages,
    messagesLoading,
    fetchMessages,
    sendMessage,
    setMessages,
  } = useSupportTickets(userId);

  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newAsunto, setNewAsunto] = useState('');
  const [newDescripcion, setNewDescripcion] = useState('');
  const [creating, setCreating] = useState(false);

  const [expandedTicketId, setExpandedTicketId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // Cargar mensajes cuando se expande un ticket
  useEffect(() => {
    if (expandedTicketId) {
      fetchMessages(expandedTicketId);
    } else {
      setMessages([]);
    }
  }, [expandedTicketId, fetchMessages, setMessages]);

  const handleToggleTicket = (ticketId: string) => {
    if (expandedTicketId === ticketId) {
      setExpandedTicketId(null);
      setReply('');
    } else {
      setExpandedTicketId(ticketId);
      setReply('');
    }
  };

  const handleCreateTicket = async () => {
    setCreating(true);
    const result = await createTicket({ asunto: newAsunto, descripcion: newDescripcion });
    setCreating(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    setNewAsunto('');
    setNewDescripcion('');
    setShowNewTicket(false);

    if (result.ticketId) {
      setExpandedTicketId(result.ticketId);
    }
  };

  const handleSend = async () => {
    if (!expandedTicketId) return;

    setSending(true);
    const result = await sendMessage({ ticketId: expandedTicketId, content: reply });
    setSending(false);

    if (result.error) {
      alert(result.error);
      return;
    }

    setReply('');
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
      {/* Quick Help Banner */}
      <Link 
        to="/ayuda" 
        className="flex items-center justify-between bg-gradient-to-r from-zinc-800 to-zinc-800/80 border border-zinc-700 rounded-2xl p-4 mb-6 hover:border-orange-500/50 transition-colors group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <HelpCircle className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <p className="font-semibold text-white">¿Necesitás ayuda rápida?</p>
            <p className="text-sm text-zinc-400">Visitá nuestro Centro de Ayuda con guías y FAQs</p>
          </div>
        </div>
        <ArrowRight className="w-5 h-5 text-orange-500 group-hover:translate-x-1 transition-transform" />
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <SectionTitle as="h2">Soporte</SectionTitle>
          <BodyText className="mt-1">Tickets de ayuda y seguimiento</BodyText>
        </div>
        <Button variant="secondary" size="sm" onClick={() => setShowNewTicket((v) => !v)}>
          <Plus className="w-4 h-4" />
          Nuevo ticket
        </Button>
      </div>

      {/* Formulario nuevo ticket */}
      <AnimatePresence>
        {showNewTicket && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-5 md:p-6 mb-6">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center"
                >
                  <LifeBuoy className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-semibold text-white">Crear ticket</p>
                  <p className="text-sm text-zinc-400">Contanos tu problema o consulta</p>
                </div>
              </div>

              <div className="grid gap-3">
                <input
                  value={newAsunto}
                  onChange={(e) => setNewAsunto(e.target.value)}
                  placeholder="Asunto (ej: No puedo conectarme)"
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm text-white"
                />
                <textarea
                  value={newDescripcion}
                  onChange={(e) => setNewDescripcion(e.target.value)}
                  placeholder="Detalle (opcional)"
                  rows={4}
                  className="w-full px-4 py-2.5 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none text-white"
                />

                <div className="flex gap-2">
                  <Button onClick={handleCreateTicket} isLoading={creating}>
                    Crear
                  </Button>
                  <Button variant="secondary" onClick={() => setShowNewTicket(false)} disabled={creating}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de tickets */}
      {ticketsLoading ? (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 md:p-12 text-center">
          <Loader2 className="w-7 h-7 animate-spin mx-auto text-orange-500" />
          <p className="mt-3 text-sm text-zinc-400">Cargando tickets...</p>
        </div>
      ) : ticketsError ? (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-6">
          <p className="text-sm text-red-400">{ticketsError}</p>
        </div>
      ) : tickets.length === 0 ? (
        <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 md:p-12 text-center">
          <LifeBuoy className="w-14 h-14 mx-auto mb-4 text-orange-500/50" />
          <SectionTitle as="h3" className="mb-2 text-center">Todavía no tenés tickets</SectionTitle>
          <BodyText className="max-w-md mx-auto text-center">
            Si necesitás ayuda, creá un ticket y te respondemos por acá.
          </BodyText>
        </div>
      ) : (
        <div className="space-y-3">
          {tickets.map((ticket) => {
            const isExpanded = expandedTicketId === ticket.id;
            
            return (
              <div
                key={ticket.id}
                className="bg-zinc-900 border border-zinc-700 rounded-2xl overflow-hidden transition-all hover:border-orange-500/50"
              >
                {/* Header del ticket (clickeable) */}
                <button
                  onClick={() => handleToggleTicket(ticket.id)}
                  className="w-full text-left p-4 md:p-5 flex items-center gap-3 hover:bg-zinc-800/50 transition-colors"
                >
                  <div
                    className="w-11 h-11 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0"
                  >
                    <MessageSquare className="w-5 h-5 text-orange-400" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate text-white">
                      {ticket.asunto}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-3.5 h-3.5 text-zinc-500" />
                      <p className="text-xs text-zinc-400">
                        {formatDate(ticket.last_message_at)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${getTicketStatusClass(ticket.status)}`}>
                      {getTicketStatusLabel(ticket.status)}
                    </span>
                    <ChevronDown 
                      className={`w-5 h-5 text-zinc-500 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} 
                    />
                  </div>
                </button>

                {/* Contenido expandible */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="px-4 md:px-5 pb-4 md:pb-5 border-t border-zinc-700">
                        {/* Descripción del ticket */}
                        {ticket.descripcion && (
                          <div className="mt-4 p-3 bg-zinc-800/50 rounded-xl border border-zinc-700">
                            <p className="text-xs font-medium text-orange-400 mb-1">Descripción original:</p>
                            <p className="text-sm text-zinc-300">
                              {ticket.descripcion}
                            </p>
                          </div>
                        )}

                        {/* Historial de mensajes */}
                        <div className="mt-4">
                          <p className="text-xs font-medium text-orange-400 mb-3">Conversación:</p>
                          
                          {messagesLoading ? (
                            <div className="flex items-center justify-center gap-2 py-6">
                              <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                              <span className="text-sm text-orange-400">Cargando...</span>
                            </div>
                          ) : messages.length === 0 ? (
                            <div className="py-4 text-center">
                              <p className="text-sm text-zinc-500">No hay mensajes aún. ¡Escribe el primero!</p>
                            </div>
                          ) : (
                            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                              {messages.map((m) => {
                                const isOwnMessage = m.user_id === userId;
                                return (
                                  <div
                                    key={m.id}
                                    className={`p-3 rounded-xl ${
                                      isOwnMessage 
                                        ? 'bg-orange-500/20 border border-orange-500/30 ml-4' 
                                        : 'bg-zinc-800 border border-zinc-700 mr-4'
                                    }`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className={`text-xs font-medium ${isOwnMessage ? 'text-orange-400' : 'text-blue-400'}`}>
                                        {isOwnMessage ? 'Tú' : '👨‍💼 Soporte'}
                                      </span>
                                      <span className="text-xs text-zinc-500">{formatDate(m.created_at)}</span>
                                    </div>
                                    <p className="text-sm text-zinc-200">
                                      {m.content}
                                    </p>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Campo para responder */}
                        {ticket.status !== 'closed' && (
                          <div className="mt-4 flex gap-2">
                            <textarea
                              value={reply}
                              onChange={(e) => setReply(e.target.value)}
                              placeholder="Escribe tu mensaje..."
                              rows={2}
                              className="flex-1 px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm resize-none text-white"
                            />
                            <Button 
                              onClick={handleSend} 
                              disabled={!reply.trim() || sending}
                              className="self-end"
                            >
                              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                            </Button>
                          </div>
                        )}

                        {ticket.status === 'closed' && (
                          <div className="mt-4 p-3 bg-zinc-800/50 rounded-xl text-center">
                            <p className="text-sm text-zinc-400">Este ticket está cerrado</p>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
