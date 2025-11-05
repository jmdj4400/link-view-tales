import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Shield, Crown } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";

export const FirewallToggle = () => {
  const queryClient = useQueryClient();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('firewall_enabled, plan')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update({ firewall_enabled: enabled })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: (_, enabled) => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      toast({
        title: enabled ? "Firewall Enabled" : "Firewall Disabled",
        description: enabled
          ? "Your traffic is now protected by our AI firewall"
          : "Traffic protection has been disabled",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const isPro = profile?.plan === 'pro';
  const isEnabled = profile?.firewall_enabled || false;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Social Traffic Firewall™</CardTitle>
          </div>
          {isPro && (
            <Badge variant="outline" className="gap-1">
              <Crown className="h-3 w-3" />
              Pro Feature
            </Badge>
          )}
        </div>
        <CardDescription>
          Automatically detect and prevent redirect failures before they happen
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium">Enable Firewall Protection</p>
              <p className="text-xs text-muted-foreground">
                AI-powered risk detection for Instagram, TikTok, and other in-app browsers
              </p>
            </div>
            <Switch
              checked={isEnabled}
              onCheckedChange={(checked) => toggleMutation.mutate(checked)}
              disabled={!isPro || toggleMutation.isPending}
            />
          </div>

          {!isPro && (
            <div className="p-3 rounded-lg bg-accent/50 border border-accent">
              <p className="text-sm text-muted-foreground">
                <Crown className="h-4 w-4 inline mr-1" />
                Upgrade to Pro to unlock the Traffic Firewall and protect your clicks from redirect failures
              </p>
            </div>
          )}

          {isPro && isEnabled && (
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
              <p className="text-sm">
                ✓ Firewall is active and protecting your traffic
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                High-risk clicks are automatically rerouted through safe fallback pages
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
