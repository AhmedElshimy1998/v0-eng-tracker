"use client"
import { savePushSubscription } from "./actions"
import { Subject, DayOfWeek } from "./types"

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

export function getDayName(day: DayOfWeek): string {
  return DAY_NAMES[day]
}

export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number)
  const period = hours >= 12 ? "PM" : "AM"
  const displayHours = hours % 12 || 12
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    console.warn("This browser does not support notifications")
    return "denied"
  }
  
  if (Notification.permission === "granted") {
    return "granted"
  }
  
  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission
  }
  
  return Notification.permission
}

export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!("Notification" in window)) {
    return "unsupported"
  }
  return Notification.permission
}

interface ClassOccurrence {
  subjectId: string
  subjectTitle: string
  subjectCode: string
  subjectColor: string
  scheduleId: string
  dayOfWeek: DayOfWeek
  time: string
  location?: string
  dateTime: Date
}

export function getNextClassOccurrences(
  subjects: Subject[],
  daysAhead: number = 7
): ClassOccurrence[] {
  const occurrences: ClassOccurrence[] = []
  const now = new Date()
  
  for (let dayOffset = 0; dayOffset < daysAhead; dayOffset++) {
    const date = new Date(now)
    date.setDate(date.getDate() + dayOffset)
    const dayOfWeek = date.getDay() as DayOfWeek
    
    subjects.forEach((subject) => {
      subject.schedules.forEach((schedule) => {
        if (schedule.dayOfWeek === dayOfWeek) {
          const [hours, minutes] = schedule.time.split(":").map(Number)
          const classDateTime = new Date(date)
          classDateTime.setHours(hours, minutes, 0, 0)
          
          // Only include future classes
          if (classDateTime > now) {
            occurrences.push({
              subjectId: subject.id,
              subjectTitle: subject.title,
              subjectCode: subject.code,
              subjectColor: subject.color,
              scheduleId: schedule.id,
              dayOfWeek: schedule.dayOfWeek,
              time: schedule.time,
              location: schedule.location,
              dateTime: classDateTime,
            })
          }
        }
      })
    })
  }
  
  return occurrences.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
}

export function getClassesForDate(
  subjects: Subject[],
  date: Date
): ClassOccurrence[] {
  const dayOfWeek = date.getDay() as DayOfWeek
  const occurrences: ClassOccurrence[] = []
  
  subjects.forEach((subject) => {
    subject.schedules.forEach((schedule) => {
      if (schedule.dayOfWeek === dayOfWeek) {
        const [hours, minutes] = schedule.time.split(":").map(Number)
        const classDateTime = new Date(date)
        classDateTime.setHours(hours, minutes, 0, 0)
        
        occurrences.push({
          subjectId: subject.id,
          subjectTitle: subject.title,
          subjectCode: subject.code,
          subjectColor: subject.color,
          scheduleId: schedule.id,
          dayOfWeek: schedule.dayOfWeek,
          time: schedule.time,
          location: schedule.location,
          dateTime: classDateTime,
        })
      }
    })
  })
  
  return occurrences.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime())
}

interface ScheduledNotificationTimer {
  subjectId: string
  scheduleId: string
  minutesBefore: number
  timeoutId: ReturnType<typeof setTimeout>
  scheduledFor: Date
}

// Store timers in module scope to persist across component re-renders
let activeTimers: ScheduledNotificationTimer[] = []
let acknowledgedNotifications: Set<string> = new Set()

function getNotificationKey(
  subjectId: string,
  scheduleId: string,
  minutesBefore: number,
  dateTime: Date
): string {
  // Use a more deterministic key format
  const dateKey = `${dateTime.getFullYear()}-${dateTime.getMonth()}-${dateTime.getDate()}-${dateTime.getHours()}-${dateTime.getMinutes()}`
  return `${subjectId}-${scheduleId}-${minutesBefore}-${dateKey}`
}

export function showNotification(
  title: string,
  body: string,
  tag: string,
  requireInteraction: boolean = true,
  onAcknowledge?: () => void
): Notification | null {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return null
  }
  
  const notification = new Notification(title, {
    body,
    tag,
    requireInteraction,
    icon: "/icon.svg",
  })
  
  notification.onclick = () => {
    window.focus()
    notification.close()
    if (onAcknowledge) {
      onAcknowledge()
    }
  }
  
  return notification
}

