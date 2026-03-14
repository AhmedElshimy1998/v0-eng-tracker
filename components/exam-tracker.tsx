"use client"

import { useState } from "react"
import { Subject, Exam } from "@/lib/types"
import { useStudy } from "@/lib/study-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Trash2, Clock, Trophy, GraduationCap } from "lucide-react"

interface ExamTrackerProps {
  subject: Subject
}

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
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

export function ExamTracker({ subject }: ExamTrackerProps) {
  const { addExam, updateExam, deleteExam } = useStudy()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<Exam["type"]>("midterm")
  const [date, setDate] = useState("")
  const [maxGrade, setMaxGrade] = useState("100")

  const handleAddExam = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !date) return

    addExam(subject.id, {
      title: title.trim(),
      type,
      date,
      maxGrade: parseInt(maxGrade) || 100,
    })
    setTitle("")
    setType("midterm")
    setDate("")
    setMaxGrade("100")
    setOpen(false)
  }

  const handleGradeUpdate = (examId: string, gradeValue: string) => {
    const grade = gradeValue ? parseInt(gradeValue) : undefined
    updateExam(subject.id, examId, { grade })
  }

  const sortedExams = [...subject.exams].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-lg">
          <GraduationCap className="h-5 w-5" />
          Exams & Grades
        </CardTitle>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Add Exam
            </Button>
          </DialogTrigger>
          <DialogContent>
            <form onSubmit={handleAddExam}>
              <DialogHeader>
                <DialogTitle>Add Exam</DialogTitle>
                <DialogDescription>
                  Schedule an exam for this subject.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="exam-title">Title</Label>
                  <Input
                    id="exam-title"
                    placeholder="e.g., Midterm Exam"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Type</Label>
                  <Select value={type} onValueChange={(v: Exam["type"]) => setType(v)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quiz">Quiz</SelectItem>
                      <SelectItem value="midterm">Midterm</SelectItem>
                      <SelectItem value="final">Final</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="exam-date">Date</Label>
                  <Input
                    id="exam-date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="max-grade">Max Grade</Label>
                  <Input
                    id="max-grade"
                    type="number"
                    placeholder="100"
                    value={maxGrade}
                    onChange={(e) => setMaxGrade(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Exam</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedExams.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">
            No exams scheduled yet
          </p>
        ) : (
          sortedExams.map((exam) => {
            const daysUntil = getDaysUntil(exam.date)
            const isPast = daysUntil < 0
            const hasGrade = exam.grade !== undefined

            return (
              <div
                key={exam.id}
                className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-4"
              >
                <div className="flex items-center gap-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{exam.title}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {exam.type}
                      </Badge>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {formatDate(exam.date)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {!isPast && !hasGrade && (
                    <Badge
                      variant={
                        daysUntil <= 3
                          ? "destructive"
                          : daysUntil <= 7
                          ? "secondary"
                          : "outline"
                      }
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      {daysUntil === 0
                        ? "Today"
                        : daysUntil === 1
                        ? "Tomorrow"
                        : `${daysUntil} days`}
                    </Badge>
                  )}

                  {(isPast || hasGrade) && (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="--"
                        value={exam.grade ?? ""}
                        onChange={(e) => handleGradeUpdate(exam.id, e.target.value)}
                        className="w-16 h-8 text-center"
                        max={exam.maxGrade}
                        min={0}
                      />
                      <span className="text-sm text-muted-foreground">
                        / {exam.maxGrade}
                      </span>
                    </div>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => deleteExam(subject.id, exam.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )
          })
        )}
      </CardContent>
    </Card>
  )
}
