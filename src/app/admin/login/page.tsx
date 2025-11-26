import {getOrCreateCsrfToken} from "@/lib/CsrfSessionManagement";
import Link from "next/link";
export default async function AdminLogin({ searchParams }: { searchParams?: { error?: string } }) {
  const csrf = await getOrCreateCsrfToken();
  const error = searchParams?.error;

  let errorMessage = "";
  if (error === "invalid_credentials") errorMessage = "Invalid username or password.";
  if (error === "invalid_csrf") errorMessage = "Invalid security token. Please try again.";
  if (error === "server_error") errorMessage = "Server error. Please try again later.";

  return (
    <div className="relative min-h-screen">
      <Link 
        href="/" 
        className="absolute top-4 left-25 font-extrabold text-xl tracking-tight"
      >
        GlamRent
      </Link>
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-bold">Admin sign in</h1>
      {errorMessage && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-3 text-sm text-red-800 dark:text-red-200">
            {errorMessage}
          </div>
        )}
      <form action="/api/admin/login" method="POST" className="mt-6 grid gap-3 rounded-2xl border p-4">
        <input type="hidden" name="csrf" value={csrf} />
        <input name="username" placeholder="Username" className="rounded-xl border px-4 py-3 text-sm" />
        <input name="password" type="password" placeholder="Password" className="rounded-xl border px-4 py-3 text-sm" />
        <button className="rounded-xl bg-fuchsia-600 text-white px-4 py-3 text-sm font-semibold">Sign in</button>
        <p className="text-xs text-slate-500">Protected area. Authorized staff only.</p>
      </form>
    </div>
    </div>
  );
}
