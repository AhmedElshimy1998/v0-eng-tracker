"use client"

import { Subject } from "@/lib/types"
import { useStudy } from "@/lib/study-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProgressCircle } from "@/components/progress-circle"
import { BookOpen, FlaskConical } from "lucide-react"
import Link from "next/link"

interface SubjectCardProps {
  subject: Subject
}

export function SubjectCard({ subject }: SubjectCardProps) {
  const { getSubjectProgress } = useStudy()
  const progress = getSubjectProgress(subject.id)
  
  const lectureCount = subject.lectures.filter((l) => l.type === "lecture").length
  const labCount = subject.lectures.filter((l) => l.type === "lab").length
  const completedCount = subject.lectures.filter((l) => l.status === "completed").length

  return (
    <Link href={`/subjects/${subject.id}`}>
      <Card className="group cursor-pointer transition-all hover:shadow-lg hover:border-primary/50">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div
                className="h-3 w-3 rounded-full"
                style={{ backgroundColor: subject.color }}
              />
              <div>
                <CardTitle className="text-lg group-hover:text-primary transition-colors">
                  {subject.title}
                </CardTitle>
                <p className="text-sm text-muted-foreground">{subject.code}</p>
              </div>
            </div>
            <ProgressCircle
              progress={progress}
              size={56}
              strokeWidth={6}
              color={subject.color}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              <span>{lectureCount} Lectures</span>
            </div>
            <div className="flex items-center gap-2">
              <FlaskConical className="h-4 w-4" />
              <span>{labCount} Labs</span>
            </div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {completedCount} of {subject.lectures.length} completed
            </span>
            <div className="flex gap-1">
              {subject.lectures.slice(0, 5).map((lecture) => (
                <div
                  key={lecture.id}
                  className={`h-2 w-2 rounded-full ${
                    lecture.status === "completed"
                      ? "bg-green-500"
                      : lecture.status === "in-progress"
                      ? "bg-yellow-500"
                      : "bg-red-500"
                  }`}
                />
              ))}
              {subject.lectures.length > 5 && (
                <span className="text-xs text-muted-foreground">+{subject.lectures.length - 5}</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
