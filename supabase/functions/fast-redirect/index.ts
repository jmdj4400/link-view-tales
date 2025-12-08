/**
 * Ultra-Fast Redirect Edge Function with Rate Limiting & Security
 * Release Hardened v2.0 - December 2025
 */

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-linkpeek-redirect',
  'Cache-Control': 'no-cache, no-store, must-revalidate',
};

// Error codes for structured logging
const ERROR_CODES = {
  RATE_LIMIT_IP: 'E001',
  RATE_LIMIT_LINK: 'E002',
  LINK_NOT_FOUND: 'E003',
  LINK_INACTIVE: 'E004',
  INVALID_URL: 'E005',
  TIMEOUT: 'E006',
  MALFORMED_URL: 'E007',
  DANGEROUS_SCHEME: 'E008',
  INTERNAL_ERROR: 'E999',
} as const;

interface RedirectRequest {
  linkId: string;
  userAgent?: string;
  referrer?: string;
  country?: string;
}

// Rate limiting configuration
const RATE_LIMITS = {
  PER_IP_BURST: 100,      // 100 requests per minute per IP
  PER_IP_SUSTAINED: 10,   // Sustained 10 req/s
  PER_LINK_MINUTE: 50,    // 50 requests per minute per link
  WINDOW_MS: 60000,
  BURST_WINDOW_MS: 10000, // 10 second burst window
};

// URL Validation timeout
const URL_VALIDATION_TIMEOUT_MS = 500;

const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(key: string, maxRequests: number, windowMs: number = RATE_LIMITS.WINDOW_MS): { allowed: boolean; retryAfter?: number } {
  const now = Date.now();
  const record = rateLimitStore.get(key);

  // Clean up old entries periodically
  if (rateLimitStore.size > 10000) {
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) rateLimitStore.delete(k);
    }
  }

  if (!record || now > record.resetTime) {
    rateLimitStore.set(key, { count: 1, resetTime: now + windowMs });
    return { allowed: true };
  }

  if (record.count >= maxRequests) {
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfter };
  }

  record.count++;
  return { allowed: true };
}

function validateRedirectUrl(url: string): { valid: boolean; error?: string; errorCode?: string } {
  try {
    const parsed = new URL(url);
    const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:', 'ftp:', 'mailto:'];
    
    if (dangerousSchemes.some(scheme => url.toLowerCase().startsWith(scheme))) {
      return { valid: false, error: 'dangerous_scheme', errorCode: ERROR_CODES.DANGEROUS_SCHEME };
    }
    
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'invalid_protocol', errorCode: ERROR_CODES.INVALID_URL };
    }
    
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return { valid: false, error: 'missing_hostname', errorCode: ERROR_CODES.MALFORMED_URL };
    }
    
    // Block localhost and private IPs in production
    const blockedHosts = ['localhost', '127.0.0.1', '0.0.0.0', '::1'];
    if (blockedHosts.includes(parsed.hostname.toLowerCase())) {
      return { valid: false, error: 'blocked_host', errorCode: ERROR_CODES.INVALID_URL };
    }
    
    // Block private IP ranges
    const privateIPPatterns = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[01])\./,
      /^192\.168\./,
    ];
    if (privateIPPatterns.some(pattern => pattern.test(parsed.hostname))) {
      return { valid: false, error: 'private_ip', errorCode: ERROR_CODES.INVALID_URL };
    }
    
    return { valid: true };
  } catch (e) {
    return { valid: false, error: 'malformed_url', errorCode: ERROR_CODES.MALFORMED_URL };
  }
}

function unwrapSocialLinks(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Instagram link wrapper
    if (urlObj.hostname === 'l.instagram.com' && urlObj.searchParams.has('u')) {
      return decodeURIComponent(urlObj.searchParams.get('u') || url);
    }
    
    // Facebook link wrapper
    if ((urlObj.hostname === 'l.facebook.com' || urlObj.hostname === 'lm.facebook.com') && urlObj.searchParams.has('u')) {
      return decodeURIComponent(urlObj.searchParams.get('u') || url);
    }
    
    // TikTok link wrapper
    if (urlObj.hostname === 'www.tiktok.com' && urlObj.pathname.startsWith('/redirect')) {
      const target = urlObj.searchParams.get('target') || urlObj.searchParams.get('u');
      if (target) return decodeURIComponent(target);
    }
    
    // Twitter/X link wrapper
    if (urlObj.hostname === 't.co') {
      return url; // t.co doesn't expose the target URL in params
    }
    
    // LinkedIn link wrapper
    if (urlObj.hostname === 'www.linkedin.com' && urlObj.pathname.startsWith('/redir')) {
      const target = urlObj.searchParams.get('url');
      if (target) return decodeURIComponent(target);
    }
    
    return url;
  } catch {
    return url;
  }
}

