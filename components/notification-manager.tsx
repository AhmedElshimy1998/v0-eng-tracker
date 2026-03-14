"use client"

import { useState, useEffect, useCallback } from "react"
import { useStudy } from "@/lib/study-context"
import {
  requestNotificationPermission,
  getNotificationPermission,
  scheduleNotifications,
  getNextClassOccurrences,
  formatTime,
  getDayName,
  registerServiceWorker,
} from "@/lib/notification-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, BellOff, BellRing, Clock, MapPin, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

export function NotificationManager() {
  const { subjects } = useStudy()
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default")
  const [notificationsEnabled, setNotificationsEnabled] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState<
    Array<{ subjectTitle: string; minutesBefore: number; time: Date }>
  >([])

  useEffect(() => {
    const currentPermission = getNotificationPermission()
    setPermission(currentPermission)
    
    if (currentPermission === "granted") {
      const stored = localStorage.getItem("studyhub-notifications-enabled")
      setNotificationsEnabled(stored === "true")
    }

    // Register service worker
    registerServiceWorker()
  }, [])

  useEffect(() => {
    if (notificationsEnabled && permission === "granted") {
      console.log("[v0] Setting up notifications with", subjects.length, "subjects")
      scheduleNotifications(subjects, (subjectId, subjectTitle, minutesBefore) => {
        console.log("[v0] Notification callback fired for", subjectTitle)
        setRecentNotifications((prev) => [
          { subjectTitle, minutesBefore, time: new Date() },
          ...prev.slice(0, 4),
        ])
        toast.info(`${subjectTitle} starts in ${minutesBefore} minutes`, {
          duration: 10000,
          action: {
            label: "Acknowledge",
            onClick: () => {},
          },
        })
      })
    }
  }, [subjects, notificationsEnabled, permission])

  const handleRequestPermission = async () => {
    const result = await requestNotificationPermission()
    setPermission(result)
    
    if (result === "granted") {
      setNotificationsEnabled(true)
      localStorage.setItem("studyhub-notifications-enabled", "true")
      toast.success("Notifications enabled! You'll receive alerts before your classes.")
    } else if (result === "denied") {
      toast.error("Notification permission denied. Please enable it in your browser settings.")
    }
  }

  const handleToggleNotifications = (enabled: boolean) => {
    console.log("[v0] Toggle notifications:", enabled)
    setNotificationsEnabled(enabled)
    localStorage.setItem("studyhub-notifications-enabled", enabled.toString())
    
    if (enabled) {
      console.log("[v0] Enabling notifications, scheduling for", subjects.length, "subjects")
      scheduleNotifications(subjects, (subjectId, subjectTitle, minutesBefore) => {
        setRecentNotifications((prev) => [
          { subjectTitle, minutesBefore, time: new Date() },
          ...prev.slice(0, 4),
        ])
      })
      toast.success("Class notifications enabled")
    } else {
      toast.info("Class notifications disabled")
    }
  }

  const upcomingClasses = getNextClassOccurrences(subjects, 2)

  const getTimeUntil = (date: Date): string => {
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (hours > 24) {
      const days = Math.floor(hours / 24)
      return `in ${days}d ${hours % 24}h`
    }
    if (hours > 0) {
      return `in ${hours}h ${minutes}m`
    }
    return `in ${minutes}m`
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <BellRing className="h-5 w-5" />
          Class Notifications
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {permission === "unsupported" ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <BellOff className="h-4 w-4" />
            <span className="text-sm">Notifications are not supported in this browser</span>
          </div>
        ) : permission === "denied" ? (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3">
            <div className="flex items-center gap-2 text-destructive">
              <BellOff className="h-4 w-4" />
              <span className="text-sm font-medium">Notifications Blocked</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Please enable notifications in your browser settings to receive class reminders.
            </p>
          </div>
        ) : permission === "default" ? (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Enable notifications to receive reminders 30 and 15 minutes before your scheduled classes.
            </p>
            <Button onClick={handleRequestPermission} className="w-full">
              <Bell className="mr-2 h-4 w-4" />
              Enable Notifications
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="notifications" className="text-sm">
                  Class Reminders
                </Label>
              </div>
              <Switch
                id="notifications"
                checked={notificationsEnabled}
                onCheckedChange={handleToggleNotifications}
              />
            </div>
            
            {notificationsEnabled && (
              <div className="rounded-lg border border-green-500/30 bg-green-500/10 p-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-sm font-medium">Notifications Active</span>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  You&apos;ll be notified 30 and 15 minutes before each class.
                </p>
              </div>
            )}
          </div>
        )}

        {upcomingClasses.length > 0 && (
          <div className="space-y-2 pt-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Upcoming Classes
            </p>
            <div className="space-y-2">
              {upcomingClasses.slice(0, 3).map((cls, i) => (
                <div
                  key={`${cls.scheduleId}-${i}`}
                  className="flex items-center justify-between rounded-lg border border-border p-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: cls.subjectColor }}
                    />
                    <div>
                      <p className="text-sm font-medium">{cls.subjectTitle}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{getDayName(cls.dayOfWeek)}</span>
                        <span>{formatTime(cls.time)}</span>
                        {cls.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {cls.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    <Clock className="mr-1 h-3 w-3" />
                    {getTimeUntil(cls.dateTime)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {recentNotifications.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Recent Alerts
            </p>
            <div className="space-y-1">
              {recentNotifications.map((notif, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <BellRing className="h-3 w-3" />
                  <span>
                    {notif.subjectTitle} - {notif.minutesBefore}min reminder
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
