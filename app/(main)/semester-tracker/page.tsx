"use client";

import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, AlertTriangle, CheckCircle2, XCircle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function SemesterTrackerPage() {
  const [cgpa, setCgpa] = useState(2.85);
  const [completedCredits, setCompletedCredits] = useState(45);
  const [failedCredits, setFailedCredits] = useState(3);
  const [warnings, setWarnings] = useState(0);

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* رأس الصفحة */}
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">التتبع الأكاديمي</h2>
          <p className="text-muted-foreground">تابع تقدمك، خطط لموادك، وحلل معدلك التراكمي.</p>
        </div>
      </div>

      {/* شريط الإحصائيات العلوي */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* الكروت زي ما هي عشان شكلها كان عاجبك */}
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

        <Card className="relative group cursor-pointer hover:border-red-500/50 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ساعات الرسوب</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{failedCredits}</div>
            <p className="text-xs text-muted-foreground">مرر الماوس لمعرفة المواد</p>
          </CardContent>
          {/* النافذة العايمة (Hover Tooltip) السريعة لمواد الرسوب */}
          <div className="absolute top-full mt-2 left-0 w-full z-50 hidden group-hover:block">
            <div className="bg-popover text-popover-foreground border shadow-lg rounded-md p-3 text-sm">
              <div className="flex justify-between items-center mb-1 text-red-500">
                <span>الميكانيكا الهندسية (1)</span>
                <span>3 ساعات</span>
              </div>
            </div>
          </div>
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
            <p className="text-xs text-muted-foreground">وضع أكاديمي مستقر</p>
          </CardContent>
        </Card>
      </div>

      {/* منطقة العمل مع ستايل التابات الجديد */}
      <Tabs defaultValue="academic-summary" className="space-y-6 mt-8">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent p-0 h-auto">
          <TabsTrigger 
            value="academic-summary" 
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 py-3 font-semibold text-base transition-all"
          >
            الملخص الأكاديمي
          </TabsTrigger>
          <TabsTrigger 
            value="semesters-management" 
            className="data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none border-b-2 border-transparent rounded-none px-6 py-3 font-semibold text-base transition-all"
          >
            إدارة الفصول الدراسية
          </TabsTrigger>
        </TabsList>
        
        {/* التابة الأولى (الأساسية): الملخص الأكاديمي */}
        <TabsContent value="academic-summary" className="space-y-4 animate-in fade-in-50 duration-500">
          <Card className="border-none shadow-none bg-transparent">
            <CardHeader className="px-0">
              <CardTitle>نظرة عامة على مسارك الأكاديمي</CardTitle>
              <CardDescription>هنا تظهر جميع مواد اللائحة وحالتك فيها. المواد الخضراء تم اجتيازها.</CardDescription>
            </CardHeader>
            <CardContent className="px-0">
               {/* تصميم مبدئي لكارت مادة ناجح فيها عشان تتخيل الشكل */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="border border-green-500/30 bg-green-500/5 p-4 rounded-lg flex flex-col justify-between">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-green-600 dark:text-green-400">الرياضيات الهندسية (1)</div>
                      <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">A+ | 4.0</Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">EMP 011 • 3 ساعات</div>
                  </div>

                  {/* تصميم مادة لسه مقفولة (Disabled) */}
                  <div className="border border-muted p-4 rounded-lg flex flex-col justify-between opacity-60">
                    <div className="flex justify-between items-start mb-2">
                      <div className="font-semibold text-muted-foreground">الرياضيات الهندسية (2)</div>
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="text-xs text-muted-foreground">EMP 012 • متطلب: EMP 011</div>
                  </div>
               </div>
            </CardContent>
          </Card>
        </TabsContent>
        
{/* التابة التانية: إدارة الفصول الدراسية */}
        <TabsContent value="semesters-management" className="space-y-4 animate-in fade-in-50 duration-500">
          <Card>
            <CardHeader>
              <CardTitle>إدارة الفصول الدراسية</CardTitle>
              <CardDescription>قم بإضافة الفصول الدراسية، تسجيل المواد، وتحديث التقديرات هنا.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                (هنا هيتم برمجة زرار إضافة ترم جديد، والجدول اللي بتسجل فيه التقديرات)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}