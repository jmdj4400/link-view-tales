/**
 * Ultra-Fast Redirect Edge Function
 * Optimized for minimal latency with reliable click capture
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

// URL unwrapping for common social media wrappers
function unwrapSocialLinks(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Instagram l.instagram.com wrapper
    if (urlObj.hostname === 'l.instagram.com' && urlObj.searchParams.has('u')) {
      return decodeURIComponent(urlObj.searchParams.get('u') || url);
    }
    
    // Facebook l.facebook.com / lm.facebook.com wrapper
    if ((urlObj.hostname === 'l.facebook.com' || urlObj.hostname === 'lm.facebook.com') && urlObj.searchParams.has('u')) {
      return decodeURIComponent(urlObj.searchParams.get('u') || url);
    }
    
    // TikTok vm.tiktok.com wrapper
    if (urlObj.hostname === 'vm.tiktok.com' && urlObj.searchParams.has('u')) {
      return decodeURIComponent(urlObj.searchParams.get('u') || url);
    }
    
    // Twitter t.co wrapper - extract from _url parameter if present
    if (urlObj.hostname === 't.co' && urlObj.searchParams.has('_url')) {
      return decodeURIComponent(urlObj.searchParams.get('_url') || url);
    }
    
    // LinkedIn lnkd.in wrapper - extract from url parameter if present
    if (urlObj.hostname === 'lnkd.in' && urlObj.searchParams.has('url')) {
      return decodeURIComponent(urlObj.searchParams.get('url') || url);
    }
    
    return url;
  } catch {
    return url;
  }
}

// Normalize URL input
function normalizeURL(url: string): string {
  if (!url) return '';
  
  let normalized = url.trim();
  
  // Remove null bytes and control characters
  normalized = normalized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Ensure protocol exists
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }
  
  // Fix common typos
  normalized = normalized
    .replace(/^http:\/([^/])/i, 'http://$1')
    .replace(/^https:\/([^/])/i, 'https://$1');
  
  // Unwrap social media wrappers
  normalized = unwrapSocialLinks(normalized);
  
  return normalized;
}

// Hash IP for privacy
async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
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

    // Use sanitized URL if available, otherwise use dest_url, then normalize
    let finalUrl = normalizeURL(link.sanitized_dest_url || link.dest_url);

    // Validate and ensure final URL is safe with timeout
    try {
      const urlObj = new URL(finalUrl);
      
      // Add UTM parameters if specified
      if (link.utm_source || link.utm_medium || link.utm_campaign) {
        if (link.utm_source) urlObj.searchParams.set('utm_source', link.utm_source);
        if (link.utm_medium) urlObj.searchParams.set('utm_medium', link.utm_medium);
        if (link.utm_campaign) urlObj.searchParams.set('utm_campaign', link.utm_campaign);
      }
      
      finalUrl = urlObj.toString();
      
      // Test URL reachability with 500ms timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 500);
        
        await fetch(finalUrl, {
          method: 'HEAD',
          signal: controller.signal,
          redirect: 'manual',
        }).finally(() => clearTimeout(timeoutId));
      } catch (fetchError) {
        // Log but continue - we'll still try to redirect
        console.warn('URL health check failed:', fetchError);
      }
      
    } catch (e) {
      // Fallback: if URL is malformed or times out, return error with drop reason
      console.error('Malformed final URL:', e);
      
      // Log drop reason
      const dropReason = e instanceof Error ? e.message : 'Invalid URL format';
      
      return new Response(
        JSON.stringify({ 
          error: 'Link temporarily unavailable', 
          success: false,
          fallback: true,
          dropReason,
          message: 'The destination link appears to be invalid. Please contact the link owner.',
        }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Parse browser info with enhanced detection
    const ua = userAgent?.toLowerCase() || '';
    const browserInfo = parseBrowserInfo(ua);
    
    // Get client IP and hash it for privacy
    const clientIP = req.headers.get('x-forwarded-for')?.split(',')[0] || 
                     req.headers.get('x-real-ip') || 
                     'unknown';
    const ipHash = clientIP !== 'unknown' ? await hashIP(clientIP) : null;

    // Instant click tracking (non-blocking, minimal payload)
    const loadTime = Date.now() - startTime;
    
    // Fire and forget - don't wait for logging (parallel, non-blocking)
    Promise.all([
      // Log redirect attempt with minimal required data
      supabase.rpc('log_redirect_attempt', {
        p_link_id: linkId,
        p_success: true,
        p_platform: browserInfo.platform,
        p_browser: browserInfo.browser,
        p_device: browserInfo.device,
        p_country: country || null,
        p_in_app_browser: browserInfo.isInAppBrowser,
        p_load_time_ms: loadTime,
        p_redirect_steps: JSON.stringify([{ 
          url: finalUrl, 
          timestamp: Date.now(), 
          type: 'server',
          unwrapped: finalUrl !== (link.sanitized_dest_url || link.dest_url)
        }]),
        p_final_url: finalUrl,
        p_drop_off_stage: null,
        p_recovery_strategy: browserInfo.isInAppBrowser ? 'fallback_ui' : null,
        p_referrer: referrer || null,
        p_user_agent: userAgent || null,
      }),
      // Track click event (minimal insert with timestamp and IP hash)
      supabase.from('events').insert({
        link_id: linkId,
        user_id: link.user_id,
        event_type: 'click',
        referrer: referrer || null,
        country: country || null,
        created_at: new Date().toISOString(),
      })
    ]).catch((err: Error) => {
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

  // Detect platform with more precision
  if (/iphone|ipad|ipod/.test(ua)) {
    info.platform = 'ios';
    info.device = /ipad/.test(ua) ? 'tablet' : 'mobile';
  } else if (/android/.test(ua)) {
    info.platform = 'android';
    info.device = /mobile/.test(ua) ? 'mobile' : 'tablet';
  } else if (/windows phone/i.test(ua)) {
    info.platform = 'windows_phone';
    info.device = 'mobile';
  } else {
    info.platform = 'desktop';
    info.device = 'desktop';
  }

  // Enhanced in-app browser detection (8 platforms)
  const inAppPatterns = [
    { pattern: /fbav|fb_iab|fbios|fb4a/i, name: 'Facebook' },
    { pattern: /instagram/i, name: 'Instagram' },
    { pattern: /twitter|x\.com/i, name: 'Twitter/X' },
    { pattern: /tiktok/i, name: 'TikTok' },
    { pattern: /snapchat/i, name: 'Snapchat' },
    { pattern: /linkedin/i, name: 'LinkedIn' },
    { pattern: /telegram/i, name: 'Telegram' },
    { pattern: /line\//i, name: 'Line' },
  ];
  
  // iOS Safari WebView detection
  if (ua.includes('iphone') && !ua.includes('safari') && ua.includes('webkit')) {
    info.isInAppBrowser = true;
    info.browser = 'iOS WebView';
    return info;
  }
  
  // Android WebView detection
  if (ua.includes('android') && ua.includes('wv') || (ua.includes('version') && !ua.includes('chrome'))) {
    info.isInAppBrowser = true;
    info.browser = 'Android WebView';
    return info;
  }

  for (const { pattern, name } of inAppPatterns) {
    if (pattern.test(ua)) {
      info.isInAppBrowser = true;
      info.browser = name;
      return info;
    }
  }

  // Regular browser detection with more coverage
  if (/edg/i.test(ua)) info.browser = 'Edge';
  else if (/chrome/i.test(ua) && !/edg/i.test(ua)) info.browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) info.browser = 'Safari';
  else if (/firefox/i.test(ua)) info.browser = 'Firefox';
  else if (/opera|opr/i.test(ua)) info.browser = 'Opera';

  return info;
}
