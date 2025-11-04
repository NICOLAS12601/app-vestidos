import { NextResponse } from "next/server";
import { getItem, getItemRentals } from "@/lib/RentalManagementSystem";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const id = Number(params.id);

  const item = await getItem(id); 
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const rentals = await getItemRentals(id);
  const formatted = rentals.map((r) => ({
    start: r.fecha_ini, 
    end: r.fecha_out,
  }));

  return NextResponse.json({ rentals: formatted });
}
