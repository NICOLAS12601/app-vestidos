import { isAdmin, getOrCreateCsrfToken } from "@/lib/CsrfSessionManagement";
import {
  listItems,
  listRentals,
  createItem,
  updateItem,
  deleteItem,
  updateRental,
  cancelRental,
  approveRental, // <-- agregar
} from "@/lib/RentalManagementSystem";
import { redirect } from "next/navigation";
import Link from "next/link";
import { unstable_noStore as noStore, revalidatePath } from "next/cache";
import InventoryTable from "@/components/InventoryTable";
import AddProductForm from "@/components/AddProductForm";

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
  const imagen = String(formData.get("imagen") ?? "");
  if (!nombre) return;
  await createItem({ nombre, color, estilo, talle, precio, imagen: imagen || null });
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
    imagen: String(formData.get("imagen") ?? ""),
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

export default async function Page({ searchParams }: { searchParams?: Promise<{ editRental?: string }> }) {
  noStore();
  if (!(await isAdmin())) redirect("/admin/login");
  const csrf = await getOrCreateCsrfToken();

  // Await searchParams en Next.js 15
  const params = await searchParams;

  // Await a DB (Sequelize retorna Promises)
  const [itemsRaw, rentalsRaw] = await Promise.all([listItems(), listRentals()]);

  // Normalizar para evitar ".map is not a function"
  const items = toArray<any>(itemsRaw).map(toPlain);
  const rentals = toArray<any>(rentalsRaw).map(toPlain);

  // Datos para edición
  const editRentalId = params?.editRental;
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
        <AddProductForm addItemAction={addItemAction} />

        {/* Listado */}
        <InventoryTable items={items} deleteItemAction={deleteItemAction} updateItemAction={updateItemAction} />
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
                          <form action={approveRentalAction} className="inline">
                            <input type="hidden" name="rid" value={String(r.id ?? r.ID ?? r._id)} />
                            <button className="rounded-lg border px-3 py-1 bg-green-50 text-green-700 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-300 dark:hover:bg-green-900/50 cursor-pointer">
                              Approve
                            </button>
                          </form>
                          <form action={cancelRentalAction} className="inline">
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
