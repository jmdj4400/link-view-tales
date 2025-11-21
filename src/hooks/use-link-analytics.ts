import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface LinkAnalytics {
  linkId: string;
  clicks: number;
  redirectSuccess: number;
  avgLoadTime: number;
  inAppBrowserClicks: number;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  topCountries: Array<{ country: string; count: number }>;
}

export function useLinkAnalytics(linkId: string | undefined, dateRange?: { from: Date; to: Date }) {
  const [analytics, setAnalytics] = useState<LinkAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!linkId) return;

    async function fetchAnalytics() {
      try {
        setLoading(true);

        // Fetch redirect data
        let redirectQuery = supabase
          .from('redirects')
          .select('*')
          .eq('link_id', linkId);

        if (dateRange) {
          redirectQuery = redirectQuery
            .gte('ts', dateRange.from.toISOString())
            .lte('ts', dateRange.to.toISOString());
        }

        const { data: redirects, error: redirectError } = await redirectQuery;

        if (redirectError) throw redirectError;

        // Calculate metrics
        const totalClicks = redirects?.length || 0;
        const successfulRedirects = redirects?.filter(r => r.success).length || 0;
        const loadTimes = redirects?.filter(r => r.load_time_ms).map(r => r.load_time_ms!) || [];
        const avgLoadTime = loadTimes.length > 0 
          ? loadTimes.reduce((a, b) => a + b, 0) / loadTimes.length 
          : 0;

        const inAppBrowserClicks = redirects?.filter(r => r.in_app_browser_detected).length || 0;

        // Device breakdown
        const deviceBreakdown = {
          mobile: redirects?.filter(r => r.device === 'mobile').length || 0,
          tablet: redirects?.filter(r => r.device === 'tablet').length || 0,
          desktop: redirects?.filter(r => r.device === 'desktop').length || 0,
        };

        // Top countries
        const countryMap = new Map<string, number>();
        redirects?.forEach(r => {
          if (r.country) {
            countryMap.set(r.country, (countryMap.get(r.country) || 0) + 1);
          }
        });

        const topCountries = Array.from(countryMap.entries())
          .map(([country, count]) => ({ country, count }))
          .sort((a, b) => b.count - a.count)
          .slice(0, 5);

        setAnalytics({
          linkId,
          clicks: totalClicks,
          redirectSuccess: totalClicks > 0 ? (successfulRedirects / totalClicks) * 100 : 0,
          avgLoadTime: Math.round(avgLoadTime),
          inAppBrowserClicks,
          deviceBreakdown,
          topCountries,
        });

        setError(null);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, [linkId, dateRange]);

  return { analytics, loading, error };
}
