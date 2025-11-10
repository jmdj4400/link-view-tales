import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar, Mail, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase-client";
import { useAuth } from "@/contexts/AuthContext";
import { InfoTooltip } from "@/components/ui/info-tooltip";

export function ReportSettings() {
  const { user } = useAuth();
  const [weeklyEnabled, setWeeklyEnabled] = useState(false);
  const [monthlyEnabled, setMonthlyEnabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, [user]);

  const fetchSettings = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('weekly_report_enabled, monthly_report_enabled')
      .eq('id', user.id)
      .single();

    if (!error && data) {
      setWeeklyEnabled(data.weekly_report_enabled || false);
      setMonthlyEnabled(data.monthly_report_enabled || false);
    }
    setIsLoading(false);
  };

  const handleSave = async () => {
    setIsSaving(true);
    
    const { error } = await supabase
      .from('profiles')
      .update({
        weekly_report_enabled: weeklyEnabled,
        monthly_report_enabled: monthlyEnabled,
      })
      .eq('id', user?.id);

    if (error) {
      toast.error("Failed to update report settings");
    } else {
      toast.success("Report settings updated successfully");
    }
    setIsSaving(false);
  };

  const handleTestReport = async (period: 'weekly' | 'monthly') => {
    try {
      const { error } = await supabase.functions.invoke('send-scheduled-report', {
        body: { userId: user?.id, period }
      });

      if (error) throw error;
      toast.success(`Test ${period} report sent to your email`);
    } catch (error) {
      toast.error("Failed to send test report");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          <CardTitle>Scheduled Analytics Reports</CardTitle>
        </div>
        <CardDescription>
          Get automated reports with your key metrics delivered to your email
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="weekly-report">Weekly Reports</Label>
                <InfoTooltip content="Receive a summary of your performance every Monday" />
              </div>
              <p className="text-sm text-muted-foreground">
                Delivered every Monday morning
              </p>
            </div>
            <Switch
              id="weekly-report"
              checked={weeklyEnabled}
              onCheckedChange={setWeeklyEnabled}
            />
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Label htmlFor="monthly-report">Monthly Reports</Label>
                <InfoTooltip content="Receive a comprehensive monthly summary on the 1st of each month" />
              </div>
              <p className="text-sm text-muted-foreground">
                Delivered on the 1st of each month
              </p>
            </div>
            <Switch
              id="monthly-report"
              checked={monthlyEnabled}
              onCheckedChange={setMonthlyEnabled}
            />
          </div>
        </div>

        <div className="flex items-center gap-3 pt-4 border-t">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Save Settings
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTestReport('weekly')}
            disabled={!weeklyEnabled}
          >
            <Mail className="h-4 w-4 mr-2" />
            Test Weekly
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleTestReport('monthly')}
            disabled={!monthlyEnabled}
          >
            <Mail className="h-4 w-4 mr-2" />
            Test Monthly
          </Button>
        </div>

        <div className="bg-muted/50 rounded-lg p-4 flex items-start gap-3">
          <Info className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
          <div className="text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">What's included in reports:</p>
            <ul className="space-y-1 list-disc list-inside">
              <li>Total views, clicks, and CTR</li>
              <li>Top performing links</li>
              <li>Traffic sources breakdown</li>
              <li>Period comparison metrics</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}