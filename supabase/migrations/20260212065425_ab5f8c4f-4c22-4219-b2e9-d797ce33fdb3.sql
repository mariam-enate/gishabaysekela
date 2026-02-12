-- Add soft delete column to profiles
ALTER TABLE public.profiles ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Update RLS: exclude soft-deleted profiles from normal view
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;
CREATE POLICY "Users can view active profiles"
ON public.profiles
FOR SELECT
USING (deleted_at IS NULL OR is_admin());
