/**
 * URL Utilities for LinkPeek
 * Provides robust URL validation, sanitization, and analysis
 */

export interface URLValidationResult {
  isValid: boolean;
  sanitized: string | null;
  issues: string[];
  warnings: string[];
  redirectChain?: string[];
  estimatedHops: number;
}

export interface URLHealthCheck {
  url: string;
  status: 'healthy' | 'warning' | 'error' | 'unknown';
  responseTime?: number;
  redirectCount: number;
  finalUrl?: string;
  issues: string[];
  recommendations: string[];
}

/**
 * Unwraps common social media link wrappers
 */
export function unwrapSocialLinks(url: string): string {
  try {
    const urlObj = new URL(url);
    
    // Instagram l.instagram.com wrapper
    if (urlObj.hostname === 'l.instagram.com' && urlObj.searchParams.has('u')) {
      return decodeURIComponent(urlObj.searchParams.get('u') || url);
    }
    
    // Facebook l.facebook.com wrapper
    if ((urlObj.hostname === 'l.facebook.com' || urlObj.hostname === 'lm.facebook.com') && urlObj.searchParams.has('u')) {
      return decodeURIComponent(urlObj.searchParams.get('u') || url);
    }
    
    // TikTok vm.tiktok.com wrapper - these redirect, keep as is
    // LinkedIn lnkd.in wrapper - these redirect, keep as is
    // Twitter t.co wrapper - these redirect, keep as is
    
    return url;
  } catch {
    return url;
  }
}

/**
 * Cleans broken or malformed UTM parameters
 */
export function cleanUTMParameters(url: string): string {
  try {
    const urlObj = new URL(url);
    const validUTMParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];
    
    // Remove empty UTM parameters
    validUTMParams.forEach(param => {
      if (urlObj.searchParams.has(param)) {
        const value = urlObj.searchParams.get(param);
        if (!value || value.trim() === '') {
          urlObj.searchParams.delete(param);
        }
      }
    });
    
    // Remove duplicate UTM parameters (keeps first occurrence)
    const seen = new Set<string>();
    const params = Array.from(urlObj.searchParams.entries());
    urlObj.search = '';
    params.forEach(([key, value]) => {
      const lowerKey = key.toLowerCase();
      if (validUTMParams.includes(lowerKey)) {
        if (!seen.has(lowerKey)) {
          urlObj.searchParams.set(lowerKey, value);
          seen.add(lowerKey);
        }
      } else {
        urlObj.searchParams.set(key, value);
      }
    });
    
    return urlObj.toString();
  } catch {
    return url;
  }
}

/**
 * Comprehensive URL sanitization
 */
export function sanitizeURL(url: string): string {
  if (!url) return '';
  
  // Remove leading/trailing whitespace
  let sanitized = url.trim();
  
  // Remove null bytes and control characters
  sanitized = sanitized.replace(/[\x00-\x1F\x7F]/g, '');
  
  // Remove any URL encoding of null bytes
  sanitized = sanitized.replace(/%00/gi, '');
  
  // Ensure protocol exists
  if (!/^https?:\/\//i.test(sanitized)) {
    sanitized = 'https://' + sanitized;
  }
  
  // Fix common typos
  sanitized = sanitized
    .replace(/^http:\/([^/])/i, 'http://$1')
    .replace(/^https:\/([^/])/i, 'https://$1');
  
  // Remove multiple slashes in path (but not in protocol)
  const [protocol, ...rest] = sanitized.split('://');
  sanitized = protocol + '://' + rest.join('://').replace(/\/+/g, '/');
  
  // Decode double-encoded URLs
  try {
    let previous = '';
    let current = sanitized;
    let iterations = 0;
    
    while (previous !== current && iterations < 5) {
      previous = current;
      try {
        current = decodeURIComponent(current);
      } catch {
        break;
      }
      iterations++;
    }
    sanitized = current;
  } catch (e) {
    // If decoding fails, use original
  }
  
  // Unwrap social link wrappers
  sanitized = unwrapSocialLinks(sanitized);
  
  // Clean UTM parameters
  sanitized = cleanUTMParameters(sanitized);
  
  return sanitized;
}

