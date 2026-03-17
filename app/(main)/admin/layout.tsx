// app/(main)/admin/layout.tsx
import { checkIsAdmin } from "@/lib/adminActions";
import { AlertOctagon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const isAdmin = await checkIsAdmin();

  // لو مش أدمن، اعرض صفحة 403 (غير مصرح)
  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[80vh] gap-4 p-8 text-center">
        <div className="bg-destructive/10 p-6 rounded-full">
          <AlertOctagon className="h-16 w-16 text-destructive" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight">غير مصرح بالدخول 403</h1>
        <p className="text-muted-foreground max-w-md text-lg">
          عذراً، هذه الصفحة مخصصة لمديري النظام فقط. ليس لديك الصلاحيات الكافية لعرض هذا المحتوى.
        </p>
        <Link href="/dashboard">
          <Button size="lg" className="mt-4">العودة للرئيسية</Button>
        </Link>
      </div>
    );
  }

  // لو أدمن، دخله عادي
  return <>{children}</>;
}