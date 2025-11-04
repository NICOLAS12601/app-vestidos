// ...existing code...
import { NextResponse } from "next/server";
import { initDb } from "../../../models";

export async function GET() {
  try {
    const { sequelize, Prenda, Reserva } = await initDb({ sync: false });
    await sequelize.authenticate();
    const prendasCount = await Prenda.count().catch(() => null);
    const reservasCount = await Reserva.count().catch(() => null);
    const ejemplos = await Prenda.findAll({ limit: 3 }).then((rows: any[]) =>
      rows.map((r) => (typeof r.get === "function" ? r.get({ plain: true }) : r))
    );

    return NextResponse.json({
      ok: true,
      prendasCount,
      reservasCount,
      ejemplos,
    });
  } catch (err: any) {
    // Loguear traza completa en servidor para debug
    console.error('[api/test_db] error', err);
    if (err && err.stack) console.error(err.stack);

    // Devolver más info en la respuesta solo en desarrollo
    return NextResponse.json(
      { ok: false, error: String(err), stack: process.env.NODE_ENV === 'development' ? err.stack : undefined },
      { status: 500 }
    );
  }
}