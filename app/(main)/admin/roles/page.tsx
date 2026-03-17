"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ShieldAlert, ShieldCheck, Trash2, UserX } from "lucide-react";
import { useAuth } from "@clerk/nextjs";

// استيراد الدوال من ملف الأكشنز
import { getAllStudents, toggleAdminStatus, getSiteAdmins, deleteUserAccount } from "@/lib/adminActions";

export default function RolesManagementPage() {
  const { userId: currentUserId } = useAuth(); // عشان نعرف مين اللي فاتح الصفحة
  const [users, setUsers] = useState<any[]>([]);
  const [adminsList, setAdminsList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const [studentsData, adminsData] = await Promise.all([
      getAllStudents(),
      getSiteAdmins()
    ]);
    setUsers(studentsData);
    setAdminsList(adminsData);
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // دالة الترقية / سحب الصلاحية
  const handleToggleRole = async (targetId: string, currentIsAdmin: boolean) => {
    if (targetId === currentUserId) {
      return alert("لا يمكنك تغيير صلاحيات نفسك من هذه الشاشة!");
    }
    
    const confirmMsg = currentIsAdmin 
      ? "هل أنت متأكد من سحب صلاحيات الإدارة من هذا المستخدم؟" 
      : "هل أنت متأكد من ترقية هذا المستخدم ليكون مدير (Admin)؟";
      
    if (!confirm(confirmMsg)) return;

    setProcessingId(targetId);
    const result = await toggleAdminStatus(targetId, !currentIsAdmin);
    if (result.success) {
      await loadData(); // تحديث القائمة
    } else {
      alert("حدث خطأ أثناء تعديل الصلاحيات.");
    }
    setProcessingId(null);
  };

  // دالة الحذف النهائي (النووي)
  const handleDeleteUser = async (targetId: string, userName: string) => {
    if (targetId === currentUserId) {
      return alert("لا يمكنك حذف حسابك الشخصي من هنا!");
    }

    const confirmMsg = `⚠️ تحذير خطير ⚠️\nهل أنت متأكد من حذف الطالب "${userName}" نهائياً؟\nسيتم مسح حسابه وكل بياناته من قاعدة البيانات ولن يمكن التراجع عن هذا الإجراء!`;
    
    if (!confirm(confirmMsg)) return;

    setProcessingId(targetId);
    const result = await deleteUserAccount(targetId);
    
    if (result.success) {
      alert("تم حذف المستخدم وكل بياناته بنجاح.");
      await loadData(); // تحديث القائمة
    } else {
      alert(`حدث خطأ أثناء الحذف: ${result.error || "مجهول"}`);
    }
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

      <Card>
        <CardHeader>
          <CardTitle>قائمة المستخدمين المسجلين</CardTitle>
          <CardDescription>عدد الحسابات في قاعدة البيانات: {users.length}</CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto p-0">
          <div className="min-w-[800px] p-6 pt-0">
            <table className="w-full text-sm text-right">
              <thead className="bg-muted/50 text-muted-foreground border-b">
                <tr>
                  <th className="px-4 py-3 font-medium">الاسم</th>
                  <th className="px-4 py-3 font-medium">القسم / الهاتف</th>
                  <th className="px-4 py-3 font-medium text-center">حالة الصلاحية</th>
                  <th className="px-4 py-3 font-medium text-center">إجراءات الإدارة</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {users.map((user) => {
                  const isAdmin = adminsList.includes(user.userId);
                  const isMe = user.userId === currentUserId;
                  const isProcessing = processingId === user.userId;

                  return (
                    <tr key={user.userId} className={`hover:bg-muted/30 transition-colors ${isMe ? 'bg-primary/5' : ''}`}>
                      <td className="px-4 py-4 font-semibold flex items-center gap-2">
                        {user.profile.name || "مستخدم بدون اسم"}
                        {isMe && <Badge variant="outline" className="text-[10px] ml-2">أنت</Badge>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm">{user.profile.department || "عام"}</div>
                        <div className="text-xs text-muted-foreground">{user.profile.phone || "-"}</div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {isAdmin ? (
                          <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20 hover:bg-orange-500/20">
                            <ShieldCheck className="w-3 h-3 ml-1 inline-block" /> مدير نظام
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-muted">
                            طالب مسجل
                          </Badge>
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
                {users.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">لا يوجد مستخدمين مسجلين.</td>
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