import { cookies } from "next/headers";

const CSRF_COOKIE = "gr_csrf";
const SESSION_COOKIE = "gr_admin";

export async function getOrCreateCsrfToken() {
    const c = await cookies();
    let token = c.get(CSRF_COOKIE)?.value;
    if (!token) {
        // In RSC render we cannot write cookies; generate a token so the form has one.
        // The actual cookie will be ensured via middleware.
        token = crypto.randomUUID();
    }
    return token;
}

export async function verifyCsrfToken(formToken: string | null | undefined) {
    if (!formToken) return false;
    const cookieToken = (await cookies()).get(CSRF_COOKIE)?.value;
    return !!cookieToken && cookieToken === formToken;
}


export async function setAdminSession() {
    const token = crypto.randomUUID();
    const c = await cookies();
    // Sesión válida por 7 días (7 * 24 * 60 * 60 segundos)
    const maxAge = 7 * 24 * 60 * 60;
    c.set(SESSION_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: maxAge,
    });
    return token;
}


export async function clearAdminSession() {
    const c = await cookies();
    c.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 0 });
}

export async function isAdmin() {
    const cookie = (await cookies()).get(SESSION_COOKIE);
    // Verificar que la cookie exista y tenga un valor válido (no vacío)
    return !!(cookie?.value && cookie.value.length > 0);
}

