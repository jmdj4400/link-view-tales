import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase-client";
import { hashUserAgent } from "@/lib/security-utils";

export default function RedirectHandler() {
  const { linkId } = useParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    handleRedirect();
  }, [linkId]);

  const handleRedirect = async () => {
    if (!linkId) return;

    try {
      // Check rate limit first (60 requests per 5 minutes per IP)
      const identifier = await hashUserAgent(navigator.userAgent);
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

      const { data: linkData, error } = await supabase
        .from('links')
        .select('dest_url, user_id, active_from, active_until, max_clicks, current_clicks, utm_source, utm_medium, utm_campaign')
        .eq('id', linkId)
        .eq('is_active', true)
        .single();

      if (error || !linkData) {
        window.location.href = '/';
        return;
      }

      // Check for A/B testing variants
      const { data: variants } = await supabase
        .from('link_variants')
        .select('*')
        .eq('link_id', linkId)
        .eq('is_active', true);

      let selectedVariant = null;
      let destUrl = linkData.dest_url;

      // If variants exist, randomly select one based on traffic percentage
      if (variants && variants.length > 0) {
        const random = Math.random() * 100;
        let cumulative = 0;
        
        for (const variant of variants) {
          cumulative += variant.traffic_percentage;
          if (random <= cumulative) {
            selectedVariant = variant;
            destUrl = variant.dest_url;
            break;
          }
        }
      }

    // Check if link is within scheduled time
    const now = new Date();
    const from = linkData.active_from ? new Date(linkData.active_from) : null;
    const until = linkData.active_until ? new Date(linkData.active_until) : null;

    if (from && now < from) {
      window.location.href = '/';
      return;
    }

    if (until && now > until) {
      window.location.href = '/';
      return;
    }

    // Check click limit
    if (linkData.max_clicks && linkData.current_clicks >= linkData.max_clicks) {
      window.location.href = '/';
      return;
    }

      // Track the click with proper hashing
      const userAgentHash = await hashUserAgent(navigator.userAgent);
      await supabase.from('events').insert({
        user_id: linkData.user_id,
        link_id: linkId,
        event_type: 'click',
        referrer: document.referrer,
        user_agent_hash: userAgentHash,
        variant_id: selectedVariant?.id || null,
      });

    // Build destination URL with UTM parameters (only if not using variant)
    if (!selectedVariant && (linkData.utm_source || linkData.utm_medium || linkData.utm_campaign)) {
      const url = new URL(destUrl);
      if (linkData.utm_source) url.searchParams.set('utm_source', linkData.utm_source);
      if (linkData.utm_medium) url.searchParams.set('utm_medium', linkData.utm_medium);
      if (linkData.utm_campaign) url.searchParams.set('utm_campaign', linkData.utm_campaign);
      destUrl = url.toString();
    }

      // Redirect
      window.location.href = destUrl;
    } catch (err) {
      console.error('Redirect error:', err);
      setError('An error occurred. Redirecting to home...');
      setTimeout(() => window.location.href = '/', 2000);
    }
  };

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
