import { Subject, Deadline, Schedule } from "./types"

export const mockSubjects: Subject[] = [
  {
    id: "1",
    title: "Data Structures & Algorithms",
    code: "CS201",
    color: "#3b82f6",
    lectures: [
      {
        id: "l1",
        title: "Introduction to Arrays",
        type: "lecture",
        status: "completed",
        notes: "Arrays are fundamental data structures that store elements in contiguous memory locations.",
        resources: [
          { id: "r1", title: "Lecture Slides", url: "https://drive.google.com/example", type: "drive" },
          { id: "r2", title: "Video Tutorial", url: "https://youtube.com/watch?v=example", type: "youtube" },
        ],
        tasks: [
          { id: "t1", title: "Complete practice problems 1-5", completed: true },
          { id: "t2", title: "Review time complexity", completed: true },
        ],
        order: 0,
      },
      {
        id: "l2",
        title: "Linked Lists",
        type: "lecture",
        status: "completed",
        notes: "Linked lists provide dynamic memory allocation and efficient insertions/deletions.",
        resources: [
          { id: "r3", title: "Linked List Visualization", url: "https://visualgo.net", type: "link" },
        ],
        tasks: [
          { id: "t3", title: "Implement singly linked list", completed: true },
          { id: "t4", title: "Implement doubly linked list", completed: false },
        ],
        order: 1,
      },
      {
        id: "l3",
        title: "Trees and Binary Search Trees",
        type: "lecture",
        status: "in-progress",
        notes: "BST allows for efficient searching, insertion, and deletion operations.",
        resources: [],
        tasks: [
          { id: "t5", title: "Watch BST video", completed: true },
          { id: "t6", title: "Implement BST from scratch", completed: false },
        ],
        order: 2,
      },
      {
        id: "l4",
        title: "Graph Algorithms",
        type: "lecture",
        status: "not-started",
        notes: "",
        resources: [],
        tasks: [],
        order: 3,
      },
      {
        id: "l5",
        title: "Lab: Sorting Algorithms",
        type: "lab",
        status: "completed",
        notes: "Implemented bubble sort, merge sort, and quick sort.",
        resources: [
          { id: "r4", title: "Lab Manual", url: "https://example.com/lab.pdf", type: "pdf" },
        ],
        tasks: [
          { id: "t7", title: "Submit sorting implementation", completed: true },
        ],
        order: 4,
      },
    ],
    exams: [
      { id: "e1", title: "Midterm Exam", type: "midterm", date: "2026-03-20", grade: 85, maxGrade: 100 },
      { id: "e2", title: "Final Exam", type: "final", date: "2026-05-15", maxGrade: 100 },
      { id: "e3", title: "Quiz 1", type: "quiz", date: "2026-02-10", grade: 18, maxGrade: 20 },
    ],
    schedules: [
      { id: "s1", dayOfWeek: 0, time: "19:00", location: "Room 101" },
      { id: "s2", dayOfWeek: 4, time: "17:00", location: "Room 101" },
    ],
  },
  {
    id: "2",
    title: "Operating Systems",
    code: "CS301",
    color: "#10b981",
    lectures: [
      {
        id: "l6",
        title: "Process Management",
        type: "lecture",
        status: "completed",
        notes: "Processes are programs in execution with their own memory space.",
        resources: [],
        tasks: [
          { id: "t8", title: "Read chapter 3", completed: true },
        ],
        order: 0,
      },
      {
        id: "l7",
        title: "Memory Management",
        type: "lecture",
        status: "in-progress",
        notes: "Virtual memory allows programs to use more memory than physically available.",
        resources: [
          { id: "r5", title: "Memory Management Video", url: "https://youtube.com/watch?v=example2", type: "youtube" },
        ],
        tasks: [
          { id: "t9", title: "Complete memory allocation exercise", completed: false },
        ],
        order: 1,
      },
      {
        id: "l8",
        title: "File Systems",
        type: "lecture",
        status: "not-started",
        notes: "",
        resources: [],
        tasks: [],
        order: 2,
      },
      {
        id: "l9",
        title: "Lab: Process Scheduling",
        type: "lab",
        status: "in-progress",
        notes: "Working on round-robin scheduling implementation.",
        resources: [],
        tasks: [
          { id: "t10", title: "Implement FCFS scheduler", completed: true },
          { id: "t11", title: "Implement Round Robin scheduler", completed: false },
        ],
        order: 3,
      },
    ],
    exams: [
      { id: "e4", title: "Midterm Exam", type: "midterm", date: "2026-03-25", maxGrade: 100 },
      { id: "e5", title: "Final Exam", type: "final", date: "2026-05-20", maxGrade: 100 },
    ],
    schedules: [
      { id: "s3", dayOfWeek: 1, time: "10:00", location: "Lab A" },
      { id: "s4", dayOfWeek: 3, time: "10:00", location: "Lab A" },
    ],
  },
  {
    id: "3",
    title: "Database Systems",
    code: "CS305",
    color: "#f59e0b",
    lectures: [
      {
        id: "l10",
        title: "Introduction to SQL",
        type: "lecture",
        status: "completed",
        notes: "SQL is the standard language for relational database management.",
        resources: [
          { id: "r6", title: "SQL Cheatsheet", url: "https://example.com/sql.pdf", type: "pdf" },
        ],
        tasks: [
          { id: "t12", title: "Complete SQL exercises", completed: true },
        ],
        order: 0,
      },
      {
        id: "l11",
        title: "Normalization",
        type: "lecture",
        status: "not-started",
        notes: "",
        resources: [],
        tasks: [],
        order: 1,
      },
      {
        id: "l12",
        title: "Lab: Database Design",
        type: "lab",
        status: "not-started",
        notes: "",
        resources: [],
        tasks: [
          { id: "t13", title: "Design ER diagram", completed: false },
          { id: "t14", title: "Create database schema", completed: false },
        ],
        order: 2,
      },
    ],
    exams: [
      { id: "e6", title: "Quiz 1", type: "quiz", date: "2026-03-18", maxGrade: 25 },
      { id: "e7", title: "Midterm Exam", type: "midterm", date: "2026-04-01", maxGrade: 100 },
      { id: "e8", title: "Final Exam", type: "final", date: "2026-05-25", maxGrade: 100 },
    ],
    schedules: [
      { id: "s5", dayOfWeek: 2, time: "14:00", location: "Room 205" },
    ],
  },
]

export const mockDeadlines: Deadline[] = [
  { id: "d1", subjectId: "1", title: "DSA Midterm Exam", type: "exam", date: "2026-03-20" },
  { id: "d2", subjectId: "3", title: "SQL Quiz", type: "exam", date: "2026-03-18" },
  { id: "d3", subjectId: "2", title: "OS Midterm Exam", type: "exam", date: "2026-03-25" },
  { id: "d4", subjectId: "1", title: "Sorting Lab Submission", type: "assignment", date: "2026-03-16" },
  { id: "d5", subjectId: "3", title: "Database Design Project", type: "assignment", date: "2026-04-05" },
]
