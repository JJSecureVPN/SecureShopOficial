import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2, Menu, X } from 'lucide-react';
import { ReferidosSection } from '../../components/ReferidosSection';
import { apiService } from '../../services/api.service';

// Componentes locales
import {
  ProfileNavSidebar,
  ProfileSection,
  AllActiveSubscriptions,
  PurchaseHistorySection,
  SupportTicketsSection,
  OverviewSection,
  SettingsSection,
} from './components';

// Tipos y utilidades
import { EstadoCuentaMap } from './types';

export default function ProfilePage() {
  const { user, profile, purchaseHistory, loading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Sección activa basada en URL o default
  const sectionFromUrl = searchParams.get('section') as ProfileSection | null;
  const [activeSection, setActiveSection] = useState<ProfileSection>(sectionFromUrl || 'overview');
  
  // Mobile sidebar
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Estados de consulta de cuenta
  const [estadosCuenta, setEstadosCuenta] = useState<EstadoCuentaMap>({});

  // Cambiar sección y actualizar URL
  const handleSectionChange = (section: ProfileSection) => {
    setActiveSection(section);
    setSearchParams({ section });
    setMobileMenuOpen(false);
  };

  // Función para consultar estado de cuenta
  const consultarEstadoCuenta = async (username: string) => {
    if (estadosCuenta[username]?.expanded) {
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { ...prev[username], expanded: false }
      }));
      return;
    }

    setEstadosCuenta(prev => ({
      ...prev,
      [username]: { loading: true, data: null, error: null, expanded: true }
    }));

    try {
      const data = await apiService.obtenerEstadoCuenta(username);
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { loading: false, data, error: null, expanded: true }
      }));
    } catch (error: any) {
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { loading: false, data: null, error: error.message || 'Error consultando', expanded: true }
      }));
    }
  };

  // Función para refrescar estado
  const refrescarEstadoCuenta = async (username: string) => {
    setEstadosCuenta(prev => ({
      ...prev,
      [username]: { ...prev[username], loading: true, error: null }
    }));

    try {
      const data = await apiService.obtenerEstadoCuenta(username);
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { loading: false, data, error: null, expanded: true }
      }));
    } catch (error: any) {
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { ...prev[username], loading: false, error: error.message }
      }));
    }
  };

  // Redirigir si no hay usuario
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [loading, user, navigate]);

  // Sincronizar sección desde URL
  useEffect(() => {
    if (sectionFromUrl && sectionFromUrl !== activeSection) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  // Obtener TODAS las suscripciones activas
  const suscripcionesActivas = purchaseHistory.filter(
    (compra) =>
      compra.estado === 'aprobado' &&
      compra.servex_username &&
      compra.servex_expiracion &&
      new Date(compra.servex_expiracion) > new Date()
  );
  
  // Para compatibilidad: primera suscripción activa (para overview)
  const suscripcionActiva = suscripcionesActivas[0] || null;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-refine-dark flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Handlers
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const emailVerificado = !!user.email_confirmed_at;

  // Renderizar contenido según la sección activa
  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            user={user}
            profile={profile}
            suscripcionActiva={suscripcionActiva}
            purchaseHistory={purchaseHistory}
            onNavigate={handleSectionChange}
          />
        );
      
      case 'subscription':
        return (
          <AllActiveSubscriptions
            suscripcionesActivas={suscripcionesActivas}
            estadosCuenta={estadosCuenta}
            onConsultarEstado={consultarEstadoCuenta}
            onRefrescarEstado={refrescarEstadoCuenta}
          />
        );
      
      case 'referidos':
        return (
          <div className="space-y-6">
            <ReferidosSection userId={user.id} userEmail={user.email || ''} />
          </div>
        );
      
      case 'tickets':
        return (
          <div className="space-y-6">
            <SupportTicketsSection userId={user.id} />
          </div>
        );
      
      case 'history':
        return (
          <div className="space-y-6">
            <PurchaseHistorySection
              purchaseHistory={purchaseHistory}
              estadosCuenta={{}}
              onConsultarEstado={() => {}}
              onRefrescarEstado={() => {}}
              readOnly={true}
            />
          </div>
        );
      
      case 'settings':
        return (
          <SettingsSection
            user={user}
            profile={profile}
            onUpdateProfile={updateProfile}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-refine-dark">
      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 bg-zinc-900/80 backdrop-blur-lg border-b border-zinc-700">
        <div className="px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-2 -ml-2 rounded-xl hover:bg-zinc-800 transition-colors"
          >
            <Menu className="w-6 h-6 text-zinc-300" />
          </button>
          <h1 className="font-bold text-white">Mi Cuenta</h1>
          <div className="w-10" />
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="lg:hidden fixed left-0 top-0 bottom-0 z-50 w-[300px] bg-zinc-900 shadow-2xl"
            >
              <div className="p-4 border-b border-zinc-700 flex items-center justify-between">
                <span className="font-bold text-white">Menú</span>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                  <X className="w-5 h-5 text-zinc-300" />
                </button>
              </div>
              <div className="p-4 overflow-y-auto max-h-[calc(100vh-64px)]">
                <ProfileNavSidebar
                  user={user}
                  profile={profile}
                  activeSection={activeSection}
                  onSectionChange={handleSectionChange}
                  emailVerificado={emailVerificado}
                  onSignOut={handleSignOut}
                  suscripcionesActivas={suscripcionesActivas.length}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main Layout - sin altura fija para scroll natural */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10">
        <div className="lg:flex lg:gap-8">
          {/* Desktop Sidebar - sticky */}
          <div className="hidden lg:block lg:w-[280px] xl:w-[320px] flex-shrink-0">
            <div className="sticky top-24">
              <ProfileNavSidebar
                user={user}
                profile={profile}
                activeSection={activeSection}
                onSectionChange={handleSectionChange}
                emailVerificado={emailVerificado}
                onSignOut={handleSignOut}
                suscripcionesActivas={suscripcionesActivas.length}
              />
            </div>
          </div>

          {/* Content Area - fluye naturalmente */}
          <div className="flex-1 min-w-0">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
