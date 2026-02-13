-- Allow admins to delete payments (for reset functionality)
CREATE POLICY "Admins can delete payments"
ON public.payments
FOR DELETE
USING (is_admin());
