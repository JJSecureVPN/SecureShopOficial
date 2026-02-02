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
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
        <span className="ml-2 text-neutral-400">Cargando planes...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Mensajes */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-300">{error}</p>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
          <div className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5">✓</div>
          <p className="text-sm text-emerald-300">{success}</p>
        </div>
      )}

      {/* Tabla de planes */}
      <div className="space-y-6">
        {tipo === "normales" && diasOrdenados.length > 0 ? (
          // Renderizar planes normales agrupados por días
          diasOrdenados.map((dias) => (
            <div key={dias} className="border border-neutral-700 rounded-lg overflow-hidden">
              <div className="bg-neutral-800/50 px-4 py-3 border-b border-neutral-700">
                <h4 className="text-sm font-semibold text-violet-400">
                  Planes de {dias} día{dias !== 1 ? 's' : ''}
                </h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-neutral-800">
                      <th className="px-4 py-3 text-left text-neutral-400 font-medium">Nombre</th>
                      <th className="px-4 py-3 text-left text-neutral-400 font-medium">Especificaciones</th>
                      <th className="px-4 py-3 text-right text-neutral-400 font-medium">Precio ARS</th>
                      <th className="px-4 py-3 text-right text-neutral-400 font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {planesPorDias[dias]?.map((plan) => (
                      <tr key={plan.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                        <td className="px-4 py-3">
                          <div className="text-neutral-200 font-medium">{plan.nombre}</div>
                          <div className="text-xs text-neutral-500">{plan.descripcion}</div>
                        </td>
                        <td className="px-4 py-3 text-neutral-400 text-xs">
                          {getPlanLabel(plan)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {editingId === plan.id ? (
                            <input
                              type="number"
                              value={editValues?.precio || ""}
                              onChange={(e) =>
                                setEditValues((prev) => ({
                                  ...prev!,
                                  precio: Number(e.target.value),
                                }))
                              }
                              className="w-32 px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-neutral-200 text-right"
                              placeholder="Precio"
                            />
                          ) : (
                            <span className="font-semibold text-neutral-100">
                              ${plan.precio.toLocaleString("es-AR")}
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right space-x-2 flex justify-end">
                          {editingId === plan.id ? (
                            <>
                              <button
                                onClick={handleSave}
                                disabled={saving}
                                className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded transition-colors"
                                title="Guardar"
                              >
                                {saving ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <Save className="w-4 h-4" />
                                )}
                              </button>
                              <button
                                onClick={handleCancel}
                                className="p-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded transition-colors"
                                title="Cancelar"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleEdit(plan)}
                              className="p-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 rounded transition-colors"
                              title="Editar"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))
        ) : tipo === "revendedores" && tiposOrdenados.length > 0 ? (
          // Renderizar planes de revendedor agrupados por tipo de cuenta
          tiposOrdenados.map((tipoKey) => {
            const labelTipo = tipoKey === "credit" ? "Planes por Créditos" : tipoKey === "validity" ? "Planes por Validez" : "Otros Planes";
            const colorTipo = tipoKey === "credit" ? "text-blue-400" : tipoKey === "validity" ? "text-emerald-400" : "text-neutral-400";
            
            return (
              <div key={tipoKey} className="border border-neutral-700 rounded-lg overflow-hidden">
                <div className="bg-neutral-800/50 px-4 py-3 border-b border-neutral-700">
                  <h4 className={`text-sm font-semibold ${colorTipo}`}>
                    {labelTipo}
                  </h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-neutral-800">
                        <th className="px-4 py-3 text-left text-neutral-400 font-medium">Nombre</th>
                        <th className="px-4 py-3 text-left text-neutral-400 font-medium">Especificaciones</th>
                        <th className="px-4 py-3 text-right text-neutral-400 font-medium">Precio ARS</th>
                        <th className="px-4 py-3 text-right text-neutral-400 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {planesPorTipo[tipoKey]?.map((plan) => (
                        <tr key={plan.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                          <td className="px-4 py-3">
                            <div className="text-neutral-200 font-medium">{plan.nombre}</div>
                          </td>
                          <td className="px-4 py-3 text-neutral-400 text-xs">
                            {getPlanLabel(plan)}
                          </td>
                          <td className="px-4 py-3 text-right">
                            {editingId === plan.id ? (
                              <input
                                type="number"
                                value={editValues?.precio || ""}
                                onChange={(e) =>
                                  setEditValues((prev) => ({
                                    ...prev!,
                                    precio: Number(e.target.value),
                                  }))
                                }
                                className="w-32 px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-neutral-200 text-right"
                                placeholder="Precio"
                              />
                            ) : (
                              <span className="font-semibold text-neutral-100">
                                ${plan.precio.toLocaleString("es-AR")}
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right space-x-2 flex justify-end">
                            {editingId === plan.id ? (
                              <>
                                <button
                                  onClick={handleSave}
                                  disabled={saving}
                                  className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded transition-colors"
                                  title="Guardar"
                                >
                                  {saving ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <Save className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={handleCancel}
                                  className="p-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded transition-colors"
                                  title="Cancelar"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleEdit(plan)}
                                className="p-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 rounded transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            )}
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
          // Renderizar tabla normal como fallback
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800">
                  <th className="px-4 py-3 text-left text-neutral-400 font-medium">Nombre</th>
                  <th className="px-4 py-3 text-left text-neutral-400 font-medium">Especificaciones</th>
                  <th className="px-4 py-3 text-right text-neutral-400 font-medium">Precio ARS</th>
                  <th className="px-4 py-3 text-right text-neutral-400 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {planes.map((plan) => (
                  <tr key={plan.id} className="border-b border-neutral-800/50 hover:bg-neutral-800/30">
                    <td className="px-4 py-3">
                      <div className="text-neutral-200 font-medium">{plan.nombre}</div>
                      <div className="text-xs text-neutral-500">{plan.descripcion}</div>
                    </td>
                    <td className="px-4 py-3 text-neutral-400 text-xs">
                      {getPlanLabel(plan)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {editingId === plan.id ? (
                        <input
                          type="number"
                          value={editValues?.precio || ""}
                          onChange={(e) =>
                            setEditValues((prev) => ({
                              ...prev!,
                              precio: Number(e.target.value),
                            }))
                          }
                          className="w-32 px-2 py-1 bg-neutral-700 border border-neutral-600 rounded text-neutral-200 text-right"
                          placeholder="Precio"
                        />
                      ) : (
                        <span className="font-semibold text-neutral-100">
                          ${plan.precio.toLocaleString("es-AR")}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2 flex justify-end">
                      {editingId === plan.id ? (
                        <>
                          <button
                            onClick={handleSave}
                            disabled={saving}
                            className="p-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded transition-colors"
                            title="Guardar"
                          >
                            {saving ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Save className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="p-2 bg-neutral-700 hover:bg-neutral-600 text-neutral-300 rounded transition-colors"
                            title="Cancelar"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(plan)}
                          className="p-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-400 rounded transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {planes.length === 0 && (
        <div className="text-center py-8 text-neutral-500">
          No hay planes disponibles
        </div>
      )}
    </div>
  );
}
