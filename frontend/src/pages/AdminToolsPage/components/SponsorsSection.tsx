import { FormEvent, useState } from "react";
import { Trash2, Plus, Edit2, Check, X, Loader2 } from "lucide-react";
import {
  Sponsor,
  CrearSponsorPayload,
  ActualizarSponsorPayload,
} from "../../../types";

interface SponsorFormState {
  name: string;
  category: "empresa" | "persona";
  role: string;
  message: string;
  avatarInitials: string;
  highlight: boolean;
  link: string;
  avatarColor: string;
  avatarUrl: string;
}

interface SponsorsSectionProps {
  sponsors: Sponsor[];
  loading: boolean;
  onCreate: (payload: CrearSponsorPayload) => Promise<void>;
  onDelete: (sponsorId: number) => Promise<void>;
  onUpdate: (id: number, payload: ActualizarSponsorPayload) => Promise<void>;
  success: string | null;
  error: string | null;
}

const AVATAR_COLORS = [
  "bg-gradient-to-br from-orange-500/20 via-orange-600/30 to-orange-500/40 text-orange-100 border border-orange-500/20",
  "bg-gradient-to-br from-zinc-700/30 via-zinc-800/40 to-zinc-900/40 text-zinc-100 border border-zinc-700/20",
  "bg-gradient-to-br from-blue-500/20 via-blue-600/30 to-cyan-500/40 text-blue-100 border border-blue-500/20",
  "bg-gradient-to-br from-emerald-500/20 via-emerald-600/30 to-teal-500/40 text-emerald-100 border border-emerald-500/20",
  "bg-gradient-to-br from-rose-500/20 via-rose-600/30 to-rose-700/40 text-rose-100 border border-rose-500/20",
  "bg-gradient-to-br from-violet-500/20 via-violet-600/30 to-fuchsia-500/40 text-violet-100 border border-violet-500/20",
];

const INITIAL_FORM: SponsorFormState = {
  name: "",
  category: "empresa",
  role: "",
  message: "",
  avatarInitials: "",
  highlight: false,
  link: "",
  avatarColor: AVATAR_COLORS[0],
  avatarUrl: "",
};

