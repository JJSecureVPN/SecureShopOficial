import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowUpRight,
  BadgeCheck,
  Building2,
  MessageCircleQuestion,
  Sparkles,
  Star,
  Users,
  ArrowRight,
} from "lucide-react";
import BottomSheet from "../../components/BottomSheet";
import { Sponsor } from "../../types";
import { apiService } from "../../services/api.service";

// ─── Tokens ───────────────────────────────────────────────────────────────────
const C = {
  bg:      "#0c0c0e",
  surface: "#111113",
  border:  "#1e1e23",
  text:    "#efefed",
  muted:   "#666672",
  faint:   "#2a2a32",
  indigo:  "#8b8cff",
  emerald: "#34d399",
  amber:   "#fbbf24",
  rose:    "#fb7185",
};

// ─── Fade on scroll ────────────────────────────────────────────────────────────
function Fade({ delay = 0, children }: { delay?: number; children: React.ReactNode }) {
  const [on, setOn] = useState(false);
  const cb = (node: HTMLDivElement | null) => {
    if (!node) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setOn(true); obs.disconnect(); } },
      { rootMargin: "-40px" }
    );
    obs.observe(node);
  };
  return (
    <div ref={cb} style={{
      opacity: on ? 1 : 0,
      transform: on ? "none" : "translateY(14px)",
      transition: `opacity .5s ease ${delay}s, transform .5s ease ${delay}s`,
    }}>{children}</div>
  );
}

// ─── Two-column section ────────────────────────────────────────────────────────
function TwoCol({
  id, label, accent = C.indigo, icon: Icon, children,
}: {
  id?: string; label: string; accent?: string; icon: React.ElementType; children: React.ReactNode;
}) {
  return (
    <section id={id} style={{
      borderTop: `1px solid ${C.border}`,
      maxWidth: 1200, margin: "0 auto",
      display: "grid", gridTemplateColumns: "240px 1fr",
    }} className="tc">
      {/* Label col */}
      <div className="tc-left" style={{
        borderRight: `1px solid ${C.border}`,
        padding: "72px 40px 72px 0",
        display: "flex", alignItems: "flex-start",
      }}>
        <Fade>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Icon size={13} color={accent} />
            <span style={{
              fontSize: 10, fontWeight: 600,
              letterSpacing: "0.14em", textTransform: "uppercase" as const,
              color: C.muted,
            }}>{label}</span>
          </div>
        </Fade>
      </div>
      {/* Content col */}
      <div className="tc-right" style={{ padding: "72px 0 72px 64px" }}>
        {children}
      </div>
    </section>
  );
}

function H2({ children }: { children: React.ReactNode }) {
  return (
    <h2 style={{
      fontFamily: "'Playfair Display', serif",
      fontSize: "clamp(22px, 2.5vw, 30px)",
      fontWeight: 600, letterSpacing: "-0.025em",
      color: C.text, lineHeight: 1.18, marginBottom: 40,
    }}>{children}</h2>
  );
}

// ─── Sponsor card ──────────────────────────────────────────────────────────────
function SponsorCard({ sponsor, featured = false }: { sponsor: Sponsor; featured?: boolean }) {
  return (
    <article style={{
      padding: "22px 0",
      borderBottom: `1px solid ${C.border}`,
      display: "flex", alignItems: "flex-start", gap: 16,
    }}>
      {/* Avatar */}
      <div style={{
        width: 38, height: 38, borderRadius: 10,
        border: `1px solid ${featured ? C.indigo + "40" : C.border}`,
        background: featured ? C.indigo + "12" : C.surface,
        flexShrink: 0, overflow: "hidden",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 12, fontWeight: 700, color: featured ? C.indigo : C.muted,
      }}>
        {sponsor.avatarUrl
          ? <img src={sponsor.avatarUrl} alt={sponsor.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : sponsor.avatarInitials}
      </div>

      {/* Info */}
      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2, flexWrap: "wrap" as const }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: C.text, letterSpacing: "-0.01em" }}>
            {sponsor.name}
          </span>
          {featured && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: "0.08em",
              textTransform: "uppercase" as const, color: C.indigo,
              background: C.indigo + "15", border: `1px solid ${C.indigo}30`,
              borderRadius: 100, padding: "2px 8px",
            }}>Destacado</span>
          )}
          <span style={{
            fontSize: 10, color: C.muted,
            background: C.faint, borderRadius: 100, padding: "2px 8px",
          }}>
            {sponsor.category === "empresa" ? "Empresa" : "Persona"}
          </span>
        </div>
        <p style={{ fontSize: 12, color: C.muted, marginBottom: 6 }}>{sponsor.role}</p>
        {sponsor.message && (
          <p style={{
            fontSize: 13, color: C.muted, lineHeight: 1.65,
            display: "-webkit-box", WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical" as const, overflow: "hidden",
          }}>{sponsor.message}</p>
        )}
      </div>

      {/* Link */}
      {sponsor.link && (
        <a href={sponsor.link} target="_blank" rel="noopener noreferrer"
          style={{ color: C.faint, flexShrink: 0, transition: "color .15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = C.text)}
          onMouseLeave={e => (e.currentTarget.style.color = C.faint)}>
          <ArrowUpRight size={15} />
        </a>
      )}
    </article>
  );
}

