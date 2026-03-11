import { useState, useEffect, useRef } from "react";
import { Shield, Globe2, Lock, Server, UploadCloud } from "lucide-react";

interface Feature {
  id: number;
  icon: typeof Shield;
  title: string;
  image: string;
  description: string;
  color: { accent: string; rgb: string };
}

const features: Feature[] = [
  {
    id: 0,
    icon: Server,
    title: "Interfaz Principal",
    image: "/ServerCard.png",
    description:
      "Conecta y desconecta con un solo clic. Selecciona servidores optimizados automáticamente y accede a estadísticas en tiempo real de tu conexión.",
    color: { accent: "#6b7fff", rgb: "107,127,255" },
  },
  {
    id: 1,
    icon: Shield,
    title: "Menú Completo",
    image: "/menuitem.png",
    description:
      "Gestiona el compartir WiFi, configura APN para conexiones móviles y mantén tu conexión segura y estable en todo momento.",
    color: { accent: "#34d399", rgb: "52,211,153" },
  },
  {
    id: 2,
    icon: Globe2,
    title: "Servidores Estratégicos",
    image: "/servidores.png",
    description:
      "Servidores de alta velocidad seleccionados para conexiones óptimas. Red global en expansión continua con estabilidad garantizada.",
    color: { accent: "#c084fc", rgb: "192,132,252" },
  },
  {
    id: 3,
    icon: Lock,
    title: "Sistema de Logs",
    image: "/logs.png",
    description:
      "Monitorea conexiones en tiempo real, revisa historial de sesiones e identifica problemas de conectividad con reportes detallados.",
    color: { accent: "#f97316", rgb: "249,115,22" },
  },
  {
    id: 4,
    icon: UploadCloud,
    title: "Importar Configuración",
    image: "/ImportScreen.png",
    description:
      "Pega un JSON con servidor y credenciales. La app analiza el contenido y configura todo automáticamente sin pasos adicionales.",
    color: { accent: "#38bdf8", rgb: "56,189,248" },
  },
];

