import { toast } from "sonner";

// تعريف الدالة الأساسية (للنجاح - أخضر) مع إضافة باراميتر للمدة
const baseToast = (message: string, duration: number = 3000) => {
  if (typeof window !== "undefined") {
    toast.success(message, { duration });
  }
};

// إضافة وظيفة الخطأ (للأحمر) مع التحكم في المدة
baseToast.error = (message: string, duration: number = 4000) => {
  if (typeof window !== "undefined") {
    toast.error(message, { duration });
  }
};

// 3. إضافة وظيفة التنبيه (الأصفر لو حبيت مستقبلاً)
baseToast.warn = (message: string, duration: number = 4000) => {
  if (typeof window !== "undefined") {
    toast.warning(message);
  }
};

export const toastt = baseToast;