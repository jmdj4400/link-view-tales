/**
 * Performance Monitoring Utilities
 * Tracks and reports on application performance
 */

interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];
  private readonly MAX_METRICS = 100;

  /**
   * Record a performance metric
   */
  record(name: string, value: number) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });

    // Keep only recent metrics
    if (this.metrics.length > this.MAX_METRICS) {
      this.metrics.shift();
    }
  }

  /**
   * Record page load time
   */
  recordPageLoad() {
    if (typeof window === 'undefined') return;

    const perfData = window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    if (perfData) {
      this.record('page_load', perfData.loadEventEnd - perfData.fetchStart);
      this.record('dom_content_loaded', perfData.domContentLoadedEventEnd - perfData.fetchStart);
      this.record('first_paint', perfData.responseEnd - perfData.fetchStart);
    }
  }

  /**
   * Measure function execution time
   */
  async measure<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const duration = performance.now() - start;
      this.record(name, duration);
      return result;
    } catch (error) {
      const duration = performance.now() - start;
      this.record(`${name}_error`, duration);
      throw error;
    }
  }

  /**
   * Get average for a metric
   */
  getAverage(name: string): number {
    const filtered = this.metrics.filter(m => m.name === name);
    if (filtered.length === 0) return 0;
    const sum = filtered.reduce((acc, m) => acc + m.value, 0);
    return sum / filtered.length;
  }

  /**
   * Get all metrics
   */
  getAllMetrics() {
    return [...this.metrics];
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const metricNames = [...new Set(this.metrics.map(m => m.name))];
    return metricNames.map(name => ({
      name,
      average: this.getAverage(name),
      count: this.metrics.filter(m => m.name === name).length,
    }));
  }

  /**
   * Clear all metrics
   */
  clear() {
    this.metrics = [];
  }

  /**
   * Check if performance is within acceptable range
   */
  isPerformant(metric: string, threshold: number): boolean {
    const avg = this.getAverage(metric);
    return avg > 0 && avg <= threshold;
  }
}

export const performanceMonitor = new PerformanceMonitor();

/**
 * React hook for measuring component render time
 */
export function usePerformanceMonitor(componentName: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  // Measure on unmount
  return () => {
    const duration = performance.now() - startTime;
    performanceMonitor.record(`component_${componentName}`, duration);
  };
}

/**
 * Performance thresholds (in milliseconds)
 */
export const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD: 2000,
  API_CALL: 500,
  REDIRECT: 50,
  COMPONENT_RENDER: 16, // 60fps
  INTERACTION: 100,
} as const;

/**
 * Check overall app performance
 */
export function checkPerformanceHealth() {
  return {
    pageLoad: performanceMonitor.isPerformant('page_load', PERFORMANCE_THRESHOLDS.PAGE_LOAD),
    apiCalls: performanceMonitor.isPerformant('api_call', PERFORMANCE_THRESHOLDS.API_CALL),
    redirects: performanceMonitor.isPerformant('redirect', PERFORMANCE_THRESHOLDS.REDIRECT),
  };
}
