-- SQL Script mentah untuk memastikan file ini dapat dijalankan berkali-kali tanpa error
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  amount NUMERIC NOT NULL,
  category TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Drop policies terlebih dahulu jika sudah ada (mencegah error "already exists")
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

-- Re-create policies
CREATE POLICY "Users can view own transactions" 
ON public.transactions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" 
ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" 
ON public.transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" 
ON public.transactions FOR DELETE USING (auth.uid() = user_id);
