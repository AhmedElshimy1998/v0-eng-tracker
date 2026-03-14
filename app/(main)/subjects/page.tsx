"use client"

import { useStudy } from "@/lib/study-context"
import { SubjectCard } from "@/components/subject-card"
import { AddSubjectDialog } from "@/components/add-subject-dialog"
import { Card, CardContent } from "@/components/ui/card"
import { BookOpen } from "lucide-react"

export default function SubjectsPage() {
  const { subjects } = useStudy()

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Subjects</h1>
          <p className="text-muted-foreground">
            Manage your courses and track progress.
          </p>
        </div>
        <AddSubjectDialog />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {subjects.map((subject) => (
          <SubjectCard key={subject.id} subject={subject} />
        ))}
        {subjects.length === 0 && (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-semibold">No subjects yet</h3>
              <p className="text-sm text-muted-foreground">
                Click &quot;Add Subject&quot; to create your first course
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
