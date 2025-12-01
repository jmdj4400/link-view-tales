/**
 * Demo Data Seeder for LinkPeek
 * Generates realistic demo analytics for onboarding and testing
 */

import { supabase } from "@/integrations/supabase/client";

const DEMO_USER_AGENTS = [
  "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Mobile Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/110.0.0.0 Safari/537.36",
  "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
];

const DEMO_REFERRERS = [
  "https://instagram.com",
  "https://facebook.com",
  "https://twitter.com",
  "https://tiktok.com",
  "https://linkedin.com",
  "",
];

const DEMO_COUNTRIES = ["US", "GB", "CA", "DE", "FR", "AU", "BR", "IN", "JP", "ES"];

interface DemoDataOptions {
  userId: string;
  linkIds: string[];
  daysBack?: number;
  eventsPerDay?: number;
}

/**
 * Generate demo click events with realistic distribution
 */
export async function generateDemoEvents(options: DemoDataOptions) {
  const { userId, linkIds, daysBack = 7, eventsPerDay = 15 } = options;
  
  if (linkIds.length === 0) {
    throw new Error("No links provided for demo data generation");
  }

  const events: Array<{
    user_id: string;
    link_id: string;
    event_type: string;
    created_at: string;
    referrer: string | null;
    country: string;
    user_agent_hash: string;
    is_bot: boolean;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
  }> = [];

  const redirects: Array<{
    link_id: string;
    ts: string;
    success: boolean;
    in_app_browser_detected: boolean;
    load_time_ms: number;
    platform: string;
    browser: string;
    device: string;
    country: string;
    user_agent: string;
    referrer: string | null;
    recovery_strategy_used: string | null;
  }> = [];

  const now = new Date();

  for (let day = 0; day < daysBack; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() - day);
    
    // Vary events per day (more recent = more events)
    const dayMultiplier = 1 - (day / daysBack) * 0.5;
    const eventsThisDay = Math.floor(eventsPerDay * dayMultiplier * (0.8 + Math.random() * 0.4));

    for (let i = 0; i < eventsThisDay; i++) {
      const eventDate = new Date(date);
      // Spread events throughout the day
      eventDate.setHours(Math.floor(Math.random() * 24));
      eventDate.setMinutes(Math.floor(Math.random() * 60));
      
      const linkId = linkIds[Math.floor(Math.random() * linkIds.length)];
      const userAgent = DEMO_USER_AGENTS[Math.floor(Math.random() * DEMO_USER_AGENTS.length)];
      const referrer = DEMO_REFERRERS[Math.floor(Math.random() * DEMO_REFERRERS.length)];
      const country = DEMO_COUNTRIES[Math.floor(Math.random() * DEMO_COUNTRIES.length)];
      const isInAppBrowser = referrer.includes("instagram") || referrer.includes("facebook");
      
      // 90% success rate for redirects
      const redirectSuccess = Math.random() > 0.1;
      
      // Detect device type from user agent
      const isMobile = userAgent.includes("Mobile") || userAgent.includes("Android") || userAgent.includes("iPhone");
      const device = isMobile ? "Mobile" : "Desktop";
      const platform = userAgent.includes("iPhone") || userAgent.includes("iPad") ? "iOS" : 
                      userAgent.includes("Android") ? "Android" : 
                      userAgent.includes("Mac") ? "macOS" : "Windows";
      const browser = userAgent.includes("Safari") && !userAgent.includes("Chrome") ? "Safari" :
                     userAgent.includes("Chrome") ? "Chrome" : "Other";
      
      // Generate view event
      events.push({
        user_id: userId,
        link_id: linkId,
        event_type: "view",
        created_at: eventDate.toISOString(),
        referrer: referrer || null,
        country,
        user_agent_hash: btoa(userAgent),
        is_bot: false,
        utm_source: referrer ? new URL(referrer).hostname.split(".")[0] : null,
        utm_medium: "social",
        utm_campaign: null,
      });

      // 70% click-through rate
      if (Math.random() > 0.3) {
        const clickDate = new Date(eventDate);
        clickDate.setSeconds(clickDate.getSeconds() + Math.floor(Math.random() * 10));
        
        events.push({
          user_id: userId,
          link_id: linkId,
          event_type: "click",
          created_at: clickDate.toISOString(),
          referrer: referrer || null,
          country,
          user_agent_hash: btoa(userAgent),
          is_bot: false,
          utm_source: referrer ? new URL(referrer).hostname.split(".")[0] : null,
          utm_medium: "social",
          utm_campaign: null,
        });

        // Add redirect record
        redirects.push({
          link_id: linkId,
          ts: clickDate.toISOString(),
          success: redirectSuccess,
          in_app_browser_detected: isInAppBrowser,
          load_time_ms: Math.floor(50 + Math.random() * 200),
          platform,
          browser,
          device,
          country,
          user_agent: userAgent,
          referrer: referrer || null,
          recovery_strategy_used: !redirectSuccess && isInAppBrowser ? "fallback_link" : null,
        });
      }
    }
  }

  // Insert events in batches
  console.log(`Inserting ${events.length} demo events...`);
  const { error: eventsError } = await supabase
    .from("events")
    .insert(events);

  if (eventsError) {
    throw new Error(`Failed to insert demo events: ${eventsError.message}`);
  }

  // Insert redirects in batches
  console.log(`Inserting ${redirects.length} demo redirects...`);
  const { error: redirectsError } = await supabase
    .from("redirects")
    .insert(redirects);

  if (redirectsError) {
    throw new Error(`Failed to insert demo redirects: ${redirectsError.message}`);
  }

  return {
    eventsCreated: events.length,
    redirectsCreated: redirects.length,
  };
}

/**
 * Check if user already has demo data
 */
export async function hasDemoData(userId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from("events")
    .select("id")
    .eq("user_id", userId)
    .limit(1);

  if (error) {
    console.error("Error checking for demo data:", error);
    return false;
  }

  return (data?.length || 0) > 0;
}

/**
 * Clear demo data for testing
 */
export async function clearDemoData(userId: string) {
  const { error: eventsError } = await supabase
    .from("events")
    .delete()
    .eq("user_id", userId);

  if (eventsError) {
    throw new Error(`Failed to clear demo events: ${eventsError.message}`);
  }

  console.log("Demo data cleared successfully");
}
