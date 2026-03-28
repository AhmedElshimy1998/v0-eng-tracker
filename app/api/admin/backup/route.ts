import { kv } from "@vercel/kv";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    let cursor = 0;
    const allKeys: string[] = [];

    // 1. 🚀 SCAN بجلب كل مفاتيح الداتا بيز بلا استثناء
    do {
      const [nextCursor, keys] = await kv.scan(cursor, { count: 1000 });
      allKeys.push(...keys);
      cursor = nextCursor;
    } while (cursor !== 0);

    if (allKeys.length === 0) {
      return NextResponse.json({ message: "Database is already empty" });
    }

    // 2. 🚀 MGET بجلب القيم كلها في خبطات سريعة (كل 100 مفتاح مع بعض)
    const backupData: Record<string, any> = {};
    const batchSize = 100;

    for (let i = 0; i < allKeys.length; i += batchSize) {
      const batch = allKeys.slice(i, i + batchSize);
      const values = await kv.mget(...batch);
      batch.forEach((key, index) => {
        backupData[key] = values[index];
      });
    }

    // 3. 🚀 تحويل الداتا لملف جاهز للتحميل
    const jsonString = JSON.stringify(backupData, null, 2);
    const fileName = `studyhub-backup-${new Date().toISOString().split('T')[0]}.json`;

    return new NextResponse(jsonString, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}