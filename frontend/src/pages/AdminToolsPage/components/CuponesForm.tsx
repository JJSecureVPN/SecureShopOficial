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
    label: "Código del Cupón",
    type: "text",
    placeholder: "EJ: VERANO2026",
    required: true,
    description: "Identificador único para el cliente",
  },
  {
    name: "tipo",
    label: "Naturaleza del Descuento",
    type: "select",
    options: DISCOUNT_TYPES,
    required: true,
    description: "¿Porcentaje o deducción fija?",
  },
  {
    name: "valor",
    label: "Magnitud",
    type: "number",
    placeholder: "30",
    required: true,
    description: "Valor numérico del beneficio",
    min: 1,
  },
  {
    name: "limite_uso",
    label: "Cupo Máximo",
    type: "number",
    placeholder: "100",
    required: false,
    description: "Cantidad de usos permitidos",
    min: 1,
  },
  {
    name: "fecha_expiracion",
    label: "Caducidad",
    type: "datetime-local",
    required: false,
    description: "Fecha y hora límite de validez",
  },
  {
    name: "oculto",
    label: "Privacidad",
    type: "checkbox",
    required: false,
    description: "No mostrar en promociones públicas",
  },
  {
    name: "planes_aplicables",
    label: "Restricción de Planes",
    type: "text",
    placeholder: "ID1, ID2, ID3",
    required: false,
    description: "IDs separados por comas",
  },
];


interface FormHeaderProps {
  cuponSuccess?: string | null;
  cuponError?: string | null;
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

interface CheckboxInputProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  required?: boolean;
}

interface SelectInputProps {
  label: string;
  description?: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  required?: boolean;
}

interface FormFieldProps {
  field: any;
  value: string | boolean;
  onChange: (value: string | boolean) => void;
}

function FormHeader({ cuponSuccess, cuponError }: FormHeaderProps) {
  if (!cuponSuccess && !cuponError) return null;

  const isSuccess = !!cuponSuccess;
  const message = cuponSuccess ?? cuponError;

  return (
    <div
      className={`rounded-[1.5rem] px-5 py-4 text-sm font-bold animate-in slide-in-from-top-2 border ${
        isSuccess
          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-400"
          : "bg-red-500/5 border-red-500/20 text-red-400"
      }`}
      role="alert"
    >
      <div className="flex items-center gap-3">
        <span className="flex items-center justify-center w-6 h-6 rounded-full bg-current/10">
          {isSuccess ? "✓" : "✕"}
        </span>
        <span className="tracking-tight">{message}</span>
      </div>
    </div>
  );
}

function FormTitle({ title, description }: { title: string; description: string }) {
  return (
    <div className="relative">
      <h2 className="text-xl font-black text-white tracking-tight uppercase">{title}</h2>
      <p className="mt-1 text-[13px] text-zinc-500 font-medium">{description}</p>
    </div>
  );
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
    <div className="flex flex-col gap-2 group">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-focus-within:text-orange-500 transition-colors">
          {label} {required && <span className="text-orange-500">*</span>}
        </span>
        {!required && <span className="text-[9px] font-black text-zinc-600 uppercase">Opcional</span>}
      </div>
      <input
        type={type}
        min={min}
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-3.5 text-[15px] text-white placeholder-zinc-700 transition-all focus:border-orange-500/50 focus:outline-none focus:ring-4 focus:ring-orange-500/5 font-medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
      {description && <p className="px-1 text-[11px] font-medium text-zinc-600 italic">{description}</p>}
    </div>
  );
}

function CheckboxInput({
  label,
  description,
  checked,
  onChange,
}: CheckboxInputProps) {
  return (
    <div className="flex flex-col gap-2 h-full justify-center pt-4">
      <label className="flex items-center gap-4 cursor-pointer group w-fit">
        <div 
          className={`w-11 h-6 rounded-full p-1 transition-all relative ${
            checked ? 'bg-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)]' : 'bg-zinc-800 border border-zinc-700'
          }`}
          onClick={() => onChange(!checked)}
        >
          <div className={`w-4 h-4 rounded-full shadow-lg transition-transform duration-300 ${checked ? 'translate-x-5 bg-white' : 'bg-zinc-500'}`} />
        </div>
        <div className="flex flex-col">
          <span className={`text-[11px] font-black uppercase tracking-widest transition-colors ${checked ? 'text-orange-500' : 'text-zinc-500'}`}>
            {label}
          </span>
          {description && <span className="text-[10px] font-medium text-zinc-600 uppercase tracking-tighter">{description}</span>}
        </div>
      </label>
    </div>
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
    <div className="flex flex-col gap-2 group">
      <span className="px-1 text-[10px] font-black uppercase tracking-widest text-zinc-500 group-focus-within:text-orange-500 transition-colors">
        {label} {required && <span className="text-orange-500">*</span>}
      </span>
      <select
        className="rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-3.5 text-[15px] text-white transition-all focus:border-orange-500/50 focus:outline-none appearance-none cursor-pointer font-medium"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      >
        <option value="" className="bg-zinc-950 text-zinc-500">Seleccionar...</option>
        {options.map((option) => (
          <option key={option.value} value={option.value} className="bg-zinc-950">
            {option.label}
          </option>
        ))}
      </select>
      {description && <p className="px-1 text-[11px] font-medium text-zinc-600 italic">{description}</p>}
    </div>
  );
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
      placeholder={field.placeholder || ""}
      onChange={onChange}
      required={field.required}
      type={field.type}
      min={field.min}
    />
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
    <section id="section-crear-cupon" className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Mensaje de estado */}
      {(cuponSuccess || cuponError) && (
        <FormHeader cuponSuccess={cuponSuccess} cuponError={cuponError} />
      )}

      {/* Contenedor principal */}
      <div className="relative overflow-hidden rounded-[2.5rem] border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl p-8 md:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Encabezado */}
        <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <FormTitle
            title="Suministro de Cupones"
            description="Motor de generación de beneficios exclusivos para la red de usuarios."
          />
          
          <div className="px-4 py-2 bg-zinc-950/50 border border-zinc-800/50 rounded-xl flex items-center gap-2">
             <div className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
             <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Servicio Activo</span>
          </div>
        </div>

        {/* Formulario */}
        <form onSubmit={onSubmit} className="space-y-10 relative z-10">
          <div className="grid gap-x-8 gap-y-8 md:grid-cols-2">
            {FORM_FIELDS.map((field) => (
              <div
                key={field.name}
                className={field.name === "tipo" || field.name === "planes_aplicables" ? "md:col-span-2" : ""}
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
          <div className="border-t border-zinc-800/50 pt-8 flex justify-end">
            <button
              type="submit"
              disabled={isCreatingCupon}
              className="group relative flex items-center justify-center gap-3 rounded-2xl bg-orange-500 px-10 py-4 text-xs font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-orange-400 hover:shadow-2xl hover:shadow-orange-500/20 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isCreatingCupon ? (
                <>
                  <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  <span>Forjar Cupón</span>
                  <div className="w-2 h-2 rounded-full bg-white opacity-40 transition-transform group-hover:scale-150" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
