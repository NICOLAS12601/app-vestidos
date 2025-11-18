import { NextResponse } from "next/server";
import { setAdminSession, verifyCsrfToken } from "@/lib/CsrfSessionManagement";

export async function POST(req: Request) {
  const form = await req.formData();
  const csrf = form.get("csrf")?.toString() ?? null;
  if (!verifyCsrfToken(csrf)) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid_csrf", req.url));
  }
  const username = (form.get("username") || "").toString();
  const password = (form.get("password") || "").toString();

  const expectedUser = process.env.ADMIN_USERNAME || "admin";
  const expectedPassword = process.env.ADMIN_PASSWORD || "admin123"; // set securely in env
  if (username !== expectedUser || password !== expectedPassword) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid_credentials", req.url));
  }

  setAdminSession();
  return NextResponse.redirect(new URL("/admin", req.url));
}
