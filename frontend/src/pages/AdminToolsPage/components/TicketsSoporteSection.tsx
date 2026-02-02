import { useEffect, useState, useMemo } from 'react';
import {
  Loader2,
  Send,
  MessageSquare,
  RefreshCw,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  Mail,
  User,
  Filter,
  ArrowUpCircle,
  ArrowDownCircle,
  MinusCircle,
  Lock,
  X,
} from 'lucide-react';
import { useAdminSupportTickets, TicketWithUser } from '../../../hooks/useAdminSupportTickets';
import { useAuth } from '../../../contexts/AuthContext';

// Formatear fecha
function formatDate(dateStr: string) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

// Formatear fecha corta
function formatDateShort(dateStr: string) {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Ahora';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit' });
  } catch {
    return dateStr;
  }
}

type StatusFilter = 'all' | 'open' | 'pending' | 'closed';

const STATUS_OPTIONS: { value: StatusFilter; label: string; icon: React.ReactNode; color: string }[] = [
  { value: 'all', label: 'Todos', icon: <Filter className="w-4 h-4" />, color: 'text-neutral-400' },
  { value: 'open', label: 'Abiertos', icon: <AlertCircle className="w-4 h-4" />, color: 'text-green-400' },
  { value: 'pending', label: 'En revisión', icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400' },
  { value: 'closed', label: 'Cerrados', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-neutral-500' },
];

const PRIORITY_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  low: { label: 'Baja', color: 'text-neutral-400 bg-neutral-800', icon: <ArrowDownCircle className="w-3.5 h-3.5" /> },
  normal: { label: 'Normal', color: 'text-blue-400 bg-blue-900/30', icon: <MinusCircle className="w-3.5 h-3.5" /> },
  high: { label: 'Alta', color: 'text-red-400 bg-red-900/30', icon: <ArrowUpCircle className="w-3.5 h-3.5" /> },
};

const STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  open: { label: 'Abierto', color: 'text-green-400', bgColor: 'bg-green-900/30 border-green-700/50' },
  pending: { label: 'En revisión', color: 'text-yellow-400', bgColor: 'bg-yellow-900/30 border-yellow-700/50' },
  closed: { label: 'Cerrado', color: 'text-neutral-400', bgColor: 'bg-neutral-800 border-neutral-700' },
};

