import { NextResponse } from "next/server";
import { isAdmin } from "../../../../../../../lib/CsrfSessionManagement";
import { cancelRental } from "../../../../../../../lib/RentalManagementSystem";

export async function POST(_: Request, { params }: { params: { id: string } }) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { error } = await cancelRental(params.id);
  if (error) return NextResponse.json({ error }, { status: 404 });
  return NextResponse.json({ ok: true });
}