function SponsorList({
  items, featured = false, loading, empty = "Sin sponsors en esta sección",
}: {
  items: Sponsor[]; featured?: boolean; loading: boolean; empty?: string;
}) {
  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column" as const, gap: 0 }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            height: 72, borderBottom: `1px solid ${C.border}`,
            background: C.surface + "80",
            borderRadius: 4, margin: "12px 0",
            animation: "pulse 1.5s ease infinite",
          }} />
        ))}
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <p style={{
        padding: "32px 0",
        borderTop: `1px solid ${C.border}`,
        fontSize: 13, color: C.muted, fontStyle: "italic",
      }}>{empty}</p>
    );
  }
  return (
    <div>
      {items.map(s => <SponsorCard key={s.id} sponsor={s} featured={featured} />)}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
interface SponsorsPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (v: boolean) => void;
}

export default function SponsorsPage({ isMobileMenuOpen, setIsMobileMenuOpen }: SponsorsPageProps) {
  const [activeSection, setActiveSection] = useState("featured");
  const [sponsors, setSponsors] = useState<Sponsor[]>([]);
  const [loadingSponsors, setLoadingSponsors] = useState(true);
  const [sponsorsError, setSponsorsError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSponsors = async () => {
      try {
        setLoadingSponsors(true);
        const data = await apiService.obtenerSponsors();
        setSponsors(data);
        setSponsorsError(null);
      } catch (error) {
        setSponsorsError(error instanceof Error ? error.message : "Error al cargar sponsors");
      } finally {
        setLoadingSponsors(false);
      }
    };
    fetchSponsors();
  }, []);

  // Fix header on this page
  useEffect(() => {
    const headerEl = document.querySelector("header") as HTMLElement | null;
    if (!headerEl) return undefined;
    const prev = { position: headerEl.style.position, top: headerEl.style.top, left: headerEl.style.left, right: headerEl.style.right, zIndex: headerEl.style.zIndex };
    Object.assign(headerEl.style, { position: "fixed", top: "0", left: "0", right: "0", zIndex: "10001" });
    return () => {
      Object.assign(headerEl.style, prev);
    };
  }, []);


  const sections = useMemo(() => [
    { id: "featured",   label: "Destacados", icon: Star },
    { id: "empresas",   label: "Empresas",   icon: Building2 },
    { id: "personas",   label: "Personas",   icon: Users },
    { id: "beneficios", label: "Beneficios", icon: BadgeCheck },
    { id: "participar", label: "Participar", icon: Sparkles },
    { id: "faq",        label: "FAQ",        icon: MessageCircleQuestion },
  ], []);

  const highlightedSponsors = useMemo(() => sponsors.filter(s => s.highlight), [sponsors]);
  const companySponsors     = useMemo(() => sponsors.filter(s => s.category === "empresa"), [sponsors]);
  const individualSponsors  = useMemo(() => sponsors.filter(s => s.category === "persona"), [sponsors]);

  return (
    <div style={{ color: C.text, minHeight: "100vh", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;0,700;1,500;1,600&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        a { text-decoration: none; cursor: pointer; }
        ::selection { background: #8b8cff30; }
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.8} }

        @media (max-width: 860px) {
          .tc { grid-template-columns: 1fr !important; }
          .tc-left { border-right: none !important; padding: 40px 20px 0 !important; }
          .tc-right { padding: 20px 20px 52px !important; }
          .hero-inner { flex-direction: column !important; padding: 100px 20px 48px !important; gap: 40px !important; }
          .hero-stats { width: 100% !important; }
          .steps-grid { grid-template-columns: 1fr !important; }
          .benefits-grid { grid-template-columns: 1fr !important; }
          .max-wrap { padding: 0 20px !important; }
          .footer-inner { padding: 20px 20px !important; flex-direction: column; gap: 6px; text-align: center; }
          .cta-inner { flex-direction: column !important; padding: 40px 20px 60px !important; gap: 32px !important; }
          .cta-left-col { display: none !important; }
          .nav-links { display: none !important; }
        }
        @media (min-width: 861px) and (max-width: 1060px) {
          .tc { grid-template-columns: 180px 1fr !important; }
          .tc-right { padding-left: 44px !important; }
        }
      `}</style>

      <main>
        {/* ─── Hero ─────────────────────────────────────────────────────── */}
        <div style={{ borderBottom: `1px solid ${C.border}` }}>
          <div className="hero-inner" style={{
            maxWidth: 1200, margin: "0 auto",
            padding: "100px 0 88px",
            display: "flex", alignItems: "flex-start",
            justifyContent: "space-between", gap: 56,
          }}>
            {/* Copy */}
            <div style={{ maxWidth: 560, flex: "1 1 auto" }}>
              <Fade>
                <div style={{
                  display: "inline-flex", alignItems: "center", gap: 7,
                  fontSize: 10, fontWeight: 600, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: C.muted, marginBottom: 24,
                }}>
                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: C.rose }} />
                  Comunidad de Sponsors
                </div>
              </Fade>
              <Fade delay={0.04}>
                <h1 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(44px, 6vw, 68px)",
                  fontWeight: 700, letterSpacing: "-0.035em",
                  color: C.text, lineHeight: 1.03, marginBottom: 24,
                }}>
                  Apoyá la<br />
                  <em style={{ color: C.indigo, fontStyle: "italic" }}>privacidad abierta.</em>
                </h1>
              </Fade>
              <Fade delay={0.08}>
                <p style={{
                  fontSize: 16, lineHeight: 1.78, color: C.muted,
                  maxWidth: 440, marginBottom: 40,
                }}>
                  Empresas y personas que sostienen el desarrollo de JJSecure VPN con transparencia y beneficios exclusivos.
                </p>
              </Fade>
              <Fade delay={0.12}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                  <Link to="/donaciones" style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    fontSize: 14, fontWeight: 600, color: C.bg, background: C.text,
                    padding: "12px 24px", borderRadius: 100,
                  }}>
                    Convertirme en sponsor
                    <ArrowRight size={13} />
                  </Link>
                  <button
                    onClick={() => document.getElementById("section-beneficios")?.scrollIntoView({ behavior: "smooth" })}
                    style={{
                      background: "none", border: "none", cursor: "pointer",
                      fontSize: 13, color: C.muted,
                      fontFamily: "'DM Sans', sans-serif",
                    }}
                  >
                    Ver beneficios →
                  </button>
                </div>
              </Fade>
            </div>

            {/* Stats panel */}
            <div className="hero-stats" style={{ flexShrink: 0, width: 260 }}>
              <Fade delay={0.18}>
                <div style={{
                  border: `1px solid ${C.border}`,
                  borderRadius: 16, overflow: "hidden",
                  background: C.surface,
                }}>
                  {[
                    { value: sponsors.length || "—", label: "Sponsors activos", color: C.indigo },
                    { value: companySponsors.length || "—", label: "Empresas",    color: C.emerald },
                    { value: individualSponsors.length || "—", label: "Personas", color: C.amber },
                  ].map((stat, i) => (
                    <div key={stat.label} style={{
                      padding: "22px 26px",
                      borderBottom: i < 2 ? `1px solid ${C.border}` : "none",
                      display: "flex", alignItems: "center",
                      justifyContent: "space-between",
                    }}>
                      <span style={{ fontSize: 11, letterSpacing: "0.08em", textTransform: "uppercase", color: C.muted }}>{stat.label}</span>
                      <span style={{
                        fontFamily: "'Playfair Display', serif",
                        fontSize: 24, fontWeight: 700, letterSpacing: "-0.03em",
                        color: stat.color,
                      }}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </Fade>
            </div>
          </div>
        </div>

        {/* ─── Sections ─────────────────────────────────────────────────── */}
        <div className="max-wrap" style={{ maxWidth: 1200, margin: "0 auto" }}>

          {/* Destacados */}
          <TwoCol id="section-featured" label="Destacados" accent={C.amber} icon={Star}>
            <Fade><H2>Sponsors del mes</H2></Fade>
            {sponsorsError && (
              <div style={{
                marginBottom: 24, padding: "12px 16px",
                borderRadius: 10, border: `1px solid ${C.rose}30`,
                background: C.rose + "08",
                fontSize: 13, color: C.rose,
              }}>{sponsorsError}</div>
            )}
            <Fade delay={0.07}>
              <SponsorList items={highlightedSponsors} featured loading={loadingSponsors} empty="Aún no hay sponsors destacados este mes" />
            </Fade>
          </TwoCol>

          {/* Empresas */}
          <TwoCol id="section-empresas" label="Empresas" accent={C.indigo} icon={Building2}>
            <Fade><H2>Infraestructura sostenida<br />por equipos que confían</H2></Fade>
            <Fade delay={0.07}>
              <SponsorList items={companySponsors} loading={loadingSponsors} empty="Este espacio está disponible para nuevas empresas patrocinadoras" />
            </Fade>
          </TwoCol>

          {/* Personas */}
          <TwoCol id="section-personas" label="Personas" accent={C.emerald} icon={Users}>
            <Fade><H2>Miembros de la comunidad<br />que dejan huella</H2></Fade>
            <Fade delay={0.07}>
              <SponsorList items={individualSponsors} loading={loadingSponsors} empty="Este espacio está disponible para nuevos perfiles personales" />
            </Fade>
          </TwoCol>

          {/* Beneficios */}
          <TwoCol id="section-beneficios" label="Beneficios" accent={C.rose} icon={BadgeCheck}>
            <Fade><H2>Estructura simple,<br />filosofía builder-friendly</H2></Fade>
            <Fade delay={0.07}>
              <div className="benefits-grid" style={{
                display: "grid", gridTemplateColumns: "1fr 1fr",
                columnGap: 48,
              }}>
                {[
                  { n: "01", title: "Visibilidad activa",  desc: "Exposición discreta y constante en todos los puntos de contacto." },
                  { n: "02", title: "Acceso temprano",     desc: "Iteraciones privadas y roadmap compartido antes de cada release." },
                  { n: "03", title: "Feedback directo",    desc: "Loops quincenales para ajustar features y priorizar infraestructura." },
                  { n: "04", title: "Soporte dedicado",    desc: "Canales privados y equipo técnico asignado cuando lo necesitás." },
                ].map((b) => (
                  <div key={b.n} style={{
                    padding: "22px 0",
                    borderBottom: `1px solid ${C.border}`,
                    display: "flex", gap: 16,
                  }}>
                    <span style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 11, color: C.faint,
                      fontWeight: 600, minWidth: 24, flexShrink: 0, paddingTop: 2,
                    }}>{b.n}</span>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{b.title}</div>
                      <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{b.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Fade>
          </TwoCol>

          {/* Participar */}
          <TwoCol id="section-participar" label="Participar" accent={C.indigo} icon={Sparkles}>
            <Fade><H2>Sumarte es simple</H2></Fade>
            <Fade delay={0.07}>
              <div className="steps-grid" style={{
                display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                gap: 1, background: C.border,
                borderRadius: 14, overflow: "hidden",
                border: `1px solid ${C.border}`,
                marginBottom: 32,
              }}>
                {[
                  { n: "01", color: C.indigo,  title: "Conectá con el equipo",    desc: "Escribinos y definimos juntos el formato." },
                  { n: "02", color: C.amber,   title: "Definí tu aportación",     desc: "Sin monto mínimo, acordamos lo que tenga sentido." },
                  { n: "03", color: C.emerald, title: "Publicamos tu presencia",  desc: "Logo, mensaje y link en menos de 48 hs." },
                ].map(s => (
                  <div key={s.n} style={{ background: C.surface, padding: "28px 24px" }}>
                    <div style={{
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 40, fontWeight: 700, letterSpacing: "-0.05em",
                      lineHeight: 1, marginBottom: 16, color: s.color + "22",
                    }}>{s.n}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 6 }}>{s.title}</div>
                    <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.65 }}>{s.desc}</div>
                  </div>
                ))}
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
                <Link to="/donaciones" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 14, fontWeight: 600, color: C.bg, background: C.text,
                  padding: "12px 24px", borderRadius: 100,
                }}>
                  Empezar ahora <ArrowRight size={13} />
                </Link>
                <button
                  onClick={() => document.getElementById("section-faq")?.scrollIntoView({ behavior: "smooth" })}
                  style={{
                    background: "none", border: "none", cursor: "pointer",
                    fontSize: 13, color: C.muted, fontFamily: "'DM Sans', sans-serif",
                  }}
                >
                  Ver preguntas frecuentes →
                </button>
              </div>
            </Fade>
          </TwoCol>

          {/* FAQ */}
          <TwoCol id="section-faq" label="FAQ" accent={C.muted} icon={MessageCircleQuestion}>
            <Fade><H2>Preguntas frecuentes</H2></Fade>
            <Fade delay={0.07}>
              {[
                { q: "¿Hay un monto mínimo?",                   a: "No imponemos montos. Acordamos lo que tenga sentido para tu contexto." },
                { q: "¿Puedo actualizar logo o mensaje?",        a: "Sí. Enviás los cambios y se reflejan en menos de 48 horas hábiles." },
                { q: "¿Cómo se validan donaciones empresariales?", a: "Solicitamos comprobantes o datos fiscales para mantener trazabilidad y compliance." },
                { q: "¿Se puede donar de forma anónima?",        a: "Totalmente. Podés usar un alias o quedar fuera del listado público." },
              ].map((item, i, arr) => (
                <div key={item.q} style={{
                  padding: "22px 0",
                  borderBottom: i < arr.length - 1 ? `1px solid ${C.border}` : "none",
                }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 6 }}>{item.q}</div>
                  <div style={{ fontSize: 13, color: C.muted, lineHeight: 1.65 }}>{item.a}</div>
                </div>
              ))}
            </Fade>
          </TwoCol>

        </div>

        {/* ─── CTA Final ────────────────────────────────────────────────── */}
        <div style={{ borderTop: `1px solid ${C.border}`, background: C.surface }}>
          <div className="cta-inner" style={{
            maxWidth: 1200, margin: "0 auto",
            padding: "96px 0",
            display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: 56,
          }}>
            <div className="cta-left-col" style={{
              borderRight: `1px solid ${C.border}`,
              paddingRight: 56,
              display: "flex", alignItems: "center",
              alignSelf: "stretch",
            }}>
              <Fade>
                <span style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: 10, fontWeight: 600,
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: C.muted, writingMode: "vertical-rl",
                  transform: "rotate(180deg)", display: "block",
                }}>Gracias por sostener la misión</span>
              </Fade>
            </div>
            <div style={{ flex: "1 1 auto" }}>
              <Fade>
                <h2 style={{
                  fontFamily: "'Playfair Display', serif",
                  fontSize: "clamp(28px, 4vw, 46px)",
                  fontWeight: 700, letterSpacing: "-0.03em",
                  color: C.text, lineHeight: 1.06, marginBottom: 12,
                }}>
                  Sostenemos la privacidad<br />
                  <em style={{ color: C.indigo, fontStyle: "italic" }}>juntos.</em>
                </h2>
                <p style={{ fontSize: 14, color: C.muted, maxWidth: 380, lineHeight: 1.75, marginBottom: 32 }}>
                  Tu apoyo impulsa la innovación abierta para toda la comunidad LATAM.
                </p>
                <Link to="/donaciones" style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  fontSize: 14, fontWeight: 600, color: C.bg, background: C.text,
                  padding: "13px 26px", borderRadius: 100,
                }}>
                  Convertirme en sponsor <ArrowRight size={13} />
                </Link>
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
            <span style={{ fontSize: 12, color: C.faint }}>© 2025 JJSecure — Comunidad de Sponsors</span>
            <span style={{ fontSize: 12, color: C.faint }}>Privacidad abierta · LATAM</span>
          </div>
        </footer>
      </main>

      {/* ─── Mobile BottomSheet ───────────────────────────────────────── */}
      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
        subtitle="Secciones"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {sections.map(section => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setIsMobileMenuOpen(false);
                  setTimeout(() => {
                    document.getElementById(`section-${section.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                  }, 300);
                }}
                style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "12px 16px", borderRadius: 10, border: "none",
                  background: isActive ? C.indigo + "15" : "none",
                  color: isActive ? C.indigo : C.muted,
                  fontSize: 14, fontWeight: 500, cursor: "pointer",
                  fontFamily: "'DM Sans', sans-serif",
                  textAlign: "left", width: "100%",
                  transition: "background .15s, color .15s",
                }}>
                <Icon size={15} />
                {section.label}
              </button>
            );
          })}
        </div>
      </BottomSheet>
    </div>
  );
}