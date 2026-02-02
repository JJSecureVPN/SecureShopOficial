import { useEffect } from 'react'
import { X } from 'lucide-react'

type Props = {
  open: boolean
  title?: string
  htmlPreviewUrl?: string | null
  loading?: boolean
  onClose: () => void
}

export default function HtmlPreviewModal({ 
  open, 
  title = 'Previsualizar HTML', 
  htmlPreviewUrl, 
  loading, 
  onClose 
}: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    
    if (open) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = 'unset'
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200 hide-scrollbar">
      {/* Backdrop con blur */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
        aria-hidden="true"
      />
      
      {/* Contenedor del modal */}
      <div className="relative w-full max-w-6xl max-h-[95vh] bg-white rounded-xl shadow-2xl flex flex-col animate-in zoom-in-95 duration-200">
        
        {/* Header mejorado */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white rounded-t-xl">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Cerrar modal"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Contenido principal */}
        <div className="flex-1 overflow-auto min-h-0 bg-gray-50 hide-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin" />
                <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-blue-300 rounded-full animate-spin animation-delay-150" />
              </div>
              <p className="text-sm text-gray-600 font-medium">Cargando vista previa...</p>
            </div>
          ) : htmlPreviewUrl ? (
            <div className="w-full h-full p-4 flex flex-col">
              <div className="w-full h-full bg-white rounded-lg shadow-inner overflow-auto min-h-0 hide-scrollbar">
                <iframe
                  title="html-preview"
                  src={htmlPreviewUrl}
                  className="w-full h-full border-0 min-h-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                  loading="lazy"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500">No hay vista previa disponible</p>
            </div>
          )}
        </div>

        {/* Footer opcional */}
        <footer className="px-6 py-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <p className="text-xs text-gray-500">
            Presiona <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-xs font-mono">ESC</kbd> para cerrar
          </p>
        </footer>
      </div>
    </div>
  )
}