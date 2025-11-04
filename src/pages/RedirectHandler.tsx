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
      .select('dest_url, user_id, active_from, active_until')
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

    // Track the click
    await supabase.from('events').insert({
      user_id: linkData.user_id,
      link_id: linkId,
      event_type: 'click',
      referrer: document.referrer,
      user_agent_hash: btoa(navigator.userAgent).substring(0, 32),
    });

    // Redirect
    window.location.href = linkData.dest_url;
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-pulse">Redirecting...</div>
      </div>
    </div>
  );
}
