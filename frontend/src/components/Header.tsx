import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ChevronDown, Home, Users, CreditCard, Store, Heart, Star, LogIn, HelpCircle, Activity } from 'lucide-react';
import ContactButton from "./ContactButton";
import NoticiasPopover from "./NoticiasPopover";
import CuponesPopover from "./CuponesPopover";
import UserMenu from "./UserMenu";
import AuthModal from "./AuthModal";
import { HeaderDropdown } from "./HeaderDropdown";
import { useState, useEffect, useRef, useLayoutEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

const Header = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement | null>(null);
  const [headerHeight, setHeaderHeight] = useState(64);
  const scrollYRef = useRef<number>(0);
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // Escuchar evento global para abrir modal de autenticación (usado por el chat)
  useEffect(() => {
    const handleOpenAuthModal = () => setShowAuthModal(true);
    document.addEventListener('open-auth-modal', handleOpenAuthModal);
    return () => document.removeEventListener('open-auth-modal', handleOpenAuthModal);
  }, []);
  
  // Bloquear scroll preservando la posición (evita salto en móviles)
  useEffect(() => {
    if (mobileMenuOpen) {
      scrollYRef.current = window.scrollY || window.pageYOffset || 0;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = '0';
      document.body.style.right = '0';
    } else {
      // Restaurar estilos y devolver la posición guardada
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
      window.scrollTo(0, scrollYRef.current || 0);
    }
    return () => {
      document.body.style.position = '';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.right = '';
    };
  }, [mobileMenuOpen]);

  // Medir la altura del header para posicionar el menú/overlay correctamente
  useLayoutEffect(() => {
    const measure = () => {
      const h = headerRef.current?.getBoundingClientRect().height || 64;
      setHeaderHeight(Math.round(h));
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, []);
  
  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: "/", label: "Inicio" },
    { path: "/planes", label: "Planes" },
    { path: "/noticias", label: "Noticias" },
  ];

  return (
    <>
      {/* Overlay cuando el menú está abierto - solo cubre debajo del header */}
      {mobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-x-0 bottom-0 bg-black/50 backdrop-blur-sm z-[8888]"
          onClick={() => setMobileMenuOpen(false)}
          style={{ top: `${headerHeight}px` }}
        />
      )}

      {/* Header - Refine.dev style */}
      <header 
        ref={headerRef}
        className="sticky top-0 left-0 right-0 w-full z-[10001] bg-refine-dark border-b border-refine"
      >
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Left side: Logo */}
          <div className="flex items-center gap-6">
            <Link
              to="/"
              reloadDocument
              className="flex items-center gap-3 group focus:outline-none"
              aria-label="JJSecure VPN"
            >
              <img
                src="/INTERNET ILIMITADO.avif"
                alt="JJSecure VPN"
                className="h-8 w-auto"
              />
            </Link>

            {/* Navigation - Desktop */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  reloadDocument
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path) ? 'text-indigo-600' : 'text-refine-secondary hover:text-refine'
                  }`}
                >
                  {link.label}
                </Link>
              ))}

              {/* Dropdown Características */}
              <div className="relative">
                <button
                  onClick={() => setFeaturesOpen(!featuresOpen)}
                  onBlur={() => setTimeout(() => setFeaturesOpen(false), 150)}
                  className="flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium text-refine-secondary hover:text-refine transition-colors"
                >
                  Características
                  <ChevronDown className={`h-4 w-4 transition-transform ${featuresOpen ? 'rotate-180' : ''}`} />
                </button>

                <HeaderDropdown isOpen={featuresOpen}>
                  <ol className="grid grid-cols-2 gap-1 px-2">
                    <li>
                      <Link
                        to="/"
                        reloadDocument
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 rounded-lg group"
                        onClick={() => setFeaturesOpen(false)}
                      >
                        <Home className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span>Inicio</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/planes"
                        reloadDocument
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 rounded-lg group"
                        onClick={() => setFeaturesOpen(false)}
                      >
                        <CreditCard className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span>Planes VPN</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/sobre-nosotros"
                        reloadDocument
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 rounded-lg group"
                        onClick={() => setFeaturesOpen(false)}
                      >
                        <Users className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span>Sobre Nosotros</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/revendedores"
                        reloadDocument
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 rounded-lg group"
                        onClick={() => setFeaturesOpen(false)}
                      >
                        <Store className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span>Revendedores</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/donaciones"
                        reloadDocument
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 rounded-lg group"
                        onClick={() => setFeaturesOpen(false)}
                      >
                        <Heart className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span>Donaciones</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/estado"
                        reloadDocument
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 rounded-lg group"
                        onClick={() => setFeaturesOpen(false)}
                      >
                        <Activity className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span>Estado</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/sponsors"
                        reloadDocument
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 rounded-lg group"
                        onClick={() => setFeaturesOpen(false)}
                      >
                        <Star className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span>Sponsors</span>
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/ayuda"
                        reloadDocument
                        className="flex items-center gap-2 px-3 py-2.5 text-sm text-zinc-300 hover:text-white hover:bg-zinc-700/50 transition-all duration-200 rounded-lg group"
                        onClick={() => setFeaturesOpen(false)}
                      >
                        <HelpCircle className="h-4 w-4 text-indigo-500 group-hover:scale-110 transition-transform flex-shrink-0" />
                        <span>Ayuda</span>
                      </Link>
                    </li>
                  </ol>
                </HeaderDropdown>
              </div>
            </nav>
          </div>

          {/* Right side: Actions */}
          <div className="flex items-center gap-2">
            {/* Desktop actions */}
            <div className="hidden md:flex items-center gap-2">
              <CuponesPopover />
              <NoticiasPopover />
              <ContactButton />
              <UserMenu />
            </div>

            {/* Mobile icons */}
            <div className="md:hidden flex items-center gap-2">
              <CuponesPopover />
              <NoticiasPopover />
              <ContactButton />
            </div>

            {/* CTA Button - escondido en /planes */}
            {location.pathname !== '/planes' && (
              <Link
                to="/planes"
                reloadDocument
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold bg-refine-accent text-zinc-900 hover:bg-orange-500 transition-colors"
              >
                Obtener VPN
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-refine-secondary hover:text-refine transition-colors"
              aria-label={mobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Menu - Refine.dev style */}
        {mobileMenuOpen && (
          <div 
            className="lg:hidden border-t border-refine bg-refine-dark-alt z-[10000]"
            style={{ 
              position: 'fixed',
              left: 0,
              right: 0,
              top: `${headerHeight}px`,
              maxHeight: `calc(100vh - ${headerHeight}px)`,
              overflowY: 'auto',
            }}
          >
            <nav className="p-4 space-y-1">
              {[
                { path: '/', label: 'Inicio', icon: Home },
                { path: '/sobre-nosotros', label: 'Sobre Nosotros', icon: Users },
                { path: '/planes', label: 'Planes VPN', icon: CreditCard },
                { path: '/noticias', label: 'Noticias', icon: Star },
                { path: '/revendedores', label: 'Revendedores', icon: Store },
                { path: '/donaciones', label: 'Donaciones', icon: Heart },
                { path: '/sponsors', label: 'Sponsors', icon: Star },
                { path: '/estado', label: 'Estado del Sistema', icon: Activity },
                { path: '/ayuda', label: 'Ayuda', icon: HelpCircle },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  reloadDocument
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors ${
                      isActive(item.path) 
                        ? 'text-indigo-600 bg-refine-dark-tertiary' 
                        : 'text-refine-secondary hover:text-refine hover:bg-refine-dark-tertiary'
                    }`}
                >
                    <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-indigo-500' : 'text-zinc-400'}`} />
                  {item.label}
                </Link>
              ))}

              {/* Mi Cuenta o Iniciar Sesión */}
              {user ? (
                <Link
                  to="/perfil"
                  reloadDocument
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base transition-colors ${
                    isActive('/perfil')
                      ? 'text-indigo-600 bg-refine-dark-tertiary'
                      : 'text-refine-secondary hover:text-refine hover:bg-refine-dark-tertiary'
                  }`}
                >
                  {/* Avatar - Mostrar imagen de Google si está disponible */}
                  {user.user_metadata?.avatar_url || user.user_metadata?.picture ? (
                    <img
                      src={user.user_metadata?.avatar_url || user.user_metadata?.picture}
                      alt="Avatar"
                      className="w-8 h-8 rounded-full object-cover"
                    />
                  ) : (
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-indigo-600 text-white"
                    >
                      {(user.user_metadata?.full_name || user.email || 'U')[0].toUpperCase()}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="font-medium">Mi Cuenta</span>
                    <span className="text-xs opacity-70 truncate max-w-[180px]">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                  </div>
                </Link>
              ) : (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setShowAuthModal(true);
                  }}
                  className="flex items-center gap-3 px-4 py-3 rounded-lg text-base text-refine-secondary hover:text-refine hover:bg-refine-dark-tertiary transition-colors w-full text-left"
                >
                  <LogIn className="h-5 w-5" />
                  Iniciar sesión
                </button>
              )}

              {/* Separador */}
              <div className="my-3 border-t border-refine" />

              {/* CTA - escondido en /planes */}
              {location.pathname !== '/planes' && (
                <div className="p-4">
                  <Link
                    to="/planes"
                    reloadDocument
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-2 w-full px-5 py-3 rounded-lg text-base font-semibold bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                  >
                    Obtener VPN
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* Modal de autenticación para móvil */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />
    </>
  );
};

export default Header;
