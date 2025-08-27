// Notification Service for Prayer Time Notifications
export class NotificationService {
  private static instance: NotificationService;
  private registration: ServiceWorkerRegistration | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  // Initialize service worker and notifications
  async initialize(): Promise<boolean> {
    try {
      // Register service worker
      if ('serviceWorker' in navigator) {
        this.registration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service Worker registered successfully');

        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage);
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize notification service:', error);
      return false;
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return 'denied';
    }

    let permission = Notification.permission;

    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    return permission;
  }

  // Check if notifications are supported and enabled
  isNotificationSupported(): boolean {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  // Check notification permission status
  getPermissionStatus(): NotificationPermission {
    return Notification.permission;
  }

  // Schedule prayer notifications
  async schedulePrayerNotifications(prayerTimes: Record<string, string>): Promise<void> {
    if (!this.registration || Notification.permission !== 'granted') {
      console.warn('Notifications not available or not permitted');
      return;
    }

    // Send prayer times to service worker for scheduling
    navigator.serviceWorker.controller?.postMessage({
      type: 'SCHEDULE_PRAYER_NOTIFICATIONS',
      prayerTimes
    });

    console.log('Prayer notifications scheduled:', prayerTimes);
  }

  // Show immediate test notification
  async showTestNotification(): Promise<void> {
    if (!this.registration || Notification.permission !== 'granted') {
      throw new Error('Notifications not available or not permitted');
    }

    await this.registration.showNotification('Azaan PWA Test', {
      body: 'Notifications are working correctly!',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      tag: 'test-notification',
      requireInteraction: false
    } as any);
  }

  // Handle messages from service worker
  private handleServiceWorkerMessage = (event: MessageEvent) => {
    const { data } = event;
    
    if (data.type === 'PLAY_AZAAN') {
      this.playAzaan(data.prayer);
    }
  };

  // Play Azaan audio
  private async playAzaan(prayerName?: string): Promise<void> {
    try {
      const audio = new Audio('/assets/azaan.mp3');
      audio.volume = 0.8;
      
      // Show visual feedback
      console.log(`Playing Azaan for ${prayerName || 'prayer time'}`);
      
      await audio.play();
      
      // Optional: Show a modal or toast when playing
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('azaan-playing', {
          detail: { prayer: prayerName }
        }));
      }
    } catch (error) {
      console.error('Failed to play Azaan:', error);
    }
  }

  // Clear all scheduled notifications
  clearNotifications(): void {
    navigator.serviceWorker.controller?.postMessage({
      type: 'CLEAR_NOTIFICATIONS'
    });
  }

  // Get installation prompt availability
  canInstallPWA(): boolean {
    return 'beforeinstallprompt' in window;
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Types for better TypeScript support
export interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface NotificationOptions {
  title: string;
  body: string;
  prayer?: string;
  icon?: string;
  requireInteraction?: boolean;
}