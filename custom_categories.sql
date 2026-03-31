CREATE TABLE IF NOT EXISTS public.custom_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  value TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.custom_categories ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own categories
CREATE POLICY "Users can view own custom categories" 
ON public.custom_categories FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own categories
CREATE POLICY "Users can insert own custom categories" 
ON public.custom_categories FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to delete their own categories
CREATE POLICY "Users can delete own custom categories"
ON public.custom_categories FOR DELETE USING (auth.uid() = user_id);
