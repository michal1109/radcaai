-- Create FAQ cache table for AI cost optimization
CREATE TABLE public.faq_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_hash TEXT NOT NULL UNIQUE,
  question_text TEXT NOT NULL,
  answer TEXT NOT NULL,
  hit_count INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.faq_cache ENABLE ROW LEVEL SECURITY;

-- Public read access for cache (used by demo endpoint)
CREATE POLICY "Anyone can read FAQ cache"
ON public.faq_cache
FOR SELECT
USING (true);

-- Only service role can insert/update/delete (from edge functions)
CREATE POLICY "Service role can manage FAQ cache"
ON public.faq_cache
FOR ALL
USING (false);

-- Create user_usage table for tracking daily message limits
CREATE TABLE public.user_usage (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  usage_date DATE NOT NULL DEFAULT CURRENT_DATE,
  messages_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, usage_date)
);

-- Enable RLS
ALTER TABLE public.user_usage ENABLE ROW LEVEL SECURITY;

-- Users can read their own usage
CREATE POLICY "Users can view their own usage"
ON public.user_usage
FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- Block direct modifications (only edge functions with service role can modify)
CREATE POLICY "Block direct usage modifications"
ON public.user_usage
FOR ALL TO authenticated
USING (false);

-- Create newsletter_subscribers table for email marketing
CREATE TABLE public.newsletter_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT 'landing',
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Enable RLS
ALTER TABLE public.newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert their email)
CREATE POLICY "Anyone can subscribe to newsletter"
ON public.newsletter_subscribers
FOR INSERT
WITH CHECK (true);

-- Block read/update/delete for non-admins
CREATE POLICY "Block newsletter subscriber reads"
ON public.newsletter_subscribers
FOR SELECT
USING (false);

CREATE POLICY "Block newsletter subscriber updates"
ON public.newsletter_subscribers
FOR UPDATE
USING (false);

CREATE POLICY "Block newsletter subscriber deletes"
ON public.newsletter_subscribers
FOR DELETE
USING (false);

-- Create demo_rate_limits table for tracking demo usage
CREATE TABLE public.demo_rate_limits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ip_hash TEXT NOT NULL,
  session_id TEXT NOT NULL,
  used_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  question_hash TEXT NOT NULL
);

-- Enable RLS
ALTER TABLE public.demo_rate_limits ENABLE ROW LEVEL SECURITY;

-- Block all direct access (only service role from edge functions)
CREATE POLICY "Block demo rate limit access"
ON public.demo_rate_limits
FOR ALL
USING (false);

-- Add indexes for performance
CREATE INDEX idx_faq_cache_question_hash ON public.faq_cache(question_hash);
CREATE INDEX idx_user_usage_user_date ON public.user_usage(user_id, usage_date);
CREATE INDEX idx_demo_rate_limits_ip_session ON public.demo_rate_limits(ip_hash, session_id);
CREATE INDEX idx_demo_rate_limits_used_at ON public.demo_rate_limits(used_at);

-- Add trigger for updated_at on faq_cache
CREATE TRIGGER update_faq_cache_updated_at
BEFORE UPDATE ON public.faq_cache
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add trigger for updated_at on user_usage
CREATE TRIGGER update_user_usage_updated_at
BEFORE UPDATE ON public.user_usage
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();