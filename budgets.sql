-- SQL Script untuk membuat tabel budgets
CREATE TABLE IF NOT EXISTS public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  month INT NOT NULL,
  year INT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, month, year)
);

-- Enable RLS
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Drop policies if exists
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

-- Create policies
CREATE POLICY "Users can view own budgets" 
ON public.budgets FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" 
ON public.budgets FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" 
ON public.budgets FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" 
ON public.budgets FOR DELETE USING (auth.uid() = user_id);
