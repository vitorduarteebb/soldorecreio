import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const session = req.auth;
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin")) {
    if (!session?.user)
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    if (session.user.role !== "MERCHANT_ADMIN")
      return NextResponse.redirect(new URL("/cliente", req.nextUrl));
  }

  if (path.startsWith("/complete-profile")) {
    if (!session?.user)
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    if (session.user.role !== "CUSTOMER")
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    if (!session.user.needsProfile)
      return NextResponse.redirect(new URL("/cliente", req.nextUrl));
    return NextResponse.next();
  }

  if (path.startsWith("/cliente")) {
    if (!session?.user)
      return NextResponse.redirect(new URL("/login", req.nextUrl));
    if (session.user.role !== "CUSTOMER")
      return NextResponse.redirect(new URL("/admin", req.nextUrl));
    if (session.user.needsProfile)
      return NextResponse.redirect(
        new URL("/complete-profile", req.nextUrl),
      );
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/admin/:path*", "/cliente/:path*", "/complete-profile"],
};
