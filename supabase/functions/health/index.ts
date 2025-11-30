import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface HealthCheck {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  checks: {
    database: { status: string; latencyMs?: number; error?: string };
    redirectLatency: { status: string; p95Ms?: number; p99Ms?: number; error?: string };
    emailProvider: { status: string; error?: string };
  };
  version: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  const health: HealthCheck = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    checks: {
      database: { status: 'unknown' },
      redirectLatency: { status: 'unknown' },
      emailProvider: { status: 'unknown' },
    },
    version: '1.0.0',
  };

  try {
    // Check 1: Database connectivity
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const dbStart = Date.now();
    try {
      const { error: dbError } = await supabase
        .from('links')
        .select('id')
        .limit(1);

      const dbLatency = Date.now() - dbStart;
      
      if (dbError) {
        health.checks.database = { 
          status: 'unhealthy', 
          latencyMs: dbLatency,
          error: dbError.message,
        };
        health.status = 'unhealthy';
      } else {
        health.checks.database = { 
          status: dbLatency < 100 ? 'healthy' : 'degraded',
          latencyMs: dbLatency,
        };
        if (dbLatency >= 100) health.status = 'degraded';
      }
    } catch (error: any) {
      health.checks.database = { 
        status: 'unhealthy',
        error: error?.message || 'Unknown error',
      };
      health.status = 'unhealthy';
    }

    // Check 2: Redirect performance (last hour)
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      
      const { data: redirects, error: redirectError } = await supabase
        .from('redirects')
        .select('load_time_ms')
        .gte('ts', oneHourAgo)
        .not('load_time_ms', 'is', null)
        .order('load_time_ms', { ascending: false })
        .limit(100);

      if (redirectError) {
        health.checks.redirectLatency = {
          status: 'unknown',
          error: redirectError.message,
        };
      } else if (redirects && redirects.length > 0) {
        const latencies = redirects.map(r => r.load_time_ms).filter(l => l !== null).sort((a, b) => a - b);
        const p95Index = Math.floor(latencies.length * 0.95);
        const p99Index = Math.floor(latencies.length * 0.99);
        const p95 = latencies[p95Index] || 0;
        const p99 = latencies[p99Index] || 0;

        health.checks.redirectLatency = {
          status: p95 < 300 ? 'healthy' : p95 < 500 ? 'degraded' : 'unhealthy',
          p95Ms: p95,
          p99Ms: p99,
        };

        if (p95 >= 300) health.status = health.status === 'unhealthy' ? 'unhealthy' : 'degraded';
        if (p95 >= 500) health.status = 'unhealthy';
      } else {
        health.checks.redirectLatency = {
          status: 'healthy',
          p95Ms: 0,
          p99Ms: 0,
        };
      }
    } catch (error: any) {
      health.checks.redirectLatency = {
        status: 'unknown',
        error: error?.message || 'Unknown error',
      };
    }

    // Check 3: Email provider (verify env vars)
    try {
      const resendKey = Deno.env.get('RESEND_API_KEY');
      
      if (!resendKey || resendKey.length < 10) {
        health.checks.emailProvider = {
          status: 'unhealthy',
          error: 'RESEND_API_KEY not configured',
        };
        health.status = 'degraded'; // Email is not critical for core redirect
      } else {
        health.checks.emailProvider = {
          status: 'healthy',
        };
      }
    } catch (error: any) {
      health.checks.emailProvider = {
        status: 'unknown',
        error: error?.message || 'Unknown error',
      };
    }

    // Log health check
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'health_check',
      status: health.status,
      durationMs: Date.now() - startTime,
    }));

    const statusCode = health.status === 'healthy' ? 200 : health.status === 'degraded' ? 200 : 503;

    return new Response(
      JSON.stringify(health, null, 2),
      {
        status: statusCode,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: any) {
    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      event: 'health_check_error',
      error: error?.message || 'Unknown error',
      stack: error?.stack,
    }));

    return new Response(
      JSON.stringify({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error?.message || 'Unknown error',
      }),
      {
        status: 503,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