/**
 * Validate URL structure and detect potential issues
 */
export function validateURL(url: string): URLValidationResult {
  const result: URLValidationResult = {
    isValid: false,
    sanitized: null,
    issues: [],
    warnings: [],
    estimatedHops: 1,
  };
  
  if (!url || typeof url !== 'string') {
    result.issues.push('URL is required');
    return result;
  }
  
  // Sanitize first
  const sanitized = sanitizeURL(url);
  result.sanitized = sanitized;
  
  // Check URL length
  if (sanitized.length > 2048) {
    result.issues.push('URL exceeds maximum length of 2048 characters');
    return result;
  }
  
  if (sanitized.length < 10) {
    result.issues.push('URL too short');
    return result;
  }
  
  // Validate URL format
  try {
    const urlObj = new URL(sanitized);
    
    // Check protocol
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      result.issues.push(`Unsupported protocol: ${urlObj.protocol}. Only HTTP(S) allowed`);
      return result;
    }
    
    // Check for localhost/private IPs
    if (urlObj.hostname === 'localhost' || 
        /^127\.\d+\.\d+\.\d+$/.test(urlObj.hostname) ||
        /^192\.168\.\d+\.\d+$/.test(urlObj.hostname) ||
        /^10\.\d+\.\d+\.\d+$/.test(urlObj.hostname)) {
      result.warnings.push('URL points to localhost or private IP');
    }
    
    // Detect common URL shorteners (potential redirect chains)
    const shorteners = [
      'bit.ly', 'tinyurl.com', 'ow.ly', 't.co', 'goo.gl', 
      'rebrand.ly', 'short.io', 'buff.ly', 'dlvr.it'
    ];
    
    if (shorteners.some(s => urlObj.hostname.includes(s))) {
      result.warnings.push('URL uses a link shortener - may add redirect hops');
      result.estimatedHops = 2;
    }
    
    // Detect potential tracking redirects
    if (urlObj.searchParams.has('redirect') || 
        urlObj.searchParams.has('url') ||
        urlObj.pathname.includes('/redirect') ||
        urlObj.pathname.includes('/goto')) {
      result.warnings.push('URL appears to be a redirect wrapper');
      result.estimatedHops = 2;
    }
    
    // Check for excessive query parameters
    if (urlObj.search.length > 500) {
      result.warnings.push('URL has very long query string - may cause issues in some browsers');
    }
    
    // Check for encoded characters in path
    if (/%[0-9A-F]{2}/i.test(urlObj.pathname)) {
      result.warnings.push('URL contains encoded characters in path');
    }
    
    result.isValid = true;
    
  } catch (e) {
    result.issues.push('Invalid URL format');
    return result;
  }
  
  return result;
}

/**
 * Extract UTM parameters from URL
 */
export function extractUTMParams(url: string): {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
} {
  try {
    const urlObj = new URL(url);
    return {
      utm_source: urlObj.searchParams.get('utm_source') || undefined,
      utm_medium: urlObj.searchParams.get('utm_medium') || undefined,
      utm_campaign: urlObj.searchParams.get('utm_campaign') || undefined,
      utm_term: urlObj.searchParams.get('utm_term') || undefined,
      utm_content: urlObj.searchParams.get('utm_content') || undefined,
    };
  } catch {
    return {};
  }
}

/**
 * Build URL with UTM parameters
 */
export function buildURLWithUTM(
  baseUrl: string,
  utmSource?: string,
  utmMedium?: string,
  utmCampaign?: string
): string {
  try {
    const url = new URL(sanitizeURL(baseUrl));
    
    if (utmSource) url.searchParams.set('utm_source', utmSource);
    if (utmMedium) url.searchParams.set('utm_medium', utmMedium);
    if (utmCampaign) url.searchParams.set('utm_campaign', utmCampaign);
    
    return url.toString();
  } catch {
    return baseUrl;
  }
}

/**
 * Detect if URL is likely to cause issues in in-app browsers
 */
