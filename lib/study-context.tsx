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

  // 1. التهيئة وجلب البيانات المباشر
  useEffect(() => {
    let mounted = true;

    async function initData() {
      try {
        const localStr = localStorage.getItem("studyhub-local-data");
        const localData: Subject[] = localStr ? JSON.parse(localStr) : [];
        
        // 1. اعرض الداتا المحلي فوراً واقفل شاشة التحميل
        if (localData.length > 0 && mounted) {
          setSubjects(localData);
          setIsLoading(false); 
        }

        if (!navigator.onLine) {
          if (mounted) {
            setIsInitialized(true);
            setIsLoading(false);
          }
          return;
        }

        // 🛑 التعديل السحري: درع حماية السيرفر من الريفريش (Cooldown) 🛑
        const lastSyncStr = localStorage.getItem("studyhub-last-sync-time");
        const lastSyncTime = lastSyncStr ? parseInt(lastSyncStr) : 0;
        const TEN_MINUTES = 10 * 60 * 1000; // 10 دقايق
        const needsSync = localStorage.getItem("needs-sync") === "true";

        // لو مفيش داتا محتاجة تترفع، ولسه معدهاش 10 دقايق على آخر مزامنة
        if (!needsSync && localData.length > 0 && (Date.now() - lastSyncTime < TEN_MINUTES)) {
          console.log("⚡ تم الاعتماد كلياً على الذاكرة المحلية (لا يوجد اتصال بالسيرفر)");
          if (mounted) {
            setIsInitialized(true);
            setIsLoading(false);
          }
          return; // إعمل Return فوراً ومتكلمش Upstash خالص!
        }

        // 🔄 لو عدى 10 دقايق، أو دي أول مرة، نكلم السيرفر
        const cloudResponse = await getCloudData();
        
        if (!cloudResponse) {
          if (mounted) {
            setIsInitialized(true);
            setIsLoading(false);
          }
          return;
        }

        const { subjects: cloudData, isNewUser } = cloudResponse;

        // ⏱️ نختم بوقت المزامنة الجديد عشان نحمي السيرفر الـ 10 دقايق الجايين
        localStorage.setItem("studyhub-last-sync-time", Date.now().toString());

        if (isNewUser && cloudData.length === 0 && localData.length === 0) {
          const initialMock = mockSubjects.map(s => ({ ...s, updatedAt: Date.now() }));
          if (mounted) {
            setSubjects(initialMock);
            setIsLoading(false);
          }
          localStorage.setItem("studyhub-local-data", JSON.stringify(initialMock));
          await saveCloudData(initialMock);
        } else {
          const mergedMap = new Map<string, Subject>();
          if (Array.isArray(cloudData)) {
            cloudData.forEach(s => mergedMap.set(s.id, s));
          }
          
          let hasLocalUpdates = false;
          localData.forEach(localItem => {
            const cloudItem = mergedMap.get(localItem.id);
            if (!cloudItem || (localItem.updatedAt || 0) > (cloudItem.updatedAt || 0)) {
              mergedMap.set(localItem.id, localItem);
              hasLocalUpdates = true;
            }
          });

          const finalData = Array.from(mergedMap.values());
          if (mounted) {
            setSubjects(finalData);
            setIsLoading(false);
          }
          localStorage.setItem("studyhub-local-data", JSON.stringify(finalData));
          
          if (hasLocalUpdates) {
            saveCloudData(finalData);
          }
        }
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        if (mounted) {
          setIsInitialized(true);
          setIsLoading(false); 
        }
      }
    }
    
    initData();
    return () => { mounted = false };
  }, []);

  // ضيف ده فوق مع تعريفات الـ state
  const isInitialLoad = React.useRef(true);

  // 2. محرك الحفظ الذكي (معدل لمنع الحفظ بعد الريفريش مباشرة)
  useEffect(() => {
    // لو دي أول رصة داتا جاية من التحميل، متعملش حفظ، وافتح القفل بس
    if (isInitialLoad.current && subjects.length > 0) {
      isInitialLoad.current = false;
      return; 
    }

    if (isInitialized && subjects.length > 0) {
      localStorage.setItem("studyhub-local-data", JSON.stringify(subjects))
      
      if (navigator.onLine) {
        saveCloudData(subjects).catch(() => {
          localStorage.setItem("needs-sync", "true")
        })
      } else {
        localStorage.setItem("needs-sync", "true")
      }
    }
  }, [subjects, isInitialized])

  // 3. مراقب الإنترنت
  useEffect(() => {
    const handleOnline = async () => {
      const needsSync = localStorage.getItem("needs-sync");
      if (needsSync === "true") {
        try {
          const currentLocalStr = localStorage.getItem("studyhub-local-data");
          const currentLocal = currentLocalStr ? JSON.parse(currentLocalStr) : [];
          if (currentLocal.length > 0) {
            const result = await saveCloudData(currentLocal);
            if (result.success) localStorage.setItem("needs-sync", "false");
          }
        } catch(e) {}
      }
    };
    window.addEventListener('online', handleOnline);
    return () => window.removeEventListener('online', handleOnline);
  }, []);

  const generateId = () => Math.random().toString(36).substring(2, 9)

  const addSubject = useCallback((subject: Omit<Subject, "id" | "lectures" | "exams" | "schedules">) => {
    setSubjects((prev) => [
      ...prev,
      { ...subject, id: generateId(), lectures: [], exams: [], schedules: [], updatedAt: Date.now() },
    ])
  }, [])

  const updateSubject = useCallback((id: string, data: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...data, updatedAt: Date.now() } : s)))
  }, [])

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, isDeleted: true, updatedAt: Date.now() } : s)))
  }, [])

  const addLecture = useCallback((subjectId: string, lecture: Omit<Lecture, "id" | "order">) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, lectures: [...s.lectures, { ...lecture, id: generateId(), order: s.lectures.length }], updatedAt: Date.now() }
    }))
  }, [])

  const updateLecture = useCallback((subjectId: string, lectureId: string, data: Partial<Lecture>) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, lectures: s.lectures.map((l) => l.id === lectureId ? { ...l, ...data } : l), updatedAt: Date.now() }
    }))
  }, [])

  const deleteLecture = useCallback((subjectId: string, lectureId: string) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, lectures: s.lectures.filter((l) => l.id !== lectureId), updatedAt: Date.now() }
    }))
  }, [])

  const reorderLectures = useCallback((subjectId: string, fromIndex: number, toIndex: number) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      const lectures = [...s.lectures].sort((a, b) => a.order - b.order)
      const [moved] = lectures.splice(fromIndex, 1)
      lectures.splice(toIndex, 0, moved)
      return { ...s, lectures: lectures.map((l, i) => ({ ...l, order: i })), updatedAt: Date.now() }
    }))
  }, [])

  const updateLectureStatus = useCallback((subjectId: string, lectureId: string, status: LectureStatus) => {
    updateLecture(subjectId, lectureId, { status })
  }, [updateLecture])

  const addTask = useCallback((subjectId: string, lectureId: string, task: Omit<Task, "id">) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, lectures: s.lectures.map((l) => l.id === lectureId ? { ...l, tasks: [...l.tasks, { ...task, id: generateId() }] } : l), updatedAt: Date.now() }
    }))
  }, [])

  const toggleTask = useCallback((subjectId: string, lectureId: string, taskId: string) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, lectures: s.lectures.map((l) => l.id === lectureId ? { ...l, tasks: l.tasks.map((t) => t.id === taskId ? { ...t, completed: !t.completed } : t) } : l), updatedAt: Date.now() }
    }))
  }, [])

  const deleteTask = useCallback((subjectId: string, lectureId: string, taskId: string) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, lectures: s.lectures.map((l) => l.id === lectureId ? { ...l, tasks: l.tasks.filter((t) => t.id !== taskId) } : l), updatedAt: Date.now() }
    }))
  }, [])

  const addResource = useCallback((subjectId: string, lectureId: string, resource: Omit<Resource, "id">) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, lectures: s.lectures.map((l) => l.id === lectureId ? { ...l, resources: [...l.resources, { ...resource, id: generateId() }] } : l), updatedAt: Date.now() }
    }))
  }, [])

  const deleteResource = useCallback((subjectId: string, lectureId: string, resourceId: string) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, lectures: s.lectures.map((l) => l.id === lectureId ? { ...l, resources: l.resources.filter((r) => r.id !== resourceId) } : l), updatedAt: Date.now() }
    }))
  }, [])

  const addExam = useCallback((subjectId: string, exam: Omit<Exam, "id">) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, exams: [...s.exams, { ...exam, id: generateId() }], updatedAt: Date.now() }
    }))
  }, [])

  const updateExam = useCallback((subjectId: string, examId: string, data: Partial<Exam>) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, exams: s.exams.map((e) => e.id === examId ? { ...e, ...data } : e), updatedAt: Date.now() }
    }))
  }, [])

  const deleteExam = useCallback((subjectId: string, examId: string) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, exams: s.exams.filter((e) => e.id !== examId), updatedAt: Date.now() }
    }))
  }, [])

  const addSchedule = useCallback((subjectId: string, schedule: Omit<Schedule, "id">) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, schedules: [...s.schedules, { ...schedule, id: generateId() }], updatedAt: Date.now() }
    }))
  }, [])

  const updateSchedule = useCallback((subjectId: string, scheduleId: string, data: Partial<Schedule>) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, schedules: s.schedules.map((sch) => sch.id === scheduleId ? { ...sch, ...data } : sch), updatedAt: Date.now() }
    }))
  }, [])

  const deleteSchedule = useCallback((subjectId: string, scheduleId: string) => {
    setSubjects((prev) => prev.map((s) => {
      if (s.id !== subjectId) return s
      return { ...s, schedules: s.schedules.filter((sch) => sch.id !== scheduleId), updatedAt: Date.now() }
    }))
  }, [])

  const getSubjectProgress = useCallback((subjectId: string): number => {
    const subject = subjects.find((s) => s.id === subjectId)
    if (!subject || subject.lectures.length === 0) return 0
    const completed = subject.lectures.filter((l) => l.status === "completed").length
    return Math.round((completed / subject.lectures.length) * 100)
  }, [subjects])

  const activeSubjects = subjects.filter(s => !s.isDeleted)

  return (
    <StudyContext.Provider
      value={{
        subjects: activeSubjects, 
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