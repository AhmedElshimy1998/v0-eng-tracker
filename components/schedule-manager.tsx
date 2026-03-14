"use client"

import { useState, useEffect } from "react"
import { Subject, DayOfWeek, Schedule } from "@/lib/types"
import { useStudy } from "@/lib/study-context"
import { getDayName, formatTime, scheduleNotifications, getNotificationPermission } from "@/lib/notification-service"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Clock, MapPin, Calendar } from "lucide-react"

interface ScheduleManagerProps {
  subject: Subject
}

const DAYS: { value: DayOfWeek; label: string }[] = [
  { value: 0, label: "Sunday" },
  { value: 1, label: "Monday" },
  { value: 2, label: "Tuesday" },
  { value: 3, label: "Wednesday" },
  { value: 4, label: "Thursday" },
  { value: 5, label: "Friday" },
  { value: 6, label: "Saturday" },
]

export function ScheduleManager({ subject }: ScheduleManagerProps) {
  const { addSchedule, deleteSchedule, subjects } = useStudy()
  const [open, setOpen] = useState(false)
  const [newSchedule, setNewSchedule] = useState<{
    dayOfWeek: DayOfWeek
    time: string
    location: string
  }>({
    dayOfWeek: 0,
    time: "09:00",
    location: "",
  })

  const handleAddSchedule = () => {
    console.log("[v0] Adding schedule for", subject.title)
    addSchedule(subject.id, {
      dayOfWeek: newSchedule.dayOfWeek,
      time: newSchedule.time,
      location: newSchedule.location || undefined,
    })
    
    // Re-schedule notifications if they're enabled
    const notifEnabled = localStorage.getItem("studyhub-notifications-enabled") === "true"
    if (notifEnabled && getNotificationPermission() === "granted") {
      console.log("[v0] Re-scheduling notifications after adding schedule")
      scheduleNotifications(subjects)
    }
    
    setNewSchedule({ dayOfWeek: 0, time: "09:00", location: "" })
    setOpen(false)
    toast.success(`Class added on ${DAYS.find(d => d.value === newSchedule.dayOfWeek)?.label} at ${newSchedule.time}`)
  }

  const handleDeleteSchedule = (scheduleId: string) => {
    deleteSchedule(subject.id, scheduleId)
  }

  const sortedSchedules = [...subject.schedules].sort((a, b) => {
    if (a.dayOfWeek !== b.dayOfWeek) {
      return a.dayOfWeek - b.dayOfWeek
    }
    return a.time.localeCompare(b.time)
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calendar className="h-5 w-5" />
          Weekly Schedule
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Time Slot
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Class Schedule</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="day">Day of Week</Label>
                <Select
                  value={newSchedule.dayOfWeek.toString()}
                  onValueChange={(value) =>
                    setNewSchedule((prev) => ({
                      ...prev,
                      dayOfWeek: parseInt(value) as DayOfWeek,
                    }))
                  }
                >
                  <SelectTrigger id="day">
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    {DAYS.map((day) => (
                      <SelectItem key={day.value} value={day.value.toString()}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={newSchedule.time}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({ ...prev, time: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location (optional)</Label>
                <Input
                  id="location"
                  placeholder="e.g., Room 101"
                  value={newSchedule.location}
                  onChange={(e) =>
                    setNewSchedule((prev) => ({ ...prev, location: e.target.value }))
                  }
                />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancel</Button>
              </DialogClose>
              <Button onClick={handleAddSchedule}>Add Schedule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        {sortedSchedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground">
            <Clock className="h-8 w-8 mb-2" />
            <p className="text-sm">No recurring schedule set</p>
            <p className="text-xs">Add weekly class times to receive notifications</p>
          </div>
        ) : (
          <div className="space-y-2">
            {sortedSchedules.map((schedule) => (
              <div
                key={schedule.id}
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg text-sm font-medium"
                    style={{
                      backgroundColor: `${subject.color}20`,
                      color: subject.color,
                    }}
                  >
                    {getDayName(schedule.dayOfWeek).slice(0, 3)}
                  </div>
                  <div>
                    <p className="font-medium">{getDayName(schedule.dayOfWeek)}</p>
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(schedule.time)}
                      </span>
                      {schedule.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {schedule.location}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => handleDeleteSchedule(schedule.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
