import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Sparkles, Shield } from "lucide-react";

type AccentColor = "indigo" | "orange" | "zinc";


const badgeColorMap: Record<AccentColor, string> = {
  indigo: "text-indigo-400",
  orange: "text-orange-400",
  zinc: "text-zinc-500",
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
  zinc: {
    bg: "bg-zinc-700",
    shadow: "shadow-[0_0_8px_rgba(113,113,122,0.3)]",
  },
};

const unitColorMap: Record<AccentColor, string> = {
  indigo: "text-indigo-400",
  orange: "text-orange-400",
  zinc: "text-[#00ffc8]",
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
  className?: string;

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
  className = "",
  children,
}: SummaryPanelProps) {
  const dot = dotColorMap[accent];

  const defaultCtaClass =
    accent === "orange"
      ? "w-full relative overflow-hidden group rounded-xl bg-gradient-to-r from-orange-500 to-amber-400 hover:from-orange-400 hover:to-amber-300 text-zinc-950 font-bold px-4 py-3.5 transition-all active:scale-[0.98]"
      : "w-full relative overflow-hidden group rounded-xl bg-white text-zinc-950 font-medium px-4 py-3.5 transition-all hover:bg-zinc-100 active:scale-[0.98]";

  return (
    <div className={`relative rounded-3xl p-8 sm:p-10 bg-[#0a0a0c] border border-zinc-800/80 shadow-2xl font-title ${className}`}>
      <div className="relative">
        {/* Badge */}
        <div
          className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.2em] bg-[#060606] border border-zinc-800/50 mb-10 ${badgeColorMap[accent]}`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          <span>{badgeText}</span>
        </div>

        {is2x1 && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="mb-8 flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
              OFERTA 2X1 ACTIVA
            </span>
          </motion.div>
        )}

        {hasSelection ? (
          <>
            {/* Title + subtitle */}
            <div className="space-y-3 mb-10">
              <h3 className="text-4xl font-extrabold text-white tracking-tighter leading-none">
                {title}
              </h3>
              <div className="text-sm text-zinc-500 font-medium leading-relaxed">
                {subtitle}
              </div>
            </div>

            <div className="space-y-10 z-10">
              {/* Price */}
              <div className="relative">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-[0.2em] mb-2 font-mono">
                    {priceLabel}
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-6xl lg:text-7xl font-extrabold text-white tracking-tighter">
                      {price}
                    </span>
                    <span className="text-xs font-bold text-zinc-600 font-mono tracking-widest">ARS</span>
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
                      className={`flex justify-between items-center ${row.isDiscount ? "text-emerald-400" : ""
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
              <ul className="space-y-5">
                {benefits.map((benefit, i) => (
                  <li key={i} className="flex items-start gap-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.4 + i * 0.1 }}
                      className={`w-1.5 h-1.5 rounded-full mt-2 shrink-0 ${dot.bg} ${dot.shadow}`}
                    />
                    <span className="text-sm text-zinc-300 font-medium">
                      {benefit}
                    </span>
                  </li>
                ))}
              </ul>

              {/* Extra children (e.g. CuponInput) */}
              {children}

              {/* CTA */}
              <div className="space-y-4 pt-6">
                <button
                  onClick={onCtaClick}
                  disabled={ctaDisabled || ctaLoading}
                  className={
                    ctaClassName ??
                    `${defaultCtaClass}${ctaDisabled || ctaLoading ? " opacity-50 cursor-not-allowed" : ""}`
                  }
                >
                  <span className="relative z-10 flex items-center justify-center gap-3 font-bold uppercase tracking-widest text-xs">
                    {ctaLoading ? (
                      ctaLoadingLabel ?? "PROCESANDO..."
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
