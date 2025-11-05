import { usePushNotifications } from "@/hooks/use-push-notifications";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, BellOff, TestTube } from "lucide-react";
import { toast } from "sonner";

export function NotificationSettings() {
  const {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  } = usePushNotifications();

  if (!isSupported) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BellOff className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Push notifications are not supported in your browser
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleToggle = async (enabled: boolean) => {
    if (enabled) {
      if (permission === 'default') {
        const granted = await requestPermission();
        if (!granted) {
          toast.error('Notification permission denied');
          return;
        }
      }
      
      if (permission === 'granted') {
        const sub = await subscribe();
        if (sub) {
          toast.success('Push notifications enabled');
        } else {
          toast.error('Failed to enable push notifications');
        }
      }
    } else {
      await unsubscribe();
      toast.success('Push notifications disabled');
    }
  };

  const handleTest = async () => {
    if (permission !== 'granted') {
      const granted = await requestPermission();
      if (!granted) {
        toast.error('Notification permission required');
        return;
      }
    }
    
    await sendTestNotification();
    toast.success('Test notification sent!');
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5" />
          Push Notifications
        </CardTitle>
        <CardDescription>
          Get notified about new clicks, profile views, and important updates
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="notifications" className="flex flex-col gap-1">
            <span>Enable Notifications</span>
            <span className="text-sm font-normal text-muted-foreground">
              {permission === 'granted' ? 'Notifications allowed' : 
               permission === 'denied' ? 'Notifications blocked' : 
               'Permission not requested'}
            </span>
          </Label>
          <Switch
            id="notifications"
            checked={!!subscription}
            onCheckedChange={handleToggle}
            disabled={permission === 'denied'}
            aria-label="Toggle push notifications"
          />
        </div>

        {subscription && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleTest}
            className="w-full"
            aria-label="Send test notification"
          >
            <TestTube className="h-4 w-4 mr-2" />
            Send Test Notification
          </Button>
        )}

        {permission === 'denied' && (
          <p className="text-sm text-muted-foreground">
            Notifications are blocked. Please enable them in your browser settings.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
