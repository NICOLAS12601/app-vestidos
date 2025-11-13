/**
 * Sistema de gestión de alquileres (completo) usando MySQL + Sequelize.
 * Exporta funciones async:
 *  - listItems(filters?)
 *  - getItem(id)
 *  - getItemRentals(itemId)
 *  - isItemAvailable(itemId, fecha_ini, fecha_out)
 *  - createRental(payload)
 *  - listRentals()
 *  - cancelRental(reservaId)
 *
 * Nota: espera que src/models/index.ts exporte initDb()
 */

import { Op } from "sequelize";
import { initDb } from "../src/models";

type CreateRentalPayload = {
  itemId: number;
  fecha_ini: string; // 'YYYY-MM-DD'
  fecha_out: string; // 'YYYY-MM-DD'
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
};

export type Item = {
  id: number | null;
  name: string;
  category?: string;
  pricePerDay?: number;
  sizes?: string[];
  color?: string;
  style?: string;
  description?: string;
  images: string[];
  alt?: string;
  raw?: any;
};

export type ReservaType = {
  id: number;
  vestido_id: number;
  fecha_ini: string;
  fecha_out: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string;
  status: string;
};

let initPromise: Promise<{ sequelize: any; Prenda: any; Reserva: any }> | null = null;

async function ensureInit() {
  if (!initPromise) {
    initPromise = initDb({ sync: false });
  }
  return await initPromise;
}

/**
 * Obtiene listado de prendas. Acepta filtros opcionales.
 * Si se llama sin parámetros sigue funcionando (compatibilidad con llamadas previas).
 */
export async function listItems(filters?: {
  q?: string;
  category?: string;
  size?: string;
  color?: string;
  style?: string;
}) {
  const { Prenda } = await ensureInit();

  const where: any = {};

  // búsqueda de texto sobre nombre
  const q = filters?.q?.toString().trim();
  if (q) {
    where[Op.or] = [
      { nombre: { [Op.like]: `%${q}%` } },
    ];
  }

  // Filtros adicionales usando los nombres reales de columnas
  if (filters?.color) where.color = filters.color;
  if (filters?.style) where.estilo = filters.style;
  if (filters?.size) where.talle = { [Op.like]: `%${filters.size}%` };

  const rows = await Prenda.findAll({ where, order: [["id", "DESC"]] }).catch((err) => {
    console.error("Error en listItems:", err);
    return [];
  });

  return rows.map((r: any) => {
    const data = typeof r.get === "function" ? r.get({ plain: true }) : r;

    // Mapeo exacto de los campos de la tabla prendas
    // name: nombre, style: estilo, sizes: talle (CSV), pricePerDay: precio
    let price = 0;
    if (typeof data.precio === "number") {
      price = data.precio;
    } else if (typeof data.precio === "string") {
      // Reemplazar , por . y parsear
      price = parseFloat(data.precio.replace(",", "."));
      if (isNaN(price)) price = 0;
    }

    return {
      id: data.id ?? null,
      name: data.nombre ?? "",
      category: undefined,
      pricePerDay: price,
      sizes: typeof data.talle === "string"
        ? data.talle.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      color: data.color ?? "",
      style: data.estilo ?? "",
      description: undefined,
      images: [],
      alt: data.nombre ?? "",
      raw: data,
    } as Item;
  });
}

export async function getItem(id: number | string) {
  const { Prenda } = await ensureInit();
  const item = await Prenda.findByPk(id);
  if (!item) return null; 
  return typeof item.get === "function" ? item.get({ plain: true }) : item;
}

export async function getItemRentals(itemId: number | string): Promise<ReservaType[]> {
  const { Reserva } = await ensureInit();
  const rows = await Reserva.findAll({
    where: { vestido_id: itemId },
    order: [["fecha_ini", "DESC"]],
  });

  return rows.map((r: any) => {
    const reserva = typeof r.get === "function" ? r.get({ plain: true }) : r;
    return reserva as ReservaType;
  });
}


/**
 * Comprueba disponibilidad de un ítem en el rango [fecha_ini, fecha_out] (inclusive).
 * Las fechas deben venir en formato 'YYYY-MM-DD'.
 */
export async function isItemAvailable(itemId: number | string, fecha_ini: string, fecha_out: string) {
  const { Reserva } = await ensureInit();

  const overlapping = await Reserva.count({
    where: {
      vestido_id: itemId,
      status: "active",
      fecha_ini: { [Op.lte]: fecha_out },
      fecha_out: { [Op.gte]: fecha_ini },
    },
  });

  return overlapping === 0;
}

/**
 * Crea una reserva dentro de una transacción, verificando disponibilidad.
 */
export async function createRental(payload: CreateRentalPayload) {
  const { sequelize, Reserva } = await ensureInit();

  const { itemId, fecha_ini, fecha_out, customer_name, customer_email, customer_phone } = payload;

  if (!itemId || !fecha_ini || !fecha_out) {
    throw new Error("Parámetros inválidos: itemId, fecha_ini y fecha_out son requeridos.");
  }

  return await sequelize.transaction(async (tx: any) => {
    // Re-check availability dentro de la transacción
    const overlapping = await Reserva.count({
      where: {
        vestido_id: itemId,
        status: "active",
        fecha_ini: { [Op.lte]: fecha_out },
        fecha_out: { [Op.gte]: fecha_ini },
      },
      transaction: tx,
      lock: tx.LOCK.UPDATE,
    });

    if (overlapping > 0) {
      throw new Error("El ítem no está disponible en las fechas solicitadas.");
    }

    const nueva = await Reserva.create(
      {
        vestido_id: itemId,
        fecha_ini,
        fecha_out,
        customer_name,
        customer_email,
        customer_phone,
        status: "active",
      },
      { transaction: tx }
    );

    return typeof nueva.get === "function" ? nueva.get({ plain: true }) : nueva;
  });
}

export async function listRentals() {
  const { Reserva } = await ensureInit();
  const rows = await Reserva.findAll({ order: [["fecha_ini", "DESC"]] });
  return rows.map((r: any) => (typeof r.get === "function" ? r.get({ plain: true }) : r));
}

export async function cancelRental(reservaId: number | string) {
  const { Reserva } = await ensureInit();
  const r = await Reserva.findByPk(reservaId);
  if (!r) throw new Error("Reserva no encontrada.");
  r.status = "cancelled";
  await r.save();
  return typeof r.get === "function" ? r.get({ plain: true }) : r;
}