import { isAdmin, getOrCreateCsrfToken } from "@/lib/CsrfSessionManagement";
import {
  listItems,
  listRentals,
  createItem,
  updateItem,
  deleteItem,
  updateRental,
  getItem,
  cancelRental,
  approveRental, // <-- agregar
} from "@/lib/RentalManagementSystem";
import { redirect } from "next/navigation";
import Link from "next/link";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";

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

// Server Actions
async function addItemAction(formData: FormData) {
  "use server";
  const nombre = String(formData.get("nombre") ?? "");
  const color = String(formData.get("color") ?? "");
  const estilo = String(formData.get("estilo") ?? "");
  const talle = String(formData.get("talle") ?? "");
  const precio = String(formData.get("precio") ?? "0");
  if (!nombre) return;
  await createItem({ nombre, color, estilo, talle, precio });
  revalidatePath("/admin");
}
async function deleteItemAction(formData: FormData) {
  "use server";
  const id = formData.get("id");
  if (!id) return;
  await deleteItem(String(id));
  revalidatePath("/admin");
}
async function updateItemAction(formData: FormData) {
  "use server";
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await updateItem(id, {
    nombre: String(formData.get("nombre") ?? ""),
    color: String(formData.get("color") ?? ""),
    estilo: String(formData.get("estilo") ?? ""),
    talle: String(formData.get("talle") ?? ""),
    precio: String(formData.get("precio") ?? "0"),
  });
  revalidatePath("/admin");
}
async function updateRentalAction(formData: FormData) {
  "use server";
  const id = String(formData.get("rid") ?? "");
  if (!id) return;
  await updateRental(id, {
    fecha_ini: String(formData.get("fecha_ini") ?? ""),
    fecha_out: String(formData.get("fecha_out") ?? ""),
    status: String(formData.get("status") ?? ""),
    customer_name: String(formData.get("customer_name") ?? ""),
    customer_email: String(formData.get("customer_email") ?? ""),
    customer_phone: String(formData.get("customer_phone") ?? ""),
  });
  revalidatePath("/admin");
}
async function cancelRentalAction(formData: FormData) {
  "use server";
  const id = String(formData.get("rid") ?? "");
  if (!id) return;
  await cancelRental(id);
  revalidatePath("/admin");
}

async function approveRentalAction(formData: FormData) {
  "use server";
  const id = String(formData.get("rid") ?? "");
  if (!id) return;
  await approveRental(id);
  revalidatePath("/admin");
}

