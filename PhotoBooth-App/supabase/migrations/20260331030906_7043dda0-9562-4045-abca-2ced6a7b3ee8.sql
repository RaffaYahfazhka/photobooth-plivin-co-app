-- Create photos table to store every captured photo
CREATE TABLE public.photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  layout TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.photos ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert photos (no auth required for photobooth)
CREATE POLICY "Anyone can insert photos"
  ON public.photos FOR INSERT
  WITH CHECK (true);

-- Allow anyone to view photos
CREATE POLICY "Anyone can view photos"
  ON public.photos FOR SELECT
  USING (true);

-- Create storage bucket for photo images
INSERT INTO storage.buckets (id, name, public)
VALUES ('photos', 'photos', true);

-- Allow anyone to upload to photos bucket
CREATE POLICY "Anyone can upload photos"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'photos');

-- Allow public read access
CREATE POLICY "Photos are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'photos');