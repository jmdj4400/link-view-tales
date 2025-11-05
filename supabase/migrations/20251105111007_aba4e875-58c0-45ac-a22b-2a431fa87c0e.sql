-- Fix: Move pg_trgm extension from public schema to extensions schema
-- This resolves the security warning about extensions in public schema

-- First, create the extension in the extensions schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

-- Drop from public if it exists there
DROP EXTENSION IF EXISTS pg_trgm CASCADE;