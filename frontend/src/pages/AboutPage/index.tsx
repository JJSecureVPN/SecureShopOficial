import { useState } from "react";

// ─── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:      "#0c0c0e",
  surface: "#111113",
  border:  "#1e1e23",
  borderM: "#28282f",
  text:    "#efefed",
  muted:   "#666672",
  faint:   "#2a2a32",
  indigo:  "#8b8cff",
  emerald: "#34d399",
  amber:   "#fbbf24",
  rose:    "#fb7185",
  sky:     "#38bdf8",
};

// ─── SVG icon ─────────────────────────────────────────────────────────────────
const Ic = ({ d, size = 16, color = "currentColor", sw = 1.7 }: { d: string; size?: number; color?: string; sw?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const P = {
  shield:   "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
  server:   "M2 8h20v8H2zM2 8V6a2 2 0 012-2h16a2 2 0 012 2v2M6 12h.01M6 16h.01",
  zap:      "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  trend:    "M23 6l-9.5 9.5-5-5L1 18",
  wifi:     "M5 12.55a11 11 0 0114.08 0M1.42 9a16 16 0 0121.16 0M8.53 16.11a6 6 0 016.95 0M12 20h.01",
  phone:    "M17 2H7a2 2 0 00-2 2v16a2 2 0 002 2h10a2 2 0 002-2V4a2 2 0 00-2-2zM12 18h.01",
  globe:    "M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10zM2 12h20",
  pin:      "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0zM12 10a1 1 0 110-2 1 1 0 010 2z",
  alert:    "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01",
  arrow:    "M5 12h14M12 5l7 7-7 7",
  check:    "M20 6L9 17l-5-5",
  eye:      "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8zM12 9a3 3 0 100 6 3 3 0 000-6z",
  heart:    "M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z",
  lock:     "M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2zM7 11V7a5 5 0 0110 0v4",
  star:     "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  users:    "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M9 7a4 4 0 100 8 4 4 0 000-8zM23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75",
};

// ─── Intersection-observer fade ───────────────────────────────────────────────
function Fade({ delay = 0, children }: any) {
  const [on, setOn] = useState(false);
  const r = (node: any) => {
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect(); } },
      { rootMargin: "-40px" }
    );
    obs.observe(node);
  };
  return (
    <div ref={r} style={{
      opacity: on ? 1 : 0,
      transform: on ? "none" : "translateY(14px)",
      transition: `opacity .55s ease ${delay}s, transform .55s ease ${delay}s`,
    }}>{children}</div>
  );
}

// ─── Two-column row ───────────────────────────────────────────────────────────
function TwoCol({ id, label, accent, icon, children }: any) {
  return (
    <section id={id} style={{
      borderTop: `1px solid ${C.border}`,
      maxWidth: 1200,
      margin: "0 auto",
      display: "grid",
      gridTemplateColumns: "240px 1fr",
      minHeight: 0,
    }} className="tc">
      {/* left label column */}
      <div className="tc-left" style={{
        borderRight: `1px solid ${C.border}`,
        padding: "72px 40px 72px 0",
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        gap: 8,
      }}>
        <Fade>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <Ic d={icon} size={13} color={accent} />
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: "0.14em",
              textTransform: "uppercase", color: C.muted,
            }}>{label}</span>
          </div>
        </Fade>
      </div>
      {/* right content */}
      <div className="tc-right" style={{ padding: "72px 0 72px 64px" }}>
        {children}
      </div>
    </section>
  );
}

function H2({ children }: any) {
  return <h2 className="heading-section" style={{color: C.text, marginBottom: 40}}>{children}</h2>;
}

