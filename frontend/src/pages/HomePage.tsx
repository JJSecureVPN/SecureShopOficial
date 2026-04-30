import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { apiService } from "../services/api.service";
import { motion } from "framer-motion";
import HeroSection from "../sections/HeroSection";
import AppDownloadSection from "../sections/AppDownloadSection";
// ImportConfigDemoV2 component removed
// InfrastructureFeaturesSection removed
import FeatureHighlights from "../sections/FeatureHighlights";
import InteractiveShowcaseSection from "../sections/InteractiveShowcaseSection";
import SplitText from "../components/animata/text/split-text";
// import AdBanner from "../components/AdBanner";

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
    <div className="relative overflow-x-hidden">
      {/* Decorative Background Elements - Standardized large SVGs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        {/* Lines 1: Top Right */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.6, x: 0 }}
          transition={{ duration: 2 }}
          className="absolute top-0 -right-[10%] w-[600px] md:w-[900px] h-auto opacity-40"
        >
          <img src="/lines-1-6ac7ba4c47562c61c5018028fd2b7a0e.svg" alt="" className="w-full h-auto" />
        </motion.div>

        {/* Lines 2: Right Middle */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 0.5, x: 0 }}
          transition={{ duration: 2.5, delay: 0.5 }}
          className="absolute top-[20%] -right-[10%] w-[700px] md:w-[1000px] h-auto opacity-30"
        >
          <img src="/lines-2-4e66616a5ef291c3566a7ddfe1ffaaa8.svg" alt="" className="w-full h-auto" />
        </motion.div>

        {/* Lines 3: Left Middle */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 0.4, x: 0 }}
          transition={{ duration: 3, delay: 1 }}
          className="absolute top-[55%] -left-[5%] w-[800px] md:w-[1100px] h-auto opacity-40"
        >
          <img src="/lines-3-4541e35a1939230404d773f7eeddcc9b.svg" alt="" className="w-full h-auto" />
        </motion.div>

        {/* Lines 4: Bottom Left */}
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 0.3, y: 0 }}
          transition={{ duration: 3.5, delay: 1.5 }}
          className="absolute bottom-0 -left-[10%] w-[600px] md:w-[900px] h-auto opacity-30"
        >
          <img src="/lines-4-4ea88270d73b7f6eaaa69e91aed97ddf.svg" alt="" className="w-full h-auto" />
        </motion.div>
      </div>

      {/* Main Content */}
      <main className="relative z-10">
        {/* Hero Section */}
        <div id="section-hero">
          <HeroSection />
        </div>

        {/* Feature Highlights - CodePen Card Aesthetic */}
        <FeatureHighlights />

        {/* First Sponsorship Banner */}
        <div className="container mx-auto px-4 py-8">
          {/* <AdBanner variant="horizontal" /> */}
        </div>

        {/* Interactive Showcase Section */}
        <InteractiveShowcaseSection />

        {/* App Download Section */}
        <div id="section-app">
          <AppDownloadSection />
        </div>

        {/* Second Sponsorship Banner */}
        <div className="container mx-auto px-4 mb-12">
          {/* <AdBanner variant="horizontal" /> */}
        </div>

        {/* Split Text Animation Section */}
        <section className="relative py-20 overflow-x-clip">
          <div className="container mx-auto px-4 flex flex-col items-center justify-center relative z-20">
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
