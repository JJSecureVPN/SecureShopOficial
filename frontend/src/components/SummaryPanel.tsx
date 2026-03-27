import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles, Shield } from "lucide-react";

type AccentColor = "indigo" | "orange";

const glowColorMap: Record<AccentColor, string> = {
  indigo: "bg-indigo-500/10",
  orange: "bg-orange-500/10",
};

const badgeColorMap: Record<AccentColor, string> = {
  indigo: "text-indigo-400",
  orange: "text-orange-400",
};

const dotColorMap: Record<AccentColor, { bg: string; shadow: string }> = {
  indigo: {
    bg: "bg-indigo-500",
    shadow: "shadow-[0_0_8px_rgba(99,102,241,0.6)]",
  },
  orange: {
    bg: "bg-orange-500",
    shadow: "shadow-[0_0_8px_rgba(249,115,22,0.6)]",
  },
};

const unitColorMap: Record<AccentColor, string> = {
  indigo: "text-indigo-400",
  orange: "text-orange-400",
};

/* ─── Price breakdown row ─────────────────────────────── */

export interface PriceBreakdownRow {
  label: string;
  value: string;
  /** Renders in green (emerald) when true */
  isDiscount?: boolean;
}

/* ─── Props ───────────────────────────────────────────── */

interface SummaryPanelProps {
  /** Badge text next to the sparkles icon */
  badgeText: string;
  /** Big heading (e.g. "30 días", "5 cupos") */
  title: string;
  /** Descriptive subtitle */
  subtitle: ReactNode;
  accent?: AccentColor;

  /** Price section ─────────── */
  priceLabel: string;
  price: string;
  /** Text shown after the price, e.g. "/día" or "/cupo" */
  unitLabel?: string;
  unitValue?: string;

  /** Extra rows between price and benefits (subtotal, discount…) */
  priceBreakdown?: PriceBreakdownRow[];

  /** Bullet-point list of benefits */
  benefits: string[];

  /** Primary CTA */
  ctaLabel: string;
  onCtaClick: () => void;
  ctaDisabled?: boolean;
  ctaLoading?: boolean;
  ctaLoadingLabel?: string;
  /** Custom className for the CTA button (full override) */
  ctaClassName?: string;

  /** Optional secondary button (e.g. "Buscar otra cuenta", "Ver demo") */
  secondaryLabel?: string;
  onSecondaryClick?: () => void;

  /** Shown when there's no valid selection yet */
  emptyState?: ReactNode;
  /** Whether the summary has a valid selection to display */
  hasSelection?: boolean;
  /** Whether the 2x1 offer is active */
  is2x1?: boolean;

  /** Extra content rendered below the price area (e.g. CuponInput) */
  children?: ReactNode;
}

/**
 * Purchase / renewal summary sidebar used across VPN and Reseller pages.
 * Always render inside <StickyLayout aside={…} />.
 */