export default async function Page({ searchParams }: { searchParams?: { editItem?: string; editRental?: string } }) {
  noStore();
  if (!isAdmin()) redirect("/admin/login");
  const csrf = await getOrCreateCsrfToken();

  // Await a DB (Sequelize retorna Promises)
  const [itemsRaw, rentalsRaw] = await Promise.all([listItems(), listRentals()]);

  // Normalizar para evitar ".map is not a function"
  const items = toArray<any>(itemsRaw).map(toPlain);
  const rentals = toArray<any>(rentalsRaw).map(toPlain);

  // Datos para edición
  const editItemId = searchParams?.editItem;
  const editRentalId = searchParams?.editRental;
  const itemForEdit = editItemId ? await getItem(editItemId) : null;
  const rentalForEdit = editRentalId ? rentals.find((r: any) => String(r.id ?? r.ID ?? r._id) === String(editRentalId)) : null;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="font-extrabold text-xl tracking-tight mb-5 block">
        GlamRent
      </Link>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Admin dashboard</h1>
        <form action="/api/admin/logout" method="POST">
          <button
            className="text-sm rounded-lg border px-3 py-2 cursor-pointer transition-colors hover:bg-gray-200 dark:hover:bg-gray-700"
          >
            Sign out
          </button>
            <Link href="/admin/login">
            </Link>
        </form>
      </div>

      <section className="mt-8">
        <h2 className="font-semibold">Inventory</h2>

        {/* Add product */}
        <div className="my-4 p-4 border rounded-lg bg-slate-50 dark:bg-slate-900">
          <form action={addItemAction} className="flex flex-wrap gap-3 items-end">
            <div>
              <label className="block text-xs font-semibold mb-1">Nombre</label>
              <input name="nombre" required className="border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Color</label>
              <input name="color" className="border rounded px-2 py-1" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Estilo</label>
              <input name="estilo" className="border rounded px-2 py-1" placeholder="Formal, casual, etc." />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Talles (CSV)</label>
              <input name="talle" className="border rounded px-2 py-1" placeholder="XS,S,M,L" />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Precio por día</label>
              <input name="precio" type="number" step="0.01" min="0" required className="border rounded px-2 py-1" />
            </div>
            <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">Add product</button>
          </form>
        </div>

        {/* Listado */}
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
                <th className="py-2 pr-0 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i: any) => (
                <tr key={String(i.id)} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800 group">
                  <td className="py-2 pr-4 relative">
                    <Link href={`?editItem=${String(i.id)}`} className="absolute inset-0 cursor-pointer" aria-label="Edit item" />
                    {String(i.id)}
                  </td>
                  <td className="py-2 pr-4">{i.name ?? "-"}</td>
                  <td className="py-2 pr-4">{i.color ?? "-"}</td>
                  <td className="py-2 pr-4">{i.style ?? "-"}</td>
                  <td className="py-2 pr-4">
                    {Array.isArray(i.sizes) ? i.sizes.join(", ") : ""}
                  </td>
                  <td className="py-2 pr-4">${Number(i.pricePerDay ?? 0).toFixed(2)}</td>
                  <td className="py-2 pl-4 pr-0 text-right">
                    <form action={deleteItemAction} className="relative z-10 inline">
                      <input type="hidden" name="id" value={String(i.id)} />
                      <button className="rounded border px-2 py-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 cursor-pointer">Delete</button>
                    </form>
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr>
                  <td className="py-3 text-slate-500" colSpan={7}>No items.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Panel de edición de item */}
        {itemForEdit && (
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Edit product #{String(itemForEdit.id)}</h3>
            <form action={updateItemAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="hidden" name="id" value={String(itemForEdit.id)} />
              <label className="text-xs font-semibold">Nombre
                <input name="nombre" defaultValue={itemForEdit.raw?.nombre ?? itemForEdit.name ?? ""} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
              <label className="text-xs font-semibold">Color
                <input name="color" defaultValue={itemForEdit.raw?.color ?? itemForEdit.color ?? ""} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
              <label className="text-xs font-semibold">Estilo
                <input name="estilo" defaultValue={itemForEdit.raw?.estilo ?? itemForEdit.style ?? ""} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
              <label className="text-xs font-semibold">Talles (CSV)
                <input name="talle" defaultValue={itemForEdit.raw?.talle ?? (Array.isArray(itemForEdit.sizes) ? itemForEdit.sizes.join(",") : "")} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
              <label className="text-xs font-semibold">Precio por día
                <input name="precio" type="number" step="0.01" min="0" defaultValue={String(itemForEdit.raw?.precio ?? itemForEdit.pricePerDay ?? "0")} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
              <div className="col-span-full flex gap-2 mt-2">
                <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">Save</button>
                <Link href="/admin" className="border px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</Link>
              </div>
            </form>
          </div>
        )}
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
                <tr key={String(r.id ?? r.ID ?? r._id)} className="border-t hover:bg-slate-50 dark:hover:bg-slate-800 group">
                  <td className="py-2 pr-4 relative">
                    <Link href={`?editRental=${String(r.id ?? r.ID ?? r._id)}`} className="absolute inset-0 cursor-pointer" aria-label="Edit rental" />
                    {String(r.id ?? r.ID ?? r._id).slice(0, 8)}
                  </td>
                  <td className="py-2 pr-4">{String(r.vestido_id ?? r.itemId ?? r.item_id ?? "")}</td>
                  <td className="py-2 pr-4">
                    {(r.fecha_ini ?? r.start ?? r.start_date) ?? ""} → {(r.fecha_out ?? r.end ?? r.end_date) ?? ""}
                  </td>
                  <td className="py-2 pr-4">
                    {(r.customer_name ?? r.customer?.name) ?? "-"}
                    <div className="text-slate-500 text-xs">
                      {(r.customer_email ?? r.customer?.email) ?? ""} • {(r.customer_phone ?? r.customer?.phone) ?? ""}
                    </div>
                  </td>
                  <td className="py-2 pr-4 capitalize">{r.status ?? r.state ?? "-"}</td>
                  <td className="py-2 pr-4">
                    <div className="relative z-10 flex gap-2">
                      {(r.status ?? r.state) === "pending" && (
                        <>
                          <form action={approveRentalAction} method="POST" className="inline">
                            <input type="hidden" name="rid" value={String(r.id ?? r.ID ?? r._id)} />
                            <button className="rounded-lg border px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 cursor-pointer">
                              Approve
                            </button>
                          </form>
                          <form action={cancelRentalAction} method="POST" className="inline">
                            <input type="hidden" name="rid" value={String(r.id ?? r.ID ?? r._id)} />
                            <button className="rounded-lg border px-3 py-1 hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                              Cancel
                            </button>
                          </form>
                        </>
                      )}
                      {(r.status ?? r.state) !== "pending" && (
                        <span className="text-slate-400">—</span>
                      )}
                    </div>
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

        {/* Panel de edición de reserva */}
        {rentalForEdit && (
          <div className="mt-6 p-4 border rounded-lg">
            <h3 className="font-semibold mb-3">Edit rental #{String(rentalForEdit.id ?? rentalForEdit.ID ?? rentalForEdit._id)}</h3>
            <form action={updateRentalAction} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input type="hidden" name="rid" value={String(rentalForEdit.id ?? rentalForEdit.ID ?? rentalForEdit._id)} />
              <label className="text-xs font-semibold">Fecha inicio (YYYY-MM-DD)
                <input name="fecha_ini" defaultValue={String(rentalForEdit.fecha_ini ?? rentalForEdit.start ?? "")} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
              <label className="text-xs font-semibold">Fecha fin (YYYY-MM-DD)
                <input name="fecha_out" defaultValue={String(rentalForEdit.fecha_out ?? rentalForEdit.end ?? "")} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
              <label className="text-xs font-semibold">Estado
                <select name="status" defaultValue={String(rentalForEdit.status ?? "pending")} className="mt-1 w-full border rounded px-2 py-1">
                  <option value="pending">pending</option>
                  <option value="approved">approved</option>
                  <option value="cancelled">cancelled</option>
                </select>
              </label>
              <label className="text-xs font-semibold">Cliente - Nombre
                <input name="customer_name" defaultValue={String(rentalForEdit.customer_name ?? rentalForEdit.customer?.name ?? "")} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
              <label className="text-xs font-semibold">Cliente - Email
                <input name="customer_email" defaultValue={String(rentalForEdit.customer_email ?? rentalForEdit.customer?.email ?? "")} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
              <label className="text-xs font-semibold">Cliente - Teléfono
                <input name="customer_phone" defaultValue={String(rentalForEdit.customer_phone ?? rentalForEdit.customer?.phone ?? "")} className="mt-1 w-full border rounded px-2 py-1" />
              </label>
              <div className="col-span-full flex gap-2 mt-2">
                <button className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 cursor-pointer">Save</button>
                <Link href="/admin" className="border px-3 py-2 rounded hover:bg-slate-50 dark:hover:bg-slate-800">Cancel</Link>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
