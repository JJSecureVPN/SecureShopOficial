import { ReactNode } from "react";
import { motion } from "framer-motion";

type AccentColor = "indigo" | "orange";

const accentMap: Record<AccentColor, string> = {
  indigo: "bg-indigo-500/10 text-indigo-400",
  orange: "bg-orange-500/10 text-orange-400",
};

interface StepCardProps {
  /** Label shown in the badge (e.g. "Paso 1", "Beneficios") */
  label: string;
  /** Card heading */
  title: string;
  /** Optional subtitle below the heading */
  subtitle?: string;
  /** Theme accent */
  accent?: AccentColor;
  /** Stagger delay for the enter animation (seconds) */
  delay?: number;
  children: ReactNode;
}

/**
 * Animated card used inside the left column of a StickyLayout.
 * Provides consistent badge, heading, and entrance animation.
 */
export default function StepCard({
  label,
  title,
  subtitle,
  accent = "indigo",
  delay = 0.1,
  children,
}: StepCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-2xl p-5 sm:p-6 lg:p-8 bg-zinc-900/50 border border-zinc-700 shadow-sm hover:shadow-lg hover:border-zinc-600 transition-all"
    >
      <div className="mb-6">
        <span
          className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3 ${accentMap[accent]}`}
        >
          {label}
        </span>
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
          {title}
        </h3>
        {subtitle && (
          <p className="text-sm mt-1 text-zinc-400">{subtitle}</p>
        )}
      </div>
      {children}
    </motion.div>
  );
}
