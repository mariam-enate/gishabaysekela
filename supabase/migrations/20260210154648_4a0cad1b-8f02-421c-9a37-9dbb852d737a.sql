
-- 1. Fix payment rejection bug: add 'rejected' to allowed statuses
ALTER TABLE public.payments DROP CONSTRAINT payments_status_check;
ALTER TABLE public.payments ADD CONSTRAINT payments_status_check CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]));

-- 2. Create app_settings table for chat control toggle
CREATE TABLE public.app_settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text NOT NULL,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Everyone can read settings
CREATE POLICY "Anyone can read settings" ON public.app_settings
  FOR SELECT USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update settings" ON public.app_settings
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Admins can insert settings" ON public.app_settings
  FOR INSERT WITH CHECK (public.is_admin());

-- Insert default chat_enabled setting
INSERT INTO public.app_settings (key, value) VALUES ('chat_enabled', 'true');

-- 3. Create avatars storage bucket for profile photos
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true);

-- Avatar storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