function normalizeURL(url: string): string {
  if (!url) return '';
  
  // Remove control characters and trim
  let normalized = url.trim().replace(/[\x00-\x1F\x7F]/g, '');
  
  // Add protocol if missing
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = 'https://' + normalized;
  }
  
  // Unwrap social link wrappers
  normalized = unwrapSocialLinks(normalized);
  
  // Clean up broken UTM params (empty values)
  try {
    const urlObj = new URL(normalized);
    const paramsToRemove: string[] = [];
    urlObj.searchParams.forEach((value, key) => {
      if (key.startsWith('utm_') && (!value || value === 'undefined' || value === 'null')) {
        paramsToRemove.push(key);
      }
    });
    paramsToRemove.forEach(key => urlObj.searchParams.delete(key));
    normalized = urlObj.toString();
  } catch {
    // Keep original if URL parsing fails
  }
  
  return normalized;
}

async function hashIP(ip: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(ip + (Deno.env.get('IP_HASH_SALT') || 'linkpeek-salt'));
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
}

function parseBrowserInfo(ua: string): { platform: string; browser: string; device: string; isInAppBrowser: boolean } {
  if (!ua) return { platform: 'unknown', browser: 'unknown', device: 'unknown', isInAppBrowser: false };
  
  const uaLower = ua.toLowerCase();
  
  // Detect in-app browsers (critical for LinkPeek's value prop)
  const inAppPatterns = [
    'instagram',
    'fbav',
    'fban',
    'fb_iab',
    'tiktok',
    'twitter',
    'linkedin',
    'snapchat',
    'pinterest',
    'wv)',           // Android WebView
    'webview',
  ];
  const isInAppBrowser = inAppPatterns.some(p => uaLower.includes(p));
  
  // Detect platform
  let platform = 'unknown';
  if (uaLower.includes('iphone') || uaLower.includes('ipad')) platform = 'iOS';
  else if (uaLower.includes('android')) platform = 'Android';
  else if (uaLower.includes('windows')) platform = 'Windows';
  else if (uaLower.includes('mac')) platform = 'macOS';
  else if (uaLower.includes('linux')) platform = 'Linux';
  
  // Detect browser
  let browser = 'unknown';
  if (isInAppBrowser) {
    if (uaLower.includes('instagram')) browser = 'Instagram';
    else if (uaLower.includes('fb')) browser = 'Facebook';
    else if (uaLower.includes('tiktok')) browser = 'TikTok';
    else if (uaLower.includes('twitter')) browser = 'Twitter/X';
    else if (uaLower.includes('linkedin')) browser = 'LinkedIn';
    else browser = 'InApp-Other';
  } else if (uaLower.includes('chrome')) browser = 'Chrome';
  else if (uaLower.includes('safari')) browser = 'Safari';
  else if (uaLower.includes('firefox')) browser = 'Firefox';
  else if (uaLower.includes('edge')) browser = 'Edge';
  
  // Detect device
  let device = 'desktop';
  if (uaLower.includes('mobile') || uaLower.includes('iphone')) device = 'mobile';
  else if (uaLower.includes('tablet') || uaLower.includes('ipad')) device = 'tablet';
  
  return { platform, browser, device, isInAppBrowser };
}

function structuredLog(level: 'info' | 'warn' | 'error', event: string, data: Record<string, unknown>) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...data,
  };
  
  if (level === 'error') {
    console.error(JSON.stringify(logEntry));
  } else if (level === 'warn') {
    console.warn(JSON.stringify(logEntry));
  } else {
    console.log(JSON.stringify(logEntry));
  }
}