export default function SponsorsSection({
  sponsors,
  loading,
  onCreate,
  onDelete,
  onUpdate,
  success,
  error,
}: SponsorsSectionProps) {
  const [form, setForm] = useState<SponsorFormState>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!form.name || !form.role || !form.message) {
      alert("Por favor completa todos los campos requeridos");
      return;
    }
    setIsSubmitting(true);
    try {
      const fallbackInitials = form.avatarInitials
        ? form.avatarInitials
        : form.name
            .trim()
            .split(/\s+/)
            .filter(Boolean)
            .slice(0, 2)
            .map((segment) => segment[0]!.toUpperCase())
            .join("")
            .slice(0, 2);

      const payload: CrearSponsorPayload = {
        name: form.name,
        category: form.category,
        role: form.role,
        message: form.message,
        avatarInitials: fallbackInitials,
        avatarClass: form.avatarColor,
        avatarUrl: form.avatarUrl || undefined,
        highlight: form.highlight,
        link: form.link || undefined,
      };

      if (editingId !== null) {
        await onUpdate(editingId, payload);
        setEditingId(null);
      } else {
        await onCreate(payload);
      }

      setForm(INITIAL_FORM);
      setShowForm(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (sponsor: Sponsor) => {
    setForm({
      name: sponsor.name,
      category: sponsor.category,
      role: sponsor.role,
      message: sponsor.message,
      avatarInitials: sponsor.avatarInitials,
      highlight: sponsor.highlight || false,
      link: sponsor.link || "",
      avatarColor: sponsor.avatarClass,
      avatarUrl: sponsor.avatarUrl || "",
    });
    setEditingId(sponsor.id);
    setShowForm(true);
  };

  const handleCancel = () => {
    setForm(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const highlightedCount = sponsors.filter((s) => s.highlight).length;
  const companyCount = sponsors.filter((s) => s.category === "empresa").length;

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Stats modernizadas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="relative group overflow-hidden rounded-[2rem] bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-6 transition-all duration-300 hover:border-orange-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-orange-500/20 transition-all" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Membresía Total</p>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-4xl font-black text-white">{sponsors.length}</p>
            <span className="text-xs font-bold text-zinc-500 uppercase">Activos</span>
          </div>
        </div>

        <div className="relative group overflow-hidden rounded-[2rem] bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-6 transition-all duration-300 hover:border-blue-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-blue-500/20 transition-all" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Alianzas Corporativas</p>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-4xl font-black text-blue-400">{companyCount}</p>
            <span className="text-xs font-bold text-zinc-500 uppercase">Empresas</span>
          </div>
        </div>

        <div className="relative group overflow-hidden rounded-[2rem] bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 p-6 transition-all duration-300 hover:border-amber-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 blur-[60px] rounded-full translate-x-1/2 -translate-y-1/2 group-hover:bg-amber-500/20 transition-all" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Menciones Especiales</p>
          <div className="mt-4 flex items-baseline gap-2">
            <p className="text-4xl font-black text-amber-400">{highlightedCount}</p>
            <span className="text-xs font-bold text-zinc-500 uppercase">Destacados</span>
          </div>
        </div>
      </div>

      {/* Messages */}
      {(success || error) && (
        <div className={`p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 ${
          success ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400" : "bg-red-500/5 border-red-500/20 text-red-400"
        }`}>
          {success ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
          <span className="text-sm font-bold tracking-tight">{success || error}</span>
        </div>
      )}

      {/* Add Button & Form Section */}
      <div className="bg-zinc-950/30 backdrop-blur-md rounded-[2.5rem] border border-zinc-800/50 overflow-hidden shadow-2xl">
        {!showForm ? (
          <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-md">
              <h3 className="text-lg font-black text-white tracking-tight uppercase">Gestión de Sponsors</h3>
              <p className="text-sm text-zinc-500 font-medium mt-1">Administra las marcas y personas que apoyan el proyecto visualmente.</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-orange-500 text-white font-black text-xs uppercase tracking-widest hover:bg-orange-400 transition-all shadow-xl shadow-orange-500/20 active:scale-95 shrink-0"
            >
              <Plus className="w-5 h-5" />
              Nuevo Sponsor
            </button>
          </div>
        ) : (
          <div className="p-8 md:p-10">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center">
                <Plus className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                  {editingId !== null ? "Editar Colaborador" : "Registrar nuevo Sponsor"}
                </h3>
                <p className="text-sm text-zinc-500 font-medium">Completa la información visual del patrocinador.</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Nombre Comercial *</label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-[1.2rem] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50 placeholder-zinc-700 font-medium transition-all"
                    placeholder="Escribe el nombre aquí"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Clasificación *</label>
                  <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-[1.2rem]">
                    {(["empresa", "persona"] as const).map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => setForm({ ...form, category: cat })}
                        className={`flex-1 py-2.5 rounded-xl text-[11px] font-black uppercase tracking-tighter transition-all ${
                          form.category === cat ? "bg-zinc-800 text-white shadow-lg" : "text-zinc-600 hover:text-zinc-400"
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Iniciales (Placeholder)</label>
                  <input
                    type="text"
                    value={form.avatarInitials}
                    onChange={(e) => setForm({ ...form, avatarInitials: e.target.value.toUpperCase().slice(0, 2) })}
                    className="w-full px-5 py-3.5 rounded-[1.2rem] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50 placeholder-zinc-700 font-medium transition-all"
                    placeholder="ej: AM"
                    maxLength={2}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Lema o Función *</label>
                  <input
                    type="text"
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-[1.2rem] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50 placeholder-zinc-700 font-medium transition-all"
                    placeholder="ej: Monitoreo Regional Argentino"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Enlace Web</label>
                  <input
                    type="url"
                    value={form.link}
                    onChange={(e) => setForm({ ...form, link: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-[1.2rem] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50 placeholder-zinc-700 font-medium transition-all"
                    placeholder="https://ejemplo.com"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Punto de Destello</label>
                  <select
                    value={form.avatarColor}
                    onChange={(e) => setForm({ ...form, avatarColor: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-[1.2rem] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50 font-medium transition-all appearance-none cursor-pointer"
                  >
                    {AVATAR_COLORS.map((color, idx) => (
                      <option key={idx} value={color} className="bg-zinc-950">
                        Color {idx + 1} del sistema
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Representación Gráfica (URL del Logo)</label>
                  <input
                    type="url"
                    value={form.avatarUrl}
                    onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-[1.2rem] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50 placeholder-zinc-700 font-medium transition-all"
                    placeholder="URL directa de la imagen (HTTPS preferiblemente)"
                  />
                </div>

                <div className="flex items-end pb-1 px-1">
                  <label className="flex items-center gap-4 cursor-pointer group">
                    <div className={`w-10 h-6 rounded-full p-1 transition-all relative ${form.highlight ? 'bg-orange-500' : 'bg-zinc-800 border border-zinc-700'}`}>
                      <input
                        type="checkbox"
                        checked={form.highlight}
                        onChange={(e) => setForm({ ...form, highlight: e.target.checked })}
                        className="hidden"
                      />
                      <div className={`w-4 h-4 rounded-full shadow-lg transition-transform duration-300 ${form.highlight ? 'translate-x-4 bg-white' : 'bg-zinc-500'}`} />
                    </div>
                    <span className={`text-[11px] font-black uppercase tracking-widest ${form.highlight ? 'text-orange-500' : 'text-zinc-500'}`}>Destacar en Web</span>
                  </label>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Contenido de Muestra (Mensaje) *</label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full px-5 py-4 rounded-[1.5rem] bg-zinc-900 border border-zinc-800 text-white focus:outline-none focus:border-orange-500/50 placeholder-zinc-700 font-medium transition-all resize-none"
                  placeholder="Describe la propuesta de valor o mensaje del sponsor..."
                  rows={4}
                />
              </div>

              {form.avatarUrl && (
                <div className="p-6 bg-zinc-900/50 border border-zinc-800/50 rounded-[2rem] flex items-center gap-6 animate-in zoom-in-95 duration-500">
                  <img
                    src={form.avatarUrl}
                    alt={form.name || "Preview"}
                    className="h-24 w-24 rounded-3xl object-cover border-4 border-zinc-800 shadow-2xl"
                  />
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Previsualización de Identidad</p>
                    <p className="text-sm text-zinc-400 font-bold mt-1">Así lucirá el logotipo principal en la sección de donadores.</p>
                  </div>
                </div>
              )}

              <div className="flex gap-4 pt-4 border-t border-zinc-800/50">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-orange-500 hover:bg-orange-400 disabled:bg-zinc-800 disabled:text-zinc-600 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-500/20 active:scale-95"
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  {editingId !== null ? "Confirmar Cambios" : "Validar y Publicar"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-8 py-4 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-black text-xs uppercase tracking-widest transition-all hover:text-white"
                >
                  Descartar
                </button>
              </div>
            </form>
          </div>
        )}
      </div>

      {/* Listado Refinado */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] px-2 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.6)]" />
             Sponsors Inscritos ({sponsors.length})
          </h3>
        </div>
        
        {loading ? (
          <div className="py-20 text-center animate-pulse">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-orange-500 opacity-20" />
            <p className="text-[11px] font-black text-zinc-600 uppercase mt-4 tracking-widest">Sincronizando Base de Datos</p>
          </div>
        ) : sponsors.length === 0 ? (
          <div className="py-20 text-center rounded-[3rem] border-2 border-dashed border-zinc-800/50">
            <p className="text-sm font-black text-zinc-600 uppercase tracking-widest">Lista Vacía</p>
            <p className="text-xs text-zinc-500 mt-2">Aún no se han registrado patrocinadores oficiales.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sponsors.map((sponsor) => (
              <div
                key={sponsor.id}
                className="group relative flex items-start gap-5 p-6 rounded-[2.2rem] bg-zinc-900/40 backdrop-blur-xl border border-zinc-800/50 hover:bg-zinc-800/40 transition-all duration-500 hover:border-orange-500/20 shadow-lg shadow-black/20"
              >
                <div className="relative shrink-0">
                  {sponsor.avatarUrl ? (
                    <img
                      src={sponsor.avatarUrl}
                      alt={sponsor.name}
                      className="h-16 w-16 rounded-[1.3rem] object-cover border-2 border-zinc-800 group-hover:border-orange-500/30 transition-all shadow-xl"
                    />
                  ) : (
                    <div className={`flex h-16 w-16 items-center justify-center rounded-[1.3rem] text-xl font-black shadow-xl group-hover:scale-105 transition-all ${sponsor.avatarClass}`}>
                      {sponsor.avatarInitials}
                    </div>
                  )}
                  {sponsor.highlight && (
                    <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center shadow-lg animate-bounce border-2 border-zinc-900">
                      <Plus className="w-3 h-3 text-white rotate-45" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h4 className="text-[17px] font-black text-white tracking-tight truncate group-hover:text-orange-400 transition-colors">{sponsor.name}</h4>
                    <span className="px-2 py-0.5 rounded-lg bg-zinc-950/50 border border-zinc-800/50 text-[9px] font-black text-zinc-500 uppercase tracking-widest">
                      {sponsor.category}
                    </span>
                  </div>
                  <p className="text-[11px] font-black text-orange-500 uppercase tracking-widest mt-1 opacity-80">{sponsor.role}</p>
                  <p className="text-xs text-zinc-400 font-medium mt-3 leading-relaxed line-clamp-2 italic">"{sponsor.message}"</p>
                </div>

                <div className="absolute top-4 right-4 flex gap-2 translate-x-4 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    onClick={() => handleEdit(sponsor)}
                    className="w-10 h-10 rounded-2xl bg-zinc-800/80 hover:bg-zinc-700 flex items-center justify-center text-zinc-400 hover:text-white transition-all shadow-xl border border-zinc-700/50"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={async () => {
                      setDeletingId(sponsor.id);
                      try {
                        await onDelete(sponsor.id);
                      } finally {
                        setDeletingId(null);
                      }
                    }}
                    disabled={deletingId === sponsor.id}
                    className="w-10 h-10 rounded-2xl bg-red-500/10 hover:bg-red-500/20 disabled:bg-red-900/40 text-red-400 hover:text-red-300 transition-all shadow-xl border border-red-500/20"
                  >
                    {deletingId === sponsor.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