export function scheduleNotifications(
  subjects: Subject[],
  onNotificationShown?: (subjectId: string, subjectTitle: string, minutesBefore: number) => void
): void {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    console.log("[v0] Notifications not available or not granted")
    return
  }
  
  // Only clear timers that are already passed
  activeTimers = activeTimers.filter((t) => t.scheduledFor.getTime() > Date.now())
  
  const occurrences = getNextClassOccurrences(subjects, 7)
  const now = new Date()
  const notificationTimes = [30, 15] // minutes before class
  
  console.log("[v0] Scheduling notifications for", occurrences.length, "upcoming classes")
  
  occurrences.forEach((occurrence) => {
    notificationTimes.forEach((minutesBefore) => {
      const notifyTime = new Date(occurrence.dateTime.getTime() - minutesBefore * 60 * 1000)
      const msUntilNotification = notifyTime.getTime() - now.getTime()
      
      // Only schedule if the notification time is in the future
      if (msUntilNotification > 0) {
        const notificationKey = getNotificationKey(
          occurrence.subjectId,
          occurrence.scheduleId,
          minutesBefore,
          occurrence.dateTime
        )
        
        // Skip if already acknowledged
        if (acknowledgedNotifications.has(notificationKey)) {
          return
        }
        
        // Skip if already scheduled
        const alreadyScheduled = activeTimers.some((t) =>
          t.subjectId === occurrence.subjectId &&
          t.scheduleId === occurrence.scheduleId &&
          t.minutesBefore === minutesBefore &&
          Math.abs(t.scheduledFor.getTime() - notifyTime.getTime()) < 1000
        )
        
        if (alreadyScheduled) {
          console.log("[v0] Notification already scheduled for", occurrence.subjectTitle, minutesBefore, "minutes before")
          return
        }
        
        console.log("[v0] Scheduling notification for", occurrence.subjectTitle, "in", Math.round(msUntilNotification / 1000 / 60), "minutes")
        
        const timeoutId = setTimeout(() => {
          const title = `${occurrence.subjectTitle} in ${minutesBefore} minutes`
          const body = occurrence.location
            ? `Class at ${formatTime(occurrence.time)} in ${occurrence.location}`
            : `Class starts at ${formatTime(occurrence.time)}`
          
          console.log("[v0] Showing notification:", title)
          
          showNotification(
            title,
            body,
            notificationKey,
            true,
            () => {
              acknowledgedNotifications.add(notificationKey)
            }
          )
          
          if (onNotificationShown) {
            onNotificationShown(occurrence.subjectId, occurrence.subjectTitle, minutesBefore)
          }
          
          // Remove this timer from active list
          activeTimers = activeTimers.filter(
            (t) => t.timeoutId !== timeoutId
          )
        }, msUntilNotification)
        
        activeTimers.push({
          subjectId: occurrence.subjectId,
          scheduleId: occurrence.scheduleId,
          minutesBefore,
          timeoutId,
          scheduledFor: notifyTime,
        })
      }
    })
  })
}

export function clearAllScheduledNotifications(): void {
  activeTimers.forEach((timer) => {
    clearTimeout(timer.timeoutId)
  })
  activeTimers = []
}

export function getActiveTimersCount(): number {
  return activeTimers.length
}

export function acknowledgeNotification(
  subjectId: string,
  scheduleId: string,
  minutesBefore: number,
  dateTime: Date
): void {
  const key = getNotificationKey(subjectId, scheduleId, minutesBefore, dateTime)
  acknowledgedNotifications.add(key)
}

// Service Worker registration for background notifications
// دالة لتحويل المفتاح العام لصيغة يفهمها المتصفح
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/')
  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }
  return outputArray
}

export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
    console.warn("Push notifications are not supported")
    return null
  }
  
  try {
    const registration = await navigator.serviceWorker.register("/sw.js")
    await navigator.serviceWorker.ready

    const existingSubscription = await registration.pushManager.getSubscription()
    if (existingSubscription) {
      await savePushSubscription(existingSubscription)
      return registration
    }

    const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!publicVapidKey) return registration

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
    })

    await savePushSubscription(subscription)
    
    return registration
  } catch (error) {
    console.error("Service worker registration/subscription failed:", error)
    return null
  }
}
