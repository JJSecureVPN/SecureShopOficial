import { HeroSection } from "./components/HeroSection";
import { QuickStatsSection } from "./components/QuickStatsSection";
import { MisionSection } from "./components/MisionSection";
import { ComoFuncionaSection } from "./components/ComoFuncionaSection";
import { CasosUsoSection } from "./components/CasosUsoSection";
import { TecnologiaSection } from "./components/TecnologiaSection";
import { ValoresSection } from "./components/ValoresSection";
import { TestimoniosSection } from "./components/TestimoniosSection";
import { CTAFinalSection } from "./components/CTAFinalSection";

interface AboutPageProps {
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (value: boolean) => void;
}

export default function AboutPage({ }: AboutPageProps) {
  return (
    <div className="min-h-screen bg-zinc-900 text-zinc-100">
      {/* Main Content */}
      <main className="pb-8 md:pb-12 xl:pb-16">
        <HeroSection />
        <QuickStatsSection />
        <MisionSection />
        <ComoFuncionaSection />
        <CasosUsoSection />
        <TecnologiaSection />
        <ValoresSection />
        <TestimoniosSection />
        <CTAFinalSection />
      </main>
    </div>
  );
}