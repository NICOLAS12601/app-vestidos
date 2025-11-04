import { NextResponse } from "next/server";
import { Op } from "sequelize";
import { initDb } from "../../../models";

export async function GET(req: Request) {
  try {
    const { Prenda } = await initDb({ sync: false });
    const url = new URL(req.url);

    // Construir filtros
    const where: any = {};

    const q = url.searchParams.get("q");
    const estilo = url.searchParams.get("estilo");
    const color = url.searchParams.get("color");
    const talle = url.searchParams.get("talle");

    if (q) {
      where.nombre = { [Op.like]: `%${q}%` };
    }
    if (estilo) where.estilo = estilo;
    if (color) where.color = color;
    if (talle) where.talle = { [Op.like]: `%${talle}%` };

    // Buscar prendas con los filtros
    const prendas = await Prenda.findAll({
      where,
      order: [["id", "DESC"]]
    });

    return NextResponse.json(prendas);
  } catch (err) {
    console.error("💥 Error en /api/items:", err);
    return NextResponse.json(
      { ok: false, error: String(err) },
      { status: 500 }
    );
  }
}