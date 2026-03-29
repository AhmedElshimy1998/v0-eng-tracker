import { toast } from "sonner"; // استدعاء sonner

export const toastt = (message: string, type: "default" | "destructive" = "default") => {
  if (type === "destructive") {
    toast.error(message); // هيظهر لون أحمر للخطأ
  } else {
    toast.success(message); // هيظهر لون أخضر للنجاح
  }
};