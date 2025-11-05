-- Create channel benchmarks table
CREATE TABLE IF NOT EXISTS channel_benchmarks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  platform text NOT NULL,
  avg_ctr numeric DEFAULT 0,
  avg_conversion_rate numeric DEFAULT 0,
  avg_redirect_success numeric DEFAULT 0,
  sample_size integer DEFAULT 0,
  updated_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- Create rule templates library
CREATE TABLE IF NOT EXISTS rule_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text NOT NULL,
  conditions jsonb NOT NULL,
  dest_example text,
  category text DEFAULT 'optimization',
  impact_score integer DEFAULT 5,
  created_at timestamptz DEFAULT now()
);

-- Create experiments table for A/B testing
CREATE TABLE IF NOT EXISTS experiments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  link_id uuid REFERENCES links(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  variant_a_id uuid REFERENCES link_variants(id),
  variant_b_id uuid REFERENCES link_variants(id),
  start_ts timestamptz DEFAULT now(),
  end_ts timestamptz,
  winner text,
  status text DEFAULT 'running' CHECK (status IN ('running', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now()
);

-- Create alerts table
CREATE TABLE IF NOT EXISTS channel_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  platform text NOT NULL,
  alert_type text NOT NULL,
  severity text DEFAULT 'warning' CHECK (severity IN ('info', 'warning', 'critical')),
  message text NOT NULL,
  recommendation text,
  acknowledged boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to metrics_daily
ALTER TABLE metrics_daily 
ADD COLUMN IF NOT EXISTS redirect_success_rate numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS flow_integrity_score numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_session_duration integer DEFAULT 0;

-- Enable RLS
ALTER TABLE channel_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE rule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiments ENABLE ROW LEVEL SECURITY;
ALTER TABLE channel_alerts ENABLE ROW LEVEL SECURITY;

-- Benchmarks are public read
CREATE POLICY "Benchmarks are publicly readable"
ON channel_benchmarks FOR SELECT
TO authenticated
USING (true);

-- Rule templates are public read
CREATE POLICY "Rule templates are publicly readable"
ON rule_templates FOR SELECT
TO authenticated
USING (true);

-- Users can manage their own experiments
CREATE POLICY "Users can view own experiments"
ON experiments FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create own experiments"
ON experiments FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own experiments"
ON experiments FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Users can manage their own alerts
CREATE POLICY "Users can view own alerts"
ON channel_alerts FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own alerts"
ON channel_alerts FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

-- Insert sample rule templates
INSERT INTO rule_templates (name, description, conditions, dest_example, category, impact_score) VALUES
('Instagram WebView Recovery', 'Automatically show "Open in Browser" for Instagram users to prevent redirect failures', '{"browser": "Instagram"}', 'https://example.com/landing', 'reliability', 9),
('TikTok Optimization', 'Route TikTok traffic through optimized landing page with faster load times', '{"browser": "TikTok"}', 'https://example.com/tiktok-landing', 'performance', 8),
('Mobile-First Landing', 'Send mobile users to mobile-optimized destination for better conversion', '{"device": "iOS"}', 'https://m.example.com', 'conversion', 7),
('LinkedIn Professional Route', 'Direct LinkedIn traffic to B2B-focused landing page', '{"browser": "LinkedIn"}', 'https://example.com/business', 'conversion', 6),
('Weekend Traffic Boost', 'Use different destination for weekend traffic when engagement is higher', '{"time_range": "weekend"}', 'https://example.com/weekend-special', 'engagement', 5);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_channel_benchmarks_platform ON channel_benchmarks(platform);
CREATE INDEX IF NOT EXISTS idx_experiments_link_id ON experiments(link_id);
CREATE INDEX IF NOT EXISTS idx_experiments_status ON experiments(status);
CREATE INDEX IF NOT EXISTS idx_channel_alerts_user_id ON channel_alerts(user_id);
CREATE INDEX IF NOT EXISTS idx_channel_alerts_acknowledged ON channel_alerts(acknowledged);