import Image from "next/image";
import { notFound } from "next/navigation";
import {getItem, getItemRentals} from "../../../../lib/RentalManagementSystem";
import ItemCalendar from "../../calendar/[id]/ItemCalendar";
import {getOrCreateCsrfToken} from "../../../../lib/CsrfSessionManagement";
import Link from "next/link";
import RentalForm from "../../../components/RentalForm";

export default async function ItemDetail({ params }: { params: { id: string } | Promise<{ id: string }> }) {
  const { id } = (await params) as { id: string };
  const itemId = Number(id);

  // await las funciones async para obtener datos reales desde la BD
  const item = await getItem(itemId);
  if (!item) return notFound();

  // Generate CSRF token; cookie will be set if missing
  const csrf = await getOrCreateCsrfToken();

  const booked = await getItemRentals(itemId);

  // asegurar imágenes por si faltan
  const images = Array.isArray(item.images) && item.images.length > 0
    ? item.images
    : [`/images/dresses/dress-${itemId}.jpg`];

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="font-extrabold text-xl tracking-tight mb-10 block">
        GlamRent
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div>
          <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800">
            <Image src={images[0]} alt={item.alt ?? item.name ?? ""} fill className="object-cover" priority/>
          </div>
          <div className="mt-4 grid grid-cols-3 gap-3">
            {images.slice(1).map((src: string, idx:number) => (
              <div key={`${idx}-${itemId}`} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                <Image src={src} alt={item.alt ?? item.name ?? ""} fill className="object-cover"/>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">{item.name}</h1>
          <p className="mt-4 font-semibold">From ${item.pricePerDay}/day</p>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Sizes: {(item.sizes || []).join(", ")}</p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Color: {item.color}{item.style ? ` • Style: ${item.style}` : ""}</p>

          <div className="mt-8">
            <h2 className="font-semibold mb-3">Availability</h2>
            <ItemCalendar itemId={itemId} />
            {booked.length > 0 && <p className="mt-2 text-xs text-slate-500">Dates marked are already booked.</p>}
          </div>

          <div className="mt-10">
            <h2 className="font-semibold mb-3">Schedule a rental</h2>
            <RentalForm itemId={itemId} csrf={csrf} />
          </div>
        </div>
      </div>
    </div>
  );
}
