// Service Worker for StudyHub Notifications

const CACHE_NAME = "studyhub-v1"

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})

// Handle notification clicks
self.addEventListener("notificationclick", (event) => {
  event.notification.close()
  
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          return client.focus()
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    })
  )
})

// Handle messages from the main app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SCHEDULE_NOTIFICATION") {
    const { title, body, tag, delay, requireInteraction } = event.data
    
    setTimeout(() => {
      self.registration.showNotification(title, {
        body,
        tag,
        requireInteraction: requireInteraction !== false,
        icon: "/icon.svg",
        badge: "/icon.svg",
        actions: [
          { action: "acknowledge", title: "Acknowledge" },
          { action: "dismiss", title: "Dismiss" },
        ],
      })
    }, delay)
  }
})

// Handle notification actions
self.addEventListener("notificationclick", (event) => {
  const action = event.action
  
  if (action === "acknowledge" || action === "dismiss") {
    event.notification.close()
  }
  
  // Always try to focus or open the app
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if ("focus" in client) {
          return client.focus()
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/")
      }
    })
  )
})
