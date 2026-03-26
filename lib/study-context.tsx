"use client"

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from "react"
import { Subject, Lecture, Exam, Task, Resource, LectureStatus, Schedule } from "./types"
import { mockSubjects } from "./mock-data"
import { getCloudData, saveCloudData } from "./actions"

interface StudyContextType {
  subjects: Subject[]
  addSubject: (subject: Omit<Subject, "id" | "lectures" | "exams" | "schedules">) => void
  updateSubject: (id: string, data: Partial<Subject>) => void
  deleteSubject: (id: string) => void
  addLecture: (subjectId: string, lecture: Omit<Lecture, "id" | "order">) => void
  updateLecture: (subjectId: string, lectureId: string, data: Partial<Lecture>) => void
  deleteLecture: (subjectId: string, lectureId: string) => void
  reorderLectures: (subjectId: string, fromIndex: number, toIndex: number) => void
  updateLectureStatus: (subjectId: string, lectureId: string, status: LectureStatus) => void
  addTask: (subjectId: string, lectureId: string, task: Omit<Task, "id">) => void
  toggleTask: (subjectId: string, lectureId: string, taskId: string) => void
  deleteTask: (subjectId: string, lectureId: string, taskId: string) => void
  addResource: (subjectId: string, lectureId: string, resource: Omit<Resource, "id">) => void
  deleteResource: (subjectId: string, lectureId: string, resourceId: string) => void
  addExam: (subjectId: string, exam: Omit<Exam, "id">) => void
  updateExam: (subjectId: string, examId: string, data: Partial<Exam>) => void
  deleteExam: (subjectId: string, examId: string) => void
  addSchedule: (subjectId: string, schedule: Omit<Schedule, "id">) => void
  updateSchedule: (subjectId: string, scheduleId: string, data: Partial<Schedule>) => void
  deleteSchedule: (subjectId: string, scheduleId: string) => void
  getSubjectProgress: (subjectId: string) => number
  isLoading: boolean
}

const StudyContext = createContext<StudyContextType | undefined>(undefined)

