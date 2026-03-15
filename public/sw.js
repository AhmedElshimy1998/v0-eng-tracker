// Service Worker for StudyHub Notifications

const CACHE_NAME = "studyhub-v1"

self.addEventListener("install", (event) => {
  self.skipWaiting()
})

self.addEventListener("activate", (event) => {
  event.waitUntil(clients.claim())
})

// 1. الحدث الجديد: استقبال الإشعار من السيرفر (Push Event)
// ده اللي هيصحي المتصفح والموقع مقفول
self.addEventListener("push", (event) => {
  // استقبال البيانات الجاية من السيرفر
  const data = event.data ? event.data.json() : {};
  const title = data.title || "تنبيه Engineering Tracker";
  
  const options = {
    body: data.body || "لديك محاضرة قريبة!",
    icon: "/icon.svg",
    badge: "/icon.svg",
    vibrate: [200, 100, 200],
    requireInteraction: true, // يفضل موجود لحد ما المستخدم يتفاعل معاه
    data: { 
      url: data.url || "/" 
    },
    actions: [
      { action: "acknowledge", title: "Acknowledge" },
      { action: "dismiss", title: "Dismiss" },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// 2. التحكم في الضغط على الإشعار (مدمج ومحسن)
self.addEventListener("notificationclick", (event) => {
  const action = event.action;
  
  // نقفل الإشعار أول ما نضغط عليه
  event.notification.close();

  // لو المستخدم ضغط Dismiss، منعملش حاجة تانية
  if (action === "dismiss") {
    return;
  }

  // في حالة الضغط العادي أو Acknowledge، نفتح الموقع
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((clientList) => {
      // لو الموقع مفتوح في تاب، نروح للتاب ده
      for (const client of clientList) {
        if (client.url.includes(self.registration.scope) && "focus" in client) {
          return client.focus();
        }
      }
      // لو الموقع مقفول خالص، نفتح تاب جديد
      if (clients.openWindow) {
        const targetUrl = event.notification.data && event.notification.data.url 
          ? event.notification.data.url 
          : "/";
        return clients.openWindow(targetUrl);
      }
    })
  );
});