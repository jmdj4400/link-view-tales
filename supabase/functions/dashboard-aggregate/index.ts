/**
 * Aggregated Dashboard API
 * Returns all dashboard metrics in a single call for faster performance
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get date range from query params (default to last 24h)
    const url = new URL(req.url);
    const hoursParam = url.searchParams.get('hours') || '24';
    const hours = parseInt(hoursParam);
    const fromDate = new Date(Date.now() - hours * 60 * 60 * 1000);

    // Fetch all data in parallel
    const [eventsResult, redirectsResult, linksResult] = await Promise.all([
      supabase
        .from('events')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_bot', false)
        .gte('created_at', fromDate.toISOString()),
      supabase
        .from('redirects')
        .select('*')
        .gte('ts', fromDate.toISOString()),
      supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
    ]);

    if (eventsResult.error) throw eventsResult.error;
    if (redirectsResult.error) throw redirectsResult.error;
    if (linksResult.error) throw linksResult.error;

    const events = eventsResult.data || [];
    const redirects = redirectsResult.data || [];
    const links = linksResult.data || [];

    // Calculate aggregate metrics
    const clickEvents = events.filter(e => e.event_type === 'click');
    const viewEvents = events.filter(e => e.event_type === 'view');
    const totalClicks = clickEvents.length;
    const totalViews = viewEvents.length;

    // Device breakdown
    const deviceMap = new Map<string, number>();
    clickEvents.forEach(event => {
      const device = event.referrer?.includes('mobile') ? 'mobile' : 
                    event.referrer?.includes('tablet') ? 'tablet' : 'desktop';
      deviceMap.set(device, (deviceMap.get(device) || 0) + 1);
    });

    const deviceSummary = {
      mobile: deviceMap.get('mobile') || 0,
      tablet: deviceMap.get('tablet') || 0,
      desktop: deviceMap.get('desktop') || 0,
    };

    // Browser breakdown
    const browserMap = new Map<string, number>();
    redirects.forEach(r => {
      if (r.browser) {
        browserMap.set(r.browser, (browserMap.get(r.browser) || 0) + 1);
      }
    });

    const browserSummary = Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Integrity score (redirect success rate)
    const successfulRedirects = redirects.filter(r => r.success).length;
    const integrityScore = redirects.length > 0 
      ? Math.round((successfulRedirects / redirects.length) * 100) 
      : 0;

    // Top link
    const linkClickMap = new Map<string, number>();
    clickEvents.forEach(e => {
      if (e.link_id) {
        linkClickMap.set(e.link_id, (linkClickMap.get(e.link_id) || 0) + 1);
      }
    });

    const topLinkId = Array.from(linkClickMap.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0];
    const topLink = links.find(l => l.id === topLinkId);

    // Drop-off ratio (failed redirects / total attempts)
    const failedRedirects = redirects.filter(r => !r.success).length;
    const dropOffRatio = redirects.length > 0 
      ? Math.round((failedRedirects / redirects.length) * 100) 
      : 0;

    const response = {
      period: `Last ${hours}h`,
      clicks: totalClicks,
      views: totalViews,
      deviceSummary,
      browserSummary,
      integrityScore,
      topLink: topLink ? { id: topLink.id, title: topLink.title, clicks: linkClickMap.get(topLink.id) } : null,
      dropOffRatio,
      timestamp: new Date().toISOString(),
    };

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Dashboard aggregate error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
