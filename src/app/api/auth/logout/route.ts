import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-data";

export async function POST(request: Request) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(request.url).origin;
  const res = NextResponse.redirect(new URL("/clients/login", appUrl));
  res.cookies.set("kk_demo_role", "", { path: "/", maxAge: 0 });

  if (!isDemoMode()) {
    try {
      const { createClient } = await import("@/lib/supabase/server");
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }
  return res;
}
