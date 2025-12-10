import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { hashUserAgent } from "@/lib/security-utils";
import { Button } from "@/components/ui/button";
import { ExternalLink, Copy, Smartphone, CheckCircle } from "lucide-react";
import { logger } from "@/lib/logger";
import { WebViewRecovery, getOpenInBrowserInstructions } from "@/lib/webview-recovery";
import { toast } from "sonner";

export default function RedirectHandler() {
  const { linkId } = useParams();
  const [error, setError] = useState<string | null>(null);
  const [fallbackUrl, setFallbackUrl] = useState<string | null>(null);
  const [showFallback, setShowFallback] = useState(false);
  const [copied, setCopied] = useState(false);
  const [browserInfo, setBrowserInfo] = useState<{ browser: string; device: string }>({ browser: 'Other', device: 'Other' });

  const detectBrowser = (ua: string) => {
    if (ua.includes('Instagram')) return 'Instagram';
    if (ua.includes('FBAN') || ua.includes('FBAV')) return 'Facebook';
    if (ua.includes('TikTok') || ua.includes('BytedanceWebview')) return 'TikTok';
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
           ua.includes('BytedanceWebview') ||
           ua.includes('LinkedIn') ||
           ua.includes('Snapchat') ||
           ua.includes('Twitter') ||
           (ua.includes('wv') && ua.includes('Android')) ||
           (ua.includes('WebView') && ua.includes('iPhone'));
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
    
    setBrowserInfo({ browser, device });

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
        await supabase.from('redirects').insert({
          link_id: linkId,
          referrer: document.referrer,
          browser,
          device,
          success: false,
          fallback_used: false,
          user_agent: ua,
          in_app_browser_detected: inAppBrowser,
        });
        window.location.href = '/';
        return;
      }

      // Check scheduling
      const now = new Date();
      const from = linkData.active_from ? new Date(linkData.active_from) : null;
      const until = linkData.active_until ? new Date(linkData.active_until) : null;

      if ((from && now < from) || (until && now > until)) {
        await supabase.from('redirects').insert({
          link_id: linkId,
          referrer: document.referrer,
          browser,
          device,
          success: false,
          fallback_used: false,
          user_agent: ua,
          in_app_browser_detected: inAppBrowser,
        });
        window.location.href = '/';
        return;
      }

      // Check click limit
      if (linkData.max_clicks && linkData.current_clicks && linkData.current_clicks >= linkData.max_clicks) {
        await supabase.from('redirects').insert({
          link_id: linkId,
          referrer: document.referrer,
          browser,
          device,
          success: false,
          fallback_used: false,
          user_agent: ua,
          in_app_browser_detected: inAppBrowser,
        });
        window.location.href = '/';
        return;
      }

      // Build final URL with UTM parameters
      let destUrl = linkData.dest_url;
      if (linkData.utm_source || linkData.utm_medium || linkData.utm_campaign) {
        const url = new URL(destUrl);
        if (linkData.utm_source) url.searchParams.set('utm_source', linkData.utm_source);
        if (linkData.utm_medium) url.searchParams.set('utm_medium', linkData.utm_medium);
        if (linkData.utm_campaign) url.searchParams.set('utm_campaign', linkData.utm_campaign);
        destUrl = url.toString();
      }

      // Track the click
      const userAgentHash = await hashUserAgent(ua);
      supabase.from('events').insert({
        user_id: linkData.user_id,
        link_id: linkId,
        event_type: 'click',
        referrer: document.referrer,
        user_agent_hash: userAgentHash
      });

      // If in-app browser, show fallback UI with instructions
      if (inAppBrowser) {
        setFallbackUrl(destUrl);
        setShowFallback(true);
        
        // Attempt automated recovery (works on Android)
        const recovery = new WebViewRecovery(
          linkId,
          linkData.user_id,
          destUrl,
          browser,
          device
        );
        
        const recoverySuccess = await recovery.attemptRecovery();
        
        // Log redirect with fallback
        await supabase.from('redirects').insert({
          link_id: linkId,
          referrer: document.referrer,
          browser,
          device,
          platform: browser.toLowerCase(),
          success: recoverySuccess,
          fallback_used: true,
          user_agent: ua,
          in_app_browser_detected: true,
          recovery_strategy_used: device === 'Android' ? 'intent_url' : 'manual',
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
          user_agent: ua,
          in_app_browser_detected: false,
        });
        window.location.href = destUrl;
      }
    } catch (err) {
      logger.error('Redirect error', err, { linkId });
      await supabase.from('redirects').insert({
        link_id: linkId,
        referrer: document.referrer,
        browser,
        device,
        success: false,
        fallback_used: false,
        user_agent: ua,
        in_app_browser_detected: inAppBrowser,
      });
      setError('An error occurred. Redirecting to home...');
      setTimeout(() => window.location.href = '/', 2000);
    }
  };

  const handleCopyUrl = async () => {
    if (!fallbackUrl) return;
    
    try {
      await navigator.clipboard.writeText(fallbackUrl);
      setCopied(true);
      toast.success('Link copied! Paste it in your browser.');
      setTimeout(() => setCopied(false), 3000);
    } catch (error) {
      // Fallback copy method
      const textArea = document.createElement('textarea');
      textArea.value = fallbackUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setCopied(true);
        toast.success('Link copied! Paste it in your browser.');
        setTimeout(() => setCopied(false), 3000);
      } catch (err) {
        toast.error('Failed to copy link');
      }
      document.body.removeChild(textArea);
    }
  };

  if (showFallback && fallbackUrl) {
    const instructions = getOpenInBrowserInstructions(browserInfo.browser, browserInfo.device);
    
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background to-muted p-4">
        <div className="max-w-md w-full bg-card border rounded-2xl shadow-xl p-8 text-center space-y-6">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <Smartphone className="h-10 w-10 text-primary" />
          </div>
          
          <div className="space-y-2">
            <h1 className="text-2xl font-bold">{instructions.title}</h1>
            <p className="text-muted-foreground">
              {browserInfo.browser}'s in-app browser can't open this link directly.
            </p>
          </div>
          
          {/* Step-by-step instructions */}
          <div className="bg-muted/50 rounded-xl p-4 text-left space-y-3">
            {instructions.steps.map((step, index) => (
              <div key={index} className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm pt-0.5">{step}</p>
              </div>
            ))}
          </div>
          
          <div className="space-y-3 pt-2">
            <p className="text-sm text-muted-foreground font-medium">Or copy the link:</p>
            
            <Button 
              size="lg" 
              variant={copied ? "default" : "outline"}
              className="w-full"
              onClick={handleCopyUrl}
            >
              {copied ? (
                <>
                  <CheckCircle className="mr-2 h-5 w-5" />
                  Copied! Open your browser & paste
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-5 w-5" />
                  {instructions.buttonText}
                </>
              )}
            </Button>
          </div>
          
          <div className="pt-4 border-t">
            <p className="text-xs text-muted-foreground break-all">
              🔗 {fallbackUrl.length > 50 ? fallbackUrl.substring(0, 50) + '...' : fallbackUrl}
            </p>
          </div>
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
