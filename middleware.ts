import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SESSION_COOKIE = "gr_admin";

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const sessionCookie = request.cookies.get(SESSION_COOKIE);

  // Verificar que la cookie tenga un valor válido (no vacío)
  const hasValidSession = sessionCookie?.value && sessionCookie.value.length > 0;

  // Proteger todas las rutas /admin excepto /admin/login
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    // Si no hay sesión válida, redirigir al login
    if (!hasValidSession) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Proteger todas las rutas /api/admin excepto /api/admin/login
  if (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login") {
    // Si no hay sesión válida, retornar 401
    if (!hasValidSession) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  // Si está en /admin/login y ya tiene sesión válida, redirigir a /admin
  if (pathname === "/admin/login") {
    if (hasValidSession) {
      const adminUrl = new URL("/admin", request.url);
      return NextResponse.redirect(adminUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};

