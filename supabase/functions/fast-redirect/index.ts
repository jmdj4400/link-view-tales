/**
 * Ultra-Fast Redirect Edge Function with Rate Limiting & Security
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-linkpeek-redirect',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

interface RedirectRequest {
  linkId: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
}

// Rate limiting configuration
const RATE_LIMITS = {
  PER_IP_BURST: 100,
  PER_IP_SUSTAINED: 10,
  PER_LINK_MINUTE: 50,
  WINDOW_MS: 60000,
};

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, maxRequests: number): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + RATE_LIMITS.WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

function validateRedirectUrl(url: string): { valid: boolean; error?: string } {
  try {
    const parsed = new URL(url);
    const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:'];
    if (dangerousSchemes.some(scheme => url.toLowerCase().startsWith(scheme))) {
      return { valid: false, error: 'dangerous_scheme' };
    }
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'invalid_protocol' };
    }
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return { valid: false, error: 'missing_hostname' };
    }
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'malformed_url' };
  }
}

function unwrapSocialLinks(url: string): string {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'l.instagram.com' && urlObj.searchParams.has('u')) {
      return decodeURIComponent(urlObj.searchParams.get('u') || url);
    }
    if ((urlObj.hostname === 'l.facebook.com' || urlObj.hostname === 'lm.facebook.com') && urlObj.searchParams.has('u')) {
      return decodeURIComponent(urlObj.searchParams.get('u') || url);
    }
    return url;
  } catch {
    return url;
  }
}

function normalizeURL(url: string): string {
  if (!url) return '';
  let normalized = url.trim().replace(/[\x00-\x1F\x7F]/g, '');
  if (!/^https?:\/\//i.test(normalized)) normalized = 'https://' + normalized;
  return unwrapSocialLinks(normalized);
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

serve(async (req) => {
  const startTime = Date.now();
  const isCanary = req.headers.get('x-linkpeek-redirect') === 'canary';
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';

    // Rate limit per IP
    const ipRateCheck = checkRateLimit(`ip:${clientIp}`, RATE_LIMITS.PER_IP_BURST);
    if (!ipRateCheck.allowed) {
      console.warn(JSON.stringify({ timestamp: new Date().toISOString(), event: 'rate_limit_exceeded', type: 'ip', retryAfter: ipRateCheck.retryAfter }));
      return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfter: ipRateCheck.retryAfter }), { 
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(ipRateCheck.retryAfter || 60) }
      });
    }

    const { linkId, userAgent, referrer, country }: RedirectRequest = await req.json();

    // Rate limit per link
    const linkRateCheck = checkRateLimit(`link:${linkId}`, RATE_LIMITS.PER_LINK_MINUTE);
    if (!linkRateCheck.allowed) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded', retryAfter: linkRateCheck.retryAfter }), { 
        status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(linkRateCheck.retryAfter || 60) }
      });
    }

    const supabase = createClient(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '');
    const { data: link, error: linkError } = await supabase.from('links').select('*').eq('id', linkId).single();

    if (linkError || !link || !link.is_active) {
      return new Response(JSON.stringify({ error: 'Link not found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    let finalUrl = normalizeURL(link.sanitized_dest_url || link.dest_url);
    
    // Security validation
    const urlValidation = validateRedirectUrl(finalUrl);
    if (!urlValidation.valid) {
      console.error(JSON.stringify({ timestamp: new Date().toISOString(), event: 'redirect_failed', reason: 'invalid_url', error: urlValidation.error, linkId, canary: isCanary }));
      return new Response(JSON.stringify({ error: 'Invalid destination URL', redirect: '/link-error.html' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
    }

    // Log success
    const totalTime = Date.now() - startTime;
    console.log(JSON.stringify({ timestamp: new Date().toISOString(), event: 'redirect_success', linkId, totalTimeMs: totalTime, canary: isCanary }));

    return new Response(JSON.stringify({ url: finalUrl, success: true }), { 
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'X-Response-Time': `${totalTime}ms` }
    });
  } catch (error: any) {
    console.error(JSON.stringify({ timestamp: new Date().toISOString(), event: 'redirect_error', error: error?.message }));
    return new Response(JSON.stringify({ error: 'Internal server error', redirect: '/link-error.html' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }});
  }
});

function parseBrowserInfo(ua: string) { return { platform: 'unknown', browser: 'unknown', device: 'unknown', isInAppBrowser: false }; }
