
-- Drop the existing restrictive SELECT policy
DROP POLICY "Users can view their own payments" ON public.payments;

-- Create new policy allowing all authenticated users to view approved payments (and admins/owners see all)
CREATE POLICY "Users can view approved payments or own payments"
ON public.payments
FOR SELECT
USING (
  status = 'approved' OR user_id = auth.uid() OR is_admin()
);
