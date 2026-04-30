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
  { value: 'all', label: 'Todos', icon: <Filter className="w-4 h-4" />, color: 'text-zinc-400' },
  { value: 'open', label: 'Abiertos', icon: <AlertCircle className="w-4 h-4" />, color: 'text-orange-400' },
  { value: 'pending', label: 'Pendientes', icon: <Clock className="w-4 h-4" />, color: 'text-yellow-400' },
  { value: 'closed', label: 'Cerrados', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-zinc-500' },
];

const PRIORITY_LABELS: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  low: { label: 'Baja', color: 'text-zinc-400 bg-zinc-800/50', icon: <ArrowDownCircle className="w-3.5 h-3.5" /> },
  normal: { label: 'Normal', color: 'text-blue-400 bg-blue-500/10 border-blue-500/20', icon: <MinusCircle className="w-3.5 h-3.5" /> },
  high: { label: 'Prioridad Alta', color: 'text-red-400 bg-red-500/10 border-red-500/20', icon: <ArrowUpCircle className="w-3.5 h-3.5" /> },
};

const STATUS_LABELS: Record<string, { label: string; color: string; bgColor: string }> = {
  open: { label: 'Abierto', color: 'text-orange-400', bgColor: 'bg-orange-500/10 border-orange-500/20' },
  pending: { label: 'En revisión', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10 border-yellow-500/20' },
  closed: { label: 'Cerrado', color: 'text-zinc-500', bgColor: 'bg-zinc-800/50 border-zinc-700/30' },
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
    setActionSuccess('Mensaje enviado correctamente');
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
    setActionSuccess(`Estado actualizado a ${STATUS_LABELS[status].label}`);
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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      {/* Filtros y acciones */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between bg-zinc-900/40 backdrop-blur-md border border-zinc-800/50 p-3 rounded-[2rem] shadow-xl shadow-black/20">
        <div className="flex flex-wrap gap-1.5 p-1">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`
                relative flex items-center gap-2.5 px-5 py-2.5 rounded-2xl text-[13px] font-bold transition-all duration-300
                ${statusFilter === opt.value
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25 scale-[1.02]'
                  : 'bg-transparent text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800/50'
                }
              `}
            >
              <span className={statusFilter === opt.value ? 'text-white' : opt.color}>
                {opt.icon}
              </span>
              {opt.label}
              {statusFilter !== opt.value && statusCounts[opt.value] > 0 && (
                <span className="flex items-center justify-center w-5 h-5 text-[10px] font-black rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700/50">
                  {statusCounts[opt.value]}
                </span>
              )}
            </button>
          ))}
        </div>

        <button
          onClick={handleRefresh}
          disabled={ticketsLoading}
          className="flex items-center gap-2.5 px-6 py-2.5 rounded-2xl text-[13px] font-black bg-zinc-800/50 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all disabled:opacity-50 border border-zinc-700/30 group shadow-lg shadow-black/20"
        >
          <RefreshCw className={`w-4 h-4 transition-transform duration-500 group-hover:rotate-180 ${ticketsLoading ? 'animate-spin' : ''}`} />
          Sincronizar
        </button>
      </div>

      {/* Mensajes de feedback */}
      {(actionSuccess || actionError) && (
        <div className={`p-4 rounded-2xl flex items-center gap-3 animate-in slide-in-from-top-2 border ${
          actionSuccess ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' : 'bg-red-500/5 border-red-500/20 text-red-400'
        }`}>
          {actionSuccess ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
          <span className="text-sm font-bold tracking-tight">{actionSuccess || actionError}</span>
        </div>
      )}

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[650px]">
        {/* Lista de tickets */}
        <div className="lg:col-span-4 bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl shadow-black/40">
          <div className="px-6 py-5 border-b border-zinc-800/50 bg-zinc-900/60 flex items-center justify-between">
            <h3 className="text-sm font-black text-zinc-400 flex items-center gap-2 uppercase tracking-widest">
              <MessageSquare className="w-4 h-4 text-orange-500" />
              Bandeja de Entrada
            </h3>
            <span className="px-2.5 py-1 bg-zinc-950/50 rounded-lg text-[10px] font-black text-zinc-500 border border-zinc-800/50">
              {tickets.length} TOTAL
            </span>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
            {ticketsLoading ? (
              <div className="p-12 text-center">
                <div className="relative inline-block">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500" />
                  <div className="absolute inset-0 blur-xl bg-orange-500/20 animate-pulse" />
                </div>
                <p className="text-xs font-bold text-zinc-500 mt-4 uppercase tracking-tighter">Sincronizando tickets...</p>
              </div>
            ) : ticketsError ? (
              <div className="p-8 text-center bg-red-500/5 m-4 rounded-2xl border border-red-500/10">
                <AlertCircle className="w-8 h-8 text-red-500 mx-auto opacity-50" />
                <p className="text-sm font-bold text-red-400/80 mt-3">{ticketsError}</p>
              </div>
            ) : tickets.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-zinc-900/80 border border-zinc-800/50 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-zinc-700" />
                </div>
                <p className="text-sm font-black text-zinc-600 uppercase tracking-widest">Bandeja Vacía</p>
                <p className="text-xs text-zinc-500 mt-2">No hay mensajes en esta categoría</p>
              </div>
            ) : (
              <div className="p-3 space-y-2">
                {tickets.map((ticket) => (
                  <button
                    key={ticket.id}
                    onClick={() => handleSelectTicket(ticket)}
                    className={`
                      relative w-full text-left p-4 rounded-3xl transition-all duration-300 group overflow-hidden
                      ${selectedTicket?.id === ticket.id 
                        ? 'bg-zinc-800/60 border border-zinc-700/50 shadow-xl shadow-black/20 translate-x-1' 
                        : 'bg-transparent border border-transparent hover:bg-zinc-800/30'
                      }
                    `}
                  >
                    {selectedTicket?.id === ticket.id && (
                      <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-orange-500 rounded-full" />
                    )}
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${ticket.status === 'open' ? 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] animate-pulse' : 'bg-zinc-600'}`} />
                          <p className={`font-bold text-[14px] truncate tracking-tight transition-colors ${selectedTicket?.id === ticket.id ? 'text-white' : 'text-zinc-200 group-hover:text-white'}`}>
                            {ticket.asunto}
                          </p>
                        </div>
                        <p className="text-[11px] font-medium text-zinc-500 truncate leading-none">
                          {ticket.user_nombre || ticket.user_email.split('@')[0]}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className="text-[10px] font-black text-zinc-600 uppercase tracking-tighter tabular-nums">
                          {formatDateShort(ticket.last_message_at)}
                        </span>
                        {ticket.priority === 'high' && (
                          <div className="flex items-center justify-center w-5 h-5 bg-red-500 rounded-full shadow-lg shadow-red-500/20">
                            <ArrowUpCircle className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detalle del ticket */}
        <div className="lg:col-span-8 flex flex-col bg-zinc-900/30 backdrop-blur-xl border border-zinc-800/50 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-black/40">
          {!selectedTicket ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="w-32 h-32 rounded-[2.5rem] bg-gradient-to-br from-zinc-800 to-zinc-900 border border-zinc-800/50 flex items-center justify-center mb-8 shadow-2xl group transition-all duration-700 hover:scale-110">
                <MessageSquare className="w-12 h-12 text-zinc-600 group-hover:text-orange-500 transition-colors" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight uppercase">Centro de Atención</h3>
              <p className="text-zinc-500 mt-2 font-medium max-w-xs">Selecciona una comunicación de la bandeja izquierda para gestionar la incidencia.</p>
            </div>
          ) : (
            <div className="flex flex-col h-full overflow-hidden">
              {/* Header del ticket */}
              <div className="px-8 py-7 border-b border-zinc-800/50 bg-zinc-900/60 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />
                
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-2xl font-black text-white tracking-tight leading-tight">{selectedTicket.asunto}</h3>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-4 text-xs">
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/50 border border-zinc-800/50 rounded-xl">
                        <User className="w-3.5 h-3.5 text-orange-500" />
                        <span className="font-bold text-zinc-300">{selectedTicket.user_nombre || 'Cliente Anónimo'}</span>
                      </div>
                      
                      <a
                        href={`mailto:${selectedTicket.user_email}`}
                        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/50 border border-zinc-800/50 rounded-xl text-zinc-400 hover:text-white hover:border-orange-500/50 transition-all font-bold"
                      >
                        <Mail className="w-3.5 h-3.5 text-orange-500" />
                        {selectedTicket.user_email}
                      </a>
                      
                      <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-950/50 border border-zinc-800/50 rounded-xl text-zinc-500 font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {formatDate(selectedTicket.created_at)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Prioridad */}
                    <div className="relative group/prio">
                      <button
                        onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider border shadow-lg transition-all ${PRIORITY_LABELS[selectedTicket.priority].color}`}
                      >
                        {PRIORITY_LABELS[selectedTicket.priority].icon}
                        {PRIORITY_LABELS[selectedTicket.priority].label}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showPriorityDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showPriorityDropdown && (
                        <div className="absolute right-0 mt-2 w-44 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-1 z-30 animate-in fade-in zoom-in duration-200">
                          {(['low', 'normal', 'high'] as const).map((p) => (
                            <button
                              key={p}
                              onClick={() => handleChangePriority(p)}
                              className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 rounded-xl flex items-center gap-3 transition-colors ${PRIORITY_LABELS[p].color.split(' ')[0]}`}
                            >
                              {PRIORITY_LABELS[p].icon}
                              {PRIORITY_LABELS[p].label}
                              {selectedTicket.priority === p && <div className="ml-auto w-1.5 h-1.5 bg-current rounded-full" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Estado */}
                    <div className="relative">
                      <button
                        onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-wider border shadow-lg transition-all ${STATUS_LABELS[selectedTicket.status].bgColor} ${STATUS_LABELS[selectedTicket.status].color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full bg-current ${selectedTicket.status === 'open' ? 'animate-pulse' : ''}`} />
                        {STATUS_LABELS[selectedTicket.status].label}
                        <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${showStatusDropdown ? 'rotate-180' : ''}`} />
                      </button>
                      {showStatusDropdown && (
                        <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-1 z-30 animate-in fade-in zoom-in duration-200">
                          {(['open', 'pending', 'closed'] as const).map((s) => (
                            <button
                              key={s}
                              onClick={() => handleChangeStatus(s)}
                              className={`w-full text-left px-4 py-3 text-[11px] font-black uppercase tracking-widest hover:bg-zinc-800 rounded-xl flex items-center gap-3 transition-colors ${STATUS_LABELS[s].color}`}
                            >
                              <span className="w-4 h-4 flex items-center justify-center">
                                {s === 'open' && <AlertCircle className="w-4 h-4" />}
                                {s === 'pending' && <Clock className="w-4 h-4" />}
                                {s === 'closed' && <CheckCircle2 className="w-4 h-4" />}
                              </span>
                              {STATUS_LABELS[s].label}
                              {selectedTicket.status === s && <div className="ml-auto w-1.5 h-1.5 bg-current rounded-full" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => setSelectedTicket(null)}
                      className="p-2.5 text-zinc-500 hover:text-white hover:bg-zinc-800/80 rounded-2xl transition-all border border-transparent hover:border-zinc-700"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Descripción original */}
                {selectedTicket.descripcion && (
                  <div className="mt-6 p-5 bg-zinc-950/40 border border-zinc-800/50 rounded-2xl relative group">
                    <div className="absolute -top-2.5 left-4 px-2 py-0.5 bg-zinc-900 border border-zinc-800/50 rounded text-[9px] font-black text-zinc-500 uppercase tracking-widest">Iniciador del Ticket</div>
                    <p className="text-[14px] text-zinc-300 font-medium leading-relaxed whitespace-pre-wrap">{selectedTicket.descripcion}</p>
                  </div>
                )}
              </div>

              {/* Chat Historico */}
              <div className="flex-1 px-8 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent space-y-6">
                {messagesLoading ? (
                  <div className="py-20 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-orange-500 opacity-50" />
                    <p className="text-[11px] font-black text-zinc-600 uppercase tracking-widest mt-4">Cargando Mensajes</p>
                  </div>
                ) : messagesError ? (
                  <div className="p-6 text-sm font-bold text-red-500 bg-red-500/5 border border-red-500/10 rounded-2xl">{messagesError}</div>
                ) : messages.length === 0 ? (
                  <div className="py-20 text-center border-2 border-dashed border-zinc-800/50 rounded-[2rem]">
                    <MessageSquare className="w-12 h-12 mx-auto text-zinc-800 mb-4" />
                    <p className="text-sm font-black text-zinc-600 uppercase tracking-widest">Sin Actividad Reciente</p>
                    <p className="text-xs text-zinc-500 mt-1">Escribe la primera respuesta oficial</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {messages.map((m) => {
                      const isAdminMessage = m.user_id !== selectedTicket.user_id;
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isAdminMessage ? 'items-end' : 'items-start'}`}
                        >
                          <div
                            className={`max-w-[85%] p-5 rounded-[1.8rem] shadow-xl relative transition-all duration-300 hover:scale-[1.01] ${
                              m.is_internal
                                ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-500/90 rounded-br-none'
                                : isAdminMessage
                                ? 'bg-zinc-800/80 border border-zinc-700/50 text-white rounded-br-none shadow-black/30'
                                : 'bg-zinc-950/80 border border-zinc-800/50 text-zinc-200 rounded-bl-none shadow-black/20'
                            }`}
                          >
                            <div className={`flex items-center gap-3 mb-2 pb-2 border-b ${
                              m.is_internal ? 'border-yellow-500/10' : isAdminMessage ? 'border-zinc-700/30' : 'border-zinc-800/30'
                            }`}>
                              <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black uppercase ${
                                isAdminMessage ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400'
                              }`}>
                                {m.is_internal ? <Lock className="w-3.5 h-3.5" /> : isAdminMessage ? 'A' : 'C'}
                              </div>
                              <span className={`text-[10px] font-black uppercase tracking-widest ${
                                m.is_internal ? 'text-yellow-500' : isAdminMessage ? 'text-orange-500' : 'text-zinc-500'
                              }`}>
                                {isAdminMessage ? 'Staff' : m.user_nombre || 'Cliente'}
                              </span>
                              <span className="text-[9px] font-bold text-zinc-600 ml-auto tabular-nums">
                                {formatDateShort(m.created_at)}
                              </span>
                            </div>
                            <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap">{m.content}</p>
                            
                            {m.is_internal && (
                              <div className="mt-3 flex items-center gap-2 text-[9px] font-black uppercase text-yellow-500/60 tracking-widest bg-yellow-500/5 px-2 py-1 rounded-md w-fit">
                                <Lock className="w-3 h-3" />
                                Nota confidencial
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Responder */}
              <div className="p-8 border-t border-zinc-800/50 bg-zinc-900/60 relative z-20">
                <div className="flex flex-col gap-5">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <div className={`w-10 h-6 rounded-full p-1 transition-colors relative ${isInternal ? 'bg-yellow-500/20 border border-yellow-500/30' : 'bg-zinc-800 border border-zinc-700'}`}>
                        <input
                          type="checkbox"
                          checked={isInternal}
                          onChange={(e) => setIsInternal(e.target.checked)}
                          className="hidden"
                        />
                        <div className={`w-4 h-4 rounded-full shadow-lg transition-transform duration-300 ${isInternal ? 'translate-x-4 bg-yellow-500' : 'bg-zinc-500'}`} />
                      </div>
                      <div className="flex flex-col">
                        <span className={`text-[11px] font-black uppercase tracking-widest ${isInternal ? 'text-yellow-500' : 'text-zinc-400'}`}>
                          Modo Interno
                        </span>
                        <span className="text-[9px] font-bold text-zinc-600 uppercase tracking-tighter">Solo visible para administradores</span>
                      </div>
                    </label>
                    
                    <button
                      onClick={handleSendReply}
                      disabled={!reply.trim() || sending}
                      className={`
                        min-w-[140px] px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-[0.1em] flex items-center justify-center gap-3 transition-all duration-300 shadow-2xl active:scale-95
                        ${isInternal 
                          ? 'bg-yellow-500 text-black hover:bg-yellow-400' 
                          : 'bg-orange-500 text-white hover:bg-orange-400 shadow-orange-500/20 hover:shadow-orange-500/40 disabled:bg-zinc-800 disabled:text-zinc-600 disabled:shadow-none'
                        }
                      `}
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      {sending ? 'Enviando...' : 'Responder'}
                    </button>
                  </div>

                  <div className="relative group">
                    <textarea
                      value={reply}
                      onChange={(e) => setReply(e.target.value)}
                      placeholder={isInternal ? 'Escribir reporte interno confidencial...' : 'Redactar respuesta oficial para el cliente...'}
                      rows={3}
                      className={`
                        w-full px-6 py-4 bg-zinc-950/80 border rounded-3xl text-[15px] text-zinc-100 placeholder-zinc-700 transition-all duration-300 outline-none resize-none font-medium
                        ${isInternal ? 'focus:border-yellow-500/50 border-yellow-500/20' : 'focus:border-orange-500/50 border-zinc-800'}
                      `}
                    />
                    <div className="absolute bottom-4 right-6 text-[10px] font-black text-zinc-700 uppercase tracking-widest pointer-events-none">
                      {reply.length} caracteres
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
