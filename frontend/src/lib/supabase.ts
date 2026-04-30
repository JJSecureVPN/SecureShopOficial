import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 Supabase Config:', {
  url: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'NOT SET',
  keySet: !!supabaseAnonKey
});

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '❌ Supabase URL o Anon Key no configurados. ' +
    'Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY a tu archivo .env'
  );
}

export const supabase = createClient(
  supabaseUrl || '',
  supabaseAnonKey || ''
);

// Tipos para la base de datos de Supabase
export interface Profile {
  id: string;
  email: string;
  nombre: string | null;
  telefono: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  // Campos de referidos
  saldo?: number;
  referral_code?: string | null;
  referred_by?: string | null;
  total_referrals?: number;
  total_earned?: number;
}

export interface PurchaseHistory {
  id: string;
  user_id: string;
  tipo: 'plan' | 'renovacion' | 'revendedor';
  plan_nombre: string;
  monto: number;
  estado: string;
  servex_username: string | null;
  servex_password: string | null;
  servex_expiracion: string | null;
  servex_connection_limit: number | null;
  mp_payment_id: string | null;
  created_at: string;
}

// ============================================
// TIPOS PARA TICKETS DE SOPORTE
// ============================================

export interface SupportTicket {
  id: string;
  user_id: string;
  asunto: string;
  descripcion: string | null;
  status: 'open' | 'pending' | 'closed';
  priority: 'low' | 'normal' | 'high';
  last_message_at: string;
  created_at: string;
  updated_at: string;
}

export interface SupportTicketMessage {
  id: string;
  ticket_id: string;
  user_id: string;
  content: string;
  is_internal: boolean;
  created_at: string;
}

// ============================================
// TIPOS PARA EL CHAT EN VIVO
// ============================================

export interface ChatRoom {
  id: string;
  nombre: string;
  descripcion: string | null;
  is_public: boolean;
  is_active: boolean;
  created_at: string;
}

export interface ChatMessage {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  is_pinned: boolean;
  is_deleted: boolean;
  created_at: string;
}

export interface ChatMessageWithUser extends ChatMessage {
  user_nombre: string | null;
  user_email: string;
  user_avatar: string | null;
  is_admin: boolean;
}

export interface ChatAdmin {
  id: string;
  user_id: string;
  created_at: string;
}

export interface ChatPresence {
  id: string;
  room_id: string;
  user_id: string;
  last_seen: string;
}

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>;
      };
      purchase_history: {
        Row: PurchaseHistory;
        Insert: Omit<PurchaseHistory, 'id' | 'created_at'>;
        Update: Partial<Omit<PurchaseHistory, 'id' | 'user_id' | 'created_at'>>;
      };
    };
  };
}
