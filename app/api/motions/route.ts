import { NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { getDb } from "../../../db";
import { motions } from "../../../db/schema";

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export async function GET() {
  const rows = await getDb()
    .select()
    .from(motions)
    .orderBy(asc(motions.sortOrder));

  return NextResponse.json(
    rows.map((motion) => ({
      id: motion.id,
      name: motion.name,
      category: motion.category,
      duration: motion.duration,
      fps: motion.fps,
      fileSize: formatFileSize(motion.fileSize),
      updatedAt: motion.updatedAt,
      url: `/api/files/${motion.r2Key}`,
    })),
    { headers: { "X-Motion-Source": "cloudflare-d1" } },
  );
}
