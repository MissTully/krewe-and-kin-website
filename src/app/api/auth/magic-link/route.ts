import { NextResponse } from "next/server";
import { isDemoMode } from "@/lib/demo-data";

export async function POST(request: Request) {
  const body = (await request.json()) as { email?: string };
  const email = body.email?.trim();
  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  if (isDemoMode()) {
    return NextResponse.json({
      message:
        "DEMO_MODE is on — use the demo buttons below, or configure Supabase and set DEMO_MODE=false.",
    });
  }

  try {
    const { createClient } = await import("@/lib/supabase/server");
    const supabase = await createClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${appUrl}/auth/callback`,
      },
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json({
      message: "Magic link sent. Check your inbox.",
    });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error
            ? e.message
            : "Supabase is not configured. Set env vars or use DEMO_MODE=true.",
      },
      { status: 500 }
    );
  }
}
