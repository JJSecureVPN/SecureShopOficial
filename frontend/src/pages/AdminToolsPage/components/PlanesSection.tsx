import { useState, useEffect } from "react";
import { AlertCircle, Edit2, Save, X, Loader2 } from "lucide-react";

interface Plan {
  id: number;
  nombre: string;
  descripcion: string;
  precio: number;
  max_users?: number;
  dias?: number;
  account_type?: "credit" | "validity";
  connection_limit?: number;
  activo?: boolean;
}

interface PlanEditState {
  id: number;
  precio: number;
  nombre: string;
}

interface PlanesSectionProps {
  tipo: "normales" | "revendedores";
  onPlanesUpdated?: () => void;
}

export function PlanesSection({ tipo, onPlanesUpdated }: PlanesSectionProps) {
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValues, setEditValues] = useState<PlanEditState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadPlanes();
  }, [tipo]);

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const loadPlanes = async () => {
    try {
      setLoading(true);
      const endpoint = tipo === "revendedores" ? "/planes-revendedores" : "/planes";
      const response = await fetch(`/api${endpoint}`, { method: "GET" });
      const data = await response.json();

      if (data.success) {
        setPlanes(data.data || []);
      } else {
        setError("Error al cargar planes");
      }
    } catch (err) {
      console.error("Error loading planes:", err);
      setError("Error al cargar planes");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (plan: Plan) => {
    setEditingId(plan.id);
    setEditValues({
      id: plan.id,
      precio: plan.precio,
      nombre: plan.nombre,
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues(null);
  };

  const handleSave = async () => {
    if (!editValues) return;

    try {
      setSaving(true);
      setError(null);

      const response = await fetch(`/api/planes${tipo === "revendedores" ? "-revendedores" : ""}/actualizar`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editValues.id,
          precio: Number(editValues.precio),
          nombre: editValues.nombre,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`Plan "${editValues.nombre}" actualizado a $${editValues.precio}`);
        setEditingId(null);
        setEditValues(null);
        loadPlanes();
        onPlanesUpdated?.();
      } else {
        setError(data.error || "Error al actualizar plan");
      }
    } catch (err) {
      console.error("Error saving plan:", err);
      setError("Error al guardar cambios");
    } finally {
      setSaving(false);
    }
  };

  const getPlanLabel = (plan: Plan) => {
    if (tipo === "revendedores") {
      const label = plan.account_type === "credit" ? "créditos" : "usuarios";
      return `${plan.max_users} ${label}`;
    }
    return `${plan.connection_limit} disp. × ${plan.dias}d`;
  };

  // Agrupar planes por días (solo para planes normales)
  const planesPorDias = tipo === "normales" 
    ? planes.reduce((acc, plan) => {
        const dias = plan.dias || 0;
        if (!acc[dias]) {
          acc[dias] = [];
        }
        acc[dias].push(plan);
        return acc;
      }, {} as Record<number, Plan[]>)
    : {};

  // Ordenar las claves de días de forma ascendente
  const diasOrdenados = tipo === "normales" 
    ? Object.keys(planesPorDias).map(Number).sort((a, b) => a - b)
    : [];

  // Agrupar planes de revendedor por tipo de cuenta
  const planesPorTipo = tipo === "revendedores"
    ? planes.reduce((acc, plan) => {
        const tipoKey = plan.account_type || "otro";
        if (!acc[tipoKey]) {
          acc[tipoKey] = [];
        }
        acc[tipoKey].push(plan);
        return acc;
      }, {} as Record<string, Plan[]>)
    : {};

  // Ordenar tipos: créditos primero, luego validez, luego otros
  const tiposOrdenados = tipo === "revendedores"
    ? Object.keys(planesPorTipo).sort((a, b) => {
        const order = { credit: 0, validity: 1, otro: 2 };
        return (order[a as keyof typeof order] || 2) - (order[b as keyof typeof order] || 2);
      })
    : [];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 bg-zinc-900/20 rounded-3xl border border-zinc-800/50 backdrop-blur-sm">
        <div className="relative">
          <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
          <div className="absolute inset-0 blur-xl bg-orange-500/20 animate-pulse" />
        </div>
        <span className="mt-4 text-zinc-400 font-medium tracking-wide">Sincronizando planes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Mensajes */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-500/5 border border-red-500/20 rounded-2xl backdrop-blur-md">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          <p className="text-sm font-medium text-red-400/90">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-center gap-3 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl backdrop-blur-md">
          <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-[10px] text-zinc-950 font-bold">✓</div>
          <p className="text-sm font-medium text-emerald-400/90">{success}</p>
        </div>
      )}

      {/* Tabla de planes */}
      <div className="space-y-8">
        {tipo === "normales" && diasOrdenados.length > 0 ? (
          diasOrdenados.map((dias) => (
            <div key={dias} className="group overflow-hidden border border-zinc-800/50 rounded-3xl bg-zinc-900/30 backdrop-blur-xl shadow-xl shadow-black/20 transition-all hover:border-zinc-700/50">
              <div className="bg-gradient-to-r from-zinc-800/50 to-transparent px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-orange-500 rounded-full" />
                  <h4 className="text-lg font-bold text-white tracking-tight">
                    Planes de <span className="text-orange-500">{dias} día{dias !== 1 ? 's' : ''}</span>
                  </h4>
                </div>
                <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
                  {planesPorDias[dias]?.length} Variantes
                </div>
              </div>
              <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-zinc-800/30 bg-zinc-900/20">
                      <th className="px-6 py-4 text-left text-[11px] font-black text-zinc-500 uppercase tracking-widest">Servicio</th>
                      <th className="px-6 py-4 text-left text-[11px] font-black text-zinc-500 uppercase tracking-widest">Especificaciones</th>
                      <th className="px-6 py-4 text-right text-[11px] font-black text-zinc-500 uppercase tracking-widest">Inversión</th>
                      <th className="px-6 py-4 text-right text-[11px] font-black text-zinc-500 uppercase tracking-widest">Gestión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/30">
                    {planesPorDias[dias]?.map((plan) => (
                      <tr key={plan.id} className="group/row transition-colors hover:bg-white/[0.02]">
                        <td className="px-6 py-5">
                          <div className="text-zinc-100 font-bold tracking-tight mb-0.5">{plan.nombre}</div>
                          <div className="text-xs text-zinc-500 font-medium">{plan.descripcion}</div>
                        </td>
                        <td className="px-6 py-5">
                          <span className="px-3 py-1 bg-orange-500/10 text-orange-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-orange-500/20">
                            {getPlanLabel(plan)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          {editingId === plan.id ? (
                            <div className="inline-flex items-center gap-2 bg-zinc-950 border border-orange-500/50 rounded-xl px-3 py-1.5">
                              <span className="text-orange-500 font-bold">$</span>
                              <input
                                type="number"
                                value={editValues?.precio || ""}
                                onChange={(e) =>
                                  setEditValues((prev) => ({
                                    ...prev!,
                                    precio: Number(e.target.value),
                                  }))
                                }
                                className="w-20 bg-transparent border-none focus:ring-0 text-white font-bold text-right p-0 outline-none"
                              />
                            </div>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="text-lg font-black text-white lining-nums tracking-tighter">
                                ${plan.precio.toLocaleString("es-AR")}
                              </span>
                              <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter mt-[-2px]">
                                Pesos ARS
                              </span>
                            </div>
                          )}
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex justify-end gap-2">
                            {editingId === plan.id ? (
                              <>
                                <button
                                  onClick={handleSave}
                                  disabled={saving}
                                  className="flex items-center justify-center p-2.5 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
                                >
                                  {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={handleCancel}
                                  className="flex items-center justify-center p-2.5 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 hover:text-white transition-all active:scale-95"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleEdit(plan)}
                                className="flex items-center justify-center p-2.5 bg-zinc-800/50 text-zinc-400 rounded-xl hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 group-hover/row:scale-110 active:scale-95"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : tipo === "revendedores" && tiposOrdenados.length > 0 ? (
          tiposOrdenados.map((tipoKey) => {
            const labelTipo = tipoKey === "credit" ? "Planes por Créditos" : tipoKey === "validity" ? "Planes por Validez" : "Otros Planes";
            const colorTipo = tipoKey === "credit" ? "text-orange-400" : tipoKey === "validity" ? "text-emerald-400" : "text-zinc-400";
            const borderTipo = tipoKey === "credit" ? "border-orange-500/30" : tipoKey === "validity" ? "border-emerald-500/30" : "border-zinc-800/30";
            const bgTipo = tipoKey === "credit" ? "bg-orange-500" : tipoKey === "validity" ? "bg-emerald-500" : "bg-zinc-500";
            
            return (
              <div key={tipoKey} className={`group overflow-hidden border ${borderTipo} rounded-3xl bg-zinc-900/30 backdrop-blur-xl shadow-xl shadow-black/20 transition-all`}>
                <div className="bg-gradient-to-r from-zinc-800/50 to-transparent px-6 py-4 border-b border-zinc-800/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-8 ${bgTipo} rounded-full`} />
                    <h4 className={`text-lg font-bold ${colorTipo} tracking-tight`}>
                      {labelTipo}
                    </h4>
                  </div>
                  <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest bg-zinc-950/50 px-3 py-1.5 rounded-full border border-zinc-800/50">
                    {planesPorTipo[tipoKey]?.length} Planes
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-zinc-800/30 bg-zinc-900/20">
                        <th className="px-6 py-4 text-left text-[11px] font-black text-zinc-500 uppercase tracking-widest">Paquete Comercial</th>
                        <th className="px-6 py-4 text-left text-[11px] font-black text-zinc-500 uppercase tracking-widest">Atributos</th>
                        <th className="px-6 py-4 text-right text-[11px] font-black text-zinc-500 uppercase tracking-widest">Costo</th>
                        <th className="px-6 py-4 text-right text-[11px] font-black text-zinc-500 uppercase tracking-widest">Ajustes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/30">
                      {planesPorTipo[tipoKey]?.map((plan) => (
                        <tr key={plan.id} className="group/row transition-colors hover:bg-white/[0.02]">
                          <td className="px-6 py-5">
                            <div className="text-zinc-100 font-bold tracking-tight">{plan.nombre}</div>
                          </td>
                          <td className="px-6 py-5">
                            <span className={`px-3 py-1 ${tipoKey === 'credit' ? 'bg-orange-500/10 text-orange-400' : 'bg-emerald-500/10 text-emerald-400'} text-[10px] font-black uppercase tracking-wider rounded-lg border border-white/5`}>
                              {getPlanLabel(plan)}
                            </span>
                          </td>
                          <td className="px-6 py-5 text-right">
                            {editingId === plan.id ? (
                              <div className="inline-flex items-center gap-2 bg-zinc-950 border border-orange-500/50 rounded-xl px-3 py-1.5">
                                <span className="text-orange-500 font-bold">$</span>
                                <input
                                  type="number"
                                  value={editValues?.precio || ""}
                                  onChange={(e) =>
                                    setEditValues((prev) => ({
                                      ...prev!,
                                      precio: Number(e.target.value),
                                    }))
                                  }
                                  className="w-20 bg-transparent border-none focus:ring-0 text-white font-bold text-right p-0 outline-none"
                                />
                              </div>
                            ) : (
                              <div className="flex flex-col items-end">
                                <span className="text-lg font-black text-white lining-nums">
                                  ${plan.precio.toLocaleString("es-AR")}
                                </span>
                                <span className="text-[9px] font-black text-zinc-600 uppercase tracking-tighter mt-[-2px]">
                                  Pesos ARS
                                </span>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex justify-end gap-2">
                              {editingId === plan.id ? (
                                <>
                                  <button
                                    onClick={handleSave}
                                    disabled={saving}
                                    className="p-2.5 bg-orange-500 text-white rounded-xl shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition-all active:scale-95 disabled:opacity-50"
                                  >
                                    {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                  </button>
                                  <button
                                    onClick={handleCancel}
                                    className="p-2.5 bg-zinc-800 text-zinc-400 rounded-xl hover:bg-zinc-700 hover:text-white transition-all active:scale-95"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => handleEdit(plan)}
                                  className="p-2.5 bg-zinc-800/50 text-zinc-400 rounded-xl hover:bg-orange-500 hover:text-white hover:shadow-lg hover:shadow-orange-500/20 transition-all duration-300 active:scale-95"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-20 bg-zinc-900/20 rounded-3xl border border-zinc-800/50 border-dashed">
            <p className="text-zinc-500 font-medium">No se encontraron planes configurados</p>
          </div>
        )}
      </div>
    </div>
  );
}
