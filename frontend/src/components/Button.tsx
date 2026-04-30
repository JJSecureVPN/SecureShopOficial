import { forwardRef, ButtonHTMLAttributes, AnchorHTMLAttributes } from "react";
import { cn } from "../utils/cn";

// Variantes de botón al estilo ProtonVPN
const buttonVariants = {
  // Botón primario - fondo sólido
  primary: [
    "bg-orange-600 text-white",
    "hover:bg-orange-700",
    "focus-visible:ring-orange-800",
  ].join(" "),
  
  // Botón secundario - outline con shadow inset (estilo ProtonVPN)
  secondary: [
    "bg-transparent text-orange-600",
    "shadow-orange-600 shadow-[inset_0_0_0_2px]",
    "hover:bg-orange-600 hover:text-white hover:shadow-transparent",
    "focus-visible:ring-orange-800",
  ].join(" "),
  
  // Botón de éxito (verde)
  success: [
    "bg-green-600 text-white",
    "hover:bg-green-700",
    "focus-visible:ring-green-800",
  ].join(" "),
  
  // Botón ghost - sin fondo ni borde
  ghost: [
    "bg-transparent text-orange-600",
    "hover:bg-orange-950/30",
    "focus-visible:ring-orange-800",
  ].join(" "),
  
  // Botón de peligro
  danger: [
    "bg-red-600 text-white",
    "hover:bg-red-700",
    "focus-visible:ring-red-800",
  ].join(" "),
};

// Tamaños de botón
const buttonSizes = {
  sm: "py-1.5 px-4 text-sm gap-1.5",
  md: "py-2.5 px-5 text-sm sm:text-base gap-2",
  lg: "py-3 px-6 text-base gap-2",
};

// Estilos base compartidos (al estilo ProtonVPN)
const baseStyles = [
  "inline-flex shrink-0 items-center justify-center",
  "rounded-full",
  "text-center font-semibold",
  "outline-none",
  "transition-[color,background-color,border-color,box-shadow] duration-150 ease-out",
  "ring-offset-white ring-offset-2 focus-visible:ring-2",
  "active:translate-y-px", // Efecto de presión sutil
  "disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0",
  "whitespace-nowrap",
].join(" ");

// Estilo para móvil (ancho completo en pantallas pequeñas)
const mobileFullWidth = "max-sm:w-full";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  fullWidthMobile?: boolean;
  isLoading?: boolean;
}

export interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: keyof typeof buttonVariants;
  size?: keyof typeof buttonSizes;
  fullWidthMobile?: boolean;
  href: string;
}

// Componente Button
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidthMobile = false,
      isLoading = false,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          buttonVariants[variant],
          buttonSizes[size],
          fullWidthMobile && mobileFullWidth,
          className
        )}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              className="animate-spin h-4 w-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Cargando...</span>
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

// Componente LinkButton (para enlaces que parecen botones)
export const LinkButton = forwardRef<HTMLAnchorElement, LinkButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      fullWidthMobile = false,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <a
        ref={ref}
        className={cn(
          baseStyles,
          buttonVariants[variant],
          buttonSizes[size],
          fullWidthMobile && mobileFullWidth,
          "no-underline",
          className
        )}
        {...props}
      >
        {children}
      </a>
    );
  }
);

LinkButton.displayName = "LinkButton";

export default Button;
