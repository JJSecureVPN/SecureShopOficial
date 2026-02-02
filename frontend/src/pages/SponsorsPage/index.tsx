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
} from "lucide-react";
import BottomSheet from "../../components/BottomSheet";
import HeroSection from "./components/HeroSection.tsx";
import { Title } from "../../components/Title";
import { Sponsor } from "../../types";
import { apiService } from "../../services/api.service";

interface SponsorsPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
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
        console.error("Error cargando sponsors:", error);
        setSponsorsError(error instanceof Error ? error.message : "Error al cargar sponsors");
      } finally {
        setLoadingSponsors(false);
      }
    };

    fetchSponsors();
  }, []);

  // Forzar header fijo mientras esta página esté montada (evita que Lenis u otros contenedores
  // con transform rompan el comportamiento sticky del header global)
  useEffect(() => {
    const headerEl = document.querySelector('header');
    if (!headerEl) return;

    const prev = {
      position: headerEl.style.position || '',
      top: headerEl.style.top || '',
      left: headerEl.style.left || '',
      right: headerEl.style.right || '',
      zIndex: headerEl.style.zIndex || '',
    };

    headerEl.style.position = 'fixed';
    headerEl.style.top = '0';
    headerEl.style.left = '0';
    headerEl.style.right = '0';
    headerEl.style.zIndex = '10001';

    return () => {
      headerEl.style.position = prev.position;
      headerEl.style.top = prev.top;
      headerEl.style.left = prev.left;
      headerEl.style.right = prev.right;
      headerEl.style.zIndex = prev.zIndex;
    };
  }, []);

  const sections = useMemo(
    () => [
      { id: "featured", label: "Destacados", icon: <Star className="h-4 w-4" /> },
      { id: "empresas", label: "Empresas", icon: <Building2 className="h-4 w-4" /> },
      { id: "personas", label: "Personas", icon: <Users className="h-4 w-4" /> },
      { id: "beneficios", label: "Beneficios", icon: <BadgeCheck className="h-4 w-4" /> },
      { id: "participar", label: "Participar", icon: <Sparkles className="h-4 w-4" /> },
      { id: "faq", label: "FAQ", icon: <MessageCircleQuestion className="h-4 w-4" /> },
    ],
    [],
  );

  const highlightedSponsors = useMemo(() => sponsors.filter((s) => s.highlight), [sponsors]);
  const companySponsors = useMemo(() => sponsors.filter((s) => s.category === "empresa"), [sponsors]);
  const individualSponsors = useMemo(() => sponsors.filter((s) => s.category === "persona"), [sponsors]);

  const SponsorCard = ({ sponsor, featured = false }: { sponsor: Sponsor; featured?: boolean }) => {
    if (featured) {
      // Pro featured card with gradient background
      return (
        <article className="rounded-lg bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-indigo-700/90 p-6 shadow-lg hover:shadow-xl transition-shadow">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm border border-white/20 text-sm font-semibold text-white">
              {sponsor.avatarUrl ? (
                <img
                  src={sponsor.avatarUrl}
                  alt={`Logo de ${sponsor.name}`}
                  className="h-full w-full rounded-lg object-cover"
                />
              ) : (
                sponsor.avatarInitials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="truncate text-sm font-semibold text-white">{sponsor.name}</h3>
                <span className="rounded-full bg-white/20 backdrop-blur-sm px-2 py-0.5 text-[10px] uppercase tracking-wide text-white border border-white/30">
                  {sponsor.category === "empresa" ? "Empresa" : "Persona"}
                </span>
              </div>
              <p className="mt-1 text-xs text-white/80">{sponsor.role}</p>
            </div>
            {sponsor.link && (
              <a
                href={sponsor.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 transition-colors hover:text-white flex-shrink-0"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>

          <p className="mt-4 line-clamp-3 text-sm text-white/90">{sponsor.message}</p>
        </article>
      );
    }

    // Regular card (dark)
    return (
      <article className="rounded-lg bg-zinc-800 border border-zinc-700 p-6 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-zinc-700 backdrop-blur-sm text-sm font-semibold text-zinc-200 border border-zinc-700">
            {sponsor.avatarUrl ? (
              <img
                src={sponsor.avatarUrl}
                alt={`Logo de ${sponsor.name}`}
                className="h-full w-full rounded-lg object-cover"
              />
            ) : (
              sponsor.avatarInitials
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="truncate text-sm font-semibold text-zinc-100">{sponsor.name}</h3>
                <span className="rounded-full bg-white/10 backdrop-blur-sm px-2 py-0.5 text-[10px] uppercase tracking-wide text-zinc-300 border border-zinc-700">
                  {sponsor.category === "empresa" ? "Empresa" : "Persona"}
                </span>
              </div>
              <p className="mt-1 text-xs text-zinc-400">{sponsor.role}</p>
            </div>
            {sponsor.link && (
              <a
                href={sponsor.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-300 transition-colors hover:text-zinc-100 flex-shrink-0"
              >
                <ArrowUpRight className="h-4 w-4" />
              </a>
            )}
          </div>

          <p className="mt-4 line-clamp-3 text-sm text-zinc-300">{sponsor.message}</p>
        </article>
      );
    };

  const SponsorGrid = ({ items, featured = false, empty = "Sin sponsors en esta sección" }: { items: Sponsor[]; featured?: boolean; empty?: string }) => {
    if (loadingSponsors) {
      return (
        <div className="grid gap-6 sm:gap-8 lg:gap-10 xl:gap-12 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 sm:h-48 lg:h-56 xl:h-64 animate-pulse rounded-lg border border-zinc-700 bg-zinc-800" />
          ))}
        </div>
      );
    }

    if (items.length === 0) {
      return (
        <div className="rounded-lg border border-dashed border-zinc-700 bg-zinc-800 py-12 text-center text-sm text-zinc-400">
          {empty}
        </div>
      );
    }

    return (
      <div className="grid gap-6 sm:gap-8 lg:gap-10 xl:gap-12 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((sponsor) => (
          <SponsorCard key={sponsor.id} sponsor={sponsor} featured={featured} />
        ))}
      </div>
    );
  };

  const SectionHeader = ({ title, description }: { title: string; description?: string }) => (
    <div className="mb-6 sm:mb-8 lg:mb-10 xl:mb-12">
      <Title as="h2">
        {title}
      </Title>
      {description && <p className="mt-2 text-sm sm:text-base lg:text-lg xl:text-xl text-zinc-400">{description}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      <main className="flex min-h-screen flex-col">
        <HeroSection />

        <div className="flex-1">
          {/* Featured */}
          <section id="section-featured" className="py-12 sm:py-16 lg:py-20 xl:py-24">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="max-w-7xl mx-auto">
                <SectionHeader
                  title="Destacados del mes"
                  description="Patrocinadores que impulsan nuestras iteraciones clave"
                />
                {sponsorsError && (
                  <div className="mb-6 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                    {sponsorsError}
                  </div>
                )}
                <SponsorGrid items={highlightedSponsors} featured empty="Aún no hay sponsors destacados" />
              </div>
            </div>
          </section>

          {/* Companies */}
          <section id="section-empresas" className="py-12 sm:py-16 lg:py-20 xl:py-24">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="max-w-7xl mx-auto">
                <SectionHeader title="Empresas" description="Infraestructura sostenida por equipos que confían" />
                <SponsorGrid
                  items={companySponsors}
                  empty="Este espacio está disponible para nuevas empresas patrocinadoras"
                />
              </div>
            </div>
          </section>

          {/* Individuals */}
          <section id="section-personas" className="py-12 sm:py-16 lg:py-20 xl:py-24">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="max-w-7xl mx-auto">
                <SectionHeader title="Personas" description="Miembros de la comunidad que dejan huella" />
                <SponsorGrid
                  items={individualSponsors}
                  empty="Este espacio está disponible para nuevos perfiles personales"
                />
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section id="section-beneficios" className="py-12 sm:py-16 lg:py-20 xl:py-24">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="max-w-7xl mx-auto">
                <div className="mb-12 text-center">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Diseñado para sponsors</p>
                  <h2 className="mt-3 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-zinc-100">Beneficios</h2>
                  <p className="mt-2 text-sm sm:text-base lg:text-lg xl:text-xl text-zinc-400">
                    Estructura simple, misma filosofía builder-friendly de Supabase
                  </p>
                </div>

                <div className="grid gap-6 sm:gap-8 lg:gap-10 xl:gap-12 md:grid-cols-2">
                  {[
                    {
                      title: "Visibilidad activa",
                      description: "Exposición discreta y constante en todos los puntos de contacto.",
                    },
                    {
                      title: "Acceso temprano",
                      description: "Iteraciones privadas y roadmap compartido antes de cada release.",
                    },
                    {
                      title: "Feedback directo",
                      description: "Loops quincenales para ajustar features y priorizar infraestructura.",
                    },
                    {
                      title: "Soporte dedicado",
                      description: "Canales privados y equipo técnico asignado cuando lo necesites.",
                    },
                  ].map((benefit) => (
                    <article
                      key={benefit.title}
                      className="rounded-lg border border-zinc-700 bg-zinc-800 p-6 sm:p-8 lg:p-10 xl:p-12 shadow-sm"
                    >
                      <h3 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-serif font-medium text-zinc-100">{benefit.title}</h3>
                      <p className="mt-2 text-sm sm:text-base lg:text-lg xl:text-xl text-zinc-400">{benefit.description}</p>
                    </article>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Participate */}
          <section id="section-participar" className="py-12 sm:py-16 lg:py-20 xl:py-24">
            <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
              <div className="max-w-7xl mx-auto">
                <div className="rounded-lg border border-zinc-700 bg-zinc-800 p-8 sm:p-10 lg:p-12 xl:p-16 shadow-sm">
                  <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">Onboarding</p>
                  <h2 className="mt-4 text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-serif font-normal text-zinc-100">Sumarte es simple</h2>
                  <p className="mt-2 text-sm sm:text-base lg:text-lg xl:text-xl text-zinc-400">Tres pasos inspirados en la experiencia de Supabase</p>

                  <div className="mt-10 grid gap-6 sm:gap-8 lg:gap-10 xl:gap-12 sm:grid-cols-3">
                    {["Conecta con el equipo", "Define tu aportación", "Publicamos tu presencia"].map((step, i) => (
                      <article key={step} className="rounded-lg border border-zinc-700 bg-zinc-800 p-6 sm:p-8 lg:p-10 xl:p-12">
                        <p className="text-xs sm:text-sm lg:text-base xl:text-lg text-zinc-400">Paso {i + 1}</p>
                        <p className="mt-2 text-lg sm:text-xl lg:text-2xl xl:text-3xl font-medium text-zinc-100">{step}</p>
                      </article>
                    ))}
                  </div>

                  <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 sm:gap-6 lg:gap-8 xl:gap-10 justify-center">
                    <Link
                      to="/donaciones"
                      className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 px-6 sm:px-8 lg:px-10 py-3 sm:py-4 lg:py-5 xl:py-6 text-sm sm:text-base lg:text-lg xl:text-xl font-medium text-white"
                    >
                      Empezar ahora
                      <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 xl:h-7" />
                    </Link>
                    <button
                      type="button"
                      className="text-sm sm:text-base lg:text-lg xl:text-xl font-medium text-zinc-300 underline-offset-4 hover:text-zinc-100 hover:underline"
                      onClick={() => {
                        document.getElementById("section-faq")?.scrollIntoView({ behavior: "smooth" });
                      }}
                    >
                      Ver preguntas frecuentes
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section id="section-faq" className="py-16 sm:py-20">
            <div className="mx-auto max-w-3xl px-5 sm:px-6 lg:px-8">
              <div className="mb-10 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-zinc-400">FAQ</p>
                <h2 className="mt-3 text-3xl font-serif font-normal text-zinc-100">Preguntas frecuentes</h2>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: "¿Hay un monto mínimo?",
                    a: "No imponemos montos. Acordamos lo que tenga sentido para tu contexto y confidencialidad.",
                  },
                  {
                    q: "¿Puedo actualizar logo o mensaje?",
                    a: "Sí. Enviás los cambios y se reflejan en menos de 48 horas hábiles.",
                  },
                  {
                    q: "¿Cómo se validan donaciones empresariales?",
                    a: "Solicitamos comprobantes o datos fiscales para mantener trazabilidad y compliance.",
                  },
                  {
                    q: "¿Se puede donar de forma anónima?",
                    a: "Totalmente. Podés usar un alias o quedar fuera del listado público.",
                  },
                ].map((item) => (
                  <article
                    key={item.q}
                    className="rounded-lg border border-gray-200 bg-white p-5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="text-base font-sans font-semibold text-gray-900">{item.q}</h3>
                    </div>
                    <p className="mt-2 text-sm text-gray-700">{item.a}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Footer */}
        <footer className="border-t border-gray-200 py-12 sm:py-16 lg:py-20 xl:py-24">
          <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="max-w-7xl mx-auto text-center text-sm sm:text-base lg:text-lg xl:text-xl text-gray-600">
              Gracias por sostener la misión de privacidad abierta de JJSecure VPN.
            </div>
          </div>
        </footer>
      </main>

      <BottomSheet
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="Navegación"
        subtitle="Secciones"
      >
        <div className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => {
                setActiveSection(section.id);
                setIsMobileMenuOpen(false);
                setTimeout(() => {
                  document
                    .getElementById(`section-${section.id}`)
                    ?.scrollIntoView({ behavior: "smooth", block: "start" });
                }, 300);
              }}
              className={`flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                activeSection === section.id
                  ? "bg-indigo-100 text-indigo-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </div>
      </BottomSheet>
    </div>
  );
}