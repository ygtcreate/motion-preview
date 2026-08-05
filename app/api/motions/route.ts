import { NextResponse } from "next/server";

const demoMotions = [
  { id: "idle-01", name: "Idle", category: "Idle", duration: 8.33, fps: 30, fileSize: "0.75 MB", updatedAt: "2026.07.22", url: "/api/files/Motions/Idle.fbx" },
  { id: "walk-01", name: "Walking", category: "Walk", duration: 1.03, fps: 30, fileSize: "0.35 MB", updatedAt: "2026.07.22", url: "/api/files/Motions/Walking.fbx" },
  { id: "jump-01", name: "Jump", category: "Action", duration: 2.60, fps: 30, fileSize: "0.53 MB", updatedAt: "2026.07.22", url: "/api/files/Motions/Jump.fbx" },
];

export async function GET() {
  const endpoint = process.env.MOTION_API_URL;
  if (endpoint) {
    const response = await fetch(endpoint, { headers: { Accept: "application/json" } });
    if (!response.ok) return NextResponse.json({ error: "Motion source unavailable" }, { status: 502 });
    return NextResponse.json(await response.json());
  }
  return NextResponse.json(demoMotions);
}
