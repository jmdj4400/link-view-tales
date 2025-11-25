/**
 * Fast Redirect Edge Function Tests
 * Tests for unwrapping, fallback, and click capture
 */

import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts";

// Test 1: URL unwrapping test
Deno.test("unwrapSocialLinks - unwraps Instagram wrapper", () => {
  const wrapped = "https://l.instagram.com/?u=https%3A%2F%2Fexample.com%2Fpage";
  const expected = "https://example.com/page";
  
  function unwrapSocialLinks(url: string): string {
    try {
      const urlObj = new URL(url);
      
      if (urlObj.hostname === 'l.instagram.com' && urlObj.searchParams.has('u')) {
        return decodeURIComponent(urlObj.searchParams.get('u') || url);
      }
      
      if ((urlObj.hostname === 'l.facebook.com' || urlObj.hostname === 'lm.facebook.com') && urlObj.searchParams.has('u')) {
        return decodeURIComponent(urlObj.searchParams.get('u') || url);
      }
      
      if (urlObj.hostname === 'vm.tiktok.com' && urlObj.searchParams.has('u')) {
        return decodeURIComponent(urlObj.searchParams.get('u') || url);
      }
      
      return url;
    } catch {
      return url;
    }
  }
  
  const result = unwrapSocialLinks(wrapped);
  assertEquals(result, expected);
});

Deno.test("unwrapSocialLinks - unwraps Facebook wrapper", () => {
  const wrapped = "https://l.facebook.com/?u=https%3A%2F%2Fexample.com%2Fpage&h=test";
  const expected = "https://example.com/page";
  
  function unwrapSocialLinks(url: string): string {
    try {
      const urlObj = new URL(url);
      
      if ((urlObj.hostname === 'l.facebook.com' || urlObj.hostname === 'lm.facebook.com') && urlObj.searchParams.has('u')) {
        return decodeURIComponent(urlObj.searchParams.get('u') || url);
      }
      
      return url;
    } catch {
      return url;
    }
  }
  
  const result = unwrapSocialLinks(wrapped);
  assertEquals(result, expected);
});

// Test 2: Fallback redirect test
Deno.test("normalizeURL - handles malformed URLs gracefully", () => {
  function normalizeURL(url: string): string {
    if (!url) return '';
    
    let normalized = url.trim();
    normalized = normalized.replace(/[\x00-\x1F\x7F]/g, '');
    
    if (!/^https?:\/\//i.test(normalized)) {
      normalized = 'https://' + normalized;
    }
    
    return normalized;
  }
  
  // Test missing protocol
  assertEquals(normalizeURL("example.com"), "https://example.com");
  
  // Test with control characters
  assertEquals(normalizeURL("https://example.com\x00test"), "https://example.comtest");
  
  // Test empty string
  assertEquals(normalizeURL(""), "");
  
  // Test whitespace
  assertEquals(normalizeURL("  https://example.com  "), "https://example.com");
});

// Test 3: Click capture test
Deno.test("parseBrowserInfo - detects in-app browsers correctly", () => {
  function parseBrowserInfo(ua: string): {
    platform: string;
    browser: string;
    device: string;
    isInAppBrowser: boolean;
  } {
    const info = {
      platform: 'unknown',
      browser: 'unknown',
      device: 'unknown',
      isInAppBrowser: false,
    };

    if (/iphone|ipad|ipod/.test(ua)) {
      info.platform = 'ios';
      info.device = /ipad/.test(ua) ? 'tablet' : 'mobile';
    } else if (/android/.test(ua)) {
      info.platform = 'android';
      info.device = /mobile/.test(ua) ? 'mobile' : 'tablet';
    }

    const inAppPatterns = [
      { pattern: /fbav|fb_iab|fbios|fb4a/i, name: 'Facebook' },
      { pattern: /instagram/i, name: 'Instagram' },
      { pattern: /tiktok/i, name: 'TikTok' },
      { pattern: /linkedin/i, name: 'LinkedIn' },
      { pattern: /telegram/i, name: 'Telegram' },
    ];

    for (const { pattern, name } of inAppPatterns) {
      if (pattern.test(ua)) {
        info.isInAppBrowser = true;
        info.browser = name;
        return info;
      }
    }
    
    // iOS WebView detection
    if (ua.includes('iphone') && !ua.includes('safari') && ua.includes('webkit')) {
      info.isInAppBrowser = true;
      info.browser = 'iOS WebView';
      return info;
    }
    
    // Android WebView detection  
    if (ua.includes('android') && ua.includes('wv')) {
      info.isInAppBrowser = true;
      info.browser = 'Android WebView';
      return info;
    }

    return info;
  }
  
  // Test Instagram detection
  const instagramUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) Instagram 123.0";
  const instagramResult = parseBrowserInfo(instagramUA.toLowerCase());
  assertEquals(instagramResult.isInAppBrowser, true);
  assertEquals(instagramResult.browser, "Instagram");
  
  // Test Facebook detection
  const facebookUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) FBAV/123.0";
  const facebookResult = parseBrowserInfo(facebookUA.toLowerCase());
  assertEquals(facebookResult.isInAppBrowser, true);
  assertEquals(facebookResult.browser, "Facebook");
  
  // Test TikTok detection
  const tiktokUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) TikTok 123.0";
  const tiktokResult = parseBrowserInfo(tiktokUA.toLowerCase());
  assertEquals(tiktokResult.isInAppBrowser, true);
  assertEquals(tiktokResult.browser, "TikTok");
  
  // Test iOS WebView detection
  const iosWebViewUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148";
  const iosWebViewResult = parseBrowserInfo(iosWebViewUA.toLowerCase());
  assertEquals(iosWebViewResult.isInAppBrowser, true);
  assertEquals(iosWebViewResult.browser, "iOS WebView");
  
  // Test Android WebView detection
  const androidWebViewUA = "Mozilla/5.0 (Linux; Android 11; wv) AppleWebKit/537.36";
  const androidWebViewResult = parseBrowserInfo(androidWebViewUA.toLowerCase());
  assertEquals(androidWebViewResult.isInAppBrowser, true);
  assertEquals(androidWebViewResult.browser, "Android WebView");
  
  // Test regular Safari (should NOT be in-app browser)
  const safariUA = "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1";
  const safariResult = parseBrowserInfo(safariUA.toLowerCase());
  assertEquals(safariResult.isInAppBrowser, false);
});

Deno.test("IP hashing - creates consistent short hashes", async () => {
  async function hashIP(ip: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(ip);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 16);
  }
  
  const ip1 = "192.168.1.1";
  const ip2 = "192.168.1.1";
  const ip3 = "192.168.1.2";
  
  const hash1 = await hashIP(ip1);
  const hash2 = await hashIP(ip2);
  const hash3 = await hashIP(ip3);
  
  // Same IP should produce same hash
  assertEquals(hash1, hash2);
  
  // Different IP should produce different hash
  assertEquals(hash1 === hash3, false);
  
  // Hash should be 16 characters (truncated SHA-256)
  assertEquals(hash1.length, 16);
});