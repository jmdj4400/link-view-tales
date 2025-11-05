-- Add setup tracking columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS instagram_bio_setup_completed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS setup_guide_dismissed boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;