export default function SummaryPanel({
  badgeText,
  title,
  subtitle,
  accent = "indigo",
  priceLabel,
  price,
  unitLabel,
  unitValue,
  priceBreakdown,
  benefits,
  ctaLabel,
  onCtaClick,
  ctaDisabled = false,
  ctaLoading = false,
  ctaLoadingLabel,
  ctaClassName,
  secondaryLabel,
  onSecondaryClick,
  emptyState,
  hasSelection = true,
  is2x1 = false,
  children,
}: SummaryPanelProps) {
  const dot = dotColorMap[accent];

  const defaultCtaClass =
    accent === "orange"
      ? "w-full relative overflow-hidden group rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-zinc-950 font-bold px-4 py-3.5 transition-all active:scale-[0.98]"
      : "w-full relative overflow-hidden group rounded-xl bg-white text-zinc-950 font-medium px-4 py-3.5 transition-all hover:bg-zinc-100 active:scale-[0.98]";

  return (
    <div className="relative rounded-2xl p-6 sm:p-8 lg:p-10 bg-zinc-950 border border-zinc-800 shadow-2xl">
      {/* Glow — kept inside a clipped wrapper so it doesn't affect layout */}
      <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
        <div
          className={`absolute -top-32 -right-32 w-64 h-64 rounded-full blur-[80px] ${glowColorMap[accent]}`}
        />
      </div>

      <div className="relative">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 rounded px-3 py-1 text-[10px] font-mono uppercase tracking-widest bg-zinc-900 border border-zinc-800 mb-8 ${badgeColorMap[accent]}`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{badgeText}</span>
        </div>

        {is2x1 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-6 flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/10 border border-purple-500/30"
          >
            <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
            <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">
              ¡Oferta 2x1 Activa! (Doble dispositivos)
            </span>
          </motion.div>
        )}

        {hasSelection ? (
          <>
            {/* Title + subtitle */}
            <div className="space-y-2 mb-8">
              <h3 className="text-3xl sm:text-4xl font-light text-white tracking-tight">
                {title}
              </h3>
              <p className="text-sm text-zinc-400 font-light leading-relaxed">
                {subtitle}
              </p>
            </div>

            <div className="space-y-8 z-10">
              {/* Price */}
              <div className="relative">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-500 font-mono uppercase tracking-widest mb-1">
                    {priceLabel}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl lg:text-6xl font-medium text-white tracking-tight">
                      {price}
                    </span>
                    <span className="text-sm text-zinc-500 font-mono">ARS</span>
                  </div>
                </div>

                {unitLabel && unitValue && (
                  <div className="mt-3 flex items-center justify-between border-t border-dashed border-zinc-800 pt-3">
                    <span className="text-xs text-zinc-500">{unitLabel}</span>
                    <span className={`text-sm font-mono ${unitColorMap[accent]}`}>
                      {unitValue}
                    </span>
                  </div>
                )}
              </div>

              {/* Optional price breakdown rows */}
              {priceBreakdown && priceBreakdown.length > 0 && (
                <div className="space-y-3">
                  {priceBreakdown.map((row, idx) => (
                    <div
                      key={idx}
                      className={`flex justify-between items-center ${
                        row.isDiscount ? "text-emerald-400" : ""
                      }`}
                    >
                      <span className={`text-xs ${row.isDiscount ? "" : "text-zinc-500"}`}>
                        {row.label}
                      </span>
                      <span className={`text-sm ${row.isDiscount ? "font-medium" : "text-zinc-400"}`}>
                        {row.value}
                      </span>
                    </div>
                  ))}
                  <div className="h-px bg-zinc-800" />
                </div>
              )}

              {/* Benefits */}
              <ul className="space-y-4">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${dot.bg} ${dot.shadow}`}
                    />
                    <span className="text-sm text-zinc-300 font-light">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Extra children (e.g. CuponInput) */}
              {children}

              {/* CTA */}
              <div className="space-y-4 pt-4">
                <button
                  onClick={onCtaClick}
                  disabled={ctaDisabled || ctaLoading}
                  className={
                    ctaClassName ??
                    `${defaultCtaClass}${ctaDisabled || ctaLoading ? " opacity-50 cursor-not-allowed" : ""}`
                  }
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {ctaLoading ? (
                      ctaLoadingLabel ?? "Procesando..."
                    ) : (
                      <>
                        {ctaLabel}
                        <span className="transition-transform group-hover:translate-x-1">
                          →
                        </span>
                      </>
                    )}
                  </span>
                </button>

                {secondaryLabel && onSecondaryClick && (
                  <button
                    onClick={onSecondaryClick}
                    className="w-full relative rounded-xl bg-transparent border border-zinc-700 text-zinc-300 font-medium px-4 py-3.5 transition-all hover:bg-zinc-800 hover:text-white hover:border-zinc-600 active:scale-[0.98]"
                  >
                    {secondaryLabel}
                  </button>
                )}
              </div>

              {/* Security note */}
              <div className="flex items-center justify-center gap-2">
                <Shield className="w-3.5 h-3.5 text-zinc-600" />
                <p className="text-[10px] font-mono tracking-wider text-zinc-600 uppercase text-center">
                  Pago cifrado y seguro
                </p>
              </div>
            </div>
          </>
        ) : (
          emptyState ?? (
            <div className="rounded-xl border border-dashed border-zinc-800 p-8 text-center bg-zinc-900/20">
              <Shield className="w-6 h-6 text-zinc-700 mx-auto mb-4" />
              <p className="text-xs text-zinc-500 font-mono uppercase tracking-widest leading-relaxed">
                Esperando
                <br />
                selección
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
