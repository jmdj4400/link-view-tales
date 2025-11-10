-- Add report settings columns to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS weekly_report_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS monthly_report_enabled BOOLEAN DEFAULT false;