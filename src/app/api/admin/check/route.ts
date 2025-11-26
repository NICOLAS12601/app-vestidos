import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/CsrfSessionManagement";

export async function GET() {
  const loggedIn = await isAdmin();
  return NextResponse.json({ loggedIn });
}

