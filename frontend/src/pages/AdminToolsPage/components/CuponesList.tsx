import { Cupon } from "../../../types";

// ============================================================================
// TIPOS
// ============================================================================

interface CouponStatusInfo {
  status: string;
  class: string;
}

interface CuponesListProps {
  cupones: Cupon[];
  loading?: boolean;
  onDesactivar: (cuponId: number) => void;
  onDelete: (cupon: Cupon) => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================


const COUPON_STATUS_STYLES = {
  activo: {
    status: "Operativo",
    class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  inactivo: {
    status: "Desactivado",
    class: "bg-zinc-800/50 text-zinc-500 border-zinc-700/30",
  },
  expirado: {
    status: "Vencido",
    class: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  agotado: {
    status: "Sin Cupos",
    class: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
};

function getCouponStatus(cupon: Cupon): CouponStatusInfo {
  if (!cupon.activo) return COUPON_STATUS_STYLES.inactivo;
  if (cupon.fecha_expiracion && new Date(cupon.fecha_expiracion) < new Date()) return COUPON_STATUS_STYLES.expirado;
  if (cupon.limite_uso && (cupon.usos_actuales ?? 0) >= cupon.limite_uso) return COUPON_STATUS_STYLES.agotado;
  return COUPON_STATUS_STYLES.activo;
}

function formatCouponValue(tipo: string, valor: number): string {
  return tipo === "porcentaje" ? `${valor}%` : `$${valor.toLocaleString()}`;
}

function TableHeader() {
  return (
    <thead>
      <tr className="border-b border-zinc-800/50 bg-zinc-900/40">
        <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Credencial</th>
        <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Modalidad</th>
        <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Beneficio</th>
        <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Utilización</th>
        <th className="px-6 py-5 text-left text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Vigencia</th>
        <th className="px-6 py-5 text-right text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Gestión</th>
      </tr>
    </thead>
  );
}

function CouponRow({
  cupon,
  onDesactivar,
  onDelete,
}: {
  cupon: Cupon;
  onDesactivar: (id: number) => void;
  onDelete: (cupon: Cupon) => void;
}) {
  const { status, class: statusClass } = getCouponStatus(cupon);
  const currentUsos = cupon.usos_actuales ?? 0;

  return (
    <tr className="group border-b border-zinc-800/30 hover:bg-zinc-800/20 transition-all duration-300">
      <td className="px-6 py-5">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${cupon.activo ? 'bg-orange-500' : 'bg-zinc-700'}`} />
          <span className="font-black text-[13px] uppercase tracking-wider text-white group-hover:text-orange-400 transition-colors">
            {cupon.codigo}
          </span>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className="text-xs font-bold text-zinc-400 capitalize">
          {cupon.tipo.replace("_", " ")}
        </span>
      </td>
      <td className="px-6 py-5">
        <span className="text-sm font-black text-white">
          {formatCouponValue(cupon.tipo, cupon.valor)}
        </span>
      </td>
      <td className="px-6 py-5">
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between w-24">
             <span className="text-[10px] font-black text-zinc-500 uppercase">{currentUsos} / {cupon.limite_uso || "∞"}</span>
          </div>
          <div className="w-24 h-1 bg-zinc-850 rounded-full overflow-hidden">
             <div 
               className="h-full bg-orange-500 transition-all duration-500" 
               style={{ width: cupon.limite_uso ? `${Math.min((currentUsos / cupon.limite_uso) * 100, 100)}%` : "100%" }} 
             />
          </div>
        </div>
      </td>
      <td className="px-6 py-5">
        <span className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[10px] font-black uppercase tracking-tighter shadow-sm ${statusClass}`}>
          {status}
        </span>
      </td>
      <td className="px-6 py-5 text-right">
        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
          <button
            onClick={() => onDesactivar(cupon.id)}
            disabled={!cupon.activo}
            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-orange-500 hover:bg-orange-500/5 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Suspender
          </button>
          <button
            onClick={() => onDelete(cupon)}
            className="px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-500/10 transition-all"
          >
            Revocar
          </button>
        </div>
      </td>
    </tr>
  );
}

export function CuponesList({
  cupones,
  loading = false,
  onDesactivar,
  onDelete,
}: CuponesListProps) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="flex items-center justify-between px-2">
         <h3 className="text-sm font-black text-zinc-500 uppercase tracking-[0.2em] flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            Inventario de Vales ({cupones.length})
         </h3>
         {loading && (
           <span className="text-[10px] font-black text-orange-500 uppercase tracking-widest animate-pulse">
             Sincronizando...
           </span>
         )}
      </div>

      <div className="overflow-hidden rounded-[2rem] border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl shadow-2xl">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
          <table className="w-full text-left">
            <TableHeader />
            <tbody className="divide-y divide-zinc-800/30">
              {cupones.length === 0 && !loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-20 text-center">
                    <p className="text-sm font-black text-zinc-600 uppercase tracking-widest">Base de Datos Limpia</p>
                    <p className="text-xs text-zinc-500 mt-2">No se han detectado cupones activos en el sistema.</p>
                  </td>
                </tr>
              ) : (
                cupones.map((cupon) => (
                  <CouponRow
                    key={cupon.id}
                    cupon={cupon}
                    onDesactivar={onDesactivar}
                    onDelete={onDelete}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
