import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logger';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(null);

  useEffect(() => {
    setIsSupported('Notification' in window && 'serviceWorker' in navigator && 'PushManager' in window);
    
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async () => {
    if (!isSupported) {
      logger.error('Push notifications not supported');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      logger.error('Error requesting notification permission', error);
      return false;
    }
  };

  const subscribe = async () => {
    if (!isSupported || permission !== 'granted') {
      return null;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Check if already subscribed
      const existingSubscription = await registration.pushManager.getSubscription();
      if (existingSubscription) {
        setSubscription(existingSubscription);
        return existingSubscription;
      }

      // Subscribe to push notifications
      const vapidKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || '';
      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey as BufferSource,
      });

      setSubscription(newSubscription);

      // Store subscription locally (database storage would require custom table)
      if (newSubscription) {
        try {
          const subscriptionData = JSON.stringify(newSubscription.toJSON());
          localStorage.setItem('push-subscription', subscriptionData);
        } catch (err) {
          logger.error('Failed to store push subscription', err);
        }
      }

      return newSubscription;
    } catch (error) {
      logger.error('Error subscribing to push notifications', error);
      return null;
    }
  };

  const unsubscribe = async () => {
    if (!subscription) return;

    try {
      await subscription.unsubscribe();
      setSubscription(null);

      // Remove from local storage
      try {
        localStorage.removeItem('push-subscription');
      } catch (err) {
        logger.error('Failed to remove push subscription', err);
      }
    } catch (error) {
      logger.error('Error unsubscribing from push notifications', error);
    }
  };

  const sendTestNotification = async () => {
    if (permission !== 'granted') return;

    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('LinkPeek', {
        body: 'Push notifications are working!',
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'test-notification',
        requireInteraction: false,
      });
    } catch (error) {
      logger.error('Error showing test notification', error);
    }
  };

  return {
    isSupported,
    permission,
    subscription,
    requestPermission,
    subscribe,
    unsubscribe,
    sendTestNotification,
  };
}

// Helper function to convert VAPID key
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}
