"use client"

import { useStudy } from "@/lib/study-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CalendarDays, Clock, FileText, GraduationCap } from "lucide-react"
import { useMemo } from "react"

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
    month: "short",
    day: "numeric",
  })
}

export function DeadlinesWidget() {
  const { subjects } = useStudy()

  const upcomingDeadlines = useMemo(() => {
    const deadlines: Array<{
      id: string
      title: string
      subjectTitle: string
      subjectColor: string
      date: string
      type: "exam" | "assignment"
      examType?: string
    }> = []

    subjects.forEach((subject) => {
      subject.exams.forEach((exam) => {
        if (exam.grade === undefined && getDaysUntil(exam.date) >= 0) {
          deadlines.push({
            id: exam.id,
            title: exam.title,
            subjectTitle: subject.title,
            subjectColor: subject.color,
            date: exam.date,
            type: "exam",
            examType: exam.type,
          })
        }
      })
    })

    return deadlines
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5)
  }, [subjects])

  return (
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
                className="flex items-center justify-between rounded-lg border border-border bg-card p-3 transition-colors hover:bg-accent"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${deadline.subjectColor}20` }}
                  >
                    {deadline.type === "exam" ? (
                      <GraduationCap
                        className="h-5 w-5"
                        style={{ color: deadline.subjectColor }}
                      />
                    ) : (
                      <FileText
                        className="h-5 w-5"
                        style={{ color: deadline.subjectColor }}
                      />
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{deadline.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {deadline.subjectTitle}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
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
                      : `${daysUntil} days`}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(deadline.date)}
                  </span>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
