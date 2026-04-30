import { FormEvent } from "react";
import { NoticiaConfig } from "../../../types";

// ============================================================================
// TIPOS
// ============================================================================

interface NoticiasSecionProps {
  config: NoticiaConfig | null;
  onToggle: (field: string) => void;
  onAvisoFieldChange: (field: string, value: string | boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  isLoading?: boolean;
  success?: string | null;
  error?: string | null;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DEFAULT_COLORS = {
  bg: "#1a1a1a",
  text: "#ffffff",
};

const AVISO_FIELDS = [
  {
    name: "texto",
    label: "Texto del aviso",
    type: "textarea",
    placeholder: "Ingresa el mensaje principal",
    required: true,
    rows: 3,
  },
  {
    name: "subtitulo",
    label: "Subtítulo",
    type: "text",
    placeholder: "Texto adicional (opcional)",
    required: false,
  },
];

const COLOR_FIELDS = [
  {
    name: "bgColor",
    label: "Color de fondo",
    title: "Selecciona el color de fondo",
  },
  {
    name: "textColor",
    label: "Color de texto",
    title: "Selecciona el color del texto",
  },
];

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function getColorValue(
  value: string | undefined,
  defaultValue: string
): string {
  return value ?? defaultValue;
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface ErrorStateProps {
  message: string;
}

function ErrorState({ message }: ErrorStateProps) {
  return (
    <div className="rounded-lg border border-neutral-700 bg-neutral-900 p-4 text-neutral-400">
      <div className="flex items-center gap-3">
        <span className="text-lg">⚠️</span>
        <span className="text-sm">{message}</span>
      </div>
    </div>
  );
}

interface StatusMessageProps {
  message: string;
  type: "success" | "error";
}

function StatusMessage({ message, type }: StatusMessageProps) {
  const isSuccess = type === "success";

  return (
    <div
      className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
        isSuccess
          ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          : "border-red-500/30 bg-red-500/10 text-red-400"
      }`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <span>{isSuccess ? "✓" : "✕"}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}

interface CheckboxFieldProps {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  description?: string;
}

function CheckboxField({
  id,
  label,
  checked,
  onChange,
  description,
}: CheckboxFieldProps) {
  return (
    <div className="flex items-start gap-3">
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        className="mt-1 h-4 w-4 rounded border-neutral-600 bg-neutral-900 accent-blue-600"
      />
      <label htmlFor={id} className="flex flex-col gap-1">
        <span className="text-sm font-medium text-neutral-200">{label}</span>
        {description && (
          <span className="text-xs text-neutral-500">{description}</span>
        )}
      </label>
    </div>
  );
}

interface TextInputProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  required?: boolean;
}

function TextInputField({
  label,
  value,
  placeholder,
  onChange,
  required,
}: TextInputProps) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-200">{label}</span>
        {!required && (
          <span className="text-xs text-neutral-500">(Opcional)</span>
        )}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20"
        required={required}
      />
    </label>
  );
}

interface TextAreaProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  rows?: number;
  required?: boolean;
}

function TextAreaField({
  label,
  value,
  placeholder,
  onChange,
  rows = 3,
  required,
}: TextAreaProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-neutral-200">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white placeholder-neutral-500 transition focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500/20 resize-none"
        required={required}
      />
    </label>
  );
}

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  title: string;
}

function ColorPicker({ label, value, onChange, title }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-neutral-200">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          title={title}
          className="h-10 w-20 cursor-pointer rounded-lg border border-neutral-700 transition hover:border-neutral-600"
        />
        <code className="rounded bg-neutral-900 px-2 py-1 text-xs text-neutral-400">
          {value.toUpperCase()}
        </code>
      </div>
    </div>
  );
}

interface PreviewProps {
  texto: string;
  subtitulo?: string;
  bgColor: string;
  textColor: string;
}

function AvisoPreview({
  texto,
  subtitulo,
  bgColor,
  textColor,
}: PreviewProps) {
  if (!texto) return null;

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
        Vista previa
      </p>
      <div
        className="rounded-lg border-2 border-dashed border-neutral-700 p-4 transition-all"
        style={{ backgroundColor: bgColor, color: textColor }}
      >
        <p className="text-sm font-medium">{texto}</p>
        {subtitulo && <p className="mt-1 text-xs opacity-80">{subtitulo}</p>}
      </div>
    </div>
  );
}

interface SubmitButtonProps {
  isLoading: boolean;
}

function SubmitButton({ isLoading }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={isLoading}
      className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isLoading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="inline-block animate-spin">⌛</span>
          Guardando...
        </span>
      ) : (
        "Guardar configuración"
      )}
    </button>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function NoticiasSection({
  config,
  onToggle,
  onAvisoFieldChange,
  onSubmit,
  isLoading = false,
  success = null,
  error = null,
}: NoticiasSecionProps) {
  if (!config) {
    return (
      <ErrorState message="No se pudo cargar la configuración de noticias" />
    );
  }

  const avisoHabilitado = config.aviso?.habilitado ?? false;

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Mensaje de estado */}
      {success && <StatusMessage message={success} type="success" />}
      {error && <StatusMessage message={error} type="error" />}

      {/* Sección principal de avisos */}
      <div className="space-y-4 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6">
        {/* Encabezado */}
        <div>
          <h3 className="text-lg font-semibold text-neutral-100">
            Avisos personalizados
          </h3>
          <p className="mt-1 text-sm text-neutral-500">
            Configura mensajes personalizados para tus usuarios
          </p>
        </div>

        {/* Toggle principal */}
        <div className="border-t border-neutral-800 pt-4">
          <CheckboxField
            id="aviso-habilitado"
            label="Habilitar avisos personalizados"
            checked={avisoHabilitado}
            onChange={() => onToggle("aviso.habilitado")}
            description="Activa para mostrar mensajes personalizados a los usuarios"
          />
        </div>

        {/* Campos condicionales */}
        {avisoHabilitado && (
          <div className="space-y-6 border-t border-neutral-800 pt-6">
            {/* Campos de texto */}
            <div className="space-y-4">
              {AVISO_FIELDS.map((field) => (
                <div key={field.name}>
                  {field.type === "textarea" ? (
                    <TextAreaField
                      label={field.label}
                      value={
                        (config.aviso?.[
                          field.name as keyof typeof config.aviso
                        ] as string) ?? ""
                      }
                      placeholder={field.placeholder}
                      onChange={(value) =>
                        onAvisoFieldChange(field.name, value)
                      }
                      rows={field.rows}
                      required={field.required}
                    />
                  ) : (
                    <TextInputField
                      label={field.label}
                      value={
                        (config.aviso?.[
                          field.name as keyof typeof config.aviso
                        ] as string) ?? ""
                      }
                      placeholder={field.placeholder}
                      onChange={(value) =>
                        onAvisoFieldChange(field.name, value)
                      }
                      required={field.required}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Selectores de color */}
            <div className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-900/50 p-4">
              <p className="text-sm font-medium text-neutral-300">
                Personalización de colores
              </p>
              <div className="grid gap-4 md:grid-cols-2">
                {COLOR_FIELDS.map((field) => (
                  <ColorPicker
                    key={field.name}
                    label={field.label}
                    value={getColorValue(
                      config.aviso?.[
                        field.name as keyof typeof config.aviso
                      ] as string,
                      field.name === "bgColor"
                        ? DEFAULT_COLORS.bg
                        : DEFAULT_COLORS.text
                    )}
                    onChange={(value) =>
                      onAvisoFieldChange(field.name, value)
                    }
                    title={field.title}
                  />
                ))}
              </div>
            </div>

            {/* Vista previa */}
            <AvisoPreview
              texto={config.aviso?.texto ?? ""}
              subtitulo={config.aviso?.subtitulo}
              bgColor={getColorValue(
                config.aviso?.bgColor as string,
                DEFAULT_COLORS.bg
              )}
              textColor={getColorValue(
                config.aviso?.textColor as string,
                DEFAULT_COLORS.text
              )}
            />
          </div>
        )}
      </div>

      {/* Botón de envío */}
      <div className="flex justify-end gap-3">
        <SubmitButton isLoading={isLoading} />
      </div>
    </form>
  );
}
