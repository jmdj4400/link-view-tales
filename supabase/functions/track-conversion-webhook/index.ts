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
    const { goal_id, event_ref, value, link_id } = await req.json();

    if (!goal_id) {
      return new Response(
        JSON.stringify({ error: 'goal_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // If link_id not provided, find the most recent click (within last 24 hours)
    let matchedClickId = null;
    let finalLinkId = link_id;

    if (!link_id) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      const { data: recentClicks } = await supabase
        .from('events')
        .select('id, link_id')
        .eq('event_type', 'click')
        .gte('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: false })
        .limit(1);

      if (recentClicks && recentClicks.length > 0) {
        matchedClickId = recentClicks[0].id;
        finalLinkId = recentClicks[0].link_id;
      }
    }

    // Record conversion event
    const { data, error } = await supabase.from('goal_events').insert({
      goal_id,
      link_id: finalLinkId,
      referrer: req.headers.get('referer') || null,
      source: 'webhook',
      conversion_value: value ? parseFloat(value) : null,
      event_ref,
      matched_click_id: matchedClickId
    }).select().single();

    if (error) throw error;

    console.log('Conversion tracked via webhook:', { goal_id, finalLinkId, matchedClickId });

    return new Response(
      JSON.stringify({ success: true, conversion_id: data.id }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error: any) {
    console.error('Error tracking conversion:', error);
    return new Response(
      JSON.stringify({ error: error?.message || 'Unknown error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
