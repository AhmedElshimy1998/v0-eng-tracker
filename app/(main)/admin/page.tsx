"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Users, ShieldCheck } from "lucide-react";
import Link from "next/link";

export default function AdminDashboardMain() {
  return (
    <div className="flex-1 space-y-8 p-4 md:p-8 pt-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">لوحة تحكم الإدارة</h2>
        <p className="text-muted-foreground">مرحباً بك في لوحة تحكم النظام. اختر الخدمة التي تريد إدارتها.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link href="/admin/curriculum">
          <Card className="hover:border-primary transition-all cursor-pointer h-full group">
            <CardHeader>
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <BookOpen className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>إدارة اللائحة والأقسام</CardTitle>
              <CardDescription>إضافة وتعديل المواد، المتطلبات، وإدارة الأقسام الأكاديمية.</CardDescription>
            </CardHeader>
            <CardContent>
              {/* أي محتوى إضافي ممكن يتحط هنا مستقبلاً */}
            </CardContent>
          </Card>
        </Link>

        <Link href="/admin/students">
          <Card className="hover:border-primary transition-all cursor-pointer h-full group">
            <CardHeader>
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-500/20 transition-colors">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <CardTitle>متابعة الطلاب</CardTitle>
              <CardDescription>عرض بيانات الطلاب، متابعة الأداء الفصلي، التراكمي، وحالة الإنذارات.</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </Link>

        <Link href="/admin/roles">
          <Card className="hover:border-primary transition-all cursor-pointer h-full group">
            <CardHeader>
              <div className="bg-orange-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-500/20 transition-colors">
                <ShieldCheck className="h-6 w-6 text-orange-500" />
              </div>
              <CardTitle>إدارة الصلاحيات</CardTitle>
              <CardDescription>تعيين أو إزالة صلاحيات الإدارة (Admin) للمستخدمين المسجلين.</CardDescription>
            </CardHeader>
            <CardContent></CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}