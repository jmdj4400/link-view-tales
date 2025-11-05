import { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { ToastAction, type ToastActionElement } from '@/components/ui/toast';

export const useServiceWorkerUpdate = () => {
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      // Listen for messages from the service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'SW_UPDATED') {
          // Show toast notification with reload action
          const action: ToastActionElement = (
            <ToastAction onClick={() => window.location.reload()} altText="Reload to update">
              Reload
            </ToastAction>
          );
          
          toast({
            title: "Update Available",
            description: "A new version is available. Reload to update.",
            action,
            duration: Infinity, // Don't auto-dismiss
          });
        }
      });

      // Check for updates on page load
      navigator.serviceWorker.ready.then((registration) => {
        registration.update();
      });
    }
  }, []);
};
