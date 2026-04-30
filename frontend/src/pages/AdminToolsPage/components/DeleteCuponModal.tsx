import { Cupon } from "../../../types";

interface DeleteCuponModalProps {
  cuponToDelete: Cupon | null;
  isDeletingCupon: boolean;
  onConfirmDelete: () => void;
  onCancel: () => void;
}

export function DeleteCuponModal({
  cuponToDelete,
  isDeletingCupon,
  onConfirmDelete,
  onCancel,
}: DeleteCuponModalProps) {
  if (!cuponToDelete) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 sm:p-10 animate-in fade-in duration-500">
      {/* Dynamic Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-3xl" onClick={onCancel} />
      
      {/* Modal Container */}
      <div 
        className="relative w-full max-w-md overflow-hidden rounded-[2.5rem] bg-zinc-950 border border-zinc-800 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 slide-in-from-bottom-10 duration-500"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Visual elements */}
        <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-orange-500/10 blur-[80px] rounded-full pointer-events-none" />
        
        <div className="p-10 relative z-10">
          <div className="mb-8 flex items-center justify-center">
             <div className="w-16 h-16 rounded-[1.5rem] bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-inner">
                <div className="w-8 h-8 rounded-full border-2 border-orange-500/30 border-t-orange-500 animate-[spin_3s_linear_infinite]" />
                <div className="absolute w-2 h-2 rounded-full bg-orange-500" />
             </div>
          </div>

          <div className="text-center space-y-4">
            <h3 className="text-2xl font-black text-white uppercase tracking-tight">Revocar Credencial</h3>
            <p className="text-sm font-medium text-zinc-500 leading-relaxed italic px-2">
              ¿Confirmas la desvinculación permanente del cupón <span className="text-orange-400 font-black not-italic">{cuponToDelete.codigo}</span> del registro central?
            </p>
          </div>

          <div className="mt-10 p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800/50">
             <div className="flex items-center gap-3 text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">
                <div className="w-1.5 h-1.5 rounded-full bg-orange-500" />
                Protocolo de Purga Automática
             </div>
             <p className="text-[11px] text-zinc-600 mt-2 font-medium leading-relaxed italic">
                Esta acción es irreversible. Se eliminarán todos los registros de uso asociados a esta credencial.
             </p>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-4">
            <button
              onClick={onCancel}
              disabled={isDeletingCupon}
              className="h-14 rounded-2xl bg-zinc-900 border border-zinc-800 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center"
            >
              Interrumpir
            </button>
            <button
              onClick={onConfirmDelete}
              disabled={isDeletingCupon}
              className="group relative h-14 rounded-2xl bg-orange-500 text-[10px] font-black uppercase tracking-widest text-white hover:bg-orange-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-3 overflow-hidden"
            >
              {isDeletingCupon ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>Ejecutar Purga</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-white opacity-40 transition-transform group-hover:scale-150" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
