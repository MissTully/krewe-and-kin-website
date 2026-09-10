import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/" || pathname === "/index.html") {
    return NextResponse.rewrite(new URL("/site/index.html", request.url));
  }
  if (pathname === "/welcome" || pathname === "/welcome.html") {
    return NextResponse.rewrite(new URL("/site/welcome.html", request.url));
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
