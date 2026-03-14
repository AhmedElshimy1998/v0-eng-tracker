"use client"

import { useState } from "react"
import { useStudy } from "@/lib/study-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Plus, BookOpen, FlaskConical } from "lucide-react"

interface AddLectureDialogProps {
  subjectId: string
}

export function AddLectureDialog({ subjectId }: AddLectureDialogProps) {
  const { addLecture } = useStudy()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [type, setType] = useState<"lecture" | "lab">("lecture")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    addLecture(subjectId, {
      title: title.trim(),
      type,
      status: "not-started",
      notes: "",
      resources: [],
      tasks: [],
    })
    setTitle("")
    setType("lecture")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Lecture
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Lecture</DialogTitle>
            <DialogDescription>
              Add a lecture or lab session to this subject.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="lecture-title">Title</Label>
              <Input
                id="lecture-title"
                placeholder="e.g., Introduction to Arrays"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label>Type</Label>
              <RadioGroup
                value={type}
                onValueChange={(value: "lecture" | "lab") => setType(value)}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lecture" id="lecture" />
                  <Label
                    htmlFor="lecture"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <BookOpen className="h-4 w-4" />
                    Lecture
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lab" id="lab" />
                  <Label
                    htmlFor="lab"
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <FlaskConical className="h-4 w-4" />
                    Lab / Section
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Add Lecture</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
