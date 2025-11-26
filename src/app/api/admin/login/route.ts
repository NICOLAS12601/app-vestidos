import { NextResponse } from "next/server";
import { verifyCsrfToken } from "@/lib/CsrfSessionManagement";
import { initDb } from "@/src/models";
import bcrypt from "bcrypt";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const form = await req.formData();
  const csrf = form.get("csrf")?.toString() ?? null;
  if (!verifyCsrfToken(csrf)) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid_csrf", req.url));
  }
  const username = (form.get("username") || "").toString().trim();
  const password = (form.get("password") || "").toString();

  if (!username || !password) {
    return NextResponse.redirect(new URL("/admin/login?error=invalid_credentials", req.url));
  }

  try {
    // Inicializar DB y obtener modelo
    const { UsuarioAdmin } = await initDb({ sync: false });

    // Buscar usuario por username
    const usuario = await UsuarioAdmin.findOne({
      where: { username },
    });

    if (!usuario) {
      // No revelar si el usuario existe o no (seguridad)
      return NextResponse.redirect(new URL("/admin/login?error=invalid_credentials", req.url));
    }

    // Verificar contraseña
    const passwordMatch = await bcrypt.compare(password, usuario.password_hash);
    if (!passwordMatch) {
      return NextResponse.redirect(new URL("/admin/login?error=invalid_credentials", req.url));
    }

    // Crear sesión con cookie persistente (7 días)
    const response = NextResponse.redirect(new URL("/admin", req.url));
    const sessionToken = randomUUID();
    // Sesión válida por 7 días (7 * 24 * 60 * 60 segundos)
    const maxAge = 7 * 24 * 60 * 60;
    response.cookies.set("gr_admin", sessionToken, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: maxAge,
    });
    
    return response;
  } catch (error) {
    console.error("Error during login:", error);
    return NextResponse.redirect(new URL("/admin/login?error=server_error", req.url));
  }
}
