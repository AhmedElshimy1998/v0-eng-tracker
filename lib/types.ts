export type LectureStatus = "not-started" | "in-progress" | "completed"

export interface Task {
  id: string
  title: string
  completed: boolean
}

export interface Resource {
  id: string
  title: string
  url: string
  type: "youtube" | "drive" | "pdf" | "link"
}

export interface Lecture {
  id: string
  title: string
  type: "lecture" | "lab"
  status: LectureStatus
  notes: string
  resources: Resource[]
  tasks: Task[]
  order: number
}

export interface Exam {
  id: string
  title: string
  type: "midterm" | "final" | "quiz"
  date: string
  grade?: number
  maxGrade: number
}

export interface Subject {
  id: string
  title: string
  code: string
  color: string
  lectures: Lecture[]
  exams: Exam[]
  schedules: Schedule[]
}

export interface Deadline {
  id: string
  subjectId: string
  title: string
  type: "exam" | "assignment"
  date: string
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6 // Sunday = 0, Saturday = 6

export interface Schedule {
  id: string
  dayOfWeek: DayOfWeek
  time: string // "HH:MM" format (24-hour)
  location?: string
}

export interface ScheduledNotification {
  id: string
  subjectId: string
  subjectTitle: string
  scheduleId: string
  scheduledTime: Date
  minutesBefore: number
  acknowledged: boolean
}
