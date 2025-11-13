import { isAdmin, getOrCreateCsrfToken } from "@/lib/CsrfSessionManagement";
import { listItems, listRentals } from "@/lib/RentalManagementSystem";
import { redirect } from "next/navigation";
import Link from "next/link";
import { unstable_noStore as noStore } from "next/cache";

export const dynamic = "force-dynamic";

// Helper: normalizar respuestas de DB/APIs: array directo o envuelto (items/data/results/rows)
function toArray<T = any>(v: any, keys: string[] = ["items", "data", "results", "rows"]): T[] {
  if (Array.isArray(v)) return v as T[];
  for (const k of keys) {
    const maybe = v?.[k];
    if (Array.isArray(maybe)) return maybe as T[];
  }
  return [];
}

// Helper: convertir instancias Sequelize a objetos planos
function toPlain<T = any>(v: any): T {
  if (v?.get && typeof v.get === "function") return v.get({ plain: true }) as T;
  if (v?.toJSON && typeof v.toJSON === "function") return v.toJSON() as T;
  return v as T;
}

type AdminItem = {
  id: number | string;
  name: string;
  category: string;
  sizes: string[];
  pricePerDay: number;
};

export default async function Page() {
  noStore();
  if (!isAdmin()) redirect("/admin/login");
  const csrf = await getOrCreateCsrfToken();

  // Await a DB (Sequelize retorna Promises)
  const [itemsRaw, rentalsRaw] = await Promise.all([listItems(), listRentals()]);

  // DEBUG: Ver qué retorna la DB
  console.log("itemsRaw:", itemsRaw);
  console.log("rentalsRaw:", rentalsRaw);

  // Normalizar para evitar ".map is not a function"
  const items = toArray<any>(itemsRaw).map(toPlain);
  const rentals = toArray<any>(rentalsRaw).map(toPlain);

  console.log("items normalized:", items);
  console.log("rentals normalized:", rentals);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="font-extrabold text-xl tracking-tight mb-5 block">
        GlamRent
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <form action="/api/admin/logout" method="POST">
          <button className="text-sm rounded-lg border px-3 py-2">Sign out</button>
            <Link href="/admin/login">
            </Link>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="font-semibold">Inventory</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400">Add/edit/delete can be wired to a database later.</p>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">ID</th>
                <th className="py-2 pr-4">Name</th>
                <th className="py-2 pr-4">Color</th>
                <th className="py-2 pr-4">Style</th>
                <th className="py-2 pr-4">Sizes</th>
                <th className="py-2 pr-4">Price/day</th>
              </tr>
            </thead>
            <tbody>
            {items.map((i: any) => (
                <tr key={String(i.id)} className="border-t">
                  <td className="py-2 pr-4">{String(i.id)}</td>
                  <td className="py-2 pr-4">{i.name ?? "-"}</td>
                  <td className="py-2 pr-4">{i.color ?? "-"}</td>
                  <td className="py-2 pr-4">{i.style ?? "-"}</td>
                  <td className="py-2 pr-4">
                    {Array.isArray(i.sizes) ? i.sizes.join(", ") : ""}
                  </td>
                  <td className="py-2 pr-4">${Number(i.pricePerDay ?? 0).toFixed(2)}</td>
                </tr>
              ))}
            {items.length === 0 && (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={6}>No items.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-semibold">Scheduled rentals</h2>
        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-2 pr-4">Rental ID</th>
                <th className="py-2 pr-4">Item</th>
                <th className="py-2 pr-4">Dates</th>
                <th className="py-2 pr-4">Customer</th>
                <th className="py-2 pr-4">Status</th>
                <th className="py-2 pr-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rentals.map((r: any) => (
                <tr key={String(r.id ?? r.ID ?? r._id)} className="border-t">
                  <td className="py-2 pr-4">{String(r.id ?? r.ID ?? r._id).slice(0, 8)}</td>
                  <td className="py-2 pr-4">{String(r.itemId ?? r.item_id ?? "")}</td>
                  <td className="py-2 pr-4">
                    {(r.start ?? r.start_date) ?? ""} → {(r.end ?? r.end_date) ?? ""}
                  </td>
                  <td className="py-2 pr-4">
                    {(r.customer?.name ?? r.customer_name) ?? "-"}
                    <div className="text-slate-500 text-xs">
                      {(r.customer?.email ?? r.customer_email) ?? ""} • {(r.customer?.phone ?? r.customer_phone) ?? ""}
                    </div>
                  </td>
                  <td className="py-2 pr-4 capitalize">{r.status ?? r.state ?? "-"}</td>
                  <td className="py-2 pr-4">
                    {(r.status ?? r.state) === "active" ? (
                      <form
                        action={`/api/admin/rentals/${String(r.id ?? r.ID ?? r._id)}/cancel`}
                        method="POST"
                      >
                        <input type="hidden" name="csrf" value={csrf} />
                        <button className="rounded-lg border px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</button>
                      </form>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
              {rentals.length === 0 && (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={6}>No rentals yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
