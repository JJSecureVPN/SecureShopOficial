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

    // Validaciones básicas
    if (!formData.titulo.trim()) {
      setSubmitError('El título es requerido');
      return;
    }
    if (!formData.descripcion.trim()) {
      setSubmitError('La descripción es requerida');
      return;
    }
    if (!formData.categoria_id) {
      setSubmitError('Debes seleccionar una categoría');
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      setSubmitError(
        error instanceof Error ? error.message : 'Error guardando noticia'
      );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-neutral-900 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-neutral-700 bg-neutral-900">
          <h3 className="text-xl font-bold text-white">
            {noticia ? 'Editar Noticia' : 'Nueva Noticia'}
          </h3>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-neutral-400 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {submitError && (
            <div className="p-4 bg-red-900/20 border border-red-800 rounded-lg flex gap-3">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <p className="text-red-300 text-sm">{submitError}</p>
            </div>
          )}

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Título *
            </label>
            <input
              type="text"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ingresa el título de la noticia"
              maxLength={200}
              className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-neutral-400 mt-1">
              {formData.titulo.length}/200
            </p>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Descripción *
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleInputChange}
              placeholder="Resumen breve de la noticia"
              maxLength={500}
              rows={3}
              className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-neutral-400 mt-1">
              {formData.descripcion.length}/500
            </p>
          </div>

          {/* Contenido Completo */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Contenido Completo
            </label>
            <textarea
              name="contenido_completo"
              value={formData.contenido_completo || ''}
              onChange={handleInputChange}
              placeholder="Contenido detallado (opcional)"
              rows={5}
              className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Categoría *
            </label>
            <select
              name="categoria_id"
              value={formData.categoria_id}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecciona una categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Imagen */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Imagen Principal
            </label>
            <div className="flex gap-4">
              {imagenPreview && (
                <div className="w-24 h-24 rounded-lg overflow-hidden border-2 border-neutral-700 flex-shrink-0">
                  <img
                    src={imagenPreview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1">
                <label className="flex items-center justify-center gap-2 px-4 py-2 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:border-blue-500 transition">
                  <Upload className="w-4 h-4" />
                  <span className="text-sm text-neutral-300">
                    Click para subir
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenChange}
                    className="hidden"
                  />
                </label>
                <p className="text-xs text-neutral-400 mt-2">
                  PNG, JPG o WebP (máx. 5MB)
                </p>
              </div>
            </div>
          </div>

          {/* Dos columnas: Estado, Visibilidad, etc. */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Estado
              </label>
              <select
                name="estado"
                value={formData.estado || 'borrador'}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {estadoOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Visibilidad
              </label>
              <select
                name="visible_para"
                value={formData.visible_para || 'todos'}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {visibilidadOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Prioridad */}
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-2">
              Prioridad
            </label>
            <input
              type="number"
              name="prioridad"
              value={formData.prioridad || 0}
              onChange={handleInputChange}
              min="0"
              max="100"
              className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-neutral-400 mt-1">
              Las noticias con mayor prioridad aparecerán primero
            </p>
          </div>

          {/* Checkboxes */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="destacada"
                checked={formData.destacada || false}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-neutral-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-neutral-300">
                Marcar como destacada
              </span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="allow_comentarios"
                checked={formData.allow_comentarios || false}
                onChange={handleInputChange}
                className="w-4 h-4 rounded border-neutral-600 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-neutral-300">
                Permitir comentarios
              </span>
            </label>
          </div>

          {/* Fechas */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Fecha de Publicación
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-neutral-400 mr-2" />
                <input
                  type="date"
                  name="fecha_publicacion"
                  value={formData.fecha_publicacion || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-300 mb-2">
                Fecha de Expiración
              </label>
              <div className="flex items-center">
                <Calendar className="w-4 h-4 text-neutral-400 mr-2" />
                <input
                  type="date"
                  name="fecha_expiracion"
                  value={formData.fecha_expiracion || ''}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-neutral-700 rounded-lg bg-neutral-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-6">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-neutral-700 text-neutral-300 rounded-lg hover:bg-neutral-800 transition disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : 'Guardar Noticia'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
