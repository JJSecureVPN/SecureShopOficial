import { Routes, Route, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage";
import PlanesPage from "./pages/PlanesPage/index";
import RevendedoresPage from "./pages/RevendedoresPage";
import ServersPage from "./pages/ServersPage/index";
import AboutPage from "./pages/AboutPage/index";
import SuccessPage from "./pages/SuccessPage";
import ErrorPage from "./pages/ErrorPage";
import TermsPage from "./pages/TermsPage";
import PrivacyPage from "./pages/PrivacyPage";
import CheckoutPage from "./pages/CheckoutPage";
import CheckoutRevendedorPage from "./pages/CheckoutRevendedorPage";
import CheckoutRenovacionPage from "./pages/CheckoutRenovacionPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import Header from "./components/Header";
import { PromoHeader } from "./components/PromoHeader";
import Footer from "./components/Footer";
import PageLoading from "./components/PageLoading";
import { LiveChat } from "./components/LiveChat";
import { useState, useEffect } from "react";
import { LoadingProvider, useLoading } from "./contexts/LoadingContext";
import { AuthProvider } from "./contexts/AuthContext";
import AdminToolsPage from "./pages/AdminToolsPage/index";
import DonacionesPage from "./pages/DonacionesPage";
import DonationSuccessPage from "./pages/DonationSuccessPage";
import SponsorsPage from "./pages/SponsorsPage/index";
import NoticiasPage from "./pages/NoticiasPage";
import HelpPage from "./pages/HelpPage";
import HelpCenter from "./pages/HelpCenter";
import AdminHelpCenter from "./pages/AdminHelpCenter";
import HelpHtmlView from "./pages/HelpHtmlView";
import { useRegisterActiveSession } from "./hooks/useRegisterActiveSession";
import { useLenis } from "./hooks/useLenis";

const TRANSITION_DURATION = 600;

const AppContent = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const { isLoading, setIsLoading } = useLoading();

  // Registrar sesión activa del usuario
  useRegisterActiveSession();

  // Inicializar smooth scroll con Lenis
  useLenis(isLoading);

  // Determinar el tipo de promo según la página actual
  // En páginas específicas, preferir esa promo. En otras páginas, dejar que el componente elija
  const promoHeaderTipo = 
    displayLocation.pathname === "/revendedores" ? "revendedores" : 
    displayLocation.pathname === "/planes" ? "planes" : 
    undefined; // undefined permite al componente elegir qué mostrar

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) {
      return;
    }

    setIsLoading(true);

    const timeout = setTimeout(() => {
      setDisplayLocation(location);
      setIsLoading(false);
    }, TRANSITION_DURATION);

    return () => clearTimeout(timeout);
  }, [location, displayLocation, setIsLoading]);

  return (
    <div className="flex flex-col min-h-screen bg-zinc-900 text-white">
      {isLoading && <PageLoading />}
      {displayLocation.pathname !== "/chat" && <PromoHeader tipo={promoHeaderTipo} />}
      <Header />
      <div className="flex-1 relative">
        <main>
          <Routes location={displayLocation} key={displayLocation.pathname}>
          <Route path="/" element={<HomePage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/checkout-renovacion" element={<CheckoutRenovacionPage />} />
          <Route path="/checkout-revendedor" element={<CheckoutRevendedorPage />} />
          <Route path="/perfil" element={<ProfilePage />} />
          <Route path="/planes" element={<PlanesPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/revendedores" element={<RevendedoresPage />} />
          <Route path="/estado" element={<ServersPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/sobre-nosotros" element={<AboutPage />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/error" element={<ErrorPage />} />
          <Route path="/donaciones" element={<DonacionesPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/donaciones/success" element={<DonationSuccessPage />} />
          <Route path="/sponsors" element={<SponsorsPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/noticias" element={<NoticiasPage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/ayuda" element={<HelpPage />} />
          <Route path="/ayuda/tutoriales" element={<HelpCenter />} />
          <Route path="/ayuda/tutoriales/view/:id" element={<HelpHtmlView />} />
          <Route path="/ayuda/tutoriales/admin" element={<AdminHelpCenter />} />
          <Route path="/terminos" element={<TermsPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/privacidad" element={<PrivacyPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
          <Route path="/155908348" element={<AdminToolsPage isMobileMenuOpen={isMobileMenuOpen} setIsMobileMenuOpen={setIsMobileMenuOpen} />} />
        </Routes>
        </main>
      </div>
      {!isLoading && !location.pathname.startsWith("/checkout") && location.pathname !== "/155908348" && location.pathname !== "/success" && location.pathname !== "/donaciones/success" && location.pathname !== "/chat" && <Footer />}
      
      {/* Chat en vivo - visible en todas las páginas excepto checkout, admin y la propia página de chat */}
      {!location.pathname.startsWith("/checkout") && location.pathname !== "/155908348" && location.pathname !== "/chat" && (
        <LiveChat />
      )}
    </div>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <LoadingProvider>
        <AppContent />
      </LoadingProvider>
    </AuthProvider>
  );
};

export default App;
