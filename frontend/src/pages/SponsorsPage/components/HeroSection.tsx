import { Heart } from "lucide-react";
import { Title } from "../../../components/Title";

export default function HeroSection() {
  return (
    <section className="bg-zinc-900 py-8 sm:py-12 lg:py-16 xl:py-20">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-zinc-700 bg-zinc-800 px-4 py-1.5 text-[11px] uppercase tracking-[0.3em] text-zinc-200 mb-6">
          <Heart className="w-3 h-3 text-rose-400" />
          <span>Comunidad de Sponsors</span>
        </div>

        {/* Title */}
        <div className="space-y-4 text-zinc-100">
          <Title as="h1">Apoya la Privacidad Abierta</Title>
          <p className="text-base sm:text-lg lg:text-xl text-zinc-400 max-w-3xl mx-auto">
            Únete a empresas y personas que sostienen el desarrollo de JJSecure VPN con transparencia y beneficios exclusivos.
          </p>
        </div>

        {/* Call to Action */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8 mb-12">
          <a
            href="/donaciones"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
          >
            <Heart className="w-5 h-5 text-white" />
            Convertirme en Sponsor
          </a>
          <button
            onClick={() => {
              document.getElementById("section-beneficios")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="px-6 py-3 rounded-lg font-semibold text-zinc-300 hover:text-zinc-100 underline-offset-4 hover:underline"
          >
            Ver Beneficios
          </button>
        </div>

        {/* Illustration */}
        <div className="flex items-center justify-center mt-8 sm:mt-10 lg:mt-12 xl:mt-16 w-full">
            <div className="w-full max-w-sm mx-auto">
              <div className="text-center">
                <Heart className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 xl:w-28 xl:h-28 text-emerald-400 mx-auto mb-4" />
                <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-semibold text-zinc-100">Sostenibilidad</p>
                <p className="text-sm sm:text-base lg:text-lg xl:text-xl text-zinc-400">Tu apoyo impulsa la innovación</p>
              </div>
            </div>
        </div>
      </div>
    </section>
  );
}