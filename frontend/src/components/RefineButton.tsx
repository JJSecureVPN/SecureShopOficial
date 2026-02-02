import { ButtonHTMLAttributes, ReactNode } from "react";

interface RefineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
  fullWidthMobile?: boolean;
}

/**
 * Botón con el diseño exacto de Refine.dev
 * - Primary: Botón naranja con efecto brightness en hover
 * - Secondary: Botón gris con efecto glow interno en hover
 */
export function RefineButton({
  variant = "primary",
  children,
  fullWidthMobile = false,
  className = "",
  ...props
}: RefineButtonProps) {
  if (variant === "primary") {
    return (
      <button
        className={`rounded-lg !text-white bg-indigo-600 hover:bg-indigo-700 transition-colors duration-150 ease-in-out py-3 px-6 flex items-center justify-center gap-2 font-semibold text-base group ${
          fullWidthMobile ? "max-sm:w-full" : ""
        } ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  // Secondary variant
  return (
    <button
      className={`relative overflow-hidden rounded-lg bg-zinc-800 py-3 px-6 flex items-center justify-center gap-2 text-white text-base font-medium group ${
        fullWidthMobile ? "max-sm:w-full" : ""
      } ${className}`}
      {...props}
    >
      <div 
        className="rounded-lg absolute left-0 top-0 w-full h-full scale-[2] origin-center transition-[opacity,transform] duration-300 ease-in-out opacity-0 group-hover:opacity-100 group-hover:scale-100 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at center, transparent 0%, rgba(249, 115, 22, 0.08) 50%, rgba(249, 115, 22, 0.18) 100%)'
        }}
      />
      {children}
    </button>
  );
}
