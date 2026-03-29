"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldCheck, UserX, Search, Filter } from "lucide-react";
import { useAuth } from "@/lib/auth-client";
import { Input } from "@/components/ui/input";

import { getAllStudents, toggleAdminStatus, getSiteAdmins, deleteUserAccount } from "@/lib/adminActions";
import { getDepartments, DepartmentItem } from "@/lib/academicActions";
import { calculateGPA, getEffectiveRecords } from "@/lib/academic-logic";
import { coursesCatalog } from "@/lib/courses";

export default function RolesManagementPage() {
  const { userId: currentUserId } = useAuth();
  const [users, setUsers] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<string[]>([]);
  const [departments, setDepartments] = useState<DepartmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("all");

  const loadData = async () => {
    setIsLoading(true);
    const [studentsData, adminsData, deptsData] = await Promise.all([
      getAllStudents(),
      getSiteAdmins(),
      getDepartments()
    ]);
    setUsers(studentsData);
    setAdminsList(adminsData);
    setDepartments(deptsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const getLevel = (credits: number) => {
    const levelNum = Math.floor(credits / 32);
    const levels = ["المستوى الصفري", "المستوى الأول", "المستوى الثاني", "المستوى الثالث", "المستوى الرابع"];
    return levels[Math.min(levelNum, 4)];
  };

  const filteredUsers = useMemo(() => {
    return users.map(user => {
      const semesters = user.profile.semesters || [];
      const allRecords = semesters.flatMap((s: any) => s.courses);
      const effectiveRecords = getEffectiveRecords(allRecords);
      const { totalCredits } = calculateGPA(effectiveRecords, coursesCatalog);
      
      const levelName = getLevel(totalCredits);
      // توحيد اسم القسم
      const deptName = departments.find(d => d.id === user.profile.department)?.name || (user.profile.department === "General" ? "المواد العامة" : user.profile.department);
      
      return { ...user, computed: { levelName, deptName } };
    }).filter(user => {
      const searchMatch = 
        (user.profile.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.profile.phone || "").includes(searchTerm);
      const levelMatch = selectedLevel === "all" || user.computed.levelName === selectedLevel;
      return searchMatch && levelMatch;
    });
  }, [users, searchTerm, selectedLevel, departments]);

  const handleToggleRole = async (targetId: string, currentIsAdmin: boolean) => {
    if (targetId === currentUserId) return toastt.warn("لا يمكنك تغيير صلاحيات نفسك من هذه الشاشة!");
    const confirmMsg = currentIsAdmin ? "هل أنت متأكد من سحب صلاحيات الإدارة من هذا المستخدم؟" : "هل أنت متأكد من ترقية هذا المستخدم ليكون مدير (Admin)؟";
    if (!confirm(confirmMsg)) return;

    setProcessingId(targetId);
    const result = await toggleAdminStatus(targetId, !currentIsAdmin);
    if (result.success) await loadData();
    else toastt.error("حدث خطأ أثناء تعديل الصلاحيات.");
    setProcessingId(null);
  };

  const handleDeleteUser = async (targetId: string, userName: string) => {
    if (targetId === currentUserId) return toastt.warn("لا يمكنك حذف حسابك الشخصي من هنا!");
    const confirmMsg = `⚠️ تحذير خطير ⚠️\nهل أنت متأكد من حذف الطالب "${userName}" نهائياً؟\nسيتم مسح حسابه وكل بياناته من قاعدة البيانات ولن يمكن التراجع عن هذا الإجراء!`;
    if (!confirm(confirmMsg)) return;

    setProcessingId(targetId);
    const result = await deleteUserAccount(targetId);
    if (result.success) {
      toastt("تم حذف المستخدم وكل بياناته بنجاح.");
      await loadData();
    } else toastt.error(`حدث خطأ أثناء الحذف: ${result.error || "مجهول"}`);
    setProcessingId(null);
  };

  if (isLoading) return <div className="p-12 text-center"><Loader2 className="animate-spin h-8 w-8 mx-auto text-primary" /></div>;

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">إدارة الصلاحيات والمستخدمين</h2>
          <p className="text-muted-foreground">قم بترقية المستخدمين أو حذف الحسابات الوهمية نهائياً من النظام.</p>
        </div>
      </div>

      {/* فلاتر البحث الجديدة */}
      <Card className="bg-muted/20 border-dashed">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="ابحث بالاسم أو رقم الهاتف..." 
              className="pr-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
            <select 
              className="h-10 w-full md:w-auto rounded-md border border-input bg-background px-3 text-sm outline-none"
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
            >
              <option value="all">جميع المستويات</option>
              <option value="المستوى الصفري">المستوى الصفري</option>
              <option value="المستوى الأول">المستوى الأول</option>
              <option value="المستوى الثاني">المستوى الثاني</option>
              <option value="المستوى الثالث">المستوى الثالث</option>
              <option value="المستوى الرابع">المستوى الرابع</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين المسجلين</CardTitle>
          <CardDescription>عدد الحسابات المطابقة: {filteredUsers.length}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <div className="min-w-[800px] p-6 pt-0">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/50 text-muted-foreground border-b">
                <tr>
                  {/* تم ضبط محاذاة الاسم هنا (text-right) */}
                  <th className="px-4 py-3 font-medium text-right w-1/4">الاسم</th>
                  <th className="px-4 py-3 font-medium text-right w-1/4">القسم / الهاتف</th>
                  <th className="px-4 py-3 font-medium text-center">المستوى</th>
                  <th className="px-4 py-3 font-medium text-center">حالة الصلاحية</th>
                  <th className="px-4 py-3 font-medium text-center">إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredUsers.map((user) => {
                  const isAdmin = adminsList.includes(user.userId);
                  const isMe = user.userId === currentUserId;
                  const isProcessing = processingId === user.userId;

                  return (
                    <tr key={user.userId} className={`hover:bg-muted/30 transition-colors ${isMe ? 'bg-primary/5' : ''}`}>
                      {/* تم ضبط محاذاة الداتا لتتطابق مع الهيدر */}
                      <td className="px-4 py-4 font-semibold text-right">
                        <div className="flex items-center gap-2 justify-start">
                          <span>{user.profile.name || "مستخدم بدون اسم"}</span>
                          {isMe && <Badge variant="outline" className="text-[10px] shrink-0">أنت</Badge>}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="text-sm font-medium">{user.computed.deptName}</div>
                        <div className="text-xs text-muted-foreground">{user.profile.phone || "-"}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <Badge variant="outline" className="bg-background">{user.computed.levelName}</Badge>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isAdmin ? (
                          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20">
                            <ShieldCheck className="w-3 h-3 ml-1 inline-block" /> مدير نظام
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted">طالب مسجل</Badge>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant={isAdmin ? "outline" : "default"} 
                            size="sm"
                            className="text-xs"
                            disabled={isMe || isProcessing}
                            onClick={() => handleToggleRole(user.userId, isAdmin)}
                          >
                            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : isAdmin ? "سحب الصلاحية" : "ترقية لمدير"}
                          </Button>

                          <Button 
                            variant="destructive" 
                            size="sm"
                            className="text-xs gap-1"
                            disabled={isMe || isProcessing}
                            onClick={() => handleDeleteUser(user.userId, user.profile.name || "مجهول")}
                          >
                            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <><UserX className="h-3 w-3" /> حذف نهائي</>}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredUsers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">لا يوجد مستخدمين يطابقون بحثك.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}