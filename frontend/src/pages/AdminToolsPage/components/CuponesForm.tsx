import { FormEvent } from "react";
import { CuponFormState } from "../types";

// ============================================================================
// TIPOS
// ============================================================================

interface CuponesFormProps {
  cuponForm: CuponFormState;
  isCreatingCupon?: boolean;
  cuponSuccess?: string | null;
  cuponError?: string | null;
  onInputChange: (field: keyof CuponFormState, value: string | boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}

// ============================================================================
// CONSTANTES
// ============================================================================

const DISCOUNT_TYPES = [
  { value: "porcentaje", label: "Porcentaje (%)" },
  { value: "monto_fijo", label: "Monto fijo ($)" },
];

const FORM_FIELDS = [
  {
    name: "codigo",
    label: "Código",
    type: "text",
    placeholder: "PROMO30",
    required: true,
    description: "Código único del cupón (sin espacios)",
  },
  {
    name: "tipo",
    label: "Tipo de descuento",
    type: "select",
    options: DISCOUNT_TYPES,
    required: true,
    description: "Selecciona si es porcentaje o monto fijo",
  },
  {
    name: "valor",
    label: "Valor",
    type: "number",
    placeholder: "30",
    required: true,
    description: "Monto o porcentaje del descuento",
    min: 1,
  },
  {
    name: "limite_uso",
    label: "Límite de uso",
    type: "number",
    placeholder: "50",
    required: false,
    description: "Cuántas veces se puede usar (opcional)",
    min: 1,
  },
  {
    name: "fecha_expiracion",
    label: "Fecha de expiración",
    type: "datetime-local",
    required: false,
    description: "Cuándo expira el cupón (opcional)",
  },
  {
    name: "oculto",
    label: "Cupón oculto",
    type: "checkbox",
    required: false,
    description: "Si está marcado, no se muestra en el header público",
  },
  {
    name: "planes_aplicables",
    label: "Planes aplicables",
    type: "text",
    placeholder: "21,22,23",
    required: false,
    description: "IDs de planes separados por comas (opcional)",
  },
];

// ============================================================================
// FUNCIONES AUXILIARES
// ============================================================================

function getPlaceholder(fieldName: string, tipo: string): string {
  if (fieldName === "valor") {
    return tipo === "porcentaje" ? "30" : "1500";
  }
  return "";
}

// ============================================================================
// COMPONENTES AUXILIARES
// ============================================================================

interface FormHeaderProps {
  cuponSuccess?: string | null;
  cuponError?: string | null;
}

function FormHeader({ cuponSuccess, cuponError }: FormHeaderProps) {
  if (!cuponSuccess && !cuponError) return null;

  const isSuccess = !!cuponSuccess;
  const message = cuponSuccess ?? cuponError;

  return (
    <div
      className={`rounded-lg px-4 py-3 text-sm font-medium ${
        isSuccess
          ? "bg-emerald-500/10 text-emerald-400"
          : "bg-red-500/10 text-red-400"
      }`}
      role="alert"
    >
      <div className="flex items-center gap-2">
        <span className="text-lg">{isSuccess ? "✓" : "✕"}</span>
        <span>{message}</span>
      </div>
    </div>
  );
}

interface FormTitleProps {
  title: string;
  description: string;
}

function FormTitle({ title, description }: FormTitleProps) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-neutral-100">{title}</h2>
      <p className="mt-1 text-sm text-neutral-400">{description}</p>
    </div>
  );
}

interface TextInputProps {
  label: string;
  description?: string;
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  required?: boolean;
  type?: string;
  min?: number;
}

function TextInput({
  label,
  description,
  value,
  placeholder,
  onChange,
  required,
  type = "text",
  min,
}: TextInputProps) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-neutral-200">{label}</span>
        {!required && (
          <span className="text-xs text-neutral-500">(Opcional)</span>
        )}
      </div>
      {description && (
        <p className="text-xs text-neutral-500">{description}</p>
      )}
      <input
        type={type}
        min={min}
        className="rounded-lg border border-neutral-700 bg-neutral-850 px-3 py-2 text-white placeholder-neutral-500 transition focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    </label>
  );
}

