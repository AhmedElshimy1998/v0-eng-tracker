import { toast } from "sonner";

// 1. بنعرف الدالة الأساسية (للنجاح - أخضر)
const baseToast = (message: string) => {
  if (typeof window !== "undefined") {
    toast.success(message);
  }
};

// 2. بنضيف وظيفة "الخطأ" كفرع منها (للأحمر)
baseToast.error = (message: string) => {
  if (typeof window !== "undefined") {
    toast.error(message);
  }
};

// 3. تصدير الدالة بعد التعديل
export const toastt = baseToast;