import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Clock } from 'lucide-react';
import type { Noticia, NoticiaCategoria, CrearNoticia } from '../../../types';
import NoticiasFormModal from './NoticiasFormModal';
import NoticiasList from './NoticiasList';
import NoticiasFilters from './NoticiasFilters';

interface NoticiasManagementProps {
  onSuccess?: (message: string) => void;
  onError?: (error: string) => void;
}

type TabType = 'publicas' | 'borradores' | 'archivadas';

export default function NoticiasManagement({
  onSuccess,
  onError,
}: NoticiasManagementProps) {
  // Estado principal
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [categorias, setCategorias] = useState<NoticiaCategoria[]>([]);
  const [loading, setLoading] = useState(true);

  // Estado de filtros
  const [activeTab, setActiveTab] = useState<TabType>('publicas');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  // Estado del modal
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingNoticia, setEditingNoticia] = useState<Noticia | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Cargar categorías
  useEffect(() => {
    cargarCategorias();
    cargarNoticias();
  }, []);

  // Recargar noticias cuando cambia el filtro
  useEffect(() => {
    cargarNoticias();
  }, [activeTab, selectedCategoria]);

  const cargarCategorias = async () => {
    try {
      const response = await fetch('/api/noticias/categorias/todas');
      const result = await response.json();
      if (result.success) {
        setCategorias(result.data || []);
      }
    } catch (error) {
      console.error('Error cargando categorías:', error);
      onError?.('Error cargando categorías');
    }
  };

  const cargarNoticias = async () => {
    try {
      setLoading(true);
      let estado = 'publicada';
      if (activeTab === 'borradores') estado = 'borrador';
      if (activeTab === 'archivadas') estado = 'archivada';

      let url = `/api/noticias/admin?estado=${estado}`;
      if (selectedCategoria) url += `&categoria=${selectedCategoria}`;

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        setNoticias(result.data || []);
      }
    } catch (error) {
      console.error('Error cargando noticias:', error);
      onError?.('Error cargando noticias');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenFormModal = (noticia?: Noticia) => {
    setEditingNoticia(noticia || null);
    setShowFormModal(true);
  };

  const handleCloseFormModal = () => {
    setShowFormModal(false);
    setEditingNoticia(null);
  };

  const handleSaveNoticia = async (data: CrearNoticia) => {
    try {
      setFormLoading(true);
      const method = editingNoticia ? 'PUT' : 'POST';
      const url = editingNoticia
        ? `/api/noticias/admin/${editingNoticia.id}`
        : '/api/noticias/admin';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess?.(result.mensaje || 'Noticia guardada exitosamente');
        handleCloseFormModal();
        cargarNoticias();
      } else {
        onError?.(result.error || 'Error guardando noticia');
      }
    } catch (error) {
      console.error('Error guardando noticia:', error);
      onError?.('Error guardando noticia');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeleteNoticia = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta noticia?')) return;

    try {
      const response = await fetch(`/api/noticias/admin/${id}`, {
        method: 'DELETE',
      });

      const result = await response.json();
      if (result.success) {
        onSuccess?.('Noticia eliminada exitosamente');
        cargarNoticias();
      } else {
        onError?.(result.error || 'Error eliminando noticia');
      }
    } catch (error) {
      console.error('Error eliminando noticia:', error);
      onError?.('Error eliminando noticia');
    }
  };

  const handleChangeEstado = async (id: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/noticias/admin/${id}/estado`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const result = await response.json();
      if (result.success) {
        onSuccess?.(result.mensaje || 'Estado actualizado');
        cargarNoticias();
      } else {
        onError?.(result.error || 'Error actualizando estado');
      }
    } catch (error) {
      console.error('Error actualizando estado:', error);
      onError?.('Error actualizando estado');
    }
  };

  const noticiasFiltradas = noticias.filter((noticia) => {
    if (searchTerm && !noticia.titulo.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  return (
    <div className="space-y-10 pb-16 animate-in fade-in slide-in-from-bottom-6 duration-700">
      {/* Header Premium */}
      <div className="relative overflow-hidden rounded-[2.5rem] bg-zinc-900/20 backdrop-blur-3xl border border-zinc-800/50 p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
          <div>
            <h2 className="text-3xl font-black text-white tracking-tight uppercase">Santuario Editorial</h2>
            <p className="text-zinc-500 font-medium mt-2 text-sm max-w-xl">
              Arquitecto de información y avisos críticos. Gestiona el flujo de conocimiento y actualizaciones estratégicas para toda la infraestructura SecureShop.
            </p>
          </div>
          
          <button
            onClick={() => handleOpenFormModal()}
            className="group relative h-14 px-8 rounded-2xl bg-orange-500 text-[11px] font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-orange-400 hover:shadow-[0_0_30px_rgba(249,115,22,0.3)] active:scale-95 flex items-center justify-center gap-3 overflow-hidden"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
            <span>Emitir Comunicado</span>
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        </div>
      </div>

      {/* Control de Navegación y Filtros */}
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 px-4">
          {/* Tabs Modernas */}
          <div className="flex p-1.5 rounded-2xl bg-zinc-950/50 border border-zinc-800/50 backdrop-blur-xl shrink-0">
            {(['publicas', 'borradores', 'archivadas'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`relative px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2 ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-zinc-500 hover:text-zinc-300'
                }`}
              >
                {activeTab === tab && (
                  <div className="absolute inset-0 bg-orange-500 rounded-xl shadow-[0_0_20px_rgba(249,115,22,0.4)] animate-in fade-in zoom-in-95 duration-500" />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  {tab === 'publicas' && <Eye className="w-3.5 h-3.5" />}
                  {tab === 'borradores' && <Clock className="w-3.5 h-3.5" />}
                  {tab === 'archivadas' && <EyeOff className="w-3.5 h-3.5" />}
                  {tab === 'publicas' ? 'Emitidas' : tab === 'borradores' ? 'Borradores' : 'Archivos'}
                </span>
              </button>
            ))}
          </div>

          <NoticiasFilters
            categorias={categorias}
            selectedCategoria={selectedCategoria}
            onCategoriaChange={setSelectedCategoria}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>

        {/* Galería de Contenido */}
        {loading ? (
          <div className="py-32 text-center">
            <div className="w-12 h-12 border-4 border-orange-500/10 border-t-orange-500 rounded-full animate-spin mx-auto mb-6 shadow-[0_0_20px_rgba(249,115,22,0.2)]" />
            <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.3em] animate-pulse">Sincronizando Archivos...</p>
          </div>
        ) : noticiasFiltradas.length === 0 ? (
          <div className="py-32 rounded-[3rem] bg-zinc-900/10 border border-dashed border-zinc-800 flex flex-col items-center justify-center text-center px-10">
            <div className="w-20 h-20 rounded-full bg-zinc-950/50 flex items-center justify-center mb-6 border border-zinc-800">
               <EyeOff className="w-8 h-8 text-zinc-700" />
            </div>
            <h4 className="text-xl font-black text-zinc-500 uppercase tracking-tight">Cámara de Vacío Detectada</h4>
            <p className="text-sm text-zinc-600 max-w-xs mt-2 italic font-medium">No se han encontrado registros bajo los protocolos de filtrado actuales.</p>
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <NoticiasList
              noticias={noticiasFiltradas}
              onEdit={handleOpenFormModal}
              onDelete={handleDeleteNoticia}
              onChangeEstado={handleChangeEstado}
            />
          </div>
        )}
      </div>

      {showFormModal && (
        <NoticiasFormModal
          noticia={editingNoticia}
          categorias={categorias}
          onClose={handleCloseFormModal}
          onSave={handleSaveNoticia}
          loading={formLoading}
        />
      )}
    </div>
  );
}
