import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hashUserAgent } from "@/lib/security-utils";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { logger } from "@/lib/logger";

export default function RedirectHandler() {
  const { linkId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);

  const detectBrowser = (ua: string) => {
    if (ua.includes('Instagram')) return 'Instagram';
    if (ua.includes('FBAN') || ua.includes('FBAV')) return 'Facebook';
    if (ua.includes('TikTok')) return 'TikTok';
    if (ua.includes('LinkedIn')) return 'LinkedIn';
    if (ua.includes('Twitter')) return 'Twitter/X';
    if (ua.includes('Snapchat')) return 'Snapchat';
    return 'Other';
  };

  const detectDevice = (ua: string) => {
    if (/iPhone|iPad|iPod/.test(ua)) return 'iOS';
    if (/Android/.test(ua)) return 'Android';
    if (/Windows/.test(ua)) return 'Windows';
    if (/Mac/.test(ua)) return 'macOS';
    return 'Other';
  };

  const isInAppBrowser = (ua: string) => {
    return ua.includes('Instagram') || 
           ua.includes('FBAN') || 
           ua.includes('FBAV') ||
           ua.includes('TikTok') ||
           ua.includes('LinkedIn') ||
           ua.includes('Snapchat');
  };

  useEffect(() => {
    handleRedirect();
  }, [linkId]);

  const handleRedirect = async () => {
    if (!linkId) return;

    const ua = navigator.userAgent;
    const browser = detectBrowser(ua);
    const device = detectDevice(ua);
    const inAppBrowser = isInAppBrowser(ua);
    let redirectSuccess = true;
    let fallbackUsed = false;

    try {
      // Check rate limit first
      const identifier = await hashUserAgent(ua);
      const { data: rateLimitOk } = await supabase.rpc('check_rate_limit', {
        p_identifier: identifier,
        p_action: 'redirect',
        p_max_requests: 60,
        p_window_minutes: 5
      });

      if (!rateLimitOk) {
        setError('Too many requests. Please try again later.');
        return;
      }

      // Fetch link data
      const { data: linkData, error } = await supabase
        .from('links')
        .select('dest_url, user_id, active_from, active_until, max_clicks, current_clicks, utm_source, utm_medium, utm_campaign')
        .eq('id', linkId)
        .eq('is_active', true)
        .single();

      if (error || !linkData) {
        redirectSuccess = false;
        await supabase.from('redirects').insert({
          link_id: linkId,
          referrer: document.referrer,
          browser,
          device,
          success: false,
          fallback_used: false,
          user_agent: ua
        });
        window.location.href = '/';
        return;
      }

      // Check scheduling
      const now = new Date();
      const from = linkData.active_from ? new Date(linkData.active_from) : null;
      const until = linkData.active_until ? new Date(linkData.active_until) : null;

      if ((from && now < from) || (until && now > until)) {
        redirectSuccess = false;
        await supabase.from('redirects').insert({
          link_id: linkId,
          referrer: document.referrer,
          browser,
          device,
          success: false,
          fallback_used: false,
          user_agent: ua
        });
        window.location.href = '/';
        return;
      }

      // Check click limit
      if (linkData.max_clicks && linkData.current_clicks >= linkData.max_clicks) {
        redirectSuccess = false;
        await supabase.from('redirects').insert({
          link_id: linkId,
          referrer: document.referrer,
          browser,
          device,
          success: false,
          fallback_used: false,
          user_agent: ua
        });
        window.location.href = '/';
        return;
      }

      // Check for smart routing rules
      const { data: rules } = await supabase
        .from('rules')
        .select('*')
        .eq('link_id', linkId)
        .eq('is_active', true)
        .order('priority', { ascending: false });

      let destUrl = linkData.dest_url;
      let ruleMatched = false;

      if (rules && rules.length > 0) {
        for (const rule of rules) {
          const conditions = rule.conditions as any;
          let match = true;

          if (conditions.referrer && !document.referrer.includes(conditions.referrer)) {
            match = false;
          }
          if (conditions.browser && browser !== conditions.browser) {
            match = false;
          }
          if (conditions.device && device !== conditions.device) {
            match = false;
          }

          if (match) {
            destUrl = rule.dest_url;
            ruleMatched = true;
            break;
          }
        }
      }

      // Check for A/B testing variants (only if no rule matched)
      if (!ruleMatched) {
        const { data: variants } = await supabase
          .from('link_variants')
          .select('*')
          .eq('link_id', linkId)
          .eq('is_active', true);

        if (variants && variants.length > 0) {
          const random = Math.random() * 100;
          let cumulative = 0;
          
          for (const variant of variants) {
            cumulative += variant.traffic_percentage;
            if (random <= cumulative) {
              destUrl = variant.dest_url;
              break;
            }
          }
        }
      }

      // Add UTM parameters
      if (linkData.utm_source || linkData.utm_medium || linkData.utm_campaign) {
        const url = new URL(destUrl);
        if (linkData.utm_source) url.searchParams.set('utm_source', linkData.utm_source);
        if (linkData.utm_medium) url.searchParams.set('utm_medium', linkData.utm_medium);
        if (linkData.utm_campaign) url.searchParams.set('utm_campaign', linkData.utm_campaign);
        destUrl = url.toString();
      }

      // Track the click
      const userAgentHash = await hashUserAgent(ua);
      await supabase.from('events').insert({
        user_id: linkData.user_id,
        link_id: linkId,
        event_type: 'click',
        referrer: document.referrer,
        user_agent_hash: userAgentHash
      });

      // If in-app browser, show fallback instead of direct redirect
      if (inAppBrowser) {
        fallbackUsed = true;
        setFallbackUrl(destUrl);
        setShowFallback(true);
        
        // Log redirect with fallback
        await supabase.from('redirects').insert({
          link_id: linkId,
          referrer: document.referrer,
          browser,
          device,
          success: true,
          fallback_used: true,
          user_agent: ua
        });
      } else {
        // Direct redirect for normal browsers
        await supabase.from('redirects').insert({
          link_id: linkId,
          referrer: document.referrer,
          browser,
          device,
          success: true,
          fallback_used: false,
          user_agent: ua
        });
        window.location.href = destUrl;
      }
    } catch (err) {
      logger.error('Redirect error', err, { linkId });
      redirectSuccess = false;
      await supabase.from('redirects').insert({
        link_id: linkId,
        referrer: document.referrer,
        browser,
        device,
        success: false,
        fallback_used: false,
        user_agent: ua
      });
      setError('An error occurred. Redirecting to home...');
      setTimeout(() => window.location.href = '/', 2000);
    }
  };

  if (showFallback && fallbackUrl) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-md w-full bg-card border rounded-lg shadow-lg p-8 text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Open in Browser</h1>
            <p className="text-muted-foreground">
              For the best experience, please open this link in your default browser.
            </p>
          </div>
          
          <Button 
            size="lg" 
            className="w-full"
            onClick={() => window.location.href = fallbackUrl}
          >
            <ExternalLink className="mr-2 h-5 w-5" />
            Open Link
          </Button>
          
          <p className="text-xs text-muted-foreground">
            Click the button above to continue to your destination
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        {error ? (
          <div className="text-destructive">{error}</div>
        ) : (
          <div className="animate-pulse">Redirecting...</div>
        )}
      </div>
    </div>
  );
}
