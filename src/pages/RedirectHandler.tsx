import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase-client";

export default function RedirectHandler() {
  const { linkId } = useParams();

  useEffect(() => {
    handleRedirect();
  }, [linkId]);

  const handleRedirect = async () => {
    if (!linkId) return;

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

    // Track the click
    await supabase.from('events').insert({
      user_id: linkData.user_id,
      link_id: linkId,
      event_type: 'click',
      referrer: document.referrer,
      user_agent_hash: btoa(navigator.userAgent).substring(0, 32),
    });

    // Build destination URL with UTM parameters
    let destUrl = linkData.dest_url;
    if (linkData.utm_source || linkData.utm_medium || linkData.utm_campaign) {
      const url = new URL(destUrl);
      if (linkData.utm_source) url.searchParams.set('utm_source', linkData.utm_source);
      if (linkData.utm_medium) url.searchParams.set('utm_medium', linkData.utm_medium);
      if (linkData.utm_campaign) url.searchParams.set('utm_campaign', linkData.utm_campaign);
      destUrl = url.toString();
    }

    // Redirect
    window.location.href = destUrl;
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">Redirecting...</div>
      </div>
    </div>
  );
}
