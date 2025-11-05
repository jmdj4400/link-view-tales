-- Create redirects table for tracking redirect outcomes
CREATE TABLE IF NOT EXISTS public.redirects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT,
  browser TEXT,
  device TEXT,
  success BOOLEAN DEFAULT true,
  fallback_used BOOLEAN DEFAULT false,
  user_agent TEXT,
  country TEXT
);

-- Create goals table for conversion tracking
CREATE TABLE IF NOT EXISTS public.goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('pixel', 'webhook')),
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create goal_events table for conversion events
CREATE TABLE IF NOT EXISTS public.goal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  link_id UUID REFERENCES public.links(id) ON DELETE SET NULL,
  ts TIMESTAMPTZ NOT NULL DEFAULT now(),
  referrer TEXT,
  source TEXT,
  conversion_value NUMERIC,
  event_ref TEXT,
  matched_click_id UUID
);

-- Create rules table for smart routing
CREATE TABLE IF NOT EXISTS public.rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id UUID REFERENCES public.links(id) ON DELETE CASCADE,
  conditions JSONB NOT NULL,
  dest_url TEXT NOT NULL,
  priority INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rules ENABLE ROW LEVEL SECURITY;

-- RLS Policies for redirects
CREATE POLICY "Anyone can insert redirects"
  ON public.redirects FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view redirects for own links"
  ON public.redirects FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE links.id = redirects.link_id
      AND links.user_id = auth.uid()
    )
  );

-- RLS Policies for goals
CREATE POLICY "Users can view own goals"
  ON public.goals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals"
  ON public.goals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals"
  ON public.goals FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals"
  ON public.goals FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for goal_events
CREATE POLICY "Anyone can insert goal events"
  ON public.goal_events FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can view goal events for own goals"
  ON public.goal_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.goals
      WHERE goals.id = goal_events.goal_id
      AND goals.user_id = auth.uid()
    )
  );

-- RLS Policies for rules
CREATE POLICY "Users can view rules for own links"
  ON public.rules FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE links.id = rules.link_id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert rules for own links"
  ON public.rules FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE links.id = rules.link_id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update rules for own links"
  ON public.rules FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE links.id = rules.link_id
      AND links.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete rules for own links"
  ON public.rules FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.links
      WHERE links.id = rules.link_id
      AND links.user_id = auth.uid()
    )
  );

-- Add indexes for performance
CREATE INDEX idx_redirects_link_id ON public.redirects(link_id);
CREATE INDEX idx_redirects_ts ON public.redirects(ts DESC);
CREATE INDEX idx_goal_events_goal_id ON public.goal_events(goal_id);
CREATE INDEX idx_goal_events_link_id ON public.goal_events(link_id);
CREATE INDEX idx_goal_events_ts ON public.goal_events(ts DESC);
CREATE INDEX idx_rules_link_id ON public.rules(link_id);
CREATE INDEX idx_rules_priority ON public.rules(priority DESC);

-- Add conversion_count to metrics_daily
ALTER TABLE public.metrics_daily 
ADD COLUMN IF NOT EXISTS conversion_count INTEGER DEFAULT 0;

-- Trigger for goals updated_at
CREATE TRIGGER update_goals_updated_at
  BEFORE UPDATE ON public.goals
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();