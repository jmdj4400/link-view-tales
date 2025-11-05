import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Info, X, XCircle } from "lucide-react";
import { toast } from "sonner";

interface ChannelAlert {
  id: string;
  platform: string;
  alert_type: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  recommendation: string | null;
  acknowledged: boolean;
  created_at: string;
}

export function ChannelAlerts() {
  const [alerts, setAlerts] = useState<ChannelAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data } = await supabase
        .from('channel_alerts')
        .select('*')
        .eq('user_id', user.user.id)
        .eq('acknowledged', false)
        .order('created_at', { ascending: false })
        .limit(5);

      setAlerts((data || []) as ChannelAlert[]);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const acknowledgeAlert = async (alertId: string) => {
    try {
      const { error } = await supabase
        .from('channel_alerts')
        .update({ acknowledged: true })
        .eq('id', alertId);

      if (error) throw error;

      setAlerts(prev => prev.filter(a => a.id !== alertId));
      toast.success('Alert dismissed');
    } catch (error) {
      console.error('Error acknowledging alert:', error);
      toast.error('Failed to dismiss alert');
    }
  };

  if (loading || alerts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {alerts.map(alert => {
        const Icon = alert.severity === 'critical' ? XCircle : 
                     alert.severity === 'warning' ? AlertTriangle : Info;
        
        const variant = alert.severity === 'critical' ? 'destructive' : 'default';

        return (
          <Alert key={alert.id} variant={variant}>
            <Icon className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              <span>{alert.platform} - {alert.alert_type.replace(/_/g, ' ')}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => acknowledgeAlert(alert.id)}
                className="h-6 w-6 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </AlertTitle>
            <AlertDescription className="space-y-2">
              <p>{alert.message}</p>
              {alert.recommendation && (
                <p className="text-sm font-medium">
                  💡 Recommendation: {alert.recommendation}
                </p>
              )}
            </AlertDescription>
          </Alert>
        );
      })}
    </div>
  );
}