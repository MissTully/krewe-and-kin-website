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
        "This preview doesn't email a link. Use the preview buttons below, or write missy@kreweandkin.com.",
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
      message: "Check your email for a sign-in link.",
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      {
        error:
          "Sign-in isn't available right now. Email missy@kreweandkin.com and I'll help you in.",
      },
      { status: 500 }
    );
  }
}
