"use client"

import { useState } from "react"
import { Lecture, LectureStatus, Resource } from "@/lib/types"
import { useStudy } from "@/lib/study-context"
import { cn } from "@/lib/utils"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  ChevronDown,
  ChevronUp,
  BookOpen,
  FlaskConical,
  Trash2,
  Plus,
  Link as LinkIcon,
  Youtube,
  FileText,
  ExternalLink,
  GripVertical,
} from "lucide-react"

interface LectureItemProps {
  lecture: Lecture
  subjectId: string
  index: number
  totalLectures: number
  onMoveUp: () => void
  onMoveDown: () => void
}

const statusConfig: Record<LectureStatus, { label: string; color: string; bgColor: string }> = {
  "not-started": { label: "Not Started", color: "text-red-500", bgColor: "bg-red-500/10" },
  "in-progress": { label: "In Progress", color: "text-yellow-500", bgColor: "bg-yellow-500/10" },
  "completed": { label: "Completed", color: "text-green-500", bgColor: "bg-green-500/10" },
}

const resourceIcons: Record<Resource["type"], React.ReactNode> = {
  youtube: <Youtube className="h-4 w-4 text-red-500" />,
  drive: <ExternalLink className="h-4 w-4 text-blue-500" />,
  pdf: <FileText className="h-4 w-4 text-orange-500" />,
  link: <LinkIcon className="h-4 w-4 text-muted-foreground" />,
}

export function LectureItem({
  lecture,
  subjectId,
  index,
  totalLectures,
  onMoveUp,
  onMoveDown,
}: LectureItemProps) {
  const {
    updateLecture,
    deleteLecture,
    updateLectureStatus,
    addTask,
    toggleTask,
    deleteTask,
    addResource,
    deleteResource,
  } = useStudy()
  
  const [isOpen, setIsOpen] = useState(false)
  const [newTask, setNewTask] = useState("")
  const [newResourceUrl, setNewResourceUrl] = useState("")
  const [newResourceTitle, setNewResourceTitle] = useState("")
  const [notes, setNotes] = useState(lecture.notes)

  const status = statusConfig[lecture.status]

  const handleAddTask = () => {
    if (!newTask.trim()) return
    addTask(subjectId, lecture.id, { title: newTask.trim(), completed: false })
    setNewTask("")
  }

  const handleAddResource = () => {
    if (!newResourceUrl.trim() || !newResourceTitle.trim()) return
    
    let type: Resource["type"] = "link"
    if (newResourceUrl.includes("youtube.com") || newResourceUrl.includes("youtu.be")) {
      type = "youtube"
    } else if (newResourceUrl.includes("drive.google.com")) {
      type = "drive"
    } else if (newResourceUrl.endsWith(".pdf")) {
      type = "pdf"
    }

    addResource(subjectId, lecture.id, {
      title: newResourceTitle.trim(),
      url: newResourceUrl.trim(),
      type,
    })
    setNewResourceUrl("")
    setNewResourceTitle("")
  }

  const handleNotesBlur = () => {
    if (notes !== lecture.notes) {
      updateLecture(subjectId, lecture.id, { notes })
    }
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div
        className={cn(
          "rounded-lg border transition-colors",
          isOpen ? "border-primary/50 bg-card" : "border-border bg-card hover:border-primary/30"
        )}
      >
        <CollapsibleTrigger asChild>
          <div className="flex cursor-pointer items-center gap-3 p-4">
            <div className="flex items-center gap-1 text-muted-foreground">
              <GripVertical className="h-4 w-4" />
              <div className="flex flex-col gap-0.5">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveUp()
                  }}
                  disabled={index === 0}
                >
                  <ChevronUp className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={(e) => {
                    e.stopPropagation()
                    onMoveDown()
                  }}
                  disabled={index === totalLectures - 1}
                >
                  <ChevronDown className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
              {lecture.type === "lecture" ? (
                <BookOpen className="h-5 w-5 text-muted-foreground" />
              ) : (
                <FlaskConical className="h-5 w-5 text-muted-foreground" />
              )}
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{lecture.title}</span>
                <Badge variant="outline" className="text-xs capitalize">
                  {lecture.type}
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>{lecture.tasks.filter((t) => t.completed).length}/{lecture.tasks.length} tasks</span>
                <span>·</span>
                <span>{lecture.resources.length} resources</span>
              </div>
            </div>

            <Badge className={cn("px-3", status.bgColor, status.color)} variant="outline">
              {status.label}
            </Badge>

            <ChevronDown
              className={cn(
                "h-5 w-5 text-muted-foreground transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="border-t border-border px-4 pb-4 pt-4 space-y-6">
            {/* Status */}
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium w-20">Status</span>
              <Select
                value={lecture.status}
                onValueChange={(value: LectureStatus) =>
                  updateLectureStatus(subjectId, lecture.id, value)
                }
              >
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not-started">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-red-500" />
                      Not Started
                    </span>
                  </SelectItem>
                  <SelectItem value="in-progress">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-yellow-500" />
                      In Progress
                    </span>
                  </SelectItem>
                  <SelectItem value="completed">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-green-500" />
                      Completed
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <span className="text-sm font-medium">Notes</span>
              <Textarea
                placeholder="Write your notes here..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                onBlur={handleNotesBlur}
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Resources */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Resources</span>
              <div className="space-y-2">
                {lecture.resources.map((resource) => (
                  <div
                    key={resource.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                  >
                    <a
                      href={resource.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:underline"
                    >
                      {resourceIcons[resource.type]}
                      <span className="text-sm">{resource.title}</span>
                    </a>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteResource(subjectId, lecture.id, resource.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Resource title"
                  value={newResourceTitle}
                  onChange={(e) => setNewResourceTitle(e.target.value)}
                  className="flex-1"
                />
                <Input
                  placeholder="URL"
                  value={newResourceUrl}
                  onChange={(e) => setNewResourceUrl(e.target.value)}
                  className="flex-1"
                />
                <Button size="icon" onClick={handleAddResource}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3">
              <span className="text-sm font-medium">Tasks</span>
              <div className="space-y-2">
                {lecture.tasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-border bg-muted/50 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(subjectId, lecture.id, task.id)}
                      />
                      <span
                        className={cn(
                          "text-sm",
                          task.completed && "line-through text-muted-foreground"
                        )}
                      >
                        {task.title}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => deleteTask(subjectId, lecture.id, task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a new task..."
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddTask()}
                />
                <Button size="icon" onClick={handleAddTask}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Delete Button */}
            <div className="flex justify-end pt-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => deleteLecture(subjectId, lecture.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Lecture
              </Button>
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  )
}
