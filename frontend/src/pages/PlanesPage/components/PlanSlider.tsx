import { useRef, useCallback, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";

interface PlanSliderProps {
  options: number[];
  value: number;
  onChange: (value: number) => void;
  formatLabel?: (value: number) => string;
  unit?: string;
  is2x1?: boolean;
}

export default function PlanSlider({
  options,
  value,
  onChange,
  formatLabel,
  unit = "días",
  is2x1 = false,
}: PlanSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const sorted = useMemo(() => [...options].sort((a, b) => a - b), [options]);

  // Si el valor actual no está en las opciones, buscamos el más cercano
  useEffect(() => {
    if (sorted.length > 0 && !sorted.includes(value)) {
      // Buscar el valor más cercano o el primero por defecto
      const closest = sorted.reduce((prev, curr) => {
        return Math.abs(curr - value) < Math.abs(prev - value) ? curr : prev;
      });
      onChange(closest);
    }
  }, [sorted, value, onChange]);

  const rawIndex = sorted.indexOf(value);
  const activeIndex = rawIndex === -1 ? 0 : rawIndex;
  const count = sorted.length;
  const progress = count <= 1 ? 0 : (activeIndex / (count - 1)) * 100;

  const label = (v: number) => (formatLabel ? formatLabel(v) : `${v}`);

  /* ── Resolve pointer → closest step ──────────────────────────── */
  const resolveValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current;
      if (!track || count <= 1) return;
      const rect = track.getBoundingClientRect();
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
      const idx = Math.round((x / rect.width) * (count - 1));
      const clamped = Math.max(0, Math.min(idx, count - 1));
      if (sorted[clamped] !== value) onChange(sorted[clamped]);
    },
    [sorted, count, value, onChange]
  );

  /* ── Pointer events ──────────────────────────────────────────── */
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      resolveValue(e.clientX);
    },
    [resolveValue]
  );
  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;
      resolveValue(e.clientX);
    },
    [isDragging, resolveValue]
  );
  const handlePointerUp = useCallback(() => setIsDragging(false), []);
  const handleTrackClick = useCallback(
    (e: React.MouseEvent) => resolveValue(e.clientX),
    [resolveValue]
  );

  /* ── Keyboard ────────────────────────────────────────────────── */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement?.getAttribute("data-plan-thumb") !== "true") return;
      const idx = sorted.indexOf(value);
      if ((e.key === "ArrowRight" || e.key === "ArrowUp") && idx < count - 1) {
        e.preventDefault();
        onChange(sorted[idx + 1]);
      }
      if ((e.key === "ArrowLeft" || e.key === "ArrowDown") && idx > 0) {
        e.preventDefault();
        onChange(sorted[idx - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sorted, count, value, onChange]);

  return (
    <div className="w-full pt-8 pb-4 select-none">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-8">
        
        {/* Monospace Labels Above Track */}
        <div className="relative w-full h-8 mb-4">
          {sorted.map((opt, i) => {
            const isActive = i === activeIndex;
            const pct = count <= 1 ? 0 : (i / (count - 1)) * 100;
            return (
              <div 
                key={`label-${opt}`}
                className="absolute top-0 flex flex-col items-center justify-end h-full"
                style={{
                  left: `${pct}%`,
                  transform: "translateX(-50%)"
                }}
              >
                <motion.span
                  animate={{
                    color: isActive ? "#a5b4fc" : "#71717a",
                    fontWeight: isActive ? 600 : 400,
                    y: isActive ? -4 : 0,
                    scale: isActive ? 1.05 : 1
                  }}
                  className="font-mono text-[11px] sm:text-xs transition-all duration-300 pointer-events-none whitespace-nowrap"
                >
                  <div className="flex flex-col items-center">
                    {isActive && is2x1 && unit === "dispositivos" && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] font-bold text-purple-400 mb-0.5 leading-none"
                      >
                        OFERTA 2x1
                      </motion.span>
                    )}
                    <span className={isActive ? "text-indigo-300" : ""}>
                      {label(opt)}
                    </span>
                  </div>
                </motion.span>
              </div>
            );
          })}
        </div>

        {/* The Track Line */}
        <div
          ref={trackRef}
          className="relative h-8 flex items-center cursor-pointer"
          onClick={handleTrackClick}
          style={{ touchAction: "none" }}
        >
          {/* Thin Background Track */}
          <div className="absolute w-full h-[3px] bg-zinc-800/80 rounded-full" />
          
          {/* Filled portion */}
          <motion.div
            className="absolute left-0 h-[3px] rounded-full bg-gradient-to-r from-indigo-600 to-indigo-400"
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />

          {/* Steps Dots */}
          {sorted.map((opt, i) => {
            const pct = count <= 1 ? 0 : (i / (count - 1)) * 100;
            const isPast = i <= activeIndex;
            return (
              <div
                key={`dot-${opt}`}
                className="absolute top-1/2 -mt-[3px] w-1.5 h-1.5 rounded-full pointer-events-none transition-colors duration-300"
                style={{
                  left: `${pct}%`,
                  transform: "translateX(-50%)",
                  backgroundColor: isPast ? "#a5b4fc" : "#3f3f46"
                }}
              />
            );
          })}

          {/* Draggable Thumb */}
          <motion.div
            data-plan-thumb="true"
            tabIndex={0}
            role="slider"
            aria-valuemin={sorted[0]}
            aria-valuemax={sorted[count - 1]}
            aria-valuenow={value}
            aria-label={`Seleccionar ${unit}`}
            className="absolute outline-none flex items-center justify-center"
            style={{
              top: "50%",
              marginTop: -16, // middle of h-32
              width: 32,
              height: 32,
              zIndex: 10,
              cursor: isDragging ? "grabbing" : "grab"
            }}
            animate={{
              left: `calc(${progress}% - 16px)`, // center thumb on exact percent
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Visual Thumb Circle */}
            <motion.div
              className="relative w-[22px] h-[22px] bg-zinc-950 rounded-full border-[2.5px] border-indigo-500 shadow-[0_0_12px_rgba(99,102,241,0.4)] flex items-center justify-center"
              animate={{
                scale: isDragging ? 1.2 : 1,
                borderColor: isDragging ? "#818cf8" : "#6366f1",
                boxShadow: isDragging 
                  ? "0 0 20px rgba(99,102,241,0.6)" 
                  : "0 0 12px rgba(99,102,241,0.4)"
              }}
            >
              {/* Inner dot */}
              <motion.div 
                className="w-1.5 h-1.5 bg-indigo-400 rounded-full"
                animate={{
                  scale: isDragging ? 0.8 : 1,
                  backgroundColor: isDragging ? "#a5b4fc" : "#818cf8"
                }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* Drag Hint */}
        <div className="flex justify-center mt-7">
          <motion.div
            initial={{ opacity: 0.5 }}
            animate={{ opacity: isDragging ? 0.9 : 0.5 }}
            className="flex items-center gap-3 text-[10px] font-mono tracking-widest uppercase text-zinc-500"
          >
            <span className="text-[8px] opacity-70">◁</span>
            {isDragging ? (
              <span className="text-indigo-400">Seleccionando {label(value)}</span>
            ) : (
              <span>Desliza para elegir</span>
            )}
            <span className="text-[8px] opacity-70">▷</span>
          </motion.div>
        </div>

      </div>
    </div>
  );
}

