// Service Worker for Azaan PWA
const CACHE_NAME = 'azaan-pwa-v2';
const STATIC_CACHE = 'azaan-static-v2';
const DYNAMIC_CACHE = 'azaan-dynamic-v2';

const STATIC_ASSETS = [
  '/',
  '/assets/azaan.mp3',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/manifest.json'
];

// Install event - cache static resources
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        return self.skipWaiting();
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Fetch event - intelligent caching strategy
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle API requests
  if (url.pathname.includes('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache GET requests
          if (request.method === 'GET') {
            const responseClone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request);
        })
    );
    return;
  }

  // Handle static assets
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        return fetch(request)
          .then((response) => {
            // Cache successful responses
            if (response.status === 200) {
              const responseClone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, responseClone);
              });
            }
            return response;
          });
      })
  );
});

// Notification click event - handle prayer time notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event.notification.tag, 'Action:', event.action);
  event.notification.close();

  if (event.action === 'play-azaan') {
    // Send message to client to play azaan
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          clientList[0].postMessage({
            type: 'PLAY_AZAAN',
            prayer: event.notification.data?.prayer
          });
          return clientList[0].focus();
        }
        return clients.openWindow('/?play-azaan=true');
      })
    );
  } else if (event.action === 'dismiss') {
    // Just close the notification
    return;
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll().then((clientList) => {
        if (clientList.length > 0) {
          return clientList[0].focus();
        }
        return clients.openWindow('/');
      })
    );
  }
});

// Background sync for prayer times
self.addEventListener('sync', (event) => {
  if (event.tag === 'prayer-times-sync') {
    event.waitUntil(syncPrayerTimes());
  }
});

// Message event - handle messages from client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SCHEDULE_PRAYER_NOTIFICATIONS') {
    const prayerTimes = event.data.prayerTimes;
    scheduleNotifications(prayerTimes);
  }
});

// Schedule prayer notifications
function scheduleNotifications(prayerTimes) {
  // Clear existing alarms/timers (simplified approach)
  // In a real app, you'd use proper background scheduling
  if (self.prayerTimers) {
    self.prayerTimers.forEach(timer => clearTimeout(timer));
  }
  self.prayerTimers = [];

  const prayers = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];
  const prayerNames = {
    fajr: 'Fajr',
    dhuhr: 'Dhuhr', 
    asr: 'Asr',
    maghrib: 'Maghrib',
    isha: 'Isha'
  };

  prayers.forEach(prayer => {
    if (prayerTimes[prayer]) {
      const [hours, minutes] = prayerTimes[prayer].split(':');
      const prayerTime = new Date();
      prayerTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // If time has passed today, schedule for tomorrow
      if (prayerTime < new Date()) {
        prayerTime.setDate(prayerTime.getDate() + 1);
      }

      const timeUntilPrayer = prayerTime.getTime() - Date.now();
      
      if (timeUntilPrayer > 0) {
        const timer = setTimeout(() => {
          showPrayerNotification(prayerNames[prayer]);
        }, timeUntilPrayer);
        
        self.prayerTimers.push(timer);
      }
    }
  });
}

// Show prayer notification
function showPrayerNotification(prayerName) {
  const options = {
    body: `It's time for ${prayerName} prayer`,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200, 100, 200],
    tag: 'prayer-notification',
    requireInteraction: true,
    data: { prayer: prayerName },
    actions: [
      {
        action: 'play-azaan',
        title: 'Play Azaan',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  self.registration.showNotification(`${prayerName} Prayer Time`, options);
}

// Sync prayer times when back online
function syncPrayerTimes() {
  console.log('Syncing prayer times...');
  // In a real implementation, this would fetch latest prayer times
  return Promise.resolve();
}

// Push event - handle push notifications (for future server-sent notifications)
self.addEventListener('push', (event) => {
  let data = {};
  
  if (event.data) {
    try {
      data = event.data.json();
    } catch (e) {
      data = { title: 'Prayer Time', body: event.data.text() };
    }
  }

  const options = {
    body: data.body || 'Prayer time notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [200, 100, 200],
    tag: 'prayer-notification',
    requireInteraction: true,
    data: data.data || {},
    actions: [
      {
        action: 'play-azaan',
        title: 'Play Azaan',
        icon: '/icons/icon-192x192.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/icon-192x192.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'Prayer Time', options)
  );
});