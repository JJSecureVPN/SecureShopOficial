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

  useEffect(() => {
    if (sorted.length > 0 && !sorted.includes(value)) {
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
    <div className="w-full pt-8 pb-4 select-none font-title">
      <div className="relative max-w-2xl mx-auto px-4 sm:px-8">
        
        {/* Monospace Labels Above Track */}
        <div className="relative w-full h-8 mb-6">
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
                    color: isActive ? "#ffffff" : "#3f3f46",
                    fontWeight: isActive ? 900 : 400,
                    y: isActive ? -4 : 0,
                    scale: isActive ? 1.1 : 1
                  }}
                  className="font-mono text-[11px] sm:text-xs transition-all duration-300 pointer-events-none whitespace-nowrap uppercase tracking-widest"
                >
                  <div className="flex flex-col items-center">
                    {isActive && is2x1 && unit === "dispositivos" && (
                      <motion.span
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-[9px] font-black text-[#00ffc8] mb-0.5 leading-none"
                      >
                        OFERTA 2x1
                      </motion.span>
                    )}
                    <span>
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
          className="relative h-10 flex items-center cursor-pointer"
          onClick={handleTrackClick}
          style={{ touchAction: "none" }}
        >
          {/* Background Track */}
          <div className="absolute w-full h-1.5 bg-[#060606] border border-zinc-800/50 rounded-full" />
          
          {/* Filled portion */}
          <motion.div
            className="absolute left-0 h-1.5 rounded-full bg-zinc-700"
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
                className="absolute top-1/2 -mt-1 w-2 h-2 rounded-full pointer-events-none transition-colors duration-300"
                style={{
                  left: `${pct}%`,
                  transform: "translateX(-50%)",
                  backgroundColor: isPast ? "#52525b" : "#18181b",
                  border: isPast ? "1px solid #71717a" : "1px solid #27272a"
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
              marginTop: -20,
              width: 40,
              height: 40,
              zIndex: 10,
              cursor: isDragging ? "grabbing" : "grab"
            }}
            animate={{
              left: `calc(${progress}% - 20px)`,
            }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Visual Thumb Circle */}
            <motion.div
              className="relative w-7 h-7 bg-white rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] flex items-center justify-center"
              animate={{
                scale: isDragging ? 1.2 : 1,
                boxShadow: isDragging 
                  ? "0 0 30px rgba(255,255,255,0.4)" 
                  : "0 0 20px rgba(255,255,255,0.2)"
              }}
            >
              {/* Inner symbol */}
              <div className="w-1 h-3 bg-black rounded-full" />
            </motion.div>
          </motion.div>
        </div>

        {/* Drag Hint */}
        <div className="flex justify-center mt-8">
          <motion.div
            initial={{ opacity: 0.4 }}
            animate={{ opacity: isDragging ? 0.8 : 0.4 }}
            className="flex items-center gap-4 text-[9px] font-black tracking-[0.3em] uppercase text-zinc-500"
          >
            <div className="w-8 h-px bg-zinc-800" />
            {isDragging ? (
              <span className="text-white">Ajustando: {label(value)} {unit}</span>
            ) : (
              <span>Desliza para elegir</span>
            )}
            <div className="w-8 h-px bg-zinc-800" />
          </motion.div>
        </div>

      </div>
    </div>
  );
}
