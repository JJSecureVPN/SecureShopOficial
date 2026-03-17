import {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
  ReactNode,
} from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile, PurchaseHistory } from '../lib/supabase';

const API_BASE = import.meta.env.VITE_API_URL || '';

/** Vincula compras realizadas como invitado al usuario que acaba de iniciar sesión */
async function vincularComprasInvitado(userId: string, email: string): Promise<void> {
  try {
    const url = API_BASE.endsWith('/api')
      ? `${API_BASE}/compras/vincular`
      : `${API_BASE}/api/compras/vincular`;

    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, email }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.data?.vinculadas > 0) {
        console.log(`[Auth] ✅ ${data.data.vinculadas} compra(s) de invitado vinculadas a la cuenta`);
      }
    }
  } catch (e) {
    // No bloqueamos el login si esto falla
    console.warn('[Auth] No se pudieron vincular compras de invitado:', e);
  }
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  purchaseHistory: PurchaseHistory[];
  loading: boolean;
  signUp: (email: string, password: string, nombre?: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signInWithGoogle: () => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<{ error: Error | null }>;
  refreshPurchaseHistory: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [purchaseHistory, setPurchaseHistory] = useState<PurchaseHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const initRef = useRef(false);

  // Cargar perfil del usuario
  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  // Cargar historial de compras
  const fetchPurchaseHistory = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('purchase_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching purchase history:', error);
        return;
      }

      setPurchaseHistory(data || []);
    } catch (error) {
      console.error('Error fetching purchase history:', error);
    }
  };

  // Refrescar historial de compras
  const refreshPurchaseHistory = async () => {
    if (user) {
      await fetchPurchaseHistory(user.id);
    }
  };

  useEffect(() => {
    // Evitar doble inicialización (React StrictMode)
    if (initRef.current) {
      return;
    }
    initRef.current = true;

    let isMounted = true;

    const initAuth = async () => {
      try {
        console.log('🔐 Iniciando autenticación...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (error) {
          console.error('❌ Error getting session:', error);
          setLoading(false);
          return;
        }
        
        console.log('✅ Sesión obtenida:', session ? 'Usuario logueado' : 'Sin sesión');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 Cargando perfil e historial...');
          await Promise.all([
            fetchProfile(session.user.id),
            fetchPurchaseHistory(session.user.id)
          ]);
          console.log('✅ Datos cargados');
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('❌ Error en initAuth:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Poner loading en false INMEDIATAMENTE
        setLoading(false);

        if (session?.user) {
          // Cargar datos en background sin bloquear
          fetchProfile(session.user.id).catch(console.error);
          fetchPurchaseHistory(session.user.id).catch(console.error);

          // Al iniciar sesión o registrarse, vincular compras realizadas como invitado
          if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
            vincularComprasInvitado(session.user.id, session.user.email || '')
              .then(() => fetchPurchaseHistory(session.user!.id))
              .catch(console.error);
          }
        } else {
          setProfile(null);
          setPurchaseHistory([]);
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Registrar usuario
  const signUp = async (email: string, password: string, nombre?: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          nombre: nombre || '',
        },
      },
    });

    return { error };
  };

  // Iniciar sesión
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // Iniciar sesión con Google
  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/perfil`,
      },
    });

    return { error };
  };

  // Cerrar sesión
  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setPurchaseHistory([]);
    window.location.href = '/';
  };

  // Actualizar perfil
  const updateProfile = async (data: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No hay usuario autenticado') };
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          email: user.email!,
          ...data,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        return { error: new Error(error.message) };
      }

      // Refrescar perfil
      await fetchProfile(user.id);
      return { error: null };
    } catch (error) {
      return { error: error as Error };
    }
  };

  const value = {
    user,
    session,
    profile,
    purchaseHistory,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile,
    refreshPurchaseHistory,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
