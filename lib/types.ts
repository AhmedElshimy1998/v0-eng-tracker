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
  | 'متطلبات التخصص (إجباري)'
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