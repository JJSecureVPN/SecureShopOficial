import React, { useEffect, useState } from 'react';
import { X, Upload, Calendar, AlertCircle } from 'lucide-react';
import type { Noticia, NoticiaCategoria, CrearNoticia } from '../../../types';

interface NoticiasFormModalProps {
  noticia?: Noticia | null;
  categorias: NoticiaCategoria[];
  onClose: () => void;
  onSave: (data: CrearNoticia) => Promise<void>;
  loading: boolean;
}

const estadoOptions = [
  { value: 'borrador', label: 'Borrador' },
  { value: 'publicada', label: 'Publicada' },
  { value:'pausada', label: 'Pausada' },
  { value: 'archivada', label: 'Archivada' },
];

const visibilidadOptions = [
  { value: 'todos', label: 'Todos' },
  { value: 'clientes', label: 'Solo clientes' },
  { value: 'admin', label: 'Solo administradores' },
  { value: 'vpn', label: 'VPN (solo app VPN)' },
];

export default function NoticiasFormModal({
  noticia,
  categorias,
  onClose,
  onSave,
  loading,
}: NoticiasFormModalProps) {
  const [formData, setFormData] = useState<CrearNoticia>({
    titulo: '',
    descripcion: '',
    categoria_id: '',
  });

  const [imagenPreview, setImagenPreview] = useState<string>('');
  const [submitError, setSubmitError] = useState<string>('');

  useEffect(() => {
    if (noticia) {
      setFormData({
        titulo: noticia.titulo,
        descripcion: noticia.descripcion,
        contenido_completo: noticia.contenido_completo,
        categoria_id: noticia.categoria_id,
        imagen_url: noticia.imagen_url,
        imagen_alt: noticia.imagen_alt,
        estado: noticia.estado,
        visible_para: noticia.visible_para,
        fecha_publicacion: noticia.fecha_publicacion?.split('T')[0],
        fecha_expiracion: noticia.fecha_expiracion?.split('T')[0],
        prioridad: noticia.prioridad,
        destacada: noticia.destacada,
        allow_comentarios: noticia.allow_comentarios,
      });
      if (noticia.imagen_url) {
        setImagenPreview(noticia.imagen_url);
      }
    }
  }, [noticia]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target as any;
    setFormData((prev: any) => ({
      ...prev,
      [name]:
        type === 'checkbox'
          ? (e.target as HTMLInputElement).checked
          : type === 'number'
            ? parseFloat(value) || 0
            : value,
    }));
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setImagenPreview(result);
        setFormData((prev: any) => ({
          ...prev,
          imagen_url: result,
          imagen_alt: formData.imagen_alt || file.name,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    if (!formData.titulo.trim()) {
      setSubmitError('La identidad del comunicado (título) es obligatoria.');
      return;
    }
    if (!formData.descripcion.trim()) {
      setSubmitError('Se requiere un resumen ejecutivo (descripción).');
      return;
    }
    if (!formData.categoria_id) {
      setSubmitError('Debe clasificar el comunicado en una categoría.');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Fallo en la sincronización del comunicado.'
      );
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in duration-500">
      <div 
        className="absolute inset-0 bg-zinc-950/80 backdrop-blur-manual" 
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-4xl max-h-full overflow-hidden rounded-[3rem] bg-zinc-900 border border-zinc-800 shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-10 duration-700">
        
        {/* Header Premium */}
        <div className="flex items-center justify-between p-8 md:px-12 border-b border-zinc-800/50 bg-zinc-900/50 backdrop-blur-xl relative z-10 shrink-0">
          <div>
             <h3 className="text-2xl font-black text-white uppercase tracking-tight">
              {noticia ? 'Refactorizar Comunicado' : 'Nuevo Manifiesto Editorial'}
            </h3>
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-1">
              Estación de Mando: {noticia ? `Rastreo ID-${noticia.id.slice(0, 8)}` : 'Nueva Entrada de Registro'}
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="w-12 h-12 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 space-y-12">
          {submitError && (
            <div className="p-5 bg-red-500/5 border border-red-500/20 rounded-[1.5rem] flex items-start gap-4 animate-in slide-in-from-top-4 duration-500">
              <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertCircle className="w-5 h-5 text-red-500" />
              </div>
              <div>
                 <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1 italic">Anomalía Detectada</p>
                 <p className="text-sm text-red-300/80 font-medium">{submitError}</p>
              </div>
            </div>
          )}

          {/* Section: Identidad */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
               <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">Identidad</h4>
            </div>

            <div className="grid grid-cols-1 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Título del Comunicado</label>
                <input
                  type="text"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleInputChange}
                  placeholder="EJ: ACTUALIZACIÓN DE SEGURIDAD V2.4"
                  className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-sm font-bold text-white placeholder-zinc-800 focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Resumen Ejecutivo</label>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="Breve descripción del impacto de esta noticia..."
                  rows={3}
                  className="w-full rounded-2xl bg-zinc-950/50 border border-zinc-800 p-6 text-sm font-medium text-zinc-400 placeholder-zinc-800 focus:outline-none focus:border-orange-500/50 transition-all resize-none"
                />
              </div>
            </div>
          </div>

          {/* Section: Multimedia y Categoría */}
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                 <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">Visuales</h4>
              </div>

              <div className="group relative">
                {imagenPreview ? (
                  <div className="relative aspect-video rounded-[2rem] overflow-hidden border border-zinc-800 group-hover:border-orange-500/30 transition-all duration-500 shadow-2xl">
                    <img
                      src={imagenPreview}
                      alt="Preview"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-zinc-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <label className="cursor-pointer px-6 py-3 rounded-2xl bg-white text-zinc-950 text-[10px] font-black uppercase tracking-widest shadow-2xl active:scale-95 transition-transform">
                          Cambiar Archivo
                          <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                       </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center aspect-video rounded-[2rem] border-2 border-dashed border-zinc-800 bg-zinc-950/30 cursor-pointer hover:bg-zinc-950/50 hover:border-orange-500/50 transition-all duration-500 group/upload">
                    <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-zinc-800 flex items-center justify-center mb-4 group-hover/upload:scale-110 transition-transform">
                       <Upload className="w-6 h-6 text-zinc-600 group-hover/upload:text-orange-500" />
                    </div>
                    <span className="text-[10px] font-black text-zinc-600 uppercase tracking-widest group-hover/upload:text-zinc-400">Anexar Multimedia</span>
                    <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                  </label>
                )}
              </div>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-3">
                 <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                 <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">Clasificación</h4>
              </div>

              <div className="space-y-6">
                 <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Clasificador Logístico</label>
                  <select
                    name="categoria_id"
                    value={formData.categoria_id}
                    onChange={handleInputChange}
                    className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-sm font-bold text-zinc-400 focus:outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Selección de Ruta</option>
                    {categorias.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.nombre}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Prioridad de Rastreo (0-100)</label>
                  <input
                    type="number"
                    name="prioridad"
                    value={formData.prioridad || 0}
                    onChange={handleInputChange}
                    className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-sm font-bold text-white focus:outline-none focus:border-orange-500/50 transition-all"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Configuración Avanzada */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
               <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">Configuración de Protocolo</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Estado Operativo</label>
                <select
                  name="estado"
                  value={formData.estado || 'borrador'}
                  onChange={handleInputChange}
                  className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-sm font-bold text-zinc-400 focus:outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer"
                >
                  {estadoOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1">Permisos de Acceso</label>
                <select
                  name="visible_para"
                  value={formData.visible_para || 'todos'}
                  onChange={handleInputChange}
                  className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-sm font-bold text-zinc-400 focus:outline-none focus:border-orange-500/50 transition-all appearance-none cursor-pointer"
                >
                  {visibilidadOptions.map((opt) => (
                    <option key={opt.value} value={opt.value} className="bg-zinc-900">{opt.label}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 h-14 md:mt-7 bg-zinc-950/30 rounded-2xl px-6 border border-zinc-800/50">
                 <button
                    type="button"
                    onClick={() => setFormData(p => ({ ...p, destacada: !p.destacada }))}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 ${
                      formData.destacada ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.4)]" : "bg-zinc-800"
                    }`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.destacada ? "translate-x-6" : "translate-x-1"}`} />
                  </button>
                  <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Destacar</span>
              </div>
            </div>
          </div>

          {/* Section: Vigencia */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
               <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
               <h4 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.3em]">Cronología</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Lanzamiento Real
                </label>
                <input
                  type="date"
                  name="fecha_publicacion"
                  value={formData.fecha_publicacion || ''}
                  onChange={handleInputChange}
                  className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-sm font-bold text-white focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 px-1 flex items-center gap-2">
                  <Calendar className="w-3 h-3" /> Retirada Estratégica
                </label>
                <input
                  type="date"
                  name="fecha_expiracion"
                  value={formData.fecha_expiracion || ''}
                  onChange={handleInputChange}
                  className="w-full h-14 rounded-2xl bg-zinc-950/50 border border-zinc-800 px-6 text-sm font-bold text-white focus:outline-none focus:border-orange-500/50 transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-12 border-t border-zinc-800/50 flex flex-col md:flex-row gap-4">
             <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-14 px-10 rounded-2xl bg-zinc-950 border border-zinc-800 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-white hover:border-zinc-700 transition-all active:scale-95"
            >
              Abortar Operación
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-14 px-10 rounded-2xl bg-orange-500 text-[11px] font-black uppercase tracking-[0.2em] text-white hover:bg-orange-400 hover:shadow-2xl hover:shadow-orange-500/20 shadow-orange-500/10 transition-all active:scale-95 flex items-center justify-center gap-3 overflow-hidden group"
            >
              <span className="relative z-10">{loading ? 'Sincronizando...' : (noticia ? 'Actualizar Registro' : 'Confirmar Lanzamiento')}</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