// ─── Star rating ──────────────────────────────────────────────────────────────
const Stars = () => (
  <div style={{ display: "flex", gap: 2 }}>
    {[0,1,2,3,4].map(i => (
      <svg key={i} width={11} height={11} viewBox="0 0 24 24" fill={C.amber} stroke="none">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
      </svg>
    ))}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function JJSecureAbout() {
  return (
    <div style={{ color: C.text, fontFamily: "'DM Sans', sans-serif", minHeight: "100vh", paddingTop: '64px' }}>
      <style>{`
        /* Force fixed header on About page to ensure it stays visible when scrolling */
        header { 
          position: fixed !important; 
          top: 0 !important; 
          left: 0 !important; 
          right: 0 !important; 
          z-index: 10001 !important;
          width: 100% !important;
        }

        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; cursor: pointer; }
        ::selection { background: #8b8cff30; }

        @media (max-width: 860px) {
          .tc { grid-template-columns: 1fr !important; }
          .tc-left { border-right: none !important; padding: 40px 20px 0 !important; border-top: none; }
          .tc-right { padding: 20px 20px 52px !important; }
          .hero-wrap { flex-direction: column !important; padding: 56px 20px 48px !important; }
          .hero-stats { width: 100% !important; }
          .hero-stats-inner { flex-direction: row !important; overflow-x: auto; }
          .stat-row { flex: 1 1 auto !important; flex-direction: column; align-items: flex-start !important; border-bottom: none !important; border-right: 1px solid ${C.border}; padding: 20px 20px !important; }
          .stat-row:last-child { border-right: none !important; }
          .nav-links { display: none !important; }
          .nav-inner { padding: 16px 20px !important; }
          .steps { grid-template-columns: 1fr !important; }
          .test-grid { grid-template-columns: 1fr !important; }
          .vals-grid { grid-template-columns: 1fr !important; }
          .tech-grid { grid-template-columns: 1fr !important; }
          .footer-inner { flex-direction: column !important; gap: 6px !important; text-align: center; padding: 18px 20px !important; }
          .cta-inner { flex-direction: column !important; gap: 32px !important; padding: 60px 20px !important; }
          .cta-left-col { border-right: none !important; border-bottom: 1px solid ${C.border}; padding: 0 0 24px !important; width: 100% !important; }
          .cta-left-col span { writing-mode: horizontal-tb !important; transform: none !important; }
          .max-wrap { padding: 0 20px !important; }
        }
        @media (min-width: 861px) and (max-width: 1060px) {
          .tc { grid-template-columns: 180px 1fr !important; }
          .tc-right { padding-left: 44px !important; }
          .hero-wrap { padding: 72px 40px !important; }
        }
      `}</style>

      {/* ─── Hero ─────────────────────────────────────────────────────── */}
      <div style={{ borderBottom: `1px solid ${C.border}` }}>
        <div className="hero-wrap" style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "100px 0 88px",
          display: "flex", alignItems: "flex-start",
          justifyContent: "space-between", gap: 56,
        }}>
          {/* copy */}
          <div style={{ maxWidth: 580, flex: "1 1 auto" }}>
            <Fade>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: 7,
                fontSize: 10, fontWeight: 600, letterSpacing: "0.14em",
                textTransform: "uppercase", color: C.muted, marginBottom: 24,
              }}>
                <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.indigo }} />
                Sobre JJSecure VPN
              </div>
            </Fade>
            <Fade delay={0.04}>
              <h1 className="heading-hero" style={{color: C.text, marginBottom: 24}}>
                Nunca más<br />
                <em style={{ color: C.indigo, fontStyle: "italic" }}>sin conexión.</em>
              </h1>
            </Fade>
            <Fade delay={0.08}>
              <p style={{
                fontSize: 16, lineHeight: 1.78, color: C.muted,
                maxWidth: 460, marginBottom: 36,
              }}>
                JJSecure es una VPN creada en la región para mantener tu línea activa incluso sin saldo. Nos movemos rápido ante bloqueos y compartimos cada iteración con la comunidad.
              </p>
            </Fade>
            <Fade delay={0.12}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 36 }}>
                {[
                  { label: "15K+ usuarios", c: C.indigo },
                  { label: "99.9% uptime", c: C.emerald },
                  { label: "Soporte 24/7", c: C.amber },
                ].map(p => (
                  <span key={p.label} style={{
                    fontSize: 12, color: C.muted,
                    border: `1px solid ${C.border}`, borderRadius: 100,
                    padding: "6px 14px",
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}>
                    <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.c, flexShrink: 0 }} />
                    {p.label}
                  </span>
                ))}
              </div>
              <a href="https://play.google.com/store/apps/details?id=com.jjsecure.lite"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 14, fontWeight: 600, color: C.bg, background: C.text,
                  padding: "13px 26px", borderRadius: 100,
                }}>
                Descargar JJSecure <Ic d={P.arrow} size={13} />
              </a>
            </Fade>
          </div>

          {/* stats panel */}
          <div className="hero-stats" style={{ flexShrink: 0, width: 280 }}>
            <Fade delay={0.18}>
              <div className="hero-stats-inner" style={{
                border: `1px solid ${C.border}`,
                borderRadius: 16, overflow: "hidden",
                background: C.surface,
              }}>
                {[
                  { value: "15K+",  label: "Usuarios activos", color: C.indigo },
                  { value: "99.9%", label: "Disponibilidad",   color: C.emerald },
                  { value: "24/7",  label: "Soporte real",     color: C.amber },
                ].map((stat, i) => (
                  <div className="stat-row" key={stat.label} style={{
                    padding: "24px 28px",
                    borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                    display: "flex", alignItems: "center",
                    justifyContent: "space-between",
                  }}>
                    <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted }}>{stat.label}</span>
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 26, fontWeight: 700, letterSpacing: "-0.03em",
                      color: stat.color,
                    }}>{stat.value}</span>
                  </div>
                ))}
              </div>
            </Fade>
          </div>
        </div>
      </div>

      {/* ─── Sections wrapper ─────────────────────────────────────────── */}
      <div className="max-wrap" style={{ maxWidth: 1200, margin: "0 auto" }}>

        {/* Misión */}
        <TwoCol id="mision" label="Misión" accent={C.rose} icon={P.heart}>
          <Fade><H2>Lo que activamos<br />cada día</H2></Fade>
          <Fade delay={0.07}>
            {[
              { n:"01", color: C.rose, title:"Acceso sin saldo", desc:"Si tu saldo se agota, la app mantiene la sesión activa mientras encontrás una recarga." },
              { n:"02", color: C.rose, title:"Congelado de megas", desc:"Nuestros nodos especializados evitan que tus datos se descuenten mientras navegás." },
              { n:"03", color: C.rose, title:"Respuesta a bloqueos", desc:"Detectamos cambios de la operadora y lanzamos un fix en horas, no semanas." },
            ].map((item, i, arr) => (
              <div key={item.n} style={{
                display: "flex", gap: 20,
                padding: "22px 0",
                borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none",
              }}>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 11, fontWeight: 600, letterSpacing: "0.06em",
                  color: item.color + "80", minWidth: 24, flexShrink: 0, paddingTop: 2,
                }}>{item.n}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{item.desc}</div>
                </div>
              </div>
            ))}
            <blockquote style={{
              marginTop: 32, paddingLeft: 18,
              borderLeft: `2px solid ${C.indigo}`,
              fontSize: 14, fontStyle: "italic",
              color: C.muted, lineHeight: 1.7,
            }}>
              "Innovamos sin pausa para que nunca te quedes sin opciones."
            </blockquote>
          </Fade>
        </TwoCol>

        {/* Casos de uso */}
        <TwoCol label="Casos de uso" accent={C.amber} icon={P.phone}>
          <Fade><H2>Escenarios reales<br />donde más ayudamos</H2></Fade>
          <Fade delay={0.07}>
            {[
              { icon: P.wifi,  color: C.indigo, title:"Sin saldo",             desc:"Seguís conectado para trabajar o estudiar aunque la recarga llegue más tarde." },
              { icon: P.alert, color: C.amber,  title:"Bloqueos de operadora", desc:"La app rota automáticamente al servidor sano, sin que hagas nada." },
              { icon: P.phone, color: C.rose,   title:"Emergencias",           desc:"Podés pedir ayuda o compartir ubicación incluso si agotaste el plan." },
              { icon: P.pin,   color: C.sky,    title:"Viajes",                desc:"Conectá desde cualquier punto sin depender de redes públicas inseguras." },
            ].map((item, i, arr) => (
              <div key={item.title} style={{
                display: "flex", gap: 16,
                padding: "20px 0",
                borderBottom: i < arr.length-1 ? `1px solid ${C.border}` : "none",
              }}>
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: `1px solid ${C.border}`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0, marginTop: 1,
                }}>
                  <Ic d={item.icon} size={13} color={item.color} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 3 }}>{item.title}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{item.desc}</div>
                </div>
              </div>
            ))}
          </Fade>
        </TwoCol>

        {/* Cómo funciona */}
        <TwoCol label="Cómo funciona" accent={C.sky} icon={P.wifi}>
          <Fade><H2>Onboarding en<br />tres pasos</H2></Fade>
          <Fade delay={0.07}>
            <div className="steps" style={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)",
              gap: 1, background: C.border,
              borderRadius: 14, overflow: "hidden",
              border: `1px solid ${C.border}`,
              marginBottom: 18,
            }}>
              {[
                { n:"01", color: C.indigo, title:"Descargá la app",    desc:"Android liviano. Instalás y listo, sin configuraciones." },
                { n:"02", color: C.amber,  title:"Activá la VPN",      desc:"Un botón redirige todo tu tráfico a nuestros nodos." },
                { n:"03", color: C.emerald,title:"Seguí conectado",    desc:"Si hay bloqueo, publicamos un parche y te avisamos." },
              ].map(s => (
                <div key={s.n} style={{ background: C.surface, padding: "28px 24px" }}>
                  <div style={{
                    fontFamily: "'Playfair Display', serif",
                    fontSize: 42, fontWeight: 700, letterSpacing: "-0.05em",
                    lineHeight: 1, marginBottom: 16,
                    color: s.color + "22",
                  }}>{s.n}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{s.desc}</div>
                </div>
              ))}
            </div>
            <div style={{
              padding: "13px 18px",
              borderRadius: 10, border: `1px solid ${C.border}`,
              fontSize: 13, color: C.muted, lineHeight: 1.65,
              display: "flex", gap: 10, alignItems: "flex-start",
            }}>
              <Ic d={P.arrow} size={13} color={C.emerald} />
              Los updates se comunican por el canal de Telegram en tiempo real. Sin sorpresas.
            </div>
          </Fade>
        </TwoCol>

        {/* Tecnología */}
        <TwoCol id="tecnologia" label="Tecnología" accent={C.indigo} icon={P.lock}>
          <Fade><H2>Stack diseñado para<br />rotar y proteger</H2></Fade>
          <Fade delay={0.07}>
            <div className="tech-grid" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 52,
            }}>
              {[
                { icon: P.server, color: C.indigo, title:"Servidores inteligentes", desc:"Detectan cambios y ajustan el túnel automáticamente." },
                { icon: P.trend,  color: C.amber,  title:"Rotación automática",     desc:"Si un nodo cae, otro toma el control sin que toques nada." },
                { icon: P.zap,    color: C.rose,   title:"Optimización mobile",     desc:"Cifrado ligero pensado para no drenar batería." },
                { icon: P.lock,   color: C.emerald,title:"Privacidad real",         desc:"Sin logs. Tráfico cifrado de extremo a extremo." },
              ].map(tech => (
                <div key={tech.title} style={{
                  display: "flex", gap: 14,
                  padding: "18px 0",
                  borderBottom: `1px solid ${C.border}`,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 7,
                    border: `1px solid ${C.border}`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, marginTop: 2,
                  }}>
                    <Ic d={tech.icon} size={13} color={tech.color} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 3 }}>{tech.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.6 }}>{tech.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 26 }}>
              {["Acceso sin saldo","Fixes en horas","Para LATAM","Soporte 24/7","App liviana","Sin logs"].map(f => (
                <span key={f} style={{
                  fontSize: 11, color: C.muted,
                  border: `1px solid ${C.border}`,
                  borderRadius: 6, padding: "5px 10px",
                  display: "inline-flex", alignItems: "center", gap: 5,
                }}>
                  <Ic d={P.check} size={10} color={C.emerald} sw={2.5} />
                  {f}
                </span>
              ))}
            </div>
          </Fade>
        </TwoCol>

        {/* Valores */}
        <TwoCol label="Valores" accent={C.rose} icon={P.heart}>
          <Fade><H2>Principios que<br />sostienen la red</H2></Fade>
          <Fade delay={0.07}>
            <div className="vals-grid" style={{
              display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 28,
            }}>
              {[
                { title:"Accesibilidad", color: C.indigo, desc:"Internet como derecho. Diseñamos pensando en contextos reales." },
                { title:"Transparencia", color: C.amber,  desc:"Compartimos el estado, los fixes y el roadmap sin adornos." },
                { title:"Resiliencia",   color: C.emerald,desc:"Bloqueos van a suceder; reaccionamos rápido y con la comunidad." },
              ].map(v => (
                <div key={v.title} style={{ paddingTop: 18, borderTop: `2px solid ${v.color}` }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 7 }}>{v.title}</div>
                  <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{v.desc}</div>
                </div>
              ))}
            </div>
          </Fade>
        </TwoCol>

        {/* Testimonios */}
        <TwoCol id="testimonios" label="Testimonios" accent={C.amber} icon={P.users}>
          <Fade><H2>Feedback directo<br />de la comunidad</H2></Fade>
          <Fade delay={0.07}>
            <div className="test-grid" style={{
              display: "grid", gridTemplateColumns: "1fr 1fr",
              gap: 1, background: C.border,
              borderRadius: 14, overflow: "hidden",
              border: `1px solid ${C.border}`,
            }}>
              {[
                { name:"Carlos Rodríguez", msg:"Sin saldo y pude seguir usando internet. JJSecure me salvó el trabajo.", date:"Hace 2 días" },
                { name:"María González",   msg:"Tenía mis gigas congelados y gracias a JJSecure pude estudiar desde casa.", date:"Hace 1 semana" },
                { name:"Luis Martínez",    msg:"App ligera, funciona cuando otros no. Nunca más sin conexión.", date:"Hace 3 días" },
                { name:"Jazmin Cardozo",   msg:"El soporte responde rápido y la conexión VPN es súper estable.", date:"Hace 5 días" },
                { name:"Roberto Silva",    msg:"Entiende las necesidades del mercado latinoamericano perfectamente.", date:"Hace 1 día" },
                { name:"Ana López",        msg:"La mejor inversión para mi negocio. Conexión estable todo el tiempo.", date:"Hace 4 días" },
              ].map((t) => (
                <div key={t.name} style={{
                  background: C.surface,
                  padding: "24px 26px",
                  display: "flex", flexDirection: "column",
                  justifyContent: "space-between", gap: 14,
                }}>
                  <div>
                    <div style={{ marginBottom: 12 }}><Stars /></div>
                    <p style={{
                      fontSize: 13, lineHeight: 1.72, color: C.text,
                      fontStyle: "italic", letterSpacing: "-0.01em",
                    }}>"{t.msg}"</p>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: C.muted }}>{t.name}</span>
                    <span style={{ fontSize: 11, color: C.faint }}>{t.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </Fade>
        </TwoCol>

      </div>{/* end max-wrap */}

      {/* ─── CTA ──────────────────────────────────────────────────────── */}
      <div style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
        <div className="cta-inner" style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "96px 0",
          display: "flex", alignItems: "center",
          justifyContent: "space-between", gap: 56,
        }}>
          {/* rotated label */}
          <div className="cta-left-col" style={{
            borderRight: `1px solid ${C.border}`,
            paddingRight: 56, display: "flex", alignItems: "center",
            alignSelf: "stretch",
          }}>
            <Fade>
              <span style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: 10, fontWeight: 600,
                letterSpacing: "0.18em", textTransform: "uppercase",
                color: C.muted, writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}>Listo para conectarte</span>
            </Fade>
          </div>
          {/* copy */}
          <div style={{ flex: "1 1 auto" }}>
            <Fade>
              <h2 style={{
                fontFamily: "'Playfair Display', serif",
                fontSize: "clamp(28px, 4vw, 48px)",
                fontWeight: 700, letterSpacing: "-0.03em",
                color: C.text, lineHeight: 1.06, marginBottom: 14,
              }}>
                Probá JJSecure<br />
                <em style={{ color: C.indigo, fontStyle: "italic" }}>y mantené tu línea activa.</em>
              </h2>
              <p style={{ fontSize: 14, color: C.muted, maxWidth: 380, lineHeight: 1.75, marginBottom: 36 }}>
                La app se actualiza con cada fix. Unite al canal de Telegram para enterarte de las nuevas builds.
              </p>
              <a href="https://play.google.com/store/apps/details?id=com.jjsecure.lite"
                target="_blank" rel="noopener noreferrer"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 14, fontWeight: 600, color: C.bg, background: C.text,
                  padding: "14px 28px", borderRadius: 100,
                }}>
                Descargar JJSecure <Ic d={P.arrow} size={13} />
              </a>
            </Fade>
          </div>
        </div>
      </div>

      {/* ─── Footer ───────────────────────────────────────────────────── */}
      <footer style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="footer-inner" style={{
          maxWidth: 1200, margin: "0 auto",
          padding: "20px 0",
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span style={{ fontSize: 12, color: C.faint }}>© 2025 JJSecure — Diseñado para LATAM</span>
          <span style={{ fontSize: 12, color: C.faint }}>Sin logs · 99.9% uptime</span>
        </div>
      </footer>
    </div>
  );
}