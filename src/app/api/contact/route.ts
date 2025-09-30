import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { name, email, message } = await req.json();

  // Por ahora solo mostramos los datos en consola
  console.log("Nuevo mensaje de contacto:");
  console.log("Nombre:", name);
  console.log("Correo:", email);
  console.log("Mensaje:", message);

  return NextResponse.json({ success: true });
}
