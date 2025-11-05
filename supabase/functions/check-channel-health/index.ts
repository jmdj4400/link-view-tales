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

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString();

    // Get all users
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, email, handle');

    if (!profiles) return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

    for (const profile of profiles) {
      // Get user's links
      const { data: links } = await supabase
        .from('links')
        .select('id')
        .eq('user_id', profile.id);

      if (!links || links.length === 0) continue;

      const linkIds = links.map(l => l.id);

      // Check redirect success rate for last 7 days
      const { data: recentRedirects } = await supabase
        .from('redirects')
        .select('success, browser')
        .in('link_id', linkIds)
        .gte('ts', sevenDaysAgo);

      // Check redirect success rate for previous 7 days
      const { data: previousRedirects } = await supabase
        .from('redirects')
        .select('success, browser')
        .in('link_id', linkIds)
        .gte('ts', fourteenDaysAgo)
        .lt('ts', sevenDaysAgo);

      if (recentRedirects && recentRedirects.length > 10) {
        const recentSuccessRate = (recentRedirects.filter(r => r.success).length / recentRedirects.length) * 100;

        // Check if below 90% threshold
        if (recentSuccessRate < 90) {
          await supabase.from('channel_alerts').insert({
            user_id: profile.id,
            platform: 'All Channels',
            alert_type: 'low_success_rate',
            severity: 'critical',
            message: `Redirect success rate dropped to ${recentSuccessRate.toFixed(1)}%`,
            recommendation: 'Review your links and consider enabling WebView fallback mode.'
          });
          
          console.log(`Critical alert created for user ${profile.handle}: ${recentSuccessRate.toFixed(1)}%`);
        }

        // Check for week-over-week drop
        if (previousRedirects && previousRedirects.length > 10) {
          const previousSuccessRate = (previousRedirects.filter(r => r.success).length / previousRedirects.length) * 100;
          const drop = previousSuccessRate - recentSuccessRate;

          if (drop > 10) {
            await supabase.from('channel_alerts').insert({
              user_id: profile.id,
              platform: 'All Channels',
              alert_type: 'performance_drop',
              severity: 'warning',
              message: `Redirect success dropped ${drop.toFixed(1)}% vs last week`,
              recommendation: 'Check for platform updates or changes in your destination URLs.'
            });

            console.log(`Warning alert created for user ${profile.handle}: ${drop.toFixed(1)}% drop`);
          }
        }

        // Check platform-specific issues
        const platforms = ['Instagram', 'TikTok', 'Facebook', 'LinkedIn'];
        for (const platform of platforms) {
          const platformRedirects = recentRedirects.filter(r => r.browser === platform);
          if (platformRedirects.length > 5) {
            const platformSuccessRate = (platformRedirects.filter(r => r.success).length / platformRedirects.length) * 100;
            
            if (platformSuccessRate < 85) {
              await supabase.from('channel_alerts').insert({
                user_id: profile.id,
                platform,
                alert_type: 'platform_issue',
                severity: 'warning',
                message: `${platform} redirect success at ${platformSuccessRate.toFixed(1)}%`,
                recommendation: `Apply ${platform} optimization rule from Rule Marketplace.`
              });

              console.log(`Platform alert created for ${profile.handle} on ${platform}`);
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Health checks completed' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error checking channel health:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});