/**
 * Ultra-Fast Redirect Edge Function
 * Optimized for minimal latency with aggressive caching
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

interface RedirectRequest {
  linkId: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const { linkId, userAgent, referrer, country }: RedirectRequest = await req.json();
    
    if (!linkId) {
      return new Response(
        JSON.stringify({ error: 'Link ID required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch link data with minimal fields for speed
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id, dest_url, sanitized_dest_url, is_active, user_id, utm_source, utm_medium, utm_campaign, max_clicks, current_clicks, active_from, active_until')
      .eq('id', linkId)
      .single();

    if (linkError || !link) {
      return new Response(
        JSON.stringify({ error: 'Link not found', success: false }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Quick validations
    if (!link.is_active) {
      return new Response(
        JSON.stringify({ error: 'Link inactive', success: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check schedule
    const now = new Date();
    if (link.active_from && new Date(link.active_from) > now) {
      return new Response(
        JSON.stringify({ error: 'Link not yet active', success: false }),
        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (link.active_until && new Date(link.active_until) < now) {
      return new Response(
        JSON.stringify({ error: 'Link expired', success: false }),
        { status: 410, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check click limit
    if (link.max_clicks && link.current_clicks >= link.max_clicks) {
      return new Response(
        JSON.stringify({ error: 'Click limit reached', success: false }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Use sanitized URL if available, otherwise use dest_url
    let finalUrl = link.sanitized_dest_url || link.dest_url;

    // Add UTM parameters if specified
    if (link.utm_source || link.utm_medium || link.utm_campaign) {
      try {
        const url = new URL(finalUrl);
        if (link.utm_source) url.searchParams.set('utm_source', link.utm_source);
        if (link.utm_medium) url.searchParams.set('utm_medium', link.utm_medium);
        if (link.utm_campaign) url.searchParams.set('utm_campaign', link.utm_campaign);
        finalUrl = url.toString();
      } catch (e) {
        console.error('Error adding UTM params:', e);
      }
    }

    // Parse browser info
    const ua = userAgent?.toLowerCase() || '';
    const browserInfo = parseBrowserInfo(ua);

    // Log redirect (non-blocking)
    const loadTime = Date.now() - startTime;
    
    // Fire and forget - don't wait for logging
    Promise.resolve(
      supabase.rpc('log_redirect_attempt', {
        p_link_id: linkId,
        p_success: true,
        p_platform: browserInfo.platform,
        p_browser: browserInfo.browser,
        p_device: browserInfo.device,
        p_country: country || null,
        p_in_app_browser: browserInfo.isInAppBrowser,
        p_load_time_ms: loadTime,
        p_redirect_steps: JSON.stringify([{ url: finalUrl, timestamp: Date.now(), type: 'server' }]),
        p_final_url: finalUrl,
        p_drop_off_stage: null,
        p_recovery_strategy: null,
        p_referrer: referrer || null,
        p_user_agent: userAgent || null,
      })
    ).then(() => {
      // Track event
      return supabase.from('events').insert({
        link_id: linkId,
        user_id: link.user_id,
        event_type: 'click',
        referrer: referrer || null,
        country: country || null,
      });
    }).catch((err: Error) => {
      console.error('Error logging redirect:', err);
    });

    // Return redirect URL
    return new Response(
      JSON.stringify({ 
        url: finalUrl, 
        success: true,
        useFallback: browserInfo.isInAppBrowser,
        loadTime,
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'X-Redirect-Time': `${loadTime}ms`,
        } 
      }
    );

  } catch (error) {
    console.error('Redirect error:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});

function parseBrowserInfo(ua: string): {
  platform: string;
  browser: string;
  device: string;
  isInAppBrowser: boolean;
} {
  const info = {
    platform: 'unknown',
    browser: 'unknown',
    device: 'unknown',
    isInAppBrowser: false,
  };

  // Detect platform
  if (/iphone|ipad|ipod/.test(ua)) {
    info.platform = 'ios';
    info.device = /ipad/.test(ua) ? 'tablet' : 'mobile';
  } else if (/android/.test(ua)) {
    info.platform = 'android';
    info.device = /mobile/.test(ua) ? 'mobile' : 'tablet';
  } else {
    info.platform = 'desktop';
    info.device = 'desktop';
  }

  // Detect in-app browsers
  const inAppPatterns = [
    { pattern: /fbav|fb_iab|fbios|fb4a/i, name: 'Facebook' },
    { pattern: /instagram/i, name: 'Instagram' },
    { pattern: /twitter/i, name: 'Twitter' },
    { pattern: /tiktok/i, name: 'TikTok' },
  ];

  for (const { pattern, name } of inAppPatterns) {
    if (pattern.test(ua)) {
      info.isInAppBrowser = true;
      info.browser = name;
      return info;
    }
  }

  // Regular browsers
  if (/chrome/i.test(ua)) info.browser = 'Chrome';
  else if (/safari/i.test(ua)) info.browser = 'Safari';
  else if (/firefox/i.test(ua)) info.browser = 'Firefox';

  return info;
}
