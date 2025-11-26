import { NextResponse } from "next/server";
import { clearAdminSession } from "@/lib/CsrfSessionManagement";

export async function POST(req: Request) {
  await clearAdminSession();
  
  // Crear respuesta de redirect y eliminar la cookie explícitamente
  const response = NextResponse.redirect(new URL("/admin/login", req.url));
  response.cookies.set("gr_admin", "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
  
  return response;
}
