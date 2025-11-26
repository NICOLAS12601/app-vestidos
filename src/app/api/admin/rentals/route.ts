import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/CsrfSessionManagement";
import { listRentals } from "@/lib/RentalManagementSystem";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const rentals = await listRentals();
  return NextResponse.json({ rentals });
}
