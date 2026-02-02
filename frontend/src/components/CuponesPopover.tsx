import { useState, useRef, useEffect } from "react";
import { CuponIcon } from "./Icons";
import { useCuponesActivos } from "../hooks/useCuponesActivos";
import { HeaderDropdown } from "./HeaderDropdown";

export default function CuponesPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { cupones: cuponesActivos } = useCuponesActivos();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative overflow-visible" ref={dropdownRef}>
      {/* Cupones Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-colors duration-150 ${
          cuponesActivos.length > 0
            ? "text-green-500 hover:text-green-400 hover:bg-green-950/30"
            : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
        }`}
        aria-label="Ver cupones activos"
      >
        <CuponIcon className="w-5 h-5" />
        {cuponesActivos.length > 0 && (
          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-zinc-900 flex items-center justify-center">
            <span className="text-xs font-bold text-white">{cuponesActivos.length}</span>
          </div>
        )}
      </button>

      {/* Cupones Popover */}
      <HeaderDropdown
        isOpen={isOpen}
        width="w-72"
        align="center"
        title="Cupones Activos"
        icon={<CuponIcon className="w-4 h-4" />}
        onClose={() => setIsOpen(false)}
      >
        {cuponesActivos.length > 0 ? (
          <div className="space-y-2 max-h-96 overflow-y-auto px-4 pt-3">
            {cuponesActivos.map((cupon) => (
              <div
                key={cupon.id}
                className="p-3 rounded-lg bg-green-500/10 hover:bg-green-500/20 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <code className="text-xs font-mono bg-green-500/20 px-2 py-1 rounded text-green-400">
                        {cupon.codigo}
                      </code>
                      <span className="text-xs font-semibold text-green-400">
                        {cupon.tipo === "porcentaje"
                          ? `${cupon.valor}%`
                          : `$${cupon.valor.toLocaleString()}`}
                      </span>
                    </div>
                    {cupon.limite_uso && (
                      <p className="text-xs text-zinc-400">
                        Usos: {cupon.usos_actuales || 0} / {cupon.limite_uso}
                      </p>
                    )}
                    {cupon.fecha_expiracion && (
                      <p className="text-xs text-zinc-500">
                        Expira: {new Date(cupon.fecha_expiracion).toLocaleDateString("es-ES")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-6 px-4">
            <CuponIcon className="w-8 h-8 text-zinc-400 mx-auto mb-2" />
            <p className="text-xs text-zinc-400">
              No hay cupones activos disponibles.
            </p>
          </div>
        )}
      </HeaderDropdown>
    </div>
  );
}
