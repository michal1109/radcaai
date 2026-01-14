-- Add restrictive RLS policies for subscriptions table
-- These block all direct user modifications, following the same pattern as user_roles

CREATE POLICY "Block subscription inserts"
ON public.subscriptions
FOR INSERT TO authenticated
WITH CHECK (false);

CREATE POLICY "Block subscription updates"
ON public.subscriptions
FOR UPDATE TO authenticated
USING (false);

CREATE POLICY "Block subscription deletions"
ON public.subscriptions
FOR DELETE TO authenticated
USING (false);