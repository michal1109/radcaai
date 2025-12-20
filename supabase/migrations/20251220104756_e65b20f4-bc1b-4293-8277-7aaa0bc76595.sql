-- Fix: set an explicit search_path for functions to avoid mutable search_path risks
-- (addresses Function Search Path Mutable)
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;