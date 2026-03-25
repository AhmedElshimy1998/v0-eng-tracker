"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useStudy } from "@/lib/study-context"
import { LectureItem } from "@/components/lecture-item"
import { AddLectureDialog } from "@/components/add-lecture-dialog"
import { ExamTracker } from "@/components/exam-tracker"
import { ScheduleManager } from "@/components/schedule-manager"
import { ProgressCircle } from "@/components/progress-circle"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { ArrowLeft, Trash2, BookOpen, CheckCircle2, Clock, XCircle } from "lucide-react"

interface SubjectDetailPageProps {
  params: Promise<{ id: string }>
}

export default function SubjectDetailPage({ params }: SubjectDetailPageProps) {
  const { id } = use(params)
  const router = useRouter()
  const { subjects, deleteSubject, getSubjectProgress, reorderLectures } = useStudy()
  
  const [isDeleting, setIsDeleting] = useState(false)
  const subject = subjects.find((s) => s.id === id)

  if (!subject) {

    if (isDeleting) {
      return (
        <div className="flex flex-col items-center justify-center py-24">
          <p className="text-muted-foreground animate-pulse text-lg font-medium">
            جاري حذف المادة والعودة...
          </p>
        </div>
      )
    }
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <h1 className="text-2xl font-bold">Subject not found</h1>
        <p className="text-muted-foreground mt-2">
          The subject you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button className="mt-4" onClick={() => router.push("/subjects")}>
          Back to Subjects
        </Button>
      </div>
    )
  }

  const progress = getSubjectProgress(subject.id)
  const sortedLectures = [...subject.lectures].sort((a, b) => a.order - b.order)

  const stats = {
    completed: subject.lectures.filter((l) => l.status === "completed").length,
    inProgress: subject.lectures.filter((l) => l.status === "in-progress").length,
    notStarted: subject.lectures.filter((l) => l.status === "not-started").length,
  }

  const handleDelete = () => {
    setIsDeleting(true) // نفعل حالة الحذف أولاً
    deleteSubject(subject!.id) // مسح المادة
    router.push("/subjects") // التوجيه للصفحة الرئيسية
  }

  const handleMoveUp = (index: number) => {
    if (index > 0) {
      reorderLectures(subject.id, index, index - 1)
    }
  }

  const handleMoveDown = (index: number) => {
    if (index < sortedLectures.length - 1) {
      reorderLectures(subject.id, index, index + 1)
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push("/subjects")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-4">
            <div
              className="h-4 w-4 rounded-full"
              style={{ backgroundColor: subject.color }}
            />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{subject.title}</h1>
              <p className="text-muted-foreground">{subject.code}</p>
            </div>
          </div>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm">
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Subject
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Subject</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete &quot;{subject.title}&quot;? This action cannot
                be undone and will remove all lectures, notes, and exams.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-2">
              <ProgressCircle progress={progress} size={80} color={subject.color} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">lectures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">lectures</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Started</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notStarted}</div>
            <p className="text-xs text-muted-foreground">lectures</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Lectures & Labs</h2>
            <AddLectureDialog subjectId={subject.id} />
          </div>

          {sortedLectures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">No lectures yet</h3>
                <p className="text-sm text-muted-foreground">
                  Add your first lecture to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {sortedLectures.map((lecture, index) => (
                <LectureItem
                  key={lecture.id}
                  lecture={lecture}
                  subjectId={subject.id}
                  index={index}
                  totalLectures={sortedLectures.length}
                  onMoveUp={() => handleMoveUp(index)}
                  onMoveDown={() => handleMoveDown(index)}
                />
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <ScheduleManager subject={subject} />
          <ExamTracker subject={subject} />
        </div>
      </div>
    </div>
  )
}
