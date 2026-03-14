"use client"

import { useMemo, useState } from "react"
import { useStudy } from "@/lib/study-context"
import { DayOfWeek } from "@/lib/types"
import { getClassesForDate, formatTime, getDayName } from "@/lib/notification-service"
import { NotificationManager } from "@/components/notification-manager"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  GraduationCap,
  FileText,
  BookOpen,
  MapPin,
} from "lucide-react"

function getDaysUntil(dateString: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateString)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  })
}

function getMonthDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const days: Array<{ date: Date | null; isCurrentMonth: boolean }> = []

  // Add padding for days before the first day of the month
  const startPadding = firstDay.getDay()
  for (let i = 0; i < startPadding; i++) {
    days.push({ date: null, isCurrentMonth: false })
  }

  // Add all days of the month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push({ date: new Date(year, month, i), isCurrentMonth: true })
  }

  return days
}

export default function CalendarPage() {
  const { subjects } = useStudy()
  const [currentDate, setCurrentDate] = useState(new Date())

  const allDeadlines = useMemo(() => {
    const deadlines: Array<{
      id: string
      title: string
      subjectTitle: string
      subjectColor: string
      date: string
      type: "exam" | "quiz"
      examType?: string
      grade?: number
      maxGrade: number
    }> = []

    subjects.forEach((subject) => {
      subject.exams.forEach((exam) => {
        deadlines.push({
          id: exam.id,
          title: exam.title,
          subjectTitle: subject.title,
          subjectColor: subject.color,
          date: exam.date,
          type: exam.type === "quiz" ? "quiz" : "exam",
          examType: exam.type,
          grade: exam.grade,
          maxGrade: exam.maxGrade,
        })
      })
    })

    return deadlines.sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    )
  }, [subjects])

  const upcomingDeadlines = allDeadlines.filter(
    (d) => getDaysUntil(d.date) >= 0 && d.grade === undefined
  )

  const pastDeadlines = allDeadlines.filter(
    (d) => getDaysUntil(d.date) < 0 || d.grade !== undefined
  )

  const year = currentDate.getFullYear()
  const month = currentDate.getMonth()
  const monthDays = getMonthDays(year, month)
  const monthName = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  })

  const getDeadlinesForDate = (date: Date) => {
    const dateStr = date.toISOString().split("T")[0]
    return allDeadlines.filter((d) => d.date === dateStr)
  }

  const getScheduledClassesForDate = (date: Date) => {
    return getClassesForDate(subjects, date)
  }

  const previousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1))
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
        <p className="text-muted-foreground">
          View your exams and deadlines at a glance.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">{monthName}</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" onClick={previousMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-1 text-center text-sm font-medium text-muted-foreground mb-2">
                <div>Sun</div>
                <div>Mon</div>
                <div>Tue</div>
                <div>Wed</div>
                <div>Thu</div>
                <div>Fri</div>
                <div>Sat</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((day, i) => {
                  if (!day.date) {
                    return <div key={`empty-${i}`} className="h-28" />
                  }

                  const deadlines = getDeadlinesForDate(day.date)
                  const scheduledClasses = getScheduledClassesForDate(day.date)
                  const isToday =
                    day.date.getTime() === today.getTime()
                  
                  const totalItems = deadlines.length + scheduledClasses.length

                  return (
                    <div
                      key={day.date.toISOString()}
                      className={`h-28 rounded-lg border p-1 overflow-hidden ${
                        isToday
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      <div
                        className={`text-sm font-medium ${
                          isToday ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {day.date.getDate()}
                      </div>
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        {scheduledClasses.slice(0, 2).map((cls, idx) => (
                          <div
                            key={`class-${cls.scheduleId}-${idx}`}
                            className="flex items-center gap-1 rounded px-1 py-0.5 text-xs truncate"
                            style={{
                              backgroundColor: `${cls.subjectColor}15`,
                              color: cls.subjectColor,
                            }}
                          >
                            <BookOpen className="h-3 w-3 shrink-0" />
                            <span className="truncate">{formatTime(cls.time)}</span>
                          </div>
                        ))}
                        {deadlines.slice(0, Math.max(0, 2 - scheduledClasses.length)).map((deadline) => (
                          <div
                            key={deadline.id}
                            className="flex items-center gap-1 rounded px-1 py-0.5 text-xs truncate"
                            style={{
                              backgroundColor: `${deadline.subjectColor}20`,
                              color: deadline.subjectColor,
                            }}
                          >
                            <GraduationCap className="h-3 w-3 shrink-0" />
                            <span className="truncate">{deadline.title}</span>
                          </div>
                        ))}
                        {totalItems > 2 && (
                          <div className="text-xs text-muted-foreground px-1">
                            +{totalItems - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <NotificationManager />
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="past">Past</TabsTrigger>
            </TabsList>
            <TabsContent value="upcoming" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <CalendarDays className="h-5 w-5" />
                    Upcoming Deadlines
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {upcomingDeadlines.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No upcoming deadlines
                    </p>
                  ) : (
                    upcomingDeadlines.map((deadline) => {
                      const daysUntil = getDaysUntil(deadline.date)
                      return (
                        <div
                          key={deadline.id}
                          className="rounded-lg border border-border bg-card p-3"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div
                                className="flex h-10 w-10 items-center justify-center rounded-lg"
                                style={{
                                  backgroundColor: `${deadline.subjectColor}20`,
                                }}
                              >
                                <GraduationCap
                                  className="h-5 w-5"
                                  style={{ color: deadline.subjectColor }}
                                />
                              </div>
                              <div>
                                <p className="text-sm font-medium">
                                  {deadline.title}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {deadline.subjectTitle}
                                </p>
                              </div>
                            </div>
                            <Badge
                              variant={
                                daysUntil <= 3
                                  ? "destructive"
                                  : daysUntil <= 7
                                  ? "secondary"
                                  : "outline"
                              }
                              className="text-xs"
                            >
                              <Clock className="mr-1 h-3 w-3" />
                              {daysUntil === 0
                                ? "Today"
                                : daysUntil === 1
                                ? "Tomorrow"
                                : `${daysUntil}d`}
                            </Badge>
                          </div>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {formatDate(deadline.date)}
                          </p>
                        </div>
                      )
                    })
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="past" className="mt-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    Past Exams
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pastDeadlines.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No past exams
                    </p>
                  ) : (
                    pastDeadlines.map((deadline) => (
                      <div
                        key={deadline.id}
                        className="rounded-lg border border-border bg-card p-3"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="flex h-10 w-10 items-center justify-center rounded-lg"
                              style={{
                                backgroundColor: `${deadline.subjectColor}20`,
                              }}
                            >
                              <GraduationCap
                                className="h-5 w-5"
                                style={{ color: deadline.subjectColor }}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-medium">
                                {deadline.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {deadline.subjectTitle}
                              </p>
                            </div>
                          </div>
                          {deadline.grade !== undefined && (
                            <Badge variant="outline">
                              {deadline.grade}/{deadline.maxGrade}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {formatDate(deadline.date)}
                        </p>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
