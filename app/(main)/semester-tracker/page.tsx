"use client";

import { useState, useMemo } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";

// استيراد الدوال والداتا اللي عملناها
// import { calculateGPA, checkCanTake, getEffectiveRecords } from "@/lib/gpaLogic";
// import { coursesCatalog } from "@/lib/courses"; 
// import { StudentCourseRecord } from "@/lib/types";

export default function SemesterTrackerPage() {
  // داتا وهمية مؤقتة عشان نظبط بيها الديزاين لحد ما نربط الداتابيز
  const [cgpa, setCgpa] = useState(2.85);
  const [completedCredits, setCompletedCredits] = useState(45);
  const [failedCredits, setFailedCredits] = useState(3);
  const [warnings, setWarnings] = useState(0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* 1. رأس الصفحة (Header) */}
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Semester Tracker</h2>
      </div>

      {/* 2. شريط الإحصائيات (Stats Cards) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المعدل التراكمي (CGPA)</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${cgpa >= 2.0 ? 'text-green-500' : 'text-red-500'}`}>
              {cgpa.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">من أصل 4.00</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الساعات المنجزة</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedCredits}</div>
            <p className="text-xs text-muted-foreground">ساعة معتمدة بنجاح</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ساعات الرسوب</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedCredits}</div>
            <p className="text-xs text-muted-foreground">ساعات تحتاج إعادة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حالة الإنذارات</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${warnings > 0 ? 'text-red-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${warnings > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {warnings}
            </div>
            <p className="text-xs text-muted-foreground">
              {warnings === 0 ? 'وضع أكاديمي مستقر' : 'تحذير أكاديمي!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. منطقة العمل (الترمات والخطة) */}
      <Tabs defaultValue="semesters" className="space-y-4">
        <TabsList>
          <TabsTrigger value="semesters">الترمات المسجلة</TabsTrigger>
          <TabsTrigger value="catalog">دليل المواد (الخطة المثالية)</TabsTrigger>
        </TabsList>
        
        {/* تاب الترمات اللي الطالب بيسجل فيها */}
        <TabsContent value="semesters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Level Zero - Term 1</CardTitle>
              <CardDescription>الفصل الدراسي الأول - المعدل الفصلي: 3.2</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                (هنا هيتم برمجة الجدول اللي الطالب بيختار فيه المادة ويحط تقديرها)
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* تاب كتالوج المواد اللي بيسحب منها */}
        <TabsContent value="catalog" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>جميع مواد اللائحة</CardTitle>
              <CardDescription>المواد المتاحة للتسجيل حسب المتطلبات</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="text-sm text-muted-foreground">
                (هنا هيتم عرض كروت المواد بالإطارات الذهبي والمقفول زي ما اتفقنا)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}