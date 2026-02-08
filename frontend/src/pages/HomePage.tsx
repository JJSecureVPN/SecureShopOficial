import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiService } from "../services/api.service";
import HeroSection from "../sections/HeroSection";
import AppDownloadSection from "../sections/AppDownloadSection";
import ImportConfigDemoV2 from "../components/ImportConfigDemoV2"; 
// InfrastructureFeaturesSection removed
import InteractiveShowcaseSection from "../sections/InteractiveShowcaseSection";
import SplitText from "../components/animata/text/split-text";

interface HomePageProps {
  // Props vacío - HomePage no necesita parámetros
}

// eslint-disable-next-line no-empty-pattern
const HomePage = ({}: HomePageProps) => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Verificar si el usuario vuelve de MercadoPago
  useEffect(() => {
    const status = searchParams.get("status");
    const pagoId = searchParams.get("pago_id");

    if (status && pagoId) {
      verificarPago(pagoId);
      // Limpiar los parámetros de la URL
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const verificarPago = async (pagoId: string) => {
    try {
      const pago = await apiService.obtenerPago(pagoId);

      if (pago.estado === "aprobado" && pago.servex_username) {
        // Redirigir a página de éxito con las credenciales
        window.location.href = `/success?pago_id=${pagoId}`;
      }
    } catch (err) {
      console.error("Error verificando pago:", err);
    }
  };

  return (
    <div>
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <div id="section-hero">
          <HeroSection />
        </div>

        {/* Interactive Showcase Section */}
        <InteractiveShowcaseSection />

        {/* Import Config Demo (casi pegada al bloque anterior) */}
        <div id="section-import" className="-mt-6 sm:-mt-8 lg:-mt-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <ImportConfigDemoV2 />
          </div>
        </div>

        {/* Integrations Carousel removed */}

        {/* App Download Section */}
        <div id="section-app">
          <AppDownloadSection />
        </div>

        {/* Infrastructure highlights section removed */}

        {/* Split Text Animation Section */}
        <section className="py-20 bg-gradient-to-b from-background to-background/50">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center">
            <SplitText 
              text="SECURE VPN" 
              className="text-primary"
            />
          </div>
        </section>
      </main>
    </div>
  );
};

export default HomePage;
