/**
 * Parse device type from user agent string
 */
export function getDeviceType(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'Tablet';
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|opera mobi|skyfire|maemo|windows phone|palm|iemobile|symbian|symbianos|fennec/i.test(ua)) {
    return 'Mobile';
  }
  return 'Desktop';
}

/**
 * Parse browser name from user agent string
 */
export function getBrowserName(userAgent: string): string {
  const ua = userAgent;
  
  // Order matters here - more specific patterns first
  if (ua.includes('Edg/')) return 'Edge';
  if (ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Chrome';
  if (ua.includes('Safari/') && !ua.includes('Chrome/') && !ua.includes('Edg/')) return 'Safari';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Opera/') || ua.includes('OPR/')) return 'Opera';
  if (ua.includes('MSIE') || ua.includes('Trident/')) return 'Internet Explorer';
  
  return 'Other';
}

/**
 * Parse operating system from user agent string
 */
export function getOperatingSystem(userAgent: string): string {
  const ua = userAgent;
  
  if (ua.includes('Windows')) return 'Windows';
  if (ua.includes('Mac OS')) return 'macOS';
  if (ua.includes('Linux')) return 'Linux';
  if (ua.includes('Android')) return 'Android';
  if (ua.includes('iOS') || ua.includes('iPhone') || ua.includes('iPad')) return 'iOS';
  
  return 'Other';
}

/**
 * Convert array of objects to CSV string
 */
export function convertToCSV(data: Record<string, any>[], headers: string[]): string {
  if (data.length === 0) return '';
  
  // Create header row
  const headerRow = headers.join(',');
  
  // Create data rows
  const dataRows = data.map(row => {
    return headers.map(header => {
      const value = row[header];
      // Escape quotes and wrap in quotes if contains comma
      if (value === null || value === undefined) return '';
      const stringValue = String(value);
      if (stringValue.includes(',') || stringValue.includes('"')) {
        return `"${stringValue.replace(/"/g, '""')}"`;
      }
      return stringValue;
    }).join(',');
  });
  
  return [headerRow, ...dataRows].join('\n');
}

/**
 * Trigger CSV file download in browser
 */
export function downloadCSV(filename: string, csvContent: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

/**
 * Format analytics data for CSV export
 */
export function formatAnalyticsForCSV(
  chartData: Array<{ date: string; clicks: number; views: number }>,
  topLinks: Array<any>,
  trafficSources: Array<any>
) {
  return {
    overview: chartData.map(d => ({
      Date: d.date,
      'Page Views': d.views,
      'Link Clicks': d.clicks,
    })),
    topLinks: topLinks.map(link => ({
      Title: link.title,
      URL: link.dest_url,
      Clicks: link.clicks,
      'CTR (%)': link.ctr.toFixed(2),
    })),
    trafficSources: trafficSources.map(source => ({
      Source: source.source,
      Clicks: source.clicks,
      'Percentage (%)': source.percentage.toFixed(2),
    })),
  };
}
