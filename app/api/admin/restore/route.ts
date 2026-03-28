import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const backupData = await req.json(); // استلام الملف المرفوع
    const keys = Object.keys(backupData);

    if (!keys || keys.length === 0) {
      return NextResponse.json({ error: "الملف فارغ أو غير صالح" }, { status: 400 });
    }

    // 🚀 تنفيذ عملية الرفع (Restore)
    // بنستخدم مصفوفة Promises عشان نخلص بسرعة
    let count = 0;
    const batchSize = 50;

    for (let i = 0; i < keys.length; i += batchSize) {
      const batchKeys = keys.slice(i, i + batchSize);
      await Promise.all(
        batchKeys.map((key) => kv.set(key, backupData[key]))
      );
      count += batchKeys.length;
    }

    return NextResponse.json({ success: true, restoredCount: count });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}