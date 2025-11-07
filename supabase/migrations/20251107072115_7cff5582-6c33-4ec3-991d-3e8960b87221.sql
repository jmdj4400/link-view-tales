-- Phase 4: Add Performance Indexes for High-Traffic Tables

-- Indexes for events table
CREATE INDEX IF NOT EXISTS idx_events_user_id ON public.events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_link_id ON public.events(link_id);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON public.events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_referrer ON public.events(referrer) WHERE referrer IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_events_user_link_created ON public.events(user_id, link_id, created_at DESC);

-- Indexes for redirects table
CREATE INDEX IF NOT EXISTS idx_redirects_link_id ON public.redirects(link_id);
CREATE INDEX IF NOT EXISTS idx_redirects_ts ON public.redirects(ts DESC);
CREATE INDEX IF NOT EXISTS idx_redirects_platform ON public.redirects(platform);
CREATE INDEX IF NOT EXISTS idx_redirects_success ON public.redirects(success);
CREATE INDEX IF NOT EXISTS idx_redirects_link_ts ON public.redirects(link_id, ts DESC);
CREATE INDEX IF NOT EXISTS idx_redirects_platform_ts ON public.redirects(platform, ts DESC) WHERE success = false;

-- Indexes for recovery_attempts table
CREATE INDEX IF NOT EXISTS idx_recovery_attempts_user_id ON public.recovery_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_recovery_attempts_link_id ON public.recovery_attempts(link_id);
CREATE INDEX IF NOT EXISTS idx_recovery_attempts_created_at ON public.recovery_attempts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recovery_attempts_platform ON public.recovery_attempts(platform);
CREATE INDEX IF NOT EXISTS idx_recovery_attempts_success ON public.recovery_attempts(success);
CREATE INDEX IF NOT EXISTS idx_recovery_attempts_user_created ON public.recovery_attempts(user_id, created_at DESC);

-- Indexes for rate_limits table (critical for performance)
CREATE INDEX IF NOT EXISTS idx_rate_limits_identifier_action ON public.rate_limits(identifier, action);
CREATE INDEX IF NOT EXISTS idx_rate_limits_window_start ON public.rate_limits(window_start DESC);
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup ON public.rate_limits(identifier, action, window_start);

-- Additional composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_events_analytics ON public.events(user_id, event_type, created_at DESC) WHERE is_bot = false;
CREATE INDEX IF NOT EXISTS idx_redirects_firewall ON public.redirects(link_id, platform, ts DESC) WHERE fallback_used = true;