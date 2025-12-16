-- Block all direct role modifications by authenticated users
-- Roles should only be managed via admin functions or triggers (like handle_new_user)

CREATE POLICY "Block direct role inserts" ON public.user_roles 
  FOR INSERT TO authenticated 
  WITH CHECK (false);

CREATE POLICY "Block role updates" ON public.user_roles 
  FOR UPDATE TO authenticated 
  USING (false);

CREATE POLICY "Block role deletions" ON public.user_roles 
  FOR DELETE TO authenticated 
  USING (false);