-- ============================================
-- SUPABASE SETUP PARA SECURESHOP VPN
-- Migración: 001_initial_setup
-- Fecha: 2024-12-14
-- Descripción: Tablas iniciales para usuarios e historial
-- ============================================

-- ============================================
-- 1. TABLA DE PERFILES DE USUARIO
-- ============================================
-- Extiende auth.users con información adicional del cliente

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  nombre TEXT,
  telefono TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índice para búsquedas por email
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- ============================================
-- 2. TABLA DE HISTORIAL DE COMPRAS
-- ============================================
-- Guarda todas las compras vinculadas al usuario

CREATE TABLE IF NOT EXISTS public.purchase_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('plan', 'renovacion', 'revendedor')),
  plan_nombre TEXT NOT NULL,
  monto DECIMAL(10,2) NOT NULL,
  estado TEXT NOT NULL DEFAULT 'aprobado',
  servex_username TEXT,
  servex_password TEXT,
  servex_expiracion TIMESTAMPTZ,
  servex_connection_limit INTEGER,
  mp_payment_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Índices para consultas frecuentes
CREATE INDEX IF NOT EXISTS idx_purchase_history_user_id ON public.purchase_history(user_id);
CREATE INDEX IF NOT EXISTS idx_purchase_history_created_at ON public.purchase_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_purchase_history_mp_payment_id ON public.purchase_history(mp_payment_id);