serve(async (req) => {
  const startTime = Date.now();
  const isCanary = req.headers.get('x-linkpeek-redirect') === 'canary';
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    const hashedIp = await hashIP(clientIp);

    // Rate limit per IP (burst check - 100 requests per 10 seconds)
    const ipBurstCheck = checkRateLimit(`ip-burst:${hashedIp}`, RATE_LIMITS.PER_IP_BURST, RATE_LIMITS.BURST_WINDOW_MS);
    if (!ipBurstCheck.allowed) {
      structuredLog('warn', 'rate_limit_exceeded', { 
        type: 'ip_burst', 
        errorCode: ERROR_CODES.RATE_LIMIT_IP,
        retryAfter: ipBurstCheck.retryAfter,
        ipHash: hashedIp,
      });
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded', 
        retryAfter: ipBurstCheck.retryAfter,
        redirect: '/link-error.html?reason=rate_limit'
      }), { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(ipBurstCheck.retryAfter || 60) }
      });
    }

    const { linkId, userAgent, referrer, country }: RedirectRequest = await req.json();
    const browserInfo = parseBrowserInfo(userAgent || '');

    // Rate limit per link (50 requests per minute)
    const linkRateCheck = checkRateLimit(`link:${linkId}`, RATE_LIMITS.PER_LINK_MINUTE);
    if (!linkRateCheck.allowed) {
      structuredLog('warn', 'rate_limit_exceeded', { 
        type: 'link', 
        errorCode: ERROR_CODES.RATE_LIMIT_LINK,
        linkId,
        retryAfter: linkRateCheck.retryAfter,
      });
      return new Response(JSON.stringify({ 
        error: 'Rate limit exceeded', 
        retryAfter: linkRateCheck.retryAfter,
        redirect: '/link-error.html?reason=rate_limit'
      }), { 
        status: 429, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Retry-After': String(linkRateCheck.retryAfter || 60) }
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '', 
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Fetch link with timeout
    const linkFetchStart = Date.now();
    const { data: link, error: linkError } = await supabase
      .from('links')
      .select('id, dest_url, sanitized_dest_url, is_active, user_id')
      .eq('id', linkId)
      .single();
    const linkFetchTime = Date.now() - linkFetchStart;

    if (linkError || !link) {
      structuredLog('warn', 'redirect_failed', { 
        reason: 'link_not_found',
        errorCode: ERROR_CODES.LINK_NOT_FOUND,
        linkId,
        canary: isCanary,
      });
      return new Response(JSON.stringify({ 
        error: 'Link not found',
        redirect: '/link-error.html?reason=not_found'
      }), { 
        status: 404, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!link.is_active) {
      structuredLog('info', 'redirect_failed', { 
        reason: 'link_inactive',
        errorCode: ERROR_CODES.LINK_INACTIVE,
        linkId,
        canary: isCanary,
      });
      return new Response(JSON.stringify({ 
        error: 'Link is inactive',
        redirect: '/link-error.html?reason=inactive'
      }), { 
        status: 410, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    let finalUrl = normalizeURL(link.sanitized_dest_url || link.dest_url);
    
    // Security validation
    const urlValidation = validateRedirectUrl(finalUrl);
    if (!urlValidation.valid) {
      structuredLog('error', 'redirect_failed', { 
        reason: 'invalid_url',
        errorCode: urlValidation.errorCode,
        error: urlValidation.error,
        linkId,
        canary: isCanary,
      });
      return new Response(JSON.stringify({ 
        error: 'Invalid destination URL',
        redirect: '/link-error.html?reason=invalid_url'
      }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Log redirect attempt (non-blocking)
    const totalTime = Date.now() - startTime;
    
    // Track redirect asynchronously (don't await)
    (async () => {
      try {
        await supabase.from('redirects').insert({
          link_id: linkId,
          success: true,
          final_url: finalUrl,
          referrer: referrer || null,
          browser: browserInfo.browser,
          device: browserInfo.device,
          platform: browserInfo.platform,
          in_app_browser_detected: browserInfo.isInAppBrowser,
          load_time_ms: totalTime,
          country: country || null,
          user_agent: userAgent?.substring(0, 500) || null,
        });
      } catch (e: unknown) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        structuredLog('warn', 'tracking_failed', { linkId, error: errorMsg });
      }
    })();

    structuredLog('info', 'redirect_success', { 
      linkId, 
      totalTimeMs: totalTime,
      linkFetchTimeMs: linkFetchTime,
      inAppBrowser: browserInfo.isInAppBrowser,
      browser: browserInfo.browser,
      platform: browserInfo.platform,
      canary: isCanary,
    });

    return new Response(JSON.stringify({ url: finalUrl, success: true }), { 
      status: 200, 
      headers: { 
        ...corsHeaders, 
        'Content-Type': 'application/json', 
        'X-Response-Time': `${totalTime}ms`,
        'X-LinkPeek-Version': '2.0',
      }
    });
  } catch (error: any) {
    const totalTime = Date.now() - startTime;
    
    structuredLog('error', 'redirect_error', { 
      errorCode: ERROR_CODES.INTERNAL_ERROR,
      error: error?.message,
      stack: error?.stack?.substring(0, 500),
      totalTimeMs: totalTime,
      canary: isCanary,
    });
    
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      redirect: '/link-error.html?reason=server_error'
    }), { 
      status: 500, 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