export function detectInAppBrowserIssues(url: string): string[] {
  const issues: string[] = [];
  
  try {
    const urlObj = new URL(sanitizeURL(url));
    
    // Check for protocols that don't work well in in-app browsers
    if (urlObj.protocol === 'tel:' || urlObj.protocol === 'mailto:') {
      issues.push('Special protocol may not work in in-app browsers');
    }
    
    // Check for file downloads
    const ext = urlObj.pathname.split('.').pop()?.toLowerCase();
    const downloadExtensions = ['pdf', 'doc', 'docx', 'zip', 'exe', 'dmg'];
    if (ext && downloadExtensions.includes(ext)) {
      issues.push('File download may be blocked in in-app browsers');
    }
    
    // Check for authentication requirements
    if (urlObj.username || urlObj.password) {
      issues.push('Basic auth may not work in in-app browsers');
    }
    
  } catch (e) {
    issues.push('Unable to analyze URL structure');
  }
  
  return issues;
}

/**
 * Get domain from URL
 */
export function getDomain(url: string): string | null {
  try {
    const urlObj = new URL(sanitizeURL(url));
    return urlObj.hostname;
  } catch {
    return null;
  }
}

/**
 * Check if URL is safe (not phishing, malware, etc.)
 * This is a basic check - in production, integrate with Google Safe Browsing API
 */
export function isURLSafe(url: string): { safe: boolean; reason?: string } {
  try {
    const urlObj = new URL(sanitizeURL(url));
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check for homograph attacks (cyrillic characters that look like latin)
    if (/[а-яА-Я]/.test(hostname)) {
      return { safe: false, reason: 'Potential homograph attack detected' };
    }
    
    // Check for suspicious TLDs
    const suspiciousTLDs = ['.tk', '.ml', '.ga', '.cf', '.gq'];
    if (suspiciousTLDs.some(tld => hostname.endsWith(tld))) {
      return { safe: false, reason: 'Suspicious top-level domain' };
    }
    
    // Check for excessive subdomains (common in phishing)
    const subdomains = hostname.split('.');
    if (subdomains.length > 5) {
      return { safe: false, reason: 'Excessive subdomains detected' };
    }
    
    // Check for IP address instead of domain
    if (/^\d+\.\d+\.\d+\.\d+$/.test(hostname)) {
      return { safe: false, reason: 'IP address instead of domain name' };
    }
    
    return { safe: true };
  } catch {
    return { safe: false, reason: 'Invalid URL format' };
  }
}

/**
 * Estimate redirect performance based on URL structure
 */
export function estimateRedirectPerformance(url: string): {
  estimatedTime: number; // ms
  confidence: 'high' | 'medium' | 'low';
  factors: string[];
} {
  const factors: string[] = [];
  let estimatedTime = 100; // base time in ms
  let confidence: 'high' | 'medium' | 'low' = 'high';
  
  try {
    const urlObj = new URL(sanitizeURL(url));
    
    // Geographic distance (basic heuristic)
    const tld = urlObj.hostname.split('.').pop()?.toLowerCase();
    const farTLDs = ['cn', 'jp', 'au', 'nz', 'za'];
    if (tld && farTLDs.includes(tld)) {
      estimatedTime += 150;
      factors.push('Geographic distance may increase latency');
    }
    
    // CDN detection (likely faster)
    const cdnProviders = ['cloudfront', 'cloudflare', 'fastly', 'akamai'];
    if (cdnProviders.some(cdn => urlObj.hostname.includes(cdn))) {
      estimatedTime -= 30;
      factors.push('CDN detected - likely fast');
    }
    
    // HTTPS adds slight overhead
    if (urlObj.protocol === 'https:') {
      estimatedTime += 20;
    }
    
    // Query string complexity
    if (urlObj.search.length > 200) {
      estimatedTime += 30;
      factors.push('Complex query string');
      confidence = 'medium';
    }
    
  } catch {
    confidence = 'low';
    factors.push('Unable to analyze URL');
  }
  
  return {
    estimatedTime,
    confidence,
    factors,
  };
}
