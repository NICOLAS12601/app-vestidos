import {getOrCreateCsrfToken} from "@/lib/CsrfSessionManagement";
import Link from "next/link";
export default async function AdminLogin() {
  const csrf = await getOrCreateCsrfToken();
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
