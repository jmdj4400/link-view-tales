import { useEffect, useState } from "react";
import { WifiOff, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Offline() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (isOnline) {
      window.location.reload();
    }
  }, [isOnline]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-muted flex items-center justify-center">
            <WifiOff className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle className="text-2xl">You're Offline</CardTitle>
          <CardDescription>
            No internet connection detected. Some features may be limited.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-medium mb-2">Available Offline:</h3>
            <ul className="space-y-1 text-sm text-muted-foreground">
              <li>• View previously loaded content</li>
              <li>• Access cached pages</li>
              <li>• Browse your profile settings</li>
            </ul>
          </div>
          <Button 
            className="w-full" 
            onClick={() => window.location.reload()}
            aria-label="Retry connection"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Connection
          </Button>
          {isOnline && (
            <p className="text-sm text-center text-muted-foreground">
              Connection restored! Reloading...
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
