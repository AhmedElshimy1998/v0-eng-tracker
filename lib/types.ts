// ==========================================
// 1. الأنواع الأساسية الحالية للموقع (لا تحذفها)
// ==========================================
export interface Property {
  id: string
  title: string
  type: "Apartment" | "House" | "Villa" | "Commercial"
  price: number
  location: string
  bedrooms: number
  bathrooms: number
  area: number
  image: string
  featured?: boolean
}

export interface User {
  name: string
  email: string
  avatar: string
}

// ==========================================
// 2. الأنواع الجديدة الخاصة بنظام تتبع الدرجات (GPA Tracker)
// ==========================================

// أنواع التقديرات المتاحة بناءً على نظام الكلية
export type Grade = 
  | 'A+' | 'A' | 'A-' 
  | 'B+' | 'B' | 'B-' 
  | 'C+' | 'C' | 'C-' 
  | 'D+' | 'D' 
  | 'F' | 'Fail' 
  | 'Taken' | '-';

// تصنيفات المواد لسهولة الفلترة في الداشبورد
export type CourseCategory = 
  | 'متطلبات جامعة (إجباري)'
  | 'متطلبات جامعة (اختياري)'
  | 'متطلبات كلية (إجباري)'
  | 'متطلبات كلية (اختياري)'
  | 'متطلبات تخصص (إجباري)'
  | 'تخصص (اختياري عام)'
  | 'تخصص دقيق (اختياري)';

// هيكل المادة في اللائحة (الخطة المثالية)
export interface Course {
  code: string;                 // كود المادة (مثل EMP 011)
  arabicName: string;           // الاسم بالعربي
  englishName: string;          // الاسم بالإنجليزي
  credits: number;              // عدد الساعات المعتمدة
  category: CourseCategory;     // تصنيف المادة
  prerequisites: string[];      // مصفوفة بأكواد المواد المتطلبة (لو مفيش بتبقى فاضية [])
  idealSemester: string;        // الترم المثالي اللي المادة بتنزل فيه
  department: string;           // القسم التابع ليه المادة (General, Mechatronics, الخ)
  exclusiveGroupId?: string; 
  electiveGroupId?: string;
  isPlaceholder?: boolean;
  requireAnyPrereq?: boolean;
}

// هيكل المادة اللي الطالب سجلها بالفعل (تاريخ الطالب)
export interface StudentCourseRecord {
  id: string;                   // ID فريد للريكورد عشان لو عاد المادة
  courseCode: string;           // كود المادة المرتبطة
  semester: string;             // الترم اللي اتسجلت فيه (مثل Level One - Term 1)
  grade: Grade;                 // التقدير اللي جابه
  points: number;               // النقط اللي بتتحسب بناء على التقدير
  isRetake: boolean;            // هل دي إعادة لمادة قديمة؟ (عشان لوجيك اللائحة)
}

// هيكل الترم الواحد عشان نحسب الـ Semester GPA
export interface SemesterData {
  name: string;
  courses: StudentCourseRecord[];
  semesterGpa: number;
  semesterCredits: number;
}


// ==========================================
// 3. أنواع نظام إدارة المواد (Study Context)
// ==========================================

export type LectureStatus = "not-started" | "in-progress" | "completed";

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

export interface Resource {
  id: string;
  title: string;
  url: string;
  type: "video" | "document" | "link";
}

export interface Lecture {
  id: string;
  title: string;
  description?: string;
  order: number;
  status: LectureStatus;
  tasks: Task[];
  resources: Resource[];
}

export interface Exam {
  id: string;
  title: string;
  date: string;
  weight: number;
  score?: number;
}

export interface Schedule {
  id: string;
  dayOfWeek: number; // 0 (الأحد) إلى 6 (السبت)
  startTime: string;
  endTime: string;
  location?: string;
  type: "lecture" | "section" | "lab";
}

export interface Subject {
  id: string;
  title: string;
  code: string;
  color: string;
  lectures: Lecture[];
  exams: Exam[];
  schedules: Schedule[];
  updatedAt?: number;  // ⏱️ وقت التعديل للمزامنة الذكية
  isDeleted?: boolean; // 🗑️ الحذف الوهمي (Soft Delete)
}