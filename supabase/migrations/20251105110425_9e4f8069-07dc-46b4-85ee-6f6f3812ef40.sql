-- Add unique constraint to channel_benchmarks platform column
ALTER TABLE channel_benchmarks ADD CONSTRAINT channel_benchmarks_platform_key UNIQUE (platform);