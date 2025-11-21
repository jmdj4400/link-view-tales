/**
 * Client-side Rate Limiter
 * Prevents abuse by limiting action frequency
 */

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();

  /**
   * Check if action is allowed
   */
  check(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = this.limits.get(key);

    // No previous entry or window expired
    if (!entry || now > entry.resetTime) {
      this.limits.set(key, {
        count: 1,
        resetTime: now + config.windowMs,
      });
      return true;
    }

    // Within window, check count
    if (entry.count >= config.maxRequests) {
      return false;
    }

    // Increment count
    entry.count++;
    this.limits.set(key, entry);
    return true;
  }

  /**
   * Get remaining requests
   */
  getRemaining(key: string, config: RateLimitConfig): number {
    const entry = this.limits.get(key);
    if (!entry || Date.now() > entry.resetTime) {
      return config.maxRequests;
    }
    return Math.max(0, config.maxRequests - entry.count);
  }

  /**
   * Get time until reset (ms)
   */
  getTimeUntilReset(key: string): number {
    const entry = this.limits.get(key);
    if (!entry) return 0;
    return Math.max(0, entry.resetTime - Date.now());
  }

  /**
   * Reset a specific key
   */
  reset(key: string) {
    this.limits.delete(key);
  }

  /**
   * Clear all limits
   */
  clearAll() {
    this.limits.clear();
  }
}

export const rateLimiter = new RateLimiter();

/**
 * Common rate limit configurations
 */
export const RATE_LIMITS = {
  // Link creation: 10 per minute
  LINK_CREATION: { maxRequests: 10, windowMs: 60 * 1000 },
  
  // API calls: 30 per minute
  API_CALL: { maxRequests: 30, windowMs: 60 * 1000 },
  
  // Export: 5 per minute
  EXPORT: { maxRequests: 5, windowMs: 60 * 1000 },
  
  // Profile updates: 10 per minute
  PROFILE_UPDATE: { maxRequests: 10, windowMs: 60 * 1000 },
  
  // Authentication: 5 per minute
  AUTH: { maxRequests: 5, windowMs: 60 * 1000 },
} as const;

/**
 * Higher-order function to rate limit async operations
 */
export function withRateLimit<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  key: string,
  config: RateLimitConfig
): T {
  return (async (...args: Parameters<T>) => {
    if (!rateLimiter.check(key, config)) {
      const resetTime = rateLimiter.getTimeUntilReset(key);
      throw new Error(
        `Rate limit exceeded. Try again in ${Math.ceil(resetTime / 1000)} seconds.`
      );
    }
    return fn(...args);
  }) as T;
}