export function StudyProvider({ children }: { children: ReactNode }) {
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [isInitialized, setIsInitialized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  // 1. جلب البيانات (أوفلاين أولاً ثم السحابة)
  useEffect(() => {
    async function loadData() {
      // القراءة من التخزين المحلي فوراً لسرعة العرض
      const localData = localStorage.getItem("studyhub-local-data")
      if (localData) {
        setSubjects(JSON.parse(localData))
        setIsLoading(false) // إخفاء اللودينج فوراً لو فيه داتا محلية
      }

      // محاولة المزامنة مع السحابة في الخلفية
      if (navigator.onLine) {
        try {
          const cloudSubjects = await getCloudData()
          if (cloudSubjects !== null && cloudSubjects !== undefined && Array.isArray(cloudSubjects)) {
            setSubjects(cloudSubjects)
            localStorage.setItem("studyhub-local-data", JSON.stringify(cloudSubjects))
          } else if (!localData) {
            setSubjects(mockSubjects)
            localStorage.setItem("studyhub-local-data", JSON.stringify(mockSubjects))
          }
        } catch (error) {
          console.log("Offline or cloud fetch failed, relying on local data.")
        }
      } else if (!localData) {
        setSubjects(mockSubjects)
      }
      
      setIsInitialized(true)
      setIsLoading(false)
    }
    loadData()
  }, [])

  // 2. حفظ أي تعديل جديد فوراً (محلياً ثم سحابياً)
  useEffect(() => {
    if (isInitialized) {
      // حفظ محلي فوري
      localStorage.setItem("studyhub-local-data", JSON.stringify(subjects))
      
      if (navigator.onLine) {
        saveCloudData(subjects).catch(() => {
          // لو النت فصل وقت الحفظ، نضع علامة للمزامنة لاحقاً
          localStorage.setItem("needs-sync", "true")
        })
      } else {
        localStorage.setItem("needs-sync", "true")
      }
    }
  }, [subjects, isInitialized])

  // 3. مراقب عودة الإنترنت لرفع التعديلات المعلقة
  useEffect(() => {
    const handleOnline = async () => {
      const needsSync = localStorage.getItem("needs-sync")
      if (needsSync === "true") {
        try {
          const currentLocalData = JSON.parse(localStorage.getItem("studyhub-local-data") || "[]")
          await saveCloudData(currentLocalData)
          localStorage.setItem("needs-sync", "false")
          console.log("Synced successfully after reconnecting!")
        } catch(e) {
          console.error("Background sync failed, will retry later.")
        }
      }
    }

    window.addEventListener('online', handleOnline)
    return () => window.removeEventListener('online', handleOnline)
  }, [])

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const addSubject = useCallback((subject: Omit<Subject, "id" | "lectures" | "exams" | "schedules">) => {
    setSubjects((prev) => [
      ...prev,
      { ...subject, id: generateId(), lectures: [], exams: [], schedules: [] },
    ])
  }, [])

  const updateSubject = useCallback((id: string, data: Partial<Subject>) => {
    setSubjects((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...data } : s))
    )
  }, [])

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id))
  }, [])

  const addLecture = useCallback(
    (subjectId: string, lecture: Omit<Lecture, "id" | "order">) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          const newLecture: Lecture = {
            ...lecture,
            id: generateId(),
            order: s.lectures.length,
          }
          return { ...s, lectures: [...s.lectures, newLecture] }
        })
      )
    },
    []
  )

  const updateLecture = useCallback(
    (subjectId: string, lectureId: string, data: Partial<Lecture>) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            lectures: s.lectures.map((l) =>
              l.id === lectureId ? { ...l, ...data } : l
            ),
          }
        })
      )
    },
    []
  )

  const deleteLecture = useCallback((subjectId: string, lectureId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s
        return {
          ...s,
          lectures: s.lectures.filter((l) => l.id !== lectureId),
        }
      })
    )
  }, [])

  const reorderLectures = useCallback(
    (subjectId: string, fromIndex: number, toIndex: number) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          const lectures = [...s.lectures].sort((a, b) => a.order - b.order)
          const [moved] = lectures.splice(fromIndex, 1)
          lectures.splice(toIndex, 0, moved)
          return {
            ...s,
            lectures: lectures.map((l, i) => ({ ...l, order: i })),
          }
        })
      )
    },
    []
  )

  const updateLectureStatus = useCallback(
    (subjectId: string, lectureId: string, status: LectureStatus) => {
      updateLecture(subjectId, lectureId, { status })
    },
    [updateLecture]
  )

  const addTask = useCallback(
    (subjectId: string, lectureId: string, task: Omit<Task, "id">) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            lectures: s.lectures.map((l) => {
              if (l.id !== lectureId) return l
              return {
                ...l,
                tasks: [...l.tasks, { ...task, id: generateId() }],
              }
            }),
          }
        })
      )
    },
    []
  )

  const toggleTask = useCallback(
    (subjectId: string, lectureId: string, taskId: string) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            lectures: s.lectures.map((l) => {
              if (l.id !== lectureId) return l
              return {
                ...l,
                tasks: l.tasks.map((t) =>
                  t.id === taskId ? { ...t, completed: !t.completed } : t
                ),
              }
            }),
          }
        })
      )
    },
    []
  )

  const deleteTask = useCallback(
    (subjectId: string, lectureId: string, taskId: string) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            lectures: s.lectures.map((l) => {
              if (l.id !== lectureId) return l
              return {
                ...l,
                tasks: l.tasks.filter((t) => t.id !== taskId),
              }
            }),
          }
        })
      )
    },
    []
  )

  const addResource = useCallback(
    (subjectId: string, lectureId: string, resource: Omit<Resource, "id">) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            lectures: s.lectures.map((l) => {
              if (l.id !== lectureId) return l
              return {
                ...l,
                resources: [...l.resources, { ...resource, id: generateId() }],
              }
            }),
          }
        })
      )
    },
    []
  )

  const deleteResource = useCallback(
    (subjectId: string, lectureId: string, resourceId: string) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            lectures: s.lectures.map((l) => {
              if (l.id !== lectureId) return l
              return {
                ...l,
                resources: l.resources.filter((r) => r.id !== resourceId),
              }
            }),
          }
        })
      )
    },
    []
  )

  const addExam = useCallback(
    (subjectId: string, exam: Omit<Exam, "id">) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            exams: [...s.exams, { ...exam, id: generateId() }],
          }
        })
      )
    },
    []
  )

  const updateExam = useCallback(
    (subjectId: string, examId: string, data: Partial<Exam>) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            exams: s.exams.map((e) =>
              e.id === examId ? { ...e, ...data } : e
            ),
          }
        })
      )
    },
    []
  )

  const deleteExam = useCallback((subjectId: string, examId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s
        return {
          ...s,
          exams: s.exams.filter((e) => e.id !== examId),
        }
      })
    )
  }, [])

  const addSchedule = useCallback(
    (subjectId: string, schedule: Omit<Schedule, "id">) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            schedules: [...s.schedules, { ...schedule, id: generateId() }],
          }
        })
      )
    },
    []
  )

  const updateSchedule = useCallback(
    (subjectId: string, scheduleId: string, data: Partial<Schedule>) => {
      setSubjects((prev) =>
        prev.map((s) => {
          if (s.id !== subjectId) return s
          return {
            ...s,
            schedules: s.schedules.map((sch) =>
              sch.id === scheduleId ? { ...sch, ...data } : sch
            ),
          }
        })
      )
    },
    []
  )

  const deleteSchedule = useCallback((subjectId: string, scheduleId: string) => {
    setSubjects((prev) =>
      prev.map((s) => {
        if (s.id !== subjectId) return s
        return {
          ...s,
          schedules: s.schedules.filter((sch) => sch.id !== scheduleId),
        }
      })
    )
  }, [])

  const getSubjectProgress = useCallback(
    (subjectId: string): number => {
      const subject = subjects.find((s) => s.id === subjectId)
      if (!subject || subject.lectures.length === 0) return 0
      const completed = subject.lectures.filter(
        (l) => l.status === "completed"
      ).length
      return Math.round((completed / subject.lectures.length) * 100)
    },
    [subjects]
  )

  return (
    <StudyContext.Provider
      value={{
        subjects,
        addSubject,
        updateSubject,
        deleteSubject,
        addLecture,
        updateLecture,
        deleteLecture,
        reorderLectures,
        updateLectureStatus,
        addTask,
        toggleTask,
        deleteTask,
        addResource,
        deleteResource,
        addExam,
        updateExam,
        deleteExam,
        addSchedule,
        updateSchedule,
        deleteSchedule,
        getSubjectProgress,
        isLoading,
      }}
    >
      {children}
    </StudyContext.Provider>
  )
}

export function useStudy() {
  const context = useContext(StudyContext)
  if (!context) {
    throw new Error("useStudy must be used within a StudyProvider")
  }
  return context
}