/**
 * Redirect Utilities for LinkPeek
 * Handles redirect detection, browser classification, and performance tracking
 */

export interface BrowserInfo {
  name: string;
  version: string;
  isInAppBrowser: boolean;
  platform: 'ios' | 'android' | 'desktop' | 'unknown';
  device: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  engine: string;
}

export interface RedirectStep {
  url: string;
  status?: number;
  timestamp: number;
  duration?: number;
  type: 'initial' | 'server' | 'client' | 'meta' | 'js';
}

export interface RedirectTracking {
  startTime: number;
  steps: RedirectStep[];
  totalTime: number;
  finalUrl: string;
  dropOffStage?: string;
  success: boolean;
}

/**
 * Detect browser and in-app browser status
 */
export function detectBrowser(userAgent: string): BrowserInfo {
  const ua = userAgent.toLowerCase();
  
  const info: BrowserInfo = {
    name: 'Unknown',
    version: '',
    isInAppBrowser: false,
    platform: 'unknown',
    device: 'unknown',
    engine: 'unknown',
  };
  
  // Detect platform
  if (/iphone|ipad|ipod/.test(ua)) {
    info.platform = 'ios';
    info.device = /ipad/.test(ua) ? 'tablet' : 'mobile';
  } else if (/android/.test(ua)) {
    info.platform = 'android';
    info.device = /mobile/.test(ua) ? 'mobile' : 'tablet';
  } else if (/windows|mac|linux/.test(ua)) {
    info.platform = 'desktop';
    info.device = 'desktop';
  }
  
  // Detect in-app browsers (most important for LinkPeek)
  const inAppBrowsers = [
    { pattern: /fbav|fb_iab|fbios|fb4a/i, name: 'Facebook' },
    { pattern: /instagram/i, name: 'Instagram' },
    { pattern: /twitter/i, name: 'Twitter' },
    { pattern: /linkedin/i, name: 'LinkedIn' },
    { pattern: /snapchat/i, name: 'Snapchat' },
    { pattern: /tiktok/i, name: 'TikTok' },
    { pattern: /pinterest/i, name: 'Pinterest' },
    { pattern: /line\//i, name: 'LINE' },
    { pattern: /wechat/i, name: 'WeChat' },
    { pattern: /whatsapp/i, name: 'WhatsApp' },
  ];
  
  for (const browser of inAppBrowsers) {
    if (browser.pattern.test(ua)) {
      info.isInAppBrowser = true;
      info.name = `${browser.name} In-App`;
      break;
    }
  }
  
  // If not in-app browser, detect regular browsers
  if (!info.isInAppBrowser) {
    if (/edg/i.test(ua)) {
      info.name = 'Edge';
      info.engine = 'Blink';
    } else if (/chrome/i.test(ua)) {
      info.name = 'Chrome';
      info.engine = 'Blink';
    } else if (/safari/i.test(ua) && !/chrome/i.test(ua)) {
      info.name = 'Safari';
      info.engine = 'WebKit';
    } else if (/firefox/i.test(ua)) {
      info.name = 'Firefox';
      info.engine = 'Gecko';
    } else if (/opera|opr/i.test(ua)) {
      info.name = 'Opera';
      info.engine = 'Blink';
    }
    
    // Extract version
    const versionMatch = ua.match(new RegExp(info.name.toLowerCase() + '[/\\s]([\\d.]+)'));
    if (versionMatch) {
      info.version = versionMatch[1];
    }
  }
  
  return info;
}

/**
 * Determine best recovery strategy for in-app browser
 */
export function getRecoveryStrategy(browserInfo: BrowserInfo): {
  strategy: 'deep_link_ios' | 'deep_link_android' | 'intent_url' | 'clipboard_copy' | 'fallback_ui' | 'none';
  confidence: 'high' | 'medium' | 'low';
  instructions: string;
} {
  if (!browserInfo.isInAppBrowser) {
    return {
      strategy: 'none',
      confidence: 'high',
      instructions: 'Regular browser detected - no recovery needed',
    };
  }
  
  if (browserInfo.platform === 'ios') {
    // iOS in-app browsers
    if (browserInfo.name.includes('Instagram') || browserInfo.name.includes('Facebook')) {
      return {
        strategy: 'deep_link_ios',
        confidence: 'medium',
        instructions: 'Attempting to open in Safari via deep link',
      };
    }
    return {
      strategy: 'fallback_ui',
      confidence: 'high',
      instructions: 'Showing fallback UI with copy/open options',
    };
  }
  
  if (browserInfo.platform === 'android') {
    // Android in-app browsers
    return {
      strategy: 'intent_url',
      confidence: 'high',
      instructions: 'Using Android intent URL to open in default browser',
    };
  }
  
  return {
    strategy: 'clipboard_copy',
    confidence: 'low',
    instructions: 'Copying URL to clipboard as fallback',
  };
}

/**
 * Track redirect performance
 */
export class RedirectTracker {
  private tracking: RedirectTracking;
  
  constructor(initialUrl: string) {
    this.tracking = {
      startTime: Date.now(),
      steps: [{
        url: initialUrl,
        timestamp: Date.now(),
        type: 'initial',
      }],
      totalTime: 0,
      finalUrl: initialUrl,
      success: false,
    };
  }
  
  addStep(url: string, type: RedirectStep['type'], status?: number): void {
    const now = Date.now();
    const lastStep = this.tracking.steps[this.tracking.steps.length - 1];
    
    this.tracking.steps.push({
      url,
      status,
      timestamp: now,
      duration: now - lastStep.timestamp,
      type,
    });
    
    this.tracking.finalUrl = url;
  }
  
  setDropOff(stage: string): void {
    this.tracking.dropOffStage = stage;
    this.tracking.success = false;
  }
  
  setSuccess(): void {
    this.tracking.success = true;
    this.tracking.totalTime = Date.now() - this.tracking.startTime;
  }
  
  getTracking(): RedirectTracking {
    return {
      ...this.tracking,
      totalTime: Date.now() - this.tracking.startTime,
    };
  }
}

/**
 * Detect if current environment is an in-app browser
 */
export function isInAppBrowser(): boolean {
  if (typeof window === 'undefined') return false;
  
  const ua = window.navigator.userAgent.toLowerCase();
  const inAppPatterns = [
    /fbav|fb_iab|fbios|fb4a/i,
    /instagram/i,
    /twitter/i,
    /linkedin/i,
    /snapchat/i,
    /tiktok/i,
    /pinterest/i,
    /line\//i,
    /wechat/i,
    /whatsapp/i,
  ];
  
  return inAppPatterns.some(pattern => pattern.test(ua));
}

/**
 * Get optimal timeout for redirect based on browser/platform
 */
export function getRedirectTimeout(browserInfo: BrowserInfo): number {
  // In-app browsers are slower and more unreliable
  if (browserInfo.isInAppBrowser) {
    return 10000; // 10 seconds
  }
  
  // Mobile browsers can be slower
  if (browserInfo.device === 'mobile') {
    return 7000; // 7 seconds
  }
  
  // Desktop browsers are generally fastest
  return 5000; // 5 seconds
}

/**
 * Check if redirect should use fallback
 */
export function shouldUseFallback(
  browserInfo: BrowserInfo,
  riskScore: number,
  redirectChainLength: number
): boolean {
  // Always use fallback for high-risk scenarios
  if (riskScore > 70) return true;
  
  // Use fallback for Instagram/TikTok due to known issues
  if (browserInfo.name.includes('Instagram') || browserInfo.name.includes('TikTok')) {
    return true;
  }
  
  // Use fallback if redirect chain is long
  if (redirectChainLength > 2) return true;
  
  return false;
}

/**
 * Build fallback URL for in-app browser recovery
 */
export function buildFallbackURL(
  destinationUrl: string,
  browserInfo: BrowserInfo
): string {
  const encoded = encodeURIComponent(destinationUrl);
  
  if (browserInfo.platform === 'ios') {
    // Try to open in Safari
    return `x-safari-${destinationUrl}`;
  }
  
  if (browserInfo.platform === 'android') {
    // Use intent URL for Android
    return `intent://${destinationUrl.replace(/^https?:\/\//, '')}#Intent;scheme=https;action=android.intent.action.VIEW;end`;
  }
  
  return destinationUrl;
}

/**
 * Parse redirect chain from response headers
 */
export function parseRedirectChain(url: string): Promise<string[]> {
  return new Promise(async (resolve) => {
    const chain: string[] = [url];
    
    try {
      // Use HEAD request to follow redirects without downloading content
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
        // Use very short timeout
        signal: AbortSignal.timeout(3000),
      });
      
      // Check if URL changed
      if (response.url !== url) {
        chain.push(response.url);
      }
      
    } catch (e) {
      // If fetch fails, return single URL
    }
    
    resolve(chain);
  });
}

/**
 * Calculate risk score for redirect
 */
export function calculateRedirectRisk(
  url: string,
  browserInfo: BrowserInfo,
  historicalFailureRate?: number
): number {
  let risk = 0;
  
  // In-app browsers are higher risk
  if (browserInfo.isInAppBrowser) {
    risk += 30;
    
    // Some in-app browsers are worse than others
    if (browserInfo.name.includes('Instagram') || browserInfo.name.includes('TikTok')) {
      risk += 20;
    }
  }
  
  // Historical failure rate
  if (historicalFailureRate) {
    risk += historicalFailureRate * 0.5;
  }
  
  // URL complexity
  try {
    const urlObj = new URL(url);
    if (urlObj.search.length > 200) risk += 10;
    if (urlObj.pathname.split('/').length > 5) risk += 5;
  } catch {
    risk += 20; // Invalid URL is high risk
  }
  
  return Math.min(100, risk);
}

/**
 * Optimize redirect by removing unnecessary parameters
 */
export function optimizeRedirectURL(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Remove common tracking parameters that aren't needed
    const trackingParams = [
      'fbclid', 'gclid', 'msclkid', '_ga', '_gl',
      'mc_cid', 'mc_eid', 'mkt_tok',
    ];
    
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param);
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}
