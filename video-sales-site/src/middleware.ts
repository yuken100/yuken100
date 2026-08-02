import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const REF_COOKIE = "ref_slug";
const REF_COOKIE_MAX_AGE_DAYS = 30;

export function middleware(request: NextRequest) {
  const ref = request.nextUrl.searchParams.get("ref");
  if (!ref) return NextResponse.next();

  const response = NextResponse.next();
  response.cookies.set(REF_COOKIE, ref, {
    maxAge: REF_COOKIE_MAX_AGE_DAYS * 24 * 60 * 60,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