export default function InteractiveShowcaseSection() {
  const [active, setActive] = useState(0);
  const [prev, setPrev] = useState<number | null>(null);
  const [dir, setDir] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused] = useState(false);
  const touchX = useRef<number | null>(null);
  const progKey = useRef(0);

  const goTo = (idx: number, d?: "next" | "prev") => {
    if (animating || idx === active) return;
    const resolved = d ?? (idx > active ? "next" : "prev");
    setDir(resolved);
    setPrev(active);
    setAnimating(true);
    setActive(idx);
    progKey.current++;
    setTimeout(() => { setPrev(null); setAnimating(false); }, 600);
  };

  const goNext = () => goTo((active + 1) % features.length, "next");
  const goPrev = () => goTo((active - 1 + features.length) % features.length, "prev");

  useEffect(() => {
    if (paused) return;
    const t = setInterval(goNext, 4500);
    return () => clearInterval(t);
  }, [paused, active, animating]);

  const feat = features[active];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Geist:wght@300;400;500;600&family=Geist+Mono:wght@400;500&display=swap');

        .sc-root { font-family: 'Geist', sans-serif; }
        .sc-mono { font-family: 'Geist Mono', monospace !important; }

        /* ── Image enter/exit (vertical slide) ── */
        @keyframes iIn  { from{opacity:0;transform:translateY(32px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes iOut { from{opacity:1;transform:translateY(0) scale(1)}      to{opacity:0;transform:translateY(-24px) scale(.97)} }
        @keyframes iInP { from{opacity:0;transform:translateY(-32px) scale(.96)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes iOutP{ from{opacity:1;transform:translateY(0) scale(1)}       to{opacity:0;transform:translateY(24px) scale(.97)} }
        .img-in   { animation: iIn   .55s cubic-bezier(.22,1,.36,1) both }
        .img-out  { animation: iOut  .40s cubic-bezier(.22,1,.36,1) both }
        .img-in-p { animation: iInP  .55s cubic-bezier(.22,1,.36,1) both }
        .img-out-p{ animation: iOutP .40s cubic-bezier(.22,1,.36,1) both }

        /* ── Text clip reveal ── */
        @keyframes clipReveal { from{clip-path:inset(100% 0 0 0)} to{clip-path:inset(0% 0 0 0)} }
        @keyframes clipRevealD{ from{clip-path:inset(0 0 100% 0)} to{clip-path:inset(0% 0 0 0)} }
        @keyframes fadeu { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes faded { from{opacity:0;transform:translateY(-10px)} to{opacity:1;transform:translateY(0)} }
        .title-in   { animation: clipReveal  .5s cubic-bezier(.22,1,.36,1) both }
        .title-in-p { animation: clipRevealD .5s cubic-bezier(.22,1,.36,1) both }
        .desc-in    { animation: fadeu .5s .07s cubic-bezier(.22,1,.36,1) both }
        .desc-in-p  { animation: faded .5s .07s cubic-bezier(.22,1,.36,1) both }

        /* ── Big number ── */
        @keyframes nIn  { from{opacity:0;transform:translateY(80%)} to{opacity:1;transform:translateY(0)} }
        @keyframes nInP { from{opacity:0;transform:translateY(-80%)} to{opacity:1;transform:translateY(0)} }
        .num-in   { animation: nIn  .45s cubic-bezier(.22,1,.36,1) both }
        .num-in-p { animation: nInP .45s cubic-bezier(.22,1,.36,1) both }

        /* ── Progress ── */
        @keyframes progFill { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        .prog { transform-origin:left; animation: progFill 4.5s linear forwards }
        .prog-pause { animation-play-state:paused }

        /* ── Nav button hover ── */
        .sc-nav:hover { border-color: #2a2a30 !important; color: #fff !important; }
        .sc-tab:hover { background: #0f0f14 !important; }

        /* ────── LAYOUT ────── */
        /* Desktop grid: [80px number] [1fr image] [300px sidebar] */
        @media (min-width: 1024px) {
          .sc-grid   { display: grid !important; grid-template-columns: 72px 1fr 300px; gap: 28px; min-height: 560px; }
          .sc-mobile { display: none !important; }
        }
        @media (max-width: 1023px) {
          .sc-grid   { display: none !important; }
          .sc-mobile { display: block !important; }
        }
      `}</style>

      <section
        className="sc-root"
        style={{ padding: "80px 0" }}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <div style={{ maxWidth: "1160px", margin: "0 auto", padding: "0 24px" }}>

          {/* ── Section header ── */}
          <div style={{ marginBottom: "56px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "18px" }}>
              <div style={{
                width: "5px", height: "5px", borderRadius: "50%",
                background: feat.color.accent,
                boxShadow: `0 0 10px 2px rgba(${feat.color.rgb},.5)`,
                transition: "background .5s, box-shadow .5s",
              }} />
              <span className="sc-mono" style={{ fontSize: "11px", letterSpacing: "0.14em", color: "#333", textTransform: "uppercase" }}>
                JJSecure VP-N
              </span>
            </div>
            <h2 className="font-title" style={{
              fontSize: "clamp(26px, 3.6vw, 48px)",
              fontWeight: 300,
              color: "#e8e8ea",
              lineHeight: 1.12,
              letterSpacing: "-0.025em",
              margin: 0,
            }}>
              Todo lo que necesitas,{" "}
              <span style={{
                fontWeight: 600,
                color: feat.color.accent,
                transition: "color .5s ease",
              }}>sin complejidad.</span>
            </h2>
          </div>

          {/* ═══════════════════════
              DESKTOP  ≥ 1024px
          ═══════════════════════ */}
          <div className="sc-grid" style={{ display: "none", alignItems: "stretch" }}>

            {/* Col 1: Number + nav */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "4px" }}>
              {/* Overflow clip for number animation */}
              <div style={{ overflow: "hidden", height: "clamp(72px,9vw,108px)", display: "flex", alignItems: "flex-start" }}>
                <div
                  key={`num-${active}`}
                  className={`sc-mono ${dir === "next" ? "num-in" : "num-in-p"}`}
                  style={{
                    fontSize: "clamp(72px,9vw,108px)",
                    fontWeight: 500,
                    color: feat.color.accent,
                    lineHeight: 1,
                    letterSpacing: "-0.05em",
                    transition: "color .5s",
                  }}
                >
                  {String(active + 1).padStart(2, "0")}
                </div>
              </div>
              <div className="sc-mono" style={{ fontSize: "11px", color: "#252528", marginTop: "4px" }}>
                /{String(features.length).padStart(2, "0")}
              </div>

              {/* Vertical step pills */}
              <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "center" }}>
                {features.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => goTo(i)}
                    title={f.title}
                    style={{
                      width: "3px",
                      height: active === i ? "28px" : "14px",
                      borderRadius: "2px",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      background: active === i ? f.color.accent : "#1a1a1e",
                      boxShadow: active === i ? `0 0 8px rgba(${f.color.rgb},.4)` : "none",
                      transition: "all .4s cubic-bezier(.22,1,.36,1)",
                    }}
                  />
                ))}
              </div>

              {/* Prev / Next */}
              <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "8px" }}>
                {[{ fn: goPrev, icon: "M7 11L3 7L7 3M11 7H3" }, { fn: goNext, icon: "M7 3L11 7L7 11M3 7H11" }].map((b, bi) => (
                  <button
                    key={bi}
                    onClick={b.fn}
                    className="sc-nav"
                    style={{
                      width: "34px", height: "34px", borderRadius: "8px",
                      border: "1px solid #18181c",
                      background: "transparent", cursor: "pointer",
                      color: "#333",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "border-color .2s, color .2s",
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d={b.icon} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                ))}
              </div>
            </div>

            {/* Col 2: Image panel */}
            <div style={{
              position: "relative",
              borderRadius: "14px",
              overflow: "hidden",
              background: "#0c0c10",
              border: "1px solid #131316",
            }}>
              {/* Glow */}
              <div style={{
                position: "absolute", inset: 0, pointerEvents: "none",
                background: `radial-gradient(ellipse at 65% 15%, rgba(${feat.color.rgb},.09), transparent 60%)`,
                transition: "background .7s ease",
              }} />
              {/* Top line */}
              <div style={{
                position: "absolute", top: 0, inset: "0 0 auto 0", height: "1px",
                background: `linear-gradient(90deg, transparent, rgba(${feat.color.rgb},.45), transparent)`,
                transition: "background .5s",
              }} />

              {/* Images */}
              {features.map((f, i) => {
                const isAct = i === active;
                const isPrv = i === prev;
                let cls = "";
                if (isAct) cls = dir === "next" ? "img-in" : "img-in-p";
                else if (isPrv) cls = dir === "next" ? "img-out" : "img-out-p";
                return (
                  <img
                    key={f.id}
                    src={f.image}
                    alt={f.title}
                    className={cls}
                    style={{
                      position: "absolute",
                      inset: "20px",
                      width: "calc(100% - 40px)",
                      height: "calc(100% - 40px)",
                      objectFit: "contain",
                      opacity: (!isAct && !isPrv) ? 0 : undefined,
                    }}
                  />
                );
              })}

              {/* Badge */}
              <div className="sc-mono" style={{
                position: "absolute", top: "14px", right: "14px",
                fontSize: "10px", color: "#202025",
                letterSpacing: "0.08em",
              }}>
                {String(active + 1).padStart(2, "0")}/{String(features.length).padStart(2, "0")}
              </div>
            </div>

            {/* Col 3: Sidebar — tabs + description */}
            <div style={{ display: "flex", flexDirection: "column", paddingTop: "4px" }}>

              {/* Tab list */}
              <nav style={{ display: "flex", flexDirection: "column", gap: "1px", marginBottom: "32px" }}>
                {features.map((f, i) => {
                  const isAct = active === i;
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      onClick={() => goTo(i)}
                      className="sc-tab"
                      style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "9px 10px", borderRadius: "7px",
                        border: "none", cursor: "pointer", textAlign: "left",
                        background: isAct ? "#0e0e13" : "transparent",
                        borderLeft: `2px solid ${isAct ? f.color.accent : "transparent"}`,
                        transition: "all .25s ease",
                        fontFamily: "inherit",
                      }}
                    >
                      <Icon style={{
                        width: "14px", height: "14px", flexShrink: 0,
                        color: isAct ? f.color.accent : "#2a2a30",
                        transition: "color .25s",
                      }} />
                      <span style={{
                        fontSize: "13px",
                        color: isAct ? "#d4d4d8" : "#3a3a40",
                        fontWeight: isAct ? 500 : 400,
                        transition: "color .25s",
                        letterSpacing: "-0.01em",
                      }}>
                        {f.title}
                      </span>
                    </button>
                  );
                })}
              </nav>

              {/* Divider */}
              <div style={{ height: "1px", background: "#111", marginBottom: "24px" }} />

              {/* Description */}
              <div style={{ flex: 1, overflow: "hidden" }}>
                <div key={`dt-${active}`} className={dir === "next" ? "title-in" : "title-in-p"}>
                  <h3 style={{
                    fontSize: "16px", fontWeight: 500, color: "#e0e0e4",
                    margin: "0 0 10px 0", letterSpacing: "-0.02em", lineHeight: 1.3,
                  }}>
                    {feat.title}
                  </h3>
                </div>
                <div key={`dd-${active}`} className={dir === "next" ? "desc-in" : "desc-in-p"}>
                  <p style={{
                    fontSize: "13px", color: "#444", lineHeight: 1.75,
                    margin: 0,
                  }}>
                    {feat.description}
                  </p>
                </div>
              </div>

              {/* Progress strips */}
              <div style={{ marginTop: "28px", display: "flex", gap: "5px" }}>
                {features.map((f, i) => (
                  <div
                    key={i}
                    onClick={() => goTo(i)}
                    style={{
                      flex: active === i ? 3 : 1,
                      height: "2px", borderRadius: "1px",
                      background: "#111", overflow: "hidden", cursor: "pointer",
                      transition: "flex .4s cubic-bezier(.22,1,.36,1)",
                    }}
                  >
                    {active === i && (
                      <div
                        key={`pr-${active}-${progKey.current}`}
                        className={`prog ${paused ? "prog-pause" : ""}`}
                        style={{ height: "100%", background: f.color.accent }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ═══════════════════════
              MOBILE  < 1024px
          ═══════════════════════ */}
          <div className="sc-mobile" style={{ display: "none" }}>
            <div
              onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
              onTouchEnd={e => {
                if (touchX.current === null) return;
                const diff = touchX.current - e.changedTouches[0].clientX;
                if (Math.abs(diff) > 40) diff > 0 ? goNext() : goPrev();
                touchX.current = null;
              }}
            >
              {/* Image card */}
              <div style={{
                position: "relative", borderRadius: "14px", overflow: "hidden",
                background: "#0c0c10", border: "1px solid #131316", height: "300px",
              }}>
                <div style={{
                  position: "absolute", inset: 0, pointerEvents: "none",
                  background: `radial-gradient(ellipse at 70% 20%, rgba(${feat.color.rgb},.09), transparent 55%)`,
                  transition: "background .7s",
                }} />
                <div style={{
                  position: "absolute", top: 0, inset: "0 0 auto 0", height: "1px",
                  background: `linear-gradient(90deg, transparent, rgba(${feat.color.rgb},.45), transparent)`,
                  transition: "background .5s",
                }} />

                {features.map((f, i) => {
                  const isAct = i === active;
                  const isPrv = i === prev;
                  let cls = "";
                  if (isAct) cls = dir === "next" ? "img-in" : "img-in-p";
                  else if (isPrv) cls = dir === "next" ? "img-out" : "img-out-p";
                  return (
                    <img
                      key={f.id}
                      src={f.image}
                      alt={f.title}
                      className={cls}
                      style={{
                        position: "absolute", inset: "16px",
                        width: "calc(100% - 32px)", height: "calc(100% - 32px)",
                        objectFit: "contain",
                        opacity: (!isAct && !isPrv) ? 0 : undefined,
                      }}
                    />
                  );
                })}

                {/* Dot indicators */}
                <div style={{
                  position: "absolute", bottom: "14px", left: "50%",
                  transform: "translateX(-50%)",
                  display: "flex", gap: "5px", alignItems: "center",
                }}>
                  {features.map((_, i) => (
                    <div
                      key={i}
                      onClick={() => goTo(i)}
                      style={{
                        width: active === i ? "18px" : "4px",
                        height: "4px", borderRadius: "2px",
                        background: active === i ? feat.color.accent : "#1e1e22",
                        transition: "all .35s cubic-bezier(.22,1,.36,1)",
                        cursor: "pointer",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Progress bar */}
              <div style={{ marginTop: "10px", height: "1px", background: "#0f0f12", overflow: "hidden" }}>
                <div
                  key={`mp-${active}-${progKey.current}`}
                  className={`prog ${paused ? "prog-pause" : ""}`}
                  style={{ height: "100%", background: feat.color.accent }}
                />
              </div>

              {/* Text */}
              <div style={{ padding: "22px 0", minHeight: "150px" }}>
                <div key={`mt-${active}`} className={dir === "next" ? "title-in" : "title-in-p"}>
                  <div style={{ display: "flex", alignItems: "center", gap: "9px", marginBottom: "10px" }}>
                    {(() => {
                      const Icon = feat.icon;
                      return <Icon style={{ width: "15px", height: "15px", color: feat.color.accent, flexShrink: 0, transition: "color .5s" }} />;
                    })()}
                    <h4 style={{
                      fontSize: "17px", fontWeight: 600, color: "#e0e0e4",
                      margin: 0, letterSpacing: "-0.025em",
                    }}>
                      {feat.title}
                    </h4>
                  </div>
                </div>
                <div key={`md-${active}`} className={dir === "next" ? "desc-in" : "desc-in-p"}>
                  <p style={{ fontSize: "14px", color: "#4a4a52", lineHeight: 1.72, margin: 0 }}>
                    {feat.description}
                  </p>
                </div>
              </div>

              {/* Chips */}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "7px" }}>
                {features.map((f, i) => {
                  const isAct = active === i;
                  const Icon = f.icon;
                  return (
                    <button
                      key={f.id}
                      onClick={() => goTo(i)}
                      style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "6px 12px", borderRadius: "100px",
                        border: isAct ? `1px solid rgba(${f.color.rgb},.35)` : "1px solid #141418",
                        background: isAct ? `rgba(${f.color.rgb},.07)` : "#0d0d10",
                        color: isAct ? "#c8c8cc" : "#3a3a40",
                        fontSize: "12px", fontWeight: isAct ? 500 : 400,
                        cursor: "pointer",
                        transition: "all .3s ease",
                        fontFamily: "inherit",
                        letterSpacing: "-0.01em",
                      }}
                    >
                      <Icon style={{
                        width: "11px", height: "11px",
                        color: isAct ? f.color.accent : "#2a2a30",
                        transition: "color .3s",
                        flexShrink: 0,
                      }} />
                      {f.title}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      </section>
    </>
  );
}