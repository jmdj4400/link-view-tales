import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, CheckCircle, Radio } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface Incident {
  id: string;
  platform: string;
  country: string | null;
  device: string | null;
  error_rate: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detected_at: string;
  resolved_at: string | null;
  sample_size: number;
}

export const IncidentRadar = () => {
  const { data: incidents, isLoading } = useQuery({
    queryKey: ['active-incidents'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .is('resolved_at', null)
        .order('detected_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      return data as Incident[];
    },
    refetchInterval: 60000, // Refresh every minute
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'outline';
    }
  };

  const getSeverityIcon = (severity: string) => {
    const isHigh = severity === 'critical' || severity === 'high';
    return isHigh ? (
      <AlertTriangle className="h-4 w-4" />
    ) : (
      <Radio className="h-4 w-4" />
    );
  };

  const healthStatus = incidents && incidents.length > 0
    ? incidents.some(i => i.severity === 'critical')
      ? 'critical'
      : incidents.some(i => i.severity === 'high')
        ? 'degraded'
        : 'ok'
    : 'ok';

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Radio className="h-5 w-5 text-primary" />
            Incident Radar
          </CardTitle>
          <CardDescription>Loading incident data...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Radio className="h-5 w-5 text-primary" />
                Incident Radar
              </CardTitle>
              <CardDescription>Real-time platform health monitoring</CardDescription>
            </div>
            <Badge
              variant={healthStatus === 'critical' ? 'destructive' : healthStatus === 'degraded' ? 'default' : 'outline'}
              className={cn(
                "gap-1",
                healthStatus === 'ok' && "border-green-500 text-green-500"
              )}
            >
              {healthStatus === 'ok' ? (
                <CheckCircle className="h-3 w-3" />
              ) : (
                <AlertTriangle className="h-3 w-3" />
              )}
              {healthStatus === 'ok' ? 'All systems operational' : `${incidents?.length} active incidents`}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {!incidents || incidents.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-green-500" />
              <p>No active incidents detected</p>
              <p className="text-xs mt-1">All platforms operating normally</p>
            </div>
          ) : (
            <div className="space-y-3">
              {incidents.map((incident) => (
                <Tooltip key={incident.id}>
                  <TooltipTrigger asChild>
                    <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3 flex-1">
                        <Badge variant={getSeverityColor(incident.severity)} className="gap-1">
                          {getSeverityIcon(incident.severity)}
                          {incident.severity}
                        </Badge>
                        <div className="flex-1">
                          <div className="font-medium capitalize">{incident.platform}</div>
                          <div className="text-xs text-muted-foreground">
                            {incident.country && `${incident.country} · `}
                            {incident.device || 'All devices'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-destructive">
                          {incident.error_rate}%
                        </div>
                        <div className="text-xs text-muted-foreground">error rate</div>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="max-w-xs">
                    <div className="space-y-1">
                      <p className="font-medium">Incident Details</p>
                      <p className="text-xs">
                        Detected: {new Date(incident.detected_at).toLocaleString()}
                      </p>
                      <p className="text-xs">
                        Sample size: {incident.sample_size} redirects
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Our firewall is automatically protecting your traffic through this platform
                      </p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
            Incidents are detected every 5 minutes and auto-resolve when normal operation resumes
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
