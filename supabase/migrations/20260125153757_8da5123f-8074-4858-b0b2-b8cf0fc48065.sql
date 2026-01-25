-- Allow admins to delete any chat message
CREATE POLICY "Admins can delete any chat message"
ON public.chat_messages
FOR DELETE
USING (public.is_admin());

-- Allow members to update their own messages
CREATE POLICY "Users can update their own messages"
ON public.chat_messages
FOR UPDATE
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Allow admins to delete profiles (ban members)
CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
USING (public.is_admin());

-- Allow admins to delete user roles when banning
CREATE POLICY "Admins can delete user roles"
ON public.user_roles
FOR DELETE
USING (public.is_admin());

-- Add avatar_url column to profiles for profile photos
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS avatar_url TEXT;