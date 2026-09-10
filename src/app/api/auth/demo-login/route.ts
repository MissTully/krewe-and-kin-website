import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-data";

export async function POST(request: Request) {
  if (!isDemoMode()) {
    return NextResponse.json(
      { error: "Demo login only available when DEMO_MODE=true" },
      { status: 403 }
    );
  }
  const body = (await request.json()) as { role?: string };
  const role = body.role === "admin" ? "admin" : "client";
  const res = NextResponse.json({ ok: true, role });
  res.cookies.set("kk_demo_role", role, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return res;
}
