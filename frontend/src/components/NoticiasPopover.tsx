import { useState, useRef, useEffect, useMemo } from "react";
import { Bell, AlertTriangle, Info, CheckCircle, XCircle } from "lucide-react";
import { useNoticias } from "../hooks/useNoticiasDB";
import { HeaderDropdown } from "./HeaderDropdown";

export default function NoticiasPopover() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { noticias, loading } = useNoticias();

  // Obtener la noticia más importante (destacada o la más reciente)
  const noticiaImportante = useMemo(() => {
    if (!noticias || noticias.length === 0) return null;
    
    // Primero buscar destacadas
    const destacada = noticias.find(n => n.destacada && n.estado === 'publicada');
    if (destacada) return destacada;
    
    // Si no hay destacada, la más reciente publicada
    return noticias.find(n => n.estado === 'publicada') || null;
  }, [noticias]);

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

  const getIcon = () => {
    if (!noticiaImportante) return <Info className="w-4 h-4" />;

    const texto = (noticiaImportante.titulo + " " + noticiaImportante.descripcion).toLowerCase();
    if (
      texto.includes("⚠️") ||
      texto.includes("mantenimiento") ||
      texto.includes("temporalmente") ||
      texto.includes("error") ||
      texto.includes("caída")
    ) {
      return <AlertTriangle className="w-4 h-4" />;
    }
    if (
      texto.includes("✅") ||
      texto.includes("activo") ||
      texto.includes("disponible") ||
      texto.includes("solucionado")
    ) {
      return <CheckCircle className="w-4 h-4" />;
    }
    if (
      texto.includes("❌") ||
      texto.includes("desactivado") ||
      texto.includes("urgente")
    ) {
      return <XCircle className="w-4 h-4" />;
    }
    return <Info className="w-4 h-4" />;
  };

  const hasActiveNoticia = !loading && noticiaImportante !== null;

  return (
    <div className="relative overflow-visible" ref={dropdownRef}>
      {/* News Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`relative p-2 rounded-xl transition-colors duration-150 ${
          hasActiveNoticia
            ? "text-orange-500 hover:text-orange-600 hover:bg-orange-950/30"
            : "text-zinc-400 hover:text-zinc-300 hover:bg-zinc-800"
        }`}
        aria-label="Ver noticias"
      >
        <Bell size={20} />
        {hasActiveNoticia && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-zinc-900 animate-pulse" />
        )}
      </button>

      {/* News Popover */}
      <HeaderDropdown
        isOpen={isOpen}
        width="w-80"
        align="center"
        title="Noticia Importante"
        icon={getIcon()}
        onClose={() => setIsOpen(false)}
      >
        {noticiaImportante ? (
          <div className="space-y-3 px-4 pt-3">
            <div className="p-3 rounded-xl bg-white/[0.03] border border-white/[0.08] text-zinc-200">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-0.5 p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
                  {getIcon()}
                </div>
                <div className="flex-1">
                  <h3 className="text-xs font-bold text-white mb-1">
                    {noticiaImportante.titulo}
                  </h3>
                  <p className="text-[11px] leading-relaxed text-zinc-400">
                    {noticiaImportante.descripcion}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-[10px] text-zinc-500">
                      {new Date(noticiaImportante.created_at).toLocaleDateString()}
                    </span>
                    <button 
                      onClick={() => {
                        setIsOpen(false);
                        // Navegar a la página de noticias si es necesario
                      }}
                      className="text-[10px] font-semibold text-orange-400 hover:text-orange-300"
                    >
                      Leer más
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 px-4">
            <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-3">
              <Info className="w-5 h-5 text-zinc-500" />
            </div>
            <p className="text-xs text-zinc-400">
              No hay noticias importantes en este momento.
            </p>
          </div>
        )}
      </HeaderDropdown>
    </div>
  );
}
