import { isDemoMode, DEMO_ADMIN, DEMO_CLIENT_PROFILE } from "./demo-data";
import type { Profile, UserRole } from "./types";

export type SessionUser = {
  id: string;
  email: string;
  profile: Profile;
};

/**
 * Resolve current user. In DEMO_MODE, uses cookie `kk_demo_role` (admin|client).
 * With Supabase configured, reads auth session + profiles.role.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  if (isDemoMode()) {
    const { cookies } = await import("next/headers");
    const store = await cookies();
    const raw = store.get("kk_demo_role")?.value;
    if (raw !== "admin" && raw !== "client") {
      return null;
    }
    const role = raw as UserRole;
    const profile = role === "admin" ? DEMO_ADMIN : DEMO_CLIENT_PROFILE;
    return { id: profile.id, email: profile.email, profile };
  }

  try {
    const { createClient } = await import("./supabase/server");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (!profile) {
      return {
        id: user.id,
        email: user.email || "",
        profile: {
          id: user.id,
          email: user.email || "",
          full_name: null,
          role: "client",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      };
    }

    return {
      id: user.id,
      email: user.email || profile.email,
      profile: profile as Profile,
    };
  } catch {
    return null;
  }
}

export async function requireUser(roles?: UserRole[]): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  if (roles && !roles.includes(user.profile.role)) {
    throw new Error("FORBIDDEN");
  }
  return user;
}
