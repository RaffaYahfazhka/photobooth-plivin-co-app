-- SQL Script untuk tabel milestones
CREATE TABLE IF NOT EXISTS public.milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_amount NUMERIC NOT NULL,
  saved_amount NUMERIC DEFAULT 0,
  target_date DATE NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can insert own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can update own milestones" ON public.milestones;
DROP POLICY IF EXISTS "Users can delete own milestones" ON public.milestones;

-- Create policies
CREATE POLICY "Users can view own milestones" 
ON public.milestones FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own milestones" 
ON public.milestones FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own milestones" 
ON public.milestones FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own milestones" 
ON public.milestones FOR DELETE USING (auth.uid() = user_id);