interface SelectInputProps {
  label: string;
  description?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  required?: boolean;
}

interface CheckboxInputProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}

function CheckboxInput({
  label,
  description,
  checked,
  onChange,
  required,
}: CheckboxInputProps) {
  return (
    <label className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          className="rounded border border-neutral-700 bg-neutral-850 text-violet-500 focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
        />
        <span className="text-sm font-medium text-neutral-200">{label}</span>
        {!required && (
          <span className="text-xs text-neutral-500">(Opcional)</span>
        )}
      </div>
      {description && (
        <p className="text-xs text-neutral-500 ml-6">{description}</p>
      )}
    </label>
  );
}

function SelectInput({
  label,
  description,
  value,
  options,
  onChange,
  required,
}: SelectInputProps) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium text-neutral-200">{label}</span>
      {description && (
        <p className="text-xs text-neutral-500">{description}</p>
      )}
      <select
        className="rounded-lg border border-neutral-700 bg-neutral-850 px-3 py-2 text-white transition focus:border-violet-500 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="">Selecciona una opción</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

interface FormFieldProps {
  field: (typeof FORM_FIELDS)[0];
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}

function FormField({ field, value, onChange }: FormFieldProps) {
  if (field.type === "select") {
    return (
      <SelectInput
        label={field.label}
        description={field.description}
        value={value as string}
        options={field.options || []}
        onChange={onChange}
        required={field.required}
      />
    );
  }

  if (field.type === "checkbox") {
    return (
      <CheckboxInput
        label={field.label}
        description={field.description}
        checked={value as boolean}
        onChange={onChange}
        required={field.required}
      />
    );
  }

  return (
    <TextInput
      label={field.label}
      description={field.description}
      value={value as string}
      placeholder={getPlaceholder(field.name, value as string)}
      onChange={onChange}
      required={field.required}
      type={field.type}
      min={field.min}
    />
  );
}

interface SubmitButtonProps {
  isLoading: boolean;
}

function SubmitButton({ isLoading }: SubmitButtonProps) {
  return (
    <div className="flex items-center justify-end gap-2">
      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-violet-600 px-6 py-2 text-sm font-medium text-white transition hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <span className="inline-block animate-spin mr-2">⌛</span>
            Creando...
          </>
        ) : (
          "Crear cupón"
        )}
      </button>
    </div>
  );
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export function CuponesForm({
  cuponForm,
  isCreatingCupon = false,
  cuponSuccess,
  cuponError,
  onInputChange,
  onSubmit,
}: CuponesFormProps) {
  return (
    <section id="section-crear-cupon" className="space-y-6">
      {/* Mensaje de estado */}
      {(cuponSuccess || cuponError) && (
        <FormHeader cuponSuccess={cuponSuccess} cuponError={cuponError} />
      )}

      {/* Contenedor principal */}
      <div className="rounded-2xl border border-neutral-800 bg-neutral-900/50 p-6 shadow-lg">
        {/* Encabezado */}
        <div className="mb-8">
          <FormTitle
            title="Crear cupón"
            description="Genera descuentos en porcentaje o monto fijo con límites y expiración"
          />
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Grid de campos */}
          <div className="grid gap-6 md:grid-cols-2">
            {FORM_FIELDS.map((field) => (
              <div
                key={field.name}
                className={field.type === "select" ? "md:col-span-2" : ""}
              >
                <FormField
                  field={field}
                  value={
                    cuponForm[field.name as keyof CuponFormState] as string | boolean
                  }
                  onChange={(value) =>
                    onInputChange(field.name as keyof CuponFormState, value)
                  }
                />
              </div>
            ))}
          </div>

          {/* Botón de envío */}
          <div className="border-t border-neutral-800 pt-6">
            <SubmitButton isLoading={isCreatingCupon} />
          </div>
        </form>
      </div>
    </section>
  );
}
