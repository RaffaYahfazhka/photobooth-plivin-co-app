-- ================================================
-- Migration: Stripe → Xendit Subscription System
-- ================================================

-- 1. Drop old Stripe-based subscriptions table
DROP TABLE IF EXISTS public.subscriptions;

-- 2. Create new Xendit-based subscriptions table
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  plan TEXT NOT NULL DEFAULT 'basic' CHECK (plan IN ('basic', 'pro')),
  status TEXT NOT NULL DEFAULT 'inactive' CHECK (status IN ('active', 'inactive', 'pending', 'expired')),
  xendit_invoice_id TEXT,
  xendit_external_id TEXT,
  amount NUMERIC DEFAULT 29000,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- 4. Create policies
DROP POLICY IF EXISTS "Users can view own subscription" ON public.subscriptions;
DROP POLICY IF EXISTS "Service role can manage subscriptions" ON public.subscriptions;

CREATE POLICY "Users can view own subscription"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Service role (untuk webhook) bisa insert/update
-- Webhook pakai supabase service_role key, jadi tidak perlu policy khusus
-- Tapi kita tetap buat policy agar user bisa insert subscription sendiri
CREATE POLICY "Users can insert own subscription"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own subscription"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- 5. Update profiles.plan constraint to include 'basic'
-- Jalankan ini HANYA jika constraint lama masih ada
-- ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_plan_check;
-- ALTER TABLE public.profiles ADD CONSTRAINT profiles_plan_check CHECK (plan IN ('free', 'basic', 'pro'));

-- Note: Jika kolom profiles.plan sudah pakai 'free', kita mapping di aplikasi:
-- 'free' = Santuy Basic, 'pro' = Santuy Pro
