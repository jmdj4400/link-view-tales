import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface IncidentThresholds {
  low: number;
  medium: number;
  high: number;
  critical: number;
}

const ERROR_RATE_THRESHOLDS: IncidentThresholds = {
  low: 5,
  medium: 10,
  high: 20,
  critical: 40,
};

const MIN_SAMPLE_SIZE = 50; // Minimum redirects needed to detect incident

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    console.log('Starting incident detection...');

    // Analyze redirects from last 5 minutes
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();

    // Aggregate by platform, country, device
    const { data: aggregates, error: aggError } = await supabase
      .from('redirects')
      .select('platform, country, device, success')
      .gte('ts', fiveMinutesAgo);

    if (aggError) throw aggError;

    if (!aggregates || aggregates.length === 0) {
      console.log('No recent redirect data to analyze');
      return new Response(
        JSON.stringify({ message: 'No data to analyze', incidents: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Group and calculate error rates
    const groups = new Map<string, { total: number; failures: number; country: string | null; device: string | null }>();

    for (const redirect of aggregates) {
      const key = `${redirect.platform}|${redirect.country || 'unknown'}|${redirect.device || 'unknown'}`;
      const existing = groups.get(key) || { total: 0, failures: 0, country: redirect.country, device: redirect.device };
      
      existing.total++;
      if (!redirect.success) {
        existing.failures++;
      }
      
      groups.set(key, existing);
    }

    const newIncidents = [];
    const now = new Date().toISOString();

    // Detect incidents
    for (const [key, stats] of groups.entries()) {
      if (stats.total < MIN_SAMPLE_SIZE) continue;

      const [platform] = key.split('|');
      const errorRate = (stats.failures / stats.total) * 100;

      let severity: string | null = null;
      if (errorRate >= ERROR_RATE_THRESHOLDS.critical) {
        severity = 'critical';
      } else if (errorRate >= ERROR_RATE_THRESHOLDS.high) {
        severity = 'high';
      } else if (errorRate >= ERROR_RATE_THRESHOLDS.medium) {
        severity = 'medium';
      } else if (errorRate >= ERROR_RATE_THRESHOLDS.low) {
        severity = 'low';
      }

      if (severity) {
        // Check if incident already exists (not resolved)
        const { data: existingIncident } = await supabase
          .from('incidents')
          .select('id, detected_at')
          .eq('platform', platform)
          .eq('country', stats.country || '')
          .eq('device', stats.device || '')
          .is('resolved_at', null)
          .order('detected_at', { ascending: false })
          .limit(1)
          .single();

        if (!existingIncident || 
            new Date(existingIncident.detected_at).getTime() < Date.now() - 30 * 60 * 1000) {
          // Create new incident if none exists or last one was >30 min ago
          
          // Count affected users
          const { count: affectedUsers } = await supabase
            .from('links')
            .select('user_id', { count: 'exact', head: true })
            .eq('is_active', true);

          const incident = {
            platform,
            country: stats.country,
            device: stats.device,
            error_rate: errorRate.toFixed(2),
            severity,
            sample_size: stats.total,
            affected_users: affectedUsers || 0,
            metadata: {
              failures: stats.failures,
              detectionWindow: '5min',
              thresholds: ERROR_RATE_THRESHOLDS,
            },
          };

          const { data: created, error: insertError } = await supabase
            .from('incidents')
            .insert(incident)
            .select()
            .single();

          if (insertError) {
            console.error('Failed to insert incident:', insertError);
          } else {
            console.log('New incident detected:', created);
            newIncidents.push(created);
          }
        } else {
          console.log('Incident already tracked:', existingIncident.id);
        }
      }
    }

    // Auto-resolve incidents older than 1 hour with no recent errors
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
    const { data: oldIncidents } = await supabase
      .from('incidents')
      .select('id, platform, country, device')
      .is('resolved_at', null)
      .lt('detected_at', oneHourAgo);

    if (oldIncidents && oldIncidents.length > 0) {
      for (const incident of oldIncidents) {
        // Check if still failing
        const recentKey = `${incident.platform}|${incident.country || 'unknown'}|${incident.device || 'unknown'}`;
        const recentStats = groups.get(recentKey);
        
        if (!recentStats || (recentStats.failures / recentStats.total) * 100 < ERROR_RATE_THRESHOLDS.low) {
          await supabase
            .from('incidents')
            .update({ resolved_at: now })
            .eq('id', incident.id);
          
          console.log('Auto-resolved incident:', incident.id);
        }
      }
    }

    return new Response(
      JSON.stringify({
        message: 'Incident detection complete',
        newIncidents: newIncidents.length,
        incidents: newIncidents,
        analyzed: aggregates.length,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Incident detection error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
