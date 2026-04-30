import { ReactNode } from "react";
import { motion } from "framer-motion";

type AccentColor = "indigo" | "orange" | "zinc";

const accentMap: Record<AccentColor, string> = {
  indigo: "bg-indigo-500/10 text-indigo-400",
  orange: "bg-orange-500/10 text-orange-400",
  zinc: "bg-white/5 text-zinc-400 border border-white/5",
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
      className="rounded-2xl p-5 sm:p-6 lg:p-8 bg-[#1e1f26] border border-[#323644] shadow-xl hover:shadow-2xl hover:border-[#444857] transition-all relative overflow-hidden group"
    >
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
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
