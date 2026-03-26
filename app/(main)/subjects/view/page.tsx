"use client"
export const dynamic = 'force-static'
import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
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
import { ArrowLeft, Trash2, BookOpen, CheckCircle2, Clock, XCircle, Loader2 } from "lucide-react"

// 1. فصلنا المحتوى في Component داخلي عشان نقدر نستخدم useSearchParams بأمان
function SubjectDetailContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const id = searchParams.get("id") // سحبنا الـ ID من الرابط: ?id=...
  
  const { subjects, deleteSubject, getSubjectProgress, reorderLectures, isLoading } = useStudy()
  
  const [isDeleting, setIsDeleting] = useState(false)
  const subject = subjects.find((s) => s.id === id)

  if (isLoading) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">جاري تحميل بيانات المادة...</p>
      </div>
    )
  }

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
        <h1 className="text-2xl font-bold">المادة غير موجودة</h1>
        <p className="text-muted-foreground mt-2">
          المادة التي تبحث عنها غير موجودة أو تم حذفها.
        </p>
        <Button className="mt-4" onClick={() => router.push("/subjects")}>
          العودة للمواد
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
    setIsDeleting(true) 
    deleteSubject(subject!.id) 
    router.push("/subjects") 
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
              حذف المادة
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>حذف المادة</AlertDialogTitle>
              <AlertDialogDescription>
                هل أنت متأكد من رغبتك في حذف مادة &quot;{subject.title}&quot;؟ هذا الإجراء لا يمكن التراجع عنه وسيحذف جميع المحاضرات والمهام والامتحانات الخاصة بها.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>إلغاء</AlertDialogCancel>
              <AlertDialogAction onClick={handleDelete}>حذف</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التقدم</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center py-2">
              <ProgressCircle progress={progress} size={80} color={subject.color} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مكتمل</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">محاضرة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد الدراسة</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">محاضرة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">لم تبدأ</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.notStarted}</div>
            <p className="text-xs text-muted-foreground">محاضرة</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">المحاضرات والسكاشن</h2>
            <AddLectureDialog subjectId={subject.id} />
          </div>

          {sortedLectures.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">لا يوجد محاضرات</h3>
                <p className="text-sm text-muted-foreground">
                  أضف أول محاضرة لتبدأ المذاكرة
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

// 2. المكون الأساسي اللي هيتم تصديره وتغليفه بـ Suspense
export default function SubjectDetailPage() {
  return (
    <Suspense fallback={
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">جاري تحميل بيانات المادة...</p>
      </div>
    }>
      <SubjectDetailContent />
    </Suspense>
  )
}