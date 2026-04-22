import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
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

import { PurchaseHistory } from '../../lib/supabase';
import { EstadoCuentaMap } from './types';

export default function ProfilePage() {
  const { user, profile, purchaseHistory, loading, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Sección activa basada en URL o default
  const sectionFromUrl = searchParams.get('section') as ProfileSection | null;
  const [activeSection, setActiveSection] = useState<ProfileSection>(sectionFromUrl || 'overview');
  
  // Estados de consulta de cuenta
  const [estadosCuenta, setEstadosCuenta] = useState<EstadoCuentaMap>({});

  // Cambiar sección y actualizar URL
  const handleSectionChange = (section: ProfileSection) => {
    setActiveSection(section);
    setSearchParams({ section });
  };

  // Función para consultar estado de cuenta manually (with expansion)
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

  // Función para consulta automática silenciosa (sin expandir)
  const sincronizarSilenciosamente = async (username: string) => {
    // Si ya tiene datos satisfactorios o está cargando, omitir
    if (estadosCuenta[username]?.data || estadosCuenta[username]?.loading) return;

    setEstadosCuenta(prev => ({
      ...prev,
      [username]: { ...prev[username], loading: true, error: null }
    }));

    try {
      const data = await apiService.obtenerEstadoCuenta(username);
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { ...prev[username], loading: false, data, error: null }
      }));
    } catch (error: any) {
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { ...prev[username], loading: false, data: null, error: error.message || 'Error' }
      }));
    }
  };

  // Función para refrescar estado manualmente
  const refrescarEstadoCuenta = async (username: string) => {
    setEstadosCuenta(prev => ({
      ...prev,
      [username]: { ...prev[username], loading: true, error: null }
    }));

    try {
      const data = await apiService.obtenerEstadoCuenta(username);
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { ...prev[username], loading: false, data, error: null, expanded: true }
      }));
    } catch (error: any) {
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { ...prev[username], loading: false, error: error.message }
      }));
    }
  };

  // Función para REPARAR conexión (Sincronización forzada)
  const repararEstadoCuenta = async (username: string) => {
    setEstadosCuenta(prev => ({
      ...prev,
      [username]: { ...prev[username], loading: true, error: null }
    }));

    try {
      await apiService.repararConexion(username);
      // Tras reparar, refrescar los datos locales
      const data = await apiService.obtenerEstadoCuenta(username);
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { 
          ...prev[username], 
          loading: false, 
          data, 
          error: null, 
          expanded: true,
          repaired: true 
        }
      }));

      // Quitar el estado de "reparado" después de 5 segundos
      setTimeout(() => {
        setEstadosCuenta(prev => ({
          ...prev,
          [username]: { ...prev[username], repaired: false }
        }));
      }, 5000);
    } catch (error: any) {
      setEstadosCuenta(prev => ({
        ...prev,
        [username]: { ...prev[username], loading: false, error: error.message || 'Error al reparar' }
      }));
    }
  };

  // 1. Redirigir si no hay usuario
  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [loading, user, navigate]);

  // 2. Sincronizar sección desde URL
  useEffect(() => {
    if (sectionFromUrl && sectionFromUrl !== activeSection) {
      setActiveSection(sectionFromUrl);
    }
  }, [sectionFromUrl]);

  // 3. Obtener suscripciones activas y únicas por usuario
  const suscripcionesActivas = Object.values(
    purchaseHistory
      .filter(
        (compra) =>
          compra.estado === 'aprobado' &&
          compra.servex_username &&
          compra.servex_expiracion &&
          new Date(compra.servex_expiracion) > new Date()
      )
      .reduce((acc: Record<string, PurchaseHistory>, current: PurchaseHistory) => {
        const username = current.servex_username!;
        if (!acc[username] || new Date(current.servex_expiracion!) > new Date(acc[username].servex_expiracion!)) {
          acc[username] = current;
        }
        return acc;
      }, {})
  ).sort((a, b) => new Date(a.servex_expiracion!).getTime() - new Date(b.servex_expiracion!).getTime());

  // 4. Efecto para sincronización automática al entrar en la sección de suscripciones
  useEffect(() => {
    if (activeSection === 'subscription' && suscripcionesActivas.length > 0) {
      const syncAll = async () => {
        // Sincronizar secuencialmente
        for (const suscripcion of suscripcionesActivas) {
          const username = suscripcion.servex_username;
          if (username) {
            await sincronizarSilenciosamente(username);
          }
        }
      };
      syncAll();
    }
  }, [activeSection, suscripcionesActivas.length]);
  
  const suscripcionActiva = suscripcionesActivas[0] || null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!user) return null;

  const emailVerificado = !!user.email_confirmed_at;
  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'overview':
        return (
          <OverviewSection
            user={user}
            profile={profile}
            suscripcionActiva={suscripcionActiva}
            purchaseHistory={purchaseHistory}
            estadosCuenta={estadosCuenta}
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
            onRepararEstado={repararEstadoCuenta}
          />
        );
      case 'referidos':
        return <ReferidosSection userId={user.id} userEmail={user.email || ''} />;
      case 'tickets':
        return <SupportTicketsSection userId={user.id} />;
      case 'history':
        return (
          <PurchaseHistorySection
            purchaseHistory={purchaseHistory}
            estadosCuenta={{}}
            onConsultarEstado={() => {}}
            readOnly={true}
          />
        );
      case 'settings':
        return <SettingsSection user={user} profile={profile} onUpdateProfile={updateProfile} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen text-zinc-100 selection:bg-orange-500/30">
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-orange-500/[0.03] blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-zinc-800/[0.05] blur-[140px] rounded-full animate-pulse" />
      </div>

      <ProfileNavSidebar
        user={user}
        profile={profile}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        emailVerificado={emailVerificado}
        onSignOut={handleSignOut}
        suscripcionesActivas={suscripcionesActivas.length}
      />

      <div className="relative z-10 lg:ml-72 pt-14 lg:pt-0 min-h-screen flex flex-col">
        <main className="flex-1 px-6 sm:px-10 py-10">
          <div className="mb-10 animate-in fade-in slide-in-from-left-4 duration-700">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-1 rounded-full bg-orange-500" />
              <div className="w-3 h-1 rounded-full bg-zinc-800" />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tight">
              {activeSection === 'overview' ? 'Resumen' : 
               activeSection === 'subscription' ? 'Mis Suscripciones' :
               activeSection === 'history' ? 'Historial de Compras' :
               activeSection === 'settings' ? 'Configuración' :
               activeSection === 'referidos' ? 'Sistema de Referidos' :
               activeSection === 'tickets' ? 'Soporte y Tickets' :
               'Perfil'}
            </h1>
            <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mt-1">
              Mi Cuenta / {activeSection}
            </p>
          </div>

          <div className="pb-20">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                {renderContent()}
              </motion.div>
            </AnimatePresence>
          </div>
        </main>
      </div>
    </div>
  );
}
