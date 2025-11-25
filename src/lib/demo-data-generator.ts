/**
 * Demo Data Generator
 * Creates realistic synthetic click events for new users
 */

import { supabase } from "@/integrations/supabase/client";

const DEMO_URL = "https://example.com/product";
const DEMO_TITLE = "Demo Link - Try LinkPeek";

const BROWSERS = ["Instagram", "Facebook", "TikTok", "Safari", "Chrome", "Twitter/X"];
const DEVICES = ["iOS", "Android", "Windows", "macOS"];
const COUNTRIES = ["US", "GB", "CA", "AU", "DE"];
const REFERRERS = [
  "https://instagram.com",
  "https://facebook.com",
  "https://tiktok.com",
  "https://twitter.com",
  null,
];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTimestamp(hoursAgo: number): Date {
  const now = new Date();
  const timestamp = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
  // Add random minutes/seconds for variance
  timestamp.setMinutes(randomInt(0, 59));
  timestamp.setSeconds(randomInt(0, 59));
  return timestamp;
}

function generateLoadTime(browser: string): number {
  // In-app browsers tend to be slower
  const inAppBrowsers = ["Instagram", "Facebook", "TikTok"];
  if (inAppBrowsers.includes(browser)) {
    return randomInt(250, 800);
  }
  return randomInt(50, 300);
}

export async function generateDemoLink() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Not authenticated");

    // Create demo link
    const { data: link, error: linkError } = await supabase
      .from("links")
      .insert({
        user_id: user.id,
        title: DEMO_TITLE,
        dest_url: DEMO_URL,
        sanitized_dest_url: DEMO_URL,
        is_active: true,
        position: 0,
        health_status: "excellent",
        current_clicks: 0,
      })
      .select()
      .single();

    if (linkError) throw linkError;

    // Generate 50-100 synthetic click events over last 24 hours
    const numEvents = randomInt(50, 100);
    const events = [];
    const redirects = [];

    for (let i = 0; i < numEvents; i++) {
      const hoursAgo = randomInt(0, 24);
      const timestamp = generateTimestamp(hoursAgo);
      const browser = randomChoice(BROWSERS);
      const device = randomChoice(DEVICES);
      const country = randomChoice(COUNTRIES);
      const referrer = randomChoice(REFERRERS);
      const loadTime = generateLoadTime(browser);
      
      // 95% success rate for demo
      const success = Math.random() > 0.05;
      const isInAppBrowser = ["Instagram", "Facebook", "TikTok", "Twitter/X"].includes(browser);

      // Create event
      events.push({
        link_id: link.id,
        user_id: user.id,
        event_type: "click",
        referrer,
        country,
        created_at: timestamp.toISOString(),
      });

      // Create redirect
      redirects.push({
        link_id: link.id,
        browser,
        device,
        platform: device.toLowerCase().includes('ios') ? 'ios' : 
                 device.toLowerCase().includes('android') ? 'android' : 'desktop',
        country,
        success,
        load_time_ms: loadTime,
        in_app_browser_detected: isInAppBrowser,
        fallback_used: isInAppBrowser && Math.random() > 0.7,
        referrer,
        final_url: DEMO_URL,
        ts: timestamp.toISOString(),
      });
    }

    // Insert events in batch
    const { error: eventsError } = await supabase
      .from("events")
      .insert(events);

    if (eventsError) throw eventsError;

    // Insert redirects in batch
    const { error: redirectsError } = await supabase
      .from("redirects")
      .insert(redirects);

    if (redirectsError) throw redirectsError;

    // Update link with click count and health metrics
    const successCount = redirects.filter(r => r.success).length;
    const avgLoadTime = redirects.reduce((sum, r) => sum + r.load_time_ms, 0) / redirects.length;

    await supabase
      .from("links")
      .update({
        current_clicks: numEvents,
        avg_redirect_time_ms: Math.round(avgLoadTime),
        health_status: successCount / numEvents > 0.95 ? "excellent" : "good",
        health_checked_at: new Date().toISOString(),
      })
      .eq("id", link.id);

    return link;
  } catch (error) {
    console.error("Error generating demo data:", error);
    throw error;
  }
}
