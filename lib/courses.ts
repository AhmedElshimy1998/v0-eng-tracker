import { Course } from "@/lib/types";

export const coursesCatalog: Course[] = [
  // --- متطلبات جامعة (إجباري) ---
  {
    code: "HUM 011",
    arabicName: "اللغة الانجليزية الفنية",
    englishName: "English Language",
    credits: 1,
    category: "متطلبات جامعة (إجباري)",
    prerequisites: []
  },
  {
    code: "HUM 061",
    arabicName: "تاريخ الهندسة والتكنولوجيا",
    englishName: "History of Eng. & Tech.",
    credits: 2,
    category: "متطلبات جامعة (إجباري)",
    prerequisites: []
  },
  {
    code: "HUM X21",
    arabicName: "القضايا المجتمعية",
    englishName: "Societal Issues",
    credits: 0,
    category: "متطلبات جامعة (إجباري)",
    prerequisites: []
  },

  // --- متطلبات كلية (إجباري) ---
  {
    code: "EMP 011",
    arabicName: "الرياضيات الهندسية (1)",
    englishName: "Engineering Math 1",
    credits: 3,
    category: "متطلبات كلية (إجباري)",
    prerequisites: []
  },
  {
    code: "EMP 012",
    arabicName: "الرياضيات الهندسية (2)",
    englishName: "Engineering Math 2",
    credits: 3,
    category: "متطلبات كلية (إجباري)",
    prerequisites: ["EMP 011"] // لاحظ المتطلب هنا
  },
  {
    code: "EMP 041",
    arabicName: "الفيزيقا الهندسية (1)",
    englishName: "Engineering Physics 1",
    credits: 3,
    category: "متطلبات كلية (إجباري)",
    prerequisites: []
  },
  {
    code: "EMP 042",
    arabicName: "الفيزيقا الهندسية (2)",
    englishName: "Engineering Physics 2",
    credits: 3,
    category: "متطلبات كلية (إجباري)",
    prerequisites: ["EMP 041"] // المتطلب
  },

  // --- متطلبات التخصص (إجباري) - عينة ---
  {
    code: "EMP 111",
    arabicName: "المعادلات التفاضليه",
    englishName: "Differential Equations",
    credits: 3,
    category: "متطلبات التخصص (إجباري)",
    prerequisites: ["EMP 012"]
  },
  {
    code: "PDE 421",
    arabicName: "ماكينات التشغيل بالتحكم العددي",
    englishName: "CNC Machines",
    credits: 2,
    category: "متطلبات التخصص (إجباري)",
    prerequisites: ["MPE 111", "CCE 211"] // لاحظ المادتين كمتطلبات
  }
];