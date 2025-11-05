import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 1x1 transparent GIF
const pixelGif = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0));

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const goalId = url.searchParams.get('goal_id');
    const eventRef = url.searchParams.get('e');
    const value = url.searchParams.get('value');

    if (!goalId) {
      return new Response(pixelGif, {
        headers: { 
          'Content-Type': 'image/gif',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          ...corsHeaders 
        }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Find the most recent click event (within last 24 hours)
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentClicks } = await supabase
      .from('events')
      .select('id, link_id')
      .eq('event_type', 'click')
      .gte('created_at', twentyFourHoursAgo)
      .order('created_at', { ascending: false })
      .limit(1);

    const matchedClickId = recentClicks && recentClicks.length > 0 ? recentClicks[0].id : null;
    const linkId = recentClicks && recentClicks.length > 0 ? recentClicks[0].link_id : null;

    // Record conversion event
    await supabase.from('goal_events').insert({
      goal_id: goalId,
      link_id: linkId,
      referrer: req.headers.get('referer') || null,
      source: 'pixel',
      conversion_value: value ? parseFloat(value) : null,
      event_ref: eventRef,
      matched_click_id: matchedClickId
    });

    console.log('Conversion tracked:', { goalId, linkId, matchedClickId });

    return new Response(pixelGif, {
      headers: { 
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        ...corsHeaders 
      }
    });
  } catch (error) {
    console.error('Error tracking conversion:', error);
    return new Response(pixelGif, {
      headers: { 
        'Content-Type': 'image/gif',
        ...corsHeaders 
      }
    });
  }
});
