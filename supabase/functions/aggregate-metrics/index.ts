import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const logStep = (step: string, details?: any) => {
  const detailsStr = details ? ` - ${JSON.stringify(details)}` : '';
  console.log(`[AGGREGATE-METRICS] ${step}${detailsStr}`);
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate CRON_SECRET for security
    const authHeader = req.headers.get('authorization');
    const cronSecret = Deno.env.get('CRON_SECRET');
    
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      logStep("Unauthorized access attempt");
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    logStep("Function started");

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } }
    );

    // Get yesterday's date
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const targetDate = yesterday.toISOString().split('T')[0];
    
    logStep("Aggregating metrics for date", { date: targetDate });

    // Get all users
    const { data: profiles, error: profilesError } = await supabaseClient
      .from('profiles')
      .select('id');

    if (profilesError) {
      throw new Error(`Failed to fetch profiles: ${profilesError.message}`);
    }

    logStep("Processing metrics for users", { count: profiles?.length || 0 });

    let processedCount = 0;
    let errorCount = 0;

    for (const profile of profiles || []) {
      try {
        // Get events for this user on target date (excluding bots)
        const startOfDay = new Date(targetDate);
        startOfDay.setUTCHours(0, 0, 0, 0);
        const endOfDay = new Date(targetDate);
        endOfDay.setUTCHours(23, 59, 59, 999);

        const { data: events, error: eventsError } = await supabaseClient
          .from('events')
          .select('event_type, referrer')
          .eq('user_id', profile.id)
          .eq('is_bot', false)
          .gte('created_at', startOfDay.toISOString())
          .lte('created_at', endOfDay.toISOString());

        if (eventsError) {
          logStep("Error fetching events for user", { userId: profile.id, error: eventsError.message });
          errorCount++;
          continue;
        }

        const viewCount = events?.filter(e => e.event_type === 'view').length || 0;
        const clickCount = events?.filter(e => e.event_type === 'click').length || 0;
        const ctr = viewCount > 0 ? (clickCount / viewCount) * 100 : 0;

        // Get top referrer
        const referrerCounts = new Map<string, number>();
        events?.filter(e => e.event_type === 'click' && e.referrer).forEach(e => {
          try {
            const url = new URL(e.referrer);
            const domain = url.hostname.replace('www.', '');
            referrerCounts.set(domain, (referrerCounts.get(domain) || 0) + 1);
          } catch {
            // Invalid URL, skip
          }
        });

        const topReferrer = Array.from(referrerCounts.entries())
          .sort((a, b) => b[1] - a[1])[0]?.[0] || null;

        // Upsert metrics_daily
        const { error: upsertError } = await supabaseClient
          .from('metrics_daily')
          .upsert({
            user_id: profile.id,
            date: targetDate,
            page_views: viewCount,
            clicks: clickCount,
            ctr: Math.round(ctr * 10) / 10,
            top_referrer: topReferrer,
          }, {
            onConflict: 'user_id,date'
          });

        if (upsertError) {
          logStep("Error upserting metrics", { userId: profile.id, error: upsertError.message });
          errorCount++;
        } else {
          processedCount++;
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logStep("Error processing user", { userId: profile.id, error: errorMessage });
        errorCount++;
      }
    }

    logStep("Aggregation complete", { processed: processedCount, errors: errorCount });

    return new Response(JSON.stringify({ 
      success: true,
      date: targetDate,
      processed: processedCount,
      errors: errorCount
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logStep("ERROR", { message: errorMessage });
    return new Response(JSON.stringify({ error: errorMessage }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
