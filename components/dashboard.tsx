"use client"

import { useStudy } from "@/lib/study-context"
import { SubjectCard } from "@/components/subject-card"
import { DeadlinesWidget } from "@/components/deadlines-widget"
import { NewsWidget } from "@/components/news-widget"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, CheckCircle2, Clock, GraduationCap } from "lucide-react"
import { useMemo } from "react"

export function Dashboard() {
  const { subjects } = useStudy()

  const stats = useMemo(() => {
    let totalLectures = 0
    let completedLectures = 0
    let inProgressLectures = 0
    let totalExams = 0

    subjects.forEach((subject) => {
      totalLectures += subject.lectures.length
      completedLectures += subject.lectures.filter(
        (l) => l.status === "completed"
      ).length
      inProgressLectures += subject.lectures.filter(
        (l) => l.status === "in-progress"
      ).length
      totalExams += subject.exams.length
    })

    return {
      totalSubjects: subjects.length,
      totalLectures,
      completedLectures,
      inProgressLectures,
      totalExams,
      overallProgress:
        totalLectures > 0
          ? Math.round((completedLectures / totalLectures) * 100)
          : 0,
    }
  }, [subjects])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Track your academic progress.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Subjects</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalLectures} total lectures
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedLectures}</div>
            <p className="text-xs text-muted-foreground">
              lectures completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgressLectures}</div>
            <p className="text-xs text-muted-foreground">
              lectures in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Progress</CardTitle>
            <GraduationCap className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.overallProgress}%</div>
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className="h-full bg-primary transition-all"
                style={{ width: `${stats.overallProgress}%` }}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold">Your Subjects</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {subjects.map((subject) => (
              <SubjectCard 
                key={subject.id} 
                subject={subject} 
              />
            ))}
            {subjects.length === 0 && (
              <Card className="col-span-full">
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <BookOpen className="h-12 w-12 text-muted-foreground" />
                  <h3 className="mt-4 text-lg font-semibold">No subjects yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Add your first subject to get started
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <NewsWidget />
          <DeadlinesWidget />
        </div>
      </div>
    </div>
  )
}
