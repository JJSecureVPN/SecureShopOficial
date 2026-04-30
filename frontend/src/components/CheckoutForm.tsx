import { forwardRef, useImperativeHandle, useRef, useEffect } from "react";
import { Mail, User, Shield, Check } from "lucide-react";
import { motion } from "framer-motion";
import CuponInput from "./CuponInput";
import { ValidacionCupon } from "../services/api.service";

export interface CheckoutFormRef {
  getNombre: () => string;
  getEmail: () => string;
  getCuponData: () => ValidacionCupon["cupon"] | null;
  getDescuento: () => number;
  validate: () => boolean;
}

interface CheckoutFormProps {
  planId: number;
  planPrecio: number;
  loading?: boolean;
  onCuponChange?: (descuento: number) => void;
  onEmailChange?: (email: string) => void;
  userEmail?: string;
}

/**
 * Formulario NO CONTROLADO - accede directamente al DOM.
 * NUNCA se re-renderiza después del primer montaje.
 * Los inputs mantienen su valor en el DOM, no en state.
 */
const CheckoutForm = forwardRef<CheckoutFormRef, CheckoutFormProps>(
  ({ planId, planPrecio, loading = false, onCuponChange, onEmailChange, userEmail }, ref) => {
    const nombreInputRef = useRef<HTMLInputElement>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);
    const errorNombreRef = useRef<HTMLParagraphElement>(null);
    const errorEmailRef = useRef<HTMLParagraphElement>(null);
    const cuponDataRef = useRef<ValidacionCupon["cupon"] | null>(null);
    const descuentoRef = useRef(0);

    console.log("[CheckoutForm] RENDER - esto NO debería aparecer en cada keystroke");

    // Pre-rellenar email si el usuario está logueado
    useEffect(() => {
      if (userEmail && emailInputRef.current) {
        emailInputRef.current.value = userEmail;
        onEmailChange?.(userEmail);
      }
    }, [userEmail]);

    // Exponer métodos al padre vía ref - acceden directamente al DOM
    useImperativeHandle(ref, () => ({
      getNombre: () => nombreInputRef.current?.value || "",
      getEmail: () => emailInputRef.current?.value || "",
      getCuponData: () => cuponDataRef.current,
      getDescuento: () => descuentoRef.current,
      validate: () => {
        const nombre = nombreInputRef.current?.value || "";
        const email = emailInputRef.current?.value || "";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        let valid = true;

        if (!nombre.trim()) {
          if (errorNombreRef.current) {
            errorNombreRef.current.textContent = "Ingresa tu nombre";
            errorNombreRef.current.style.display = "flex";
          }
          valid = false;
        } else {
          if (errorNombreRef.current) {
            errorNombreRef.current.style.display = "none";
          }
        }

        if (!email.trim() || !emailRegex.test(email)) {
          if (errorEmailRef.current) {
            errorEmailRef.current.textContent = email.trim()
              ? "Email inválido"
              : "Ingresa tu email";
            errorEmailRef.current.style.display = "flex";
          }
          valid = false;
        } else {
          if (errorEmailRef.current) {
            errorEmailRef.current.style.display = "none";
          }
        }

        return valid;
      },
    }));

    const handleCuponValidado = (descuento: number, cupon: ValidacionCupon["cupon"]) => {
      console.log("[CheckoutForm] Cupón aplicado:", descuento);
      cuponDataRef.current = cupon;
      descuentoRef.current = descuento;
      if (onCuponChange) {
        onCuponChange(descuento);
      }
    };

    const handleCuponRemovido = () => {
      console.log("[CheckoutForm] Cupón removido");
      cuponDataRef.current = null;
      descuentoRef.current = 0;
      if (onCuponChange) {
        onCuponChange(0);
      }
    };

    return (
      <form className="space-y-5">
        {/* Nombre - NO CONTROLADO */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Nombre completo
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-focus-within:bg-orange-500/20 transition-colors">
              <User className="w-5 h-5 text-orange-500" />
            </div>
            <input
              ref={nombreInputRef}
              type="text"
              disabled={loading}
              className="w-full pl-16 pr-4 py-4 bg-zinc-800 border border-zinc-600 rounded-xl text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all hover:border-zinc-500"
              placeholder="Juan Pérez"
            />
          </div>
          <p
            ref={errorNombreRef}
            className="text-rose-600 text-xs mt-2 items-center gap-1.5 hidden"
            style={{ display: "none" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Ingresa tu nombre</span>
          </p>
        </motion.div>

        {/* Email - NO CONTROLADO */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Email
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center group-focus-within:bg-orange-500/20 transition-colors">
              <Mail className="w-5 h-5 text-orange-500" />
            </div>
            <input
              ref={emailInputRef}
              type="email"
              disabled={loading}
              readOnly={!!userEmail}
              className={`w-full pl-16 pr-12 py-4 border border-zinc-600 rounded-xl text-zinc-100 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-400 transition-all ${
                userEmail ? 'bg-zinc-700 cursor-not-allowed' : 'bg-zinc-800 hover:border-zinc-500'
              }`}
              placeholder="tu@email.com"
              onChange={(e) => !userEmail && onEmailChange?.(e.target.value)}
              onBlur={(e) => !userEmail && onEmailChange?.(e.target.value)}
            />
            {userEmail && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center">
                <Check className="w-4 h-4 text-emerald-400" />
              </div>
            )}
          </div>
          {userEmail && (
            <p className="text-emerald-400 text-xs mt-2 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5" />
              Email de tu cuenta verificado
            </p>
          )}
          <p
            ref={errorEmailRef}
            className="text-rose-600 text-xs mt-2 items-center gap-1.5"
            style={{ display: "none" }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
            <span>Ingresa tu email</span>
          </p>
          <p className="text-zinc-400 text-xs mt-2 flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-orange-500" />
            Recibirás tus credenciales VPN en este email
          </p>
        </motion.div>

        {/* Cupón */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <CuponInput
            planId={planId}
            precioPlan={planPrecio}
            onCuponValidado={handleCuponValidado}
            onCuponRemovido={handleCuponRemovido}
            cuponActual={cuponDataRef.current}
            descuentoActual={descuentoRef.current}
            clienteEmail={emailInputRef.current?.value}
          />
        </motion.div>
      </form>
    );
  }
);

CheckoutForm.displayName = "CheckoutForm";

export default CheckoutForm;
