import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Monitor, Smartphone, Tablet } from "lucide-react";

interface DeviceBrowserStatsProps {
  deviceStats: Array<{ type: string; count: number; percentage: number }>;
  browserStats: Array<{ name: string; count: number; percentage: number }>;
}

export function DeviceBrowserStats({ deviceStats, browserStats }: DeviceBrowserStatsProps) {
  const getDeviceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Tablet className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
          <CardDescription>Traffic by device type</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {deviceStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No device data yet
              </p>
            ) : (
              deviceStats.map((device) => (
                <div key={device.type} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {getDeviceIcon(device.type)}
                      <span className="font-medium">{device.type}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{device.count}</span>
                      <span className="font-medium">{device.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${device.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Browser Breakdown</CardTitle>
          <CardDescription>Traffic by browser</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {browserStats.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No browser data yet
              </p>
            ) : (
              browserStats.map((browser) => (
                <div key={browser.name} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{browser.name}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">{browser.count}</span>
                      <span className="font-medium">{browser.percentage.toFixed(1)}%</span>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all"
                      style={{ width: `${browser.percentage}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
