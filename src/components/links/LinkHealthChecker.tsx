import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Clock, AlertTriangle, ExternalLink, TrendingUp } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { validateURL, estimateRedirectPerformance, detectInAppBrowserIssues, isURLSafe } from '@/lib/url-utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { supabase } from '@/lib/supabase-client';

interface LinkHealthCheckerProps {
  url: string;
  linkId?: string;
  showDetails?: boolean;
}

export function LinkHealthChecker({ url, linkId, showDetails = true }: LinkHealthCheckerProps) {
  const [checking, setChecking] = useState(false);
  const [health, setHealth] = useState<{
    status: 'healthy' | 'warning' | 'error' | 'unknown';
    issues: string[];
    warnings: string[];
    recommendations: string[];
    performance: ReturnType<typeof estimateRedirectPerformance>;
    historicalData?: {
      successRate: number;
      avgLoadTime: number;
      lastChecked: string;
    };
  } | null>(null);

  useEffect(() => {
    if (url) {
      checkHealth();
    }
  }, [url]);

  const checkHealth = async () => {
    setChecking(true);
    
    // Run validation
    const validation = validateURL(url);
    const performance = estimateRedirectPerformance(url);
    const inAppIssues = detectInAppBrowserIssues(url);
    const safetyCheck = isURLSafe(url);
    
    const issues: string[] = [...validation.issues];
    const warnings: string[] = [...validation.warnings, ...inAppIssues];
    const recommendations: string[] = [];
    
    // Safety check
    if (!safetyCheck.safe) {
      issues.push(safetyCheck.reason || 'URL failed safety check');
    }
    
    // Get historical data if linkId provided
    let historicalData;
    if (linkId) {
      const { data } = await supabase
        .from('links')
        .select('health_status, health_checked_at, avg_redirect_time_ms')
        .eq('id', linkId)
        .single();
      
      if (data) {
        const { data: redirectData } = await supabase
          .from('redirects')
          .select('success')
          .eq('link_id', linkId)
          .gte('ts', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
          .limit(100);
        
        if (redirectData && redirectData.length > 0) {
          const successCount = redirectData.filter(r => r.success).length;
          historicalData = {
            successRate: (successCount / redirectData.length) * 100,
            avgLoadTime: data.avg_redirect_time_ms || 0,
            lastChecked: data.health_checked_at || '',
          };
        }
      }
    }
    
    // Generate recommendations
    if (validation.estimatedHops > 1) {
      recommendations.push('Consider using the final destination URL directly to reduce redirect hops');
    }
    
    if (performance.estimatedTime > 500) {
      recommendations.push('URL may have high latency - consider using a CDN');
    }
    
    if (inAppIssues.length > 0) {
      recommendations.push('Enable LinkPeek firewall to improve reliability in social media apps');
    }
    
    if (historicalData && historicalData.successRate < 95) {
      recommendations.push('Link has reliability issues - check destination server health');
    }
    
    // Determine overall status
    let status: 'healthy' | 'warning' | 'error' | 'unknown' = 'healthy';
    if (issues.length > 0) {
      status = 'error';
    } else if (warnings.length > 0 || (historicalData && historicalData.successRate < 90)) {
      status = 'warning';
    }
    
    setHealth({
      status,
      issues,
      warnings,
      recommendations,
      performance,
      historicalData,
    });
    
    setChecking(false);
    
    // Update link health in database if linkId provided
    if (linkId && validation.isValid) {
      await supabase
        .from('links')
        .update({
          health_status: status,
          health_checked_at: new Date().toISOString(),
          sanitized_dest_url: validation.sanitized,
          redirect_chain_length: validation.estimatedHops,
        })
        .eq('id', linkId);
    }
  };

  if (checking) {
    return (
      <Card className="p-4">
        <div className="space-y-3">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-3/4" />
        </div>
      </Card>
    );
  }

  if (!health) return null;

  const StatusIcon = health.status === 'healthy' 
    ? CheckCircle 
    : health.status === 'warning' 
    ? AlertTriangle 
    : AlertCircle;

  const statusColor = health.status === 'healthy' 
    ? 'text-green-500' 
    : health.status === 'warning' 
    ? 'text-yellow-500' 
    : 'text-red-500';

  return (
    <div className="space-y-4">
      {/* Status Summary */}
      <div className="flex items-center gap-3">
        <StatusIcon className={`h-5 w-5 ${statusColor}`} />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">
              {health.status === 'healthy' ? 'Healthy Link' : 
               health.status === 'warning' ? 'Minor Issues Detected' : 
               'Issues Found'}
            </span>
            {health.historicalData && (
              <Badge variant="outline" className="text-xs">
                {health.historicalData.successRate.toFixed(1)}% success rate
              </Badge>
            )}
          </div>
          {health.historicalData && (
            <p className="text-xs text-muted-foreground">
              Avg load time: {health.historicalData.avgLoadTime}ms
            </p>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={checkHealth}
          disabled={checking}
        >
          Recheck
        </Button>
      </div>

      {showDetails && (
        <>
          {/* Issues */}
          {health.issues.length > 0 && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Critical Issues</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1 text-sm">
                  {health.issues.map((issue, i) => (
                    <li key={i}>• {issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Warnings */}
          {health.warnings.length > 0 && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Warnings</AlertTitle>
              <AlertDescription>
                <ul className="mt-2 space-y-1 text-sm">
                  {health.warnings.map((warning, i) => (
                    <li key={i}>• {warning}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Performance Info */}
          {health.status !== 'error' && (
            <Card className="p-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Performance Estimate</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-muted-foreground">Est. redirect time</p>
                    <p className="font-medium">{health.performance.estimatedTime}ms</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Confidence</p>
                    <Badge variant="outline" className="text-xs">
                      {health.performance.confidence}
                    </Badge>
                  </div>
                </div>
                {health.performance.factors.length > 0 && (
                  <div className="text-xs text-muted-foreground">
                    {health.performance.factors.map((factor, i) => (
                      <div key={i}>• {factor}</div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          )}

          {/* Recommendations */}
          {health.recommendations.length > 0 && (
            <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-medium">Recommendations</span>
                </div>
                <ul className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  {health.recommendations.map((rec, i) => (
                    <li key={i}>• {rec}</li>
                  ))}
                </ul>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