export default function TicketsSoporteSection() {
  const { user } = useAuth();
  const {
    tickets,
    ticketsLoading,
    ticketsError,
    fetchTickets,
    messages,
    messagesLoading,
    messagesError,
    fetchMessages,
    sendMessage,
    updateTicketStatus,
    updateTicketPriority,
  } = useAdminSupportTickets();

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('open');
  const [selectedTicket, setSelectedTicket] = useState<TicketWithUser | null>(null);
  const [reply, setReply] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  // Cargar tickets al montar o cambiar filtro
  useEffect(() => {
    fetchTickets(statusFilter === 'all' ? undefined : statusFilter);
  }, [fetchTickets, statusFilter]);

  // Cargar mensajes cuando se selecciona un ticket
  useEffect(() => {
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  }, [fetchMessages, selectedTicket]);

  // Contadores por status
  const statusCounts = useMemo(() => {
    const counts = { all: 0, open: 0, pending: 0, closed: 0 };
    tickets.forEach((t) => {
      counts.all++;
      counts[t.status]++;
    });
    return counts;
  }, [tickets]);

  const handleSelectTicket = (ticket: TicketWithUser) => {
    setSelectedTicket(ticket);
    setReply('');
    setIsInternal(false);
    setShowStatusDropdown(false);
    setShowPriorityDropdown(false);
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !user) return;

    setSending(true);
    setActionError(null);

    const result = await sendMessage(
      { ticketId: selectedTicket.id, content: reply, isInternal },
      user.id
    );

    setSending(false);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    setReply('');
    setIsInternal(false);
    setActionSuccess('Mensaje enviado');
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleChangeStatus = async (status: 'open' | 'pending' | 'closed') => {
    if (!selectedTicket) return;

    const result = await updateTicketStatus(selectedTicket.id, status);
    setShowStatusDropdown(false);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    setSelectedTicket({ ...selectedTicket, status });
    setActionSuccess(`Estado cambiado a ${STATUS_LABELS[status].label}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleChangePriority = async (priority: 'low' | 'normal' | 'high') => {
    if (!selectedTicket) return;

    const result = await updateTicketPriority(selectedTicket.id, priority);
    setShowPriorityDropdown(false);

    if (result.error) {
      setActionError(result.error);
      return;
    }

    setSelectedTicket({ ...selectedTicket, priority });
    setActionSuccess(`Prioridad cambiada a ${PRIORITY_LABELS[priority].label}`);
    setTimeout(() => setActionSuccess(null), 3000);
  };

  const handleRefresh = () => {
    fetchTickets(statusFilter === 'all' ? undefined : statusFilter);
    if (selectedTicket) {
      fetchMessages(selectedTicket.id);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filtros y acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-2">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`
                flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                ${statusFilter === opt.value
                  ? 'bg-purple-600 text-white'
                  : 'bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white'
                }
              `}
            >
              {opt.icon}
              {opt.label}
              {statusFilter !== opt.value && statusCounts[opt.value] > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-xs rounded-full bg-neutral-700">
                  {statusCounts[opt.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          disabled={ticketsLoading}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-neutral-800 text-neutral-400 hover:bg-neutral-700 hover:text-white transition-all disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${ticketsLoading ? 'animate-spin' : ''}`} />
          Actualizar
        </button>
      </div>

      {/* Mensajes de feedback */}
      {actionSuccess && (
        <div className="p-3 bg-green-900/30 border border-green-700/50 rounded-lg text-green-400 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {actionSuccess}
        </div>
      )}
      {actionError && (
        <div className="p-3 bg-red-900/30 border border-red-700/50 rounded-lg text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {actionError}
        </div>
      )}

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Lista de tickets */}
        <div className="lg:col-span-1 bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
          <div className="p-3 border-b border-neutral-800 bg-neutral-900">
            <h3 className="text-sm font-semibold text-neutral-300">
              Tickets ({tickets.length})
            </h3>
          </div>

          <div className="max-h-[600px] overflow-y-auto">
            {ticketsLoading ? (
              <div className="p-8 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-orange-500" />
                <p className="text-sm text-neutral-500 mt-2">Cargando tickets...</p>
              </div>
            ) : ticketsError ? (
              <div className="p-4 text-sm text-red-400">{ticketsError}</div>
            ) : tickets.length === 0 ? (
              <div className="p-8 text-center">
                <MessageSquare className="w-10 h-10 mx-auto text-neutral-700" />
                <p className="text-sm text-neutral-500 mt-2">No hay tickets</p>
              </div>
            ) : (
              <div className="divide-y divide-neutral-800">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`
                      w-full text-left p-3 hover:bg-neutral-800/50 transition-colors
                      ${selectedTicket?.id === ticket.id ? 'bg-purple-900/20 border-l-2 border-purple-500' : ''}
                    `}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm text-white truncate">{ticket.asunto}</p>
                        <p className="text-xs text-neutral-500 truncate mt-0.5">
                          {ticket.user_nombre || ticket.user_email}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-neutral-500">{formatDateShort(ticket.last_message_at)}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded border ${STATUS_LABELS[ticket.status].bgColor} ${STATUS_LABELS[ticket.status].color}`}>
                          {STATUS_LABELS[ticket.status].label}
                        </span>
                      </div>
                    </div>
                    {ticket.priority === 'high' && (
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-red-400">
                        <ArrowUpCircle className="w-3 h-3" />
                        Prioridad alta
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detalle del ticket */}
        <div className="lg:col-span-2 bg-neutral-900/50 border border-neutral-800 rounded-xl overflow-hidden">
          {!selectedTicket ? (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 mx-auto text-neutral-700" />
              <p className="text-neutral-500 mt-3">Selecciona un ticket para ver los detalles</p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {/* Header del ticket */}
              <div className="p-4 border-b border-neutral-800 bg-neutral-900">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-lg font-semibold text-white">{selectedTicket.asunto}</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm">
                      <span className="flex items-center gap-1.5 text-neutral-400">
                        <User className="w-4 h-4" />
                        {selectedTicket.user_nombre || '(sin nombre)'}
                      </span>
                      <a
                        href={`mailto:${selectedTicket.user_email}`}
                        className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300"
                      >
                        <Mail className="w-4 h-4" />
                        {selectedTicket.user_email}
                      </a>
                      <span className="text-neutral-500">
                        {formatDate(selectedTicket.created_at)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Dropdown de prioridad */}
                    <div className="relative">
                      <button
                        onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium ${PRIORITY_LABELS[selectedTicket.priority].color}`}
                      >
                        {PRIORITY_LABELS[selectedTicket.priority].icon}
                        {PRIORITY_LABELS[selectedTicket.priority].label}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {showPriorityDropdown && (
                        <div className="absolute right-0 mt-1 w-32 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-10">
                          {(['low', 'normal', 'high'] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => handleChangePriority(p)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-700 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 ${PRIORITY_LABELS[p].color.split(' ')[0]}`}
                            >
                              {PRIORITY_LABELS[p].icon}
                              {PRIORITY_LABELS[p].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dropdown de status */}
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border ${STATUS_LABELS[selectedTicket.status].bgColor} ${STATUS_LABELS[selectedTicket.status].color}`}
                      >
                        {selectedTicket.status === 'open' && <AlertCircle className="w-3.5 h-3.5" />}
                        {selectedTicket.status === 'pending' && <Clock className="w-3.5 h-3.5" />}
                        {selectedTicket.status === 'closed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                        {STATUS_LABELS[selectedTicket.status].label}
                        <ChevronDown className="w-3 h-3" />
                      </button>
                      {showStatusDropdown && (
                        <div className="absolute right-0 mt-1 w-36 bg-neutral-800 border border-neutral-700 rounded-lg shadow-xl z-10">
                          {(['open', 'pending', 'closed'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => handleChangeStatus(s)}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-700 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 ${STATUS_LABELS[s].color}`}
                            >
                              {s === 'open' && <AlertCircle className="w-4 h-4" />}
                              {s === 'pending' && <Clock className="w-4 h-4" />}
                              {s === 'closed' && <CheckCircle2 className="w-4 h-4" />}
                              {STATUS_LABELS[s].label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="p-1.5 text-neutral-500 hover:text-white hover:bg-neutral-800 rounded-lg transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Descripción del ticket */}
                {selectedTicket.descripcion && (
                  <div className="mt-3 p-3 bg-neutral-800/50 rounded-lg">
                    <p className="text-sm text-neutral-300 whitespace-pre-wrap">{selectedTicket.descripcion}</p>
                  </div>
                )}
              </div>

              {/* Mensajes */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[350px] space-y-3">
                {messagesLoading ? (
                  <div className="text-center py-8">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto text-orange-500" />
                    <p className="text-sm text-neutral-500 mt-2">Cargando mensajes...</p>
                  </div>
                ) : messagesError ? (
                  <div className="text-sm text-red-400">{messagesError}</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-8 text-neutral-500 text-sm">
                    No hay mensajes. Sé el primero en responder.
                  </div>
                ) : (
                  messages.map((m) => {
                    const isAdminMessage = m.user_id !== selectedTicket.user_id;
                    return (
                      <div
                        key={m.id}
                        className={`p-3 rounded-xl ${
                          m.is_internal
                            ? 'bg-yellow-900/20 border border-yellow-700/30'
                            : isAdminMessage
                            ? 'bg-purple-900/20 border border-purple-700/30'
                            : 'bg-neutral-800 border border-neutral-700'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className={`text-xs font-medium ${isAdminMessage ? 'text-purple-400' : 'text-neutral-400'}`}>
                            {m.is_internal && <Lock className="w-3 h-3 inline mr-1" />}
                            {isAdminMessage ? 'Soporte' : m.user_nombre || m.user_email}
                            {m.is_internal && ' (nota interna)'}
                          </span>
                          <span className="text-xs text-neutral-500">{formatDate(m.created_at)}</span>
                        </div>
                        <p className="text-sm text-neutral-200 whitespace-pre-wrap">{m.content}</p>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Caja de respuesta */}
              <div className="p-4 border-t border-neutral-800 bg-neutral-900">
                <div className="flex items-center gap-2 mb-2">
                  <label className="flex items-center gap-2 text-xs text-neutral-400 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="rounded border-neutral-700 bg-neutral-800 text-purple-500 focus:ring-purple-500"
                    />
                    <Lock className="w-3 h-3" />
                    Nota interna (no visible para el usuario)
                  </label>
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                    placeholder={isInternal ? 'Escribe una nota interna...' : 'Escribe tu respuesta...'}
                    rows={2}
                    className="flex-1 px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-xl text-sm text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                  />
                  <button
                    onClick={handleSendReply}
                    disabled={!reply.trim() || sending}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm flex items-center gap-2 transition-colors"
                  >
                    {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    Enviar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
