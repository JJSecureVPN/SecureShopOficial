import { motion } from "framer-motion";
import { Monitor, Smartphone, Tablet, Laptop } from "lucide-react";

interface DeviceChipSelectorProps {
  options: number[];
  value: number;
  onChange: (value: number) => void;
}

const DEVICE_ICONS = [Smartphone, Laptop, Tablet, Monitor];

/**
 * Horizontal chip selector for device count.
 * Each chip shows an icon, the count, and animates a sliding indicator
 * behind the active chip via Framer Motion `layoutId`.
 */
export default function DeviceChipSelector({
  options,
  value,
  onChange,
}: DeviceChipSelectorProps) {
  const sorted = [...options].sort((a, b) => a - b);

  return (
    <div className="flex flex-wrap gap-3">
      {sorted.map((opt, i) => {
        const isActive = opt === value;
        const Icon = DEVICE_ICONS[i % DEVICE_ICONS.length];

        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`relative flex items-center gap-2.5 rounded-xl px-5 py-3.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${
              isActive
                ? "text-white"
                : "text-zinc-400 bg-zinc-800/50 border border-zinc-700 hover:border-indigo-500/30 hover:bg-zinc-800 hover:text-zinc-200"
            }`}
          >
            {/* Animated background pill */}
            {isActive && (
              <motion.div
                layoutId="device-chip-active"
                className="absolute inset-0 rounded-xl bg-indigo-600/20 border-2 border-indigo-500"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            <span className="relative flex items-center gap-2.5">
              <Icon
                className={`w-4 h-4 transition-colors duration-200 ${
                  isActive ? "text-indigo-400" : "text-zinc-500"
                }`}
              />
              <span>
                {opt} {opt === 1 ? "dispositivo" : "dispositivos"}
              </span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
