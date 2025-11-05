import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.78.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // Aggregate metrics by platform
    const platforms = ['Instagram', 'Facebook', 'TikTok', 'LinkedIn', 'Twitter/X', 'Other'];
    
    for (const platform of platforms) {
      // Get redirect stats
      const { data: redirects } = await supabase
        .from('redirects')
        .select('success, fallback_used')
        .eq('browser', platform)
        .gte('ts', thirtyDaysAgo);

      // Get click and conversion stats
      const { data: events } = await supabase
        .from('events')
        .select('event_type, link_id')
        .gte('created_at', thirtyDaysAgo);

      const { data: conversions } = await supabase
        .from('goal_events')
        .select('*')
        .gte('ts', thirtyDaysAgo);

      if (redirects && events) {
        const totalRedirects = redirects.length;
        const successfulRedirects = redirects.filter(r => r.success).length;
        const totalClicks = events.filter(e => e.event_type === 'click').length;
        const totalConversions = conversions?.length || 0;

        const avgRedirectSuccess = totalRedirects > 0 
          ? (successfulRedirects / totalRedirects) * 100 
          : 0;
        
        const avgCtr = totalClicks > 0 ? (totalClicks / (totalClicks + 100)) * 100 : 0; // Simplified
        const avgConversionRate = totalClicks > 0 
          ? (totalConversions / totalClicks) * 100 
          : 0;

        // Upsert benchmark data
        await supabase
          .from('channel_benchmarks')
          .upsert({
            platform,
            avg_ctr: avgCtr,
            avg_conversion_rate: avgConversionRate,
            avg_redirect_success: avgRedirectSuccess,
            sample_size: totalRedirects,
            updated_at: new Date().toISOString()
          }, { onConflict: 'platform' });

        console.log(`Updated benchmarks for ${platform}:`, {
          avgCtr,
          avgConversionRate,
          avgRedirectSuccess,
          sampleSize: totalRedirects
        });
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Benchmarks aggregated successfully' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error aggregating benchmarks:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});