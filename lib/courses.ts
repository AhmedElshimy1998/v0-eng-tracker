import { Course } from "./types";

export const coursesCatalog: Course[] = [
  // --- المواد العامة (جامعة/كلية) ---
  { code: "HUM 011", arabicName: "اللغة الانجليزية الفنية", englishName: "English Language", credits: 1, category: "متطلبات جامعة (إجباري)", prerequisites: [], idealSemester: "Level Zero - Term 1", department: "المواد العامة (جامعة/كلية)" },
  { code: "HUM 061", arabicName: "تاريخ الهندسة والتكنولوجيا", englishName: "History of Eng. & Tech.", credits: 2, category: "متطلبات جامعة (إجباري)", prerequisites: [], idealSemester: "Level Zero - Term 2", department: "المواد العامة (جامعة/كلية)" },
  { code: "HUM 131", arabicName: "مقدمة الي البرمجة وتكنولوجيا المعلومات", englishName: "Intro to Computer & Prog.", credits: 2, category: "متطلبات جامعة (إجباري)", prerequisites: [], idealSemester: "Level One - Term 1", department: "المواد العامة (جامعة/كلية)" },
  { code: "HUM X32", arabicName: "مهارات الاتصال والعرض والتقديم", englishName: "Comm. & Pres. Skills", credits: 2, category: "متطلبات جامعة (إجباري)", prerequisites: [], idealSemester: "Level Three - Term 1", department: "المواد العامة (جامعة/كلية)" },
  { code: "HUM X33", arabicName: "التفكير العلمي", englishName: "Scientific Thinking", credits: 2, category: "متطلبات جامعة (إجباري)", prerequisites: [], idealSemester: "Level Three - Term 2", department: "المواد العامة (جامعة/كلية)" },
  
  { code: "HUM XE2", arabicName: "اللغة الالمانية", englishName: "German Language", credits: 2, category: "متطلبات جامعة (اختياري)", prerequisites: [], idealSemester: "Level Four - Term 2", department: "المواد العامة (جامعة/كلية)" },
  
  // مواد الكلية الإجبارية (تتبع أيضاً المواد العامة حسب طلبك)
  { code: "EMP 011", arabicName: "الرياضيات الهندسية (1)", englishName: "Engineering Math 1", credits: 3, category: "متطلبات كلية (إجباري)", prerequisites: [], idealSemester: "Level Zero - Term 1", department: "المواد العامة (جامعة/كلية)" },
  { code: "EMP 012", arabicName: "الرياضيات الهندسية (2)", englishName: "Engineering Math 2", credits: 3, category: "متطلبات كلية (إجباري)", prerequisites: ["EMP 011"], idealSemester: "Level Zero - Term 2", department: "المواد العامة (جامعة/كلية)" },
  { code: "EMP 021", arabicName: "الميكانيكا الهندسية (1)", englishName: "Engineering Mechanics 1", credits: 3, category: "متطلبات كلية (إجباري)", prerequisites: [], idealSemester: "Level Zero - Term 1", department: "المواد العامة (جامعة/كلية)" },
  { code: "EMP 022", arabicName: "الميكانيكا الهندسية (2)", englishName: "Engineering Mechanics 2", credits: 3, category: "متطلبات كلية (إجباري)", prerequisites: ["EMP 021"], idealSemester: "Level Zero - Term 2", department: "المواد العامة (جامعة/كلية)" },
  { code: "EMP 041", arabicName: "الفيزيقا الهندسية (1)", englishName: "Engineering Physics 1", credits: 3, category: "متطلبات كلية (إجباري)", prerequisites: [], idealSemester: "Level Zero - Term 1", department: "المواد العامة (جامعة/كلية)" },
  { code: "EMP 042", arabicName: "الفيزيقا الهندسية (2)", englishName: "Engineering Physics 2", credits: 3, category: "متطلبات كلية (إجباري)", prerequisites: ["EMP 041"], idealSemester: "Level Zero - Term 2", department: "المواد العامة (جامعة/كلية)" },
  { code: "PDE 021", arabicName: "الرسم الهندسي (1)", englishName: "Engineering Drawing 1", credits: 3, category: "متطلبات كلية (إجباري)", prerequisites: [], idealSemester: "Level Zero - Term 1", department: "المواد العامة (جامعة/كلية)" },
  { code: "PDE 022", arabicName: "الرسم الهندسي (2)", englishName: "Engineering Drawing 2", credits: 3, category: "متطلبات كلية (إجباري)", prerequisites: ["PDE 021"], idealSemester: "Level Zero - Term 2", department: "المواد العامة (جامعة/كلية)" },
  { code: "EMP 031", arabicName: "الكيمياء الهندسية", englishName: "Engineering Chemistry", credits: 3, category: "متطلبات كلية (إجباري)", prerequisites: [], idealSemester: "Level Zero - Term 1", department: "المواد العامة (جامعة/كلية)" },
  { code: "PDE 011", arabicName: "تكنولوجيا الانتاج", englishName: "Production Technology", credits: 2, category: "متطلبات كلية (إجباري)", prerequisites: [], idealSemester: "Level Zero - Term 2", department: "المواد العامة (جامعة/كلية)" },

  // --- مواد قسم هندسة الميكاترونيات ---
  { code: "EMP X13", arabicName: "الرياضيات الهندسية (3)", englishName: "Engineering Math 3", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EMP 012"], idealSemester: "Level One - Term 1", department: "هندسة الميكاترونيات" },
  { code: "MPE 121", arabicName: "هندسة حرارية", englishName: "Thermodynamics", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EMP 042"], idealSemester: "Level One - Term 1", department: "هندسة الميكاترونيات" },
  { code: "PDE 111", arabicName: "مقاومة المواد وتحليل الاجهادات", englishName: "Strength of Materials", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: [], idealSemester: "Level One - Term 1", department: "هندسة الميكاترونيات" },
  { code: "EPE 111", arabicName: "هندسة كهربائية", englishName: "Electrical Engineering", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EMP 042"], idealSemester: "Level One - Term 1", department: "هندسة الميكاترونيات" },
  { code: "EMP X14", arabicName: "الرياضيات الهندسية (4)", englishName: "Engineering Math 4", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EMP X13"], idealSemester: "Level One - Term 2", department: "هندسة الميكاترونيات" },
  { code: "MPE 112", arabicName: "ديناميكا النظم الميكانيكية", englishName: "Dynamics of Mech. Systems", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: [], idealSemester: "Level One - Term 2", department: "هندسة الميكاترونيات" },
  { code: "MPE 111", arabicName: "رسم ميكانيكي باستخدام الحاسوب", englishName: "CAD", credits: 2, category: "متطلبات تخصص (إجباري)", prerequisites: ["PDE 022"], idealSemester: "Level One - Term 2", department: "هندسة الميكاترونيات" },
  { code: "PDE 121", arabicName: "نظرية ماكينات", englishName: "Theory of Machines", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: [], idealSemester: "Level One - Term 2", department: "هندسة الميكاترونيات" },
  { code: "EEC 111", arabicName: "الكترونيات", englishName: "Electronics", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: [], idealSemester: "Level One - Term 2", department: "هندسة الميكاترونيات" },
  { code: "ENG X61", arabicName: "التقارير الفنية", englishName: "Technical Reports", credits: 2, category: "متطلبات تخصص (إجباري)", prerequisites: [], idealSemester: "Level One - Term 2", department: "هندسة الميكاترونيات" },


  { code: "MPE 211", arabicName: "اجهزة قياس", englishName: "Measurements", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EMP 042"], idealSemester: "Level Two - Term 1", department: "هندسة الميكاترونيات" },
  { code: "MPE 231", arabicName: "ميكانيكا الموائع", englishName: "Fluid Mechanics", credits: 2, category: "متطلبات تخصص (إجباري)", prerequisites: ["EMP 042"], idealSemester: "Level Two - Term 1", department: "هندسة الميكاترونيات" },
  { code: "EPE 211", arabicName: "الات كهربائيه", englishName: "Electrical Machines", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EPE 111"], idealSemester: "Level Two - Term 1", department: "هندسة الميكاترونيات" },
  { code: "CCE 211", arabicName: "برمجة حاسب", englishName: "Computer Programming", credits: 2, category: "متطلبات تخصص (إجباري)", prerequisites: [], idealSemester: "Level Two - Term 1", department: "هندسة الميكاترونيات" },

  { code: "MPE 252", arabicName: "نظم ميكاترونيات", englishName: "Mechatronics Systems", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 211"], idealSemester: "Level Two - Term 2", department: "هندسة الميكاترونيات" },
  { code: "PDE 221", arabicName: "تصميم ماكينات", englishName: "Machine Design", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["PDE 111"], idealSemester: "Level Two - Term 2", department: "هندسة الميكاترونيات" },
  { code: "EPE 212", arabicName: "الكترونيات القوي", englishName: "Power Electronics", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EPE 111"], idealSemester: "Level Two - Term 2", department: "هندسة الميكاترونيات" },
  { code: "CCE 212", arabicName: "هندسة الحاسب", englishName: "Computer Engineering", credits: 2, category: "متطلبات تخصص (إجباري)", prerequisites: [], idealSemester: "Level Two - Term 2", department: "هندسة الميكاترونيات" },
  { code: "MPE 351", arabicName: "التحكم الالي في النظم الميكانيكية", englishName: "Automatic Control", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EMP 012"], idealSemester: "Level Three - Term 1", department: "هندسة الميكاترونيات" },
  { code: "MPE 354", arabicName: "روبوتات", englishName: "Robotics", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EMP X14"], idealSemester: "Level Three - Term 1", department: "هندسة الميكاترونيات" },
  { code: "PDE 321", arabicName: "نظرية اهتزازات", englishName: "Theory of Vibrations", credits: 2, category: "متطلبات تخصص (إجباري)", prerequisites: ["EMP 012"], idealSemester: "Level Three - Term 1", department: "هندسة الميكاترونيات" },
  { code: "CCE 311", arabicName: "البرمجة الشيئية وهياكل البيانات", englishName: "OOP & Data Structures", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["CCE 211"], idealSemester: "Level Three - Term 1", department: "هندسة الميكاترونيات" },
  { code: "EEC 312", arabicName: "معالجه الاشارة الرقمية", englishName: "Digital Signal Processing", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: [], idealSemester: "Level Three - Term 1", department: "هندسة الميكاترونيات" },
  { code: "MPE 352", arabicName: "نظم تحكم متقدمة في التطبيقات الميكانيكية", englishName: "Advanced Control", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 351"], idealSemester: "Level Three - Term 2", department: "هندسة الميكاترونيات" },
  { code: "MPE 353", arabicName: "تصميم النظم الميكاترونيكية", englishName: "Mechatronics Sys Design", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 252"], idealSemester: "Level Three - Term 2", department: "هندسة الميكاترونيات" },
  { code: "MPE 331", arabicName: "تصميم النظم الهيدروليكية والنيومايتية", englishName: "Hydraulic & Pneumatic", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 231"], idealSemester: "Level Three - Term 2", department: "هندسة الميكاترونيات" },
  { code: "CCE 321", arabicName: "نظم التحكم الرقمي", englishName: "Digital Control Systems", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 351"], idealSemester: "Level Three - Term 2", department: "هندسة الميكاترونيات" },
  { code: "EEC 311", arabicName: "الاتصالات", englishName: "Communications", credits: 2, category: "متطلبات تخصص (إجباري)", prerequisites: ["EMP X14"], idealSemester: "Level Three - Term 2", department: "هندسة الميكاترونيات" },
  { code: "MPE 452", arabicName: "روبوتات متقدمة", englishName: "Advanced Robotics", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 354"], idealSemester: "Level Four - Term 1", department: "هندسة الميكاترونيات" },
  { code: "MPE 441", arabicName: "هندسة السيارات", englishName: "Automotive Engineering", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 121"], idealSemester: "Level Four - Term 1", department: "هندسة الميكاترونيات" },
  { code: "EEC 411", arabicName: "الانظمة المدمجة", englishName: "Embedded Systems", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EEC 111"], idealSemester: "Level Four - Term 1", department: "هندسة الميكاترونيات" },
  { code: "MPE 251", arabicName: "الصحة والسلامة المهنية", englishName: "Occupational Health & Safety", credits: 1, category: "متطلبات تخصص (إجباري)", prerequisites: [], idealSemester: "Level Four - Term 1", department: "هندسة الميكاترونيات" },
  { code: "MPE 461", arabicName: "مشروع التخرج (1)", englishName: "Graduation Project 1", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["Completion of 112 credits", "ENG X61", "HUM X32"], idealSemester: "Level Four - Term 1", department: "هندسة الميكاترونيات" },
  { code: "MPE 451", arabicName: "التحكم في العمليات الصناعية", englishName: "Industrial Process Control", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 252"], idealSemester: "Level Four - Term 2", department: "هندسة الميكاترونيات" },
  { code: "PDE 421", arabicName: "ماكينات التشغيل بالتحكم العددي", englishName: "CNC Machines", credits: 2, category: "متطلبات تخصص (إجباري)", prerequisites: ["CCE 211", "MPE 111"], idealSemester: "Level Four - Term 2", department: "هندسة الميكاترونيات" },
  
  { code: "MPE 462", arabicName: "مشروع التخرج (2)", englishName: "Graduation Project 2", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 461"], idealSemester: "Level Four - Term 2", department: "هندسة الميكاترونيات" },
  
  // مواد اختيارية تخصص
  { code: "ENG XE1", arabicName: "الاقتصاد الهندسي ودراسات الجدوي", englishName: "Eng. Economy", credits: 2, category: "تخصص (اختياري عام)", prerequisites: [], idealSemester: "Level Two - Term 2", department: "هندسة الميكاترونيات" },
  


  // مواد ذات مفاضله فردية
  { code: "PLACE_HUM_1", arabicName: "الإسعافات الأولية / القانون والأخلاقيات", englishName: "First Aid / Ethics", credits: 2, category: "متطلبات جامعة (اختياري)", prerequisites: [], idealSemester: "Level One - Term 1", department: "المواد العامة (جامعة/كلية)", isPlaceholder: true, exclusiveGroupId: "exc_hum_1" },
  { code: "HUM XE8", arabicName: "مهارات الاسعافات الاولية", englishName: "First Aid Skills", credits: 2, category: "متطلبات جامعة (اختياري)", prerequisites: [], idealSemester: "Level One - Term 1", department: "المواد العامة (جامعة/كلية)", exclusiveGroupId: "exc_hum_1" },
  { code: "HUM XE1", arabicName: "القانون والاخلاقيات في الهندسة", englishName: "Law and Ethics in Engineering", credits: 2, category: "متطلبات جامعة (اختياري)", prerequisites: [], idealSemester: "Level One - Term 1", department: "المواد العامة (جامعة/كلية)", exclusiveGroupId: "exc_hum_1" },

  { code: "PLACE_MPE_1", arabicName: "مقرر اختياري 1", englishName: "Elective Course 1", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 252"], idealSemester: "Level Four - Term 1", department: "هندسة الميكاترونيات", isPlaceholder: true, exclusiveGroupId: "exc_MPE_1" },
  { code: "MPE 453", arabicName: "الميكاترونيات الحيوية", englishName: "Bio-Mechatronics", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 252"], idealSemester: "Level Four - Term 1", department: "هندسة الميكاترونيات", exclusiveGroupId: "exc_MPE_1" },
  { code: "PDE 431", arabicName: "مقدمة إلي الانظمة الميكروالكتروميكانيكية", englishName: "Introductions to Microelectromechanical Systems", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 252"], idealSemester: "Level Four - Term 1", department: "هندسة الميكاترونيات", exclusiveGroupId: "exc_MPE_1" },
  
  { code: "PLACE_MPE_2", arabicName: "مقرر اختياري 2", englishName: "Elective Course 2", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 351", "MPE 121"], requireAnyPrereq: true, idealSemester: "Level Four - Term 2", department: "هندسة الميكاترونيات", isPlaceholder: true, exclusiveGroupId: "exc_MPE_2" },
  { code: "MPE 455", arabicName: "نظم التحكم المؤازر", englishName: "Servo Control Systems", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 351"], idealSemester: "Level Four - Term 2", department: "هندسة الميكاترونيات", exclusiveGroupId: "exc_MPE_2" },
  { code: "MPE 454", arabicName: "انظمة الطاقة المتجدده", englishName: "Renewable Energy Systems", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 121"], idealSemester: "Level Four - Term 2", department: "هندسة الميكاترونيات", exclusiveGroupId: "exc_MPE_2" },
  
  { code: "PLACE_MPE_3", arabicName: "مقرر اختياري 3", englishName: "Elective Course 3", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["CCE 211", "EEC 111"], requireAnyPrereq: true, idealSemester: "Level Four - Term 2", department: "هندسة الميكاترونيات", isPlaceholder: true, exclusiveGroupId: "exc_MPE_3" },
  { code: "CCE 411", arabicName: "رؤية الالة", englishName: "Machine Vision", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["CCE 211"], idealSemester: "Level Four - Term 2", department: "هندسة الميكاترونيات", exclusiveGroupId: "exc_MPE_3" },
  { code: "EEC 412", arabicName: "تصميم الدوائر المتكامله ذات النطاق الواسع جدا", englishName: "VLSI Design", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["EEC 111"], idealSemester: "Level Four - Term 2", department: "هندسة الميكاترونيات", exclusiveGroupId: "exc_MPE_3" },
  
  // مجموعه العلوم الاساسيه 

  // --- 1. الكروت الوهمية لمجموعة العلوم الأساسية (3 كروت عشان الطالب يختار 3 مرات) ---
  { code: "PLACE_EMP_1", arabicName: "مادة علوم أساسية (1)", englishName: "Basic Sciences Elective (1)", credits: 3, category: "متطلبات كلية (اختياري)", prerequisites: [], idealSemester: "Level Two - Term 1", department: "المواد العامة (جامعة/كلية)", isPlaceholder: true, electiveGroupId: "elec_emp_basic" },
  { code: "PLACE_EMP_2", arabicName: "مادة علوم أساسية (2)", englishName: "Basic Sciences Elective (2)", credits: 3, category: "متطلبات كلية (اختياري)", prerequisites: [], idealSemester: "Level Two - Term 1", department: "المواد العامة (جامعة/كلية)", isPlaceholder: true, electiveGroupId: "elec_emp_basic" },
  { code: "PLACE_EMP_3", arabicName: "مادة علوم أساسية (3)", englishName: "Basic Sciences Elective (3)", credits: 3, category: "متطلبات كلية (اختياري)", prerequisites: [], idealSemester: "Level Two - Term 2", department: "المواد العامة (جامعة/كلية)", isPlaceholder: true, electiveGroupId: "elec_emp_basic" },

  // --- 2. المواد الحقيقية للعلوم الأساسية (7 مواد بعد استبعاد المشطوب عليهم) ---
  { code: "EMP X11", arabicName: "الطرق العددية للمهندسين", englishName: "Numerical Methods for Engineers", credits: 3, category: "متطلبات كلية (اختياري)", prerequisites: ["EMP 012", "HUM 131"], idealSemester: "Level Two - Term 1", department: "المواد العامة (جامعة/كلية)", electiveGroupId: "elec_emp_basic" },
  { code: "EMP X12", arabicName: "الرياضيات المتقطعة", englishName: "Discrete Mathematics", credits: 3, category: "متطلبات كلية (اختياري)", prerequisites: ["EMP 011"], idealSemester: "Level Two - Term 1", department: "المواد العامة (جامعة/كلية)", electiveGroupId: "elec_emp_basic" },
  { code: "EMP X15", arabicName: "الاحصاء و نظرية الاحتمالات", englishName: "Statistic and Probability theory", credits: 3, category: "متطلبات كلية (اختياري)", prerequisites: ["EMP 012"], idealSemester: "Level Two - Term 1", department: "المواد العامة (جامعة/كلية)", electiveGroupId: "elec_emp_basic" },
  { code: "EMP X16", arabicName: "بحوث العمليات", englishName: "Operation Research", credits: 3, category: "متطلبات كلية (اختياري)", prerequisites: ["EMP 011"], idealSemester: "Level Two - Term 1", department: "المواد العامة (جامعة/كلية)", electiveGroupId: "elec_emp_basic" },
  { code: "EMP X17", arabicName: "التحليل الإحصائى للبيانات", englishName: "Statistical data analysis", credits: 3, category: "متطلبات كلية (اختياري)", prerequisites: ["EMP 011"], idealSemester: "Level Two - Term 1", department: "المواد العامة (جامعة/كلية)", electiveGroupId: "elec_emp_basic" },
  { code: "EMP X43", arabicName: "الفيزيقا الهندسية (3)", englishName: "Engineering Physics (3)", credits: 3, category: "متطلبات كلية (اختياري)", prerequisites: ["EMP 042"], idealSemester: "Level Two - Term 1", department: "المواد العامة (جامعة/كلية)", electiveGroupId: "elec_emp_basic" },
  { code: "EMP X32", arabicName: "النانوتكنولوجي", englishName: "Nanotechnology", credits: 3, category: "متطلبات كلية (اختياري)", prerequisites: ["EMP 031"], idealSemester: "Level Two - Term 1", department: "المواد العامة (جامعة/كلية)", electiveGroupId: "elec_emp_basic" },


  // مواد طاقه
  { code: "MPE 462", arabicName: "ماده للاختبار", englishName: "test path", credits: 3, category: "متطلبات تخصص (إجباري)", prerequisites: ["MPE 461"], idealSemester: "Level Four - Term 2", department: "هندسة الطاقة والنظم الكهربية" },
];

