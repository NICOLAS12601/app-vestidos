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

import { Op, type Sequelize as SequelizeType, type Transaction } from "sequelize";
import { initDb } from "../src/models";
import Prenda from "../src/models/Prenda";
import Reserva from "../src/models/Reserva";

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
    pricePerDay?: number;
    sizes?: string[];
    color?: string;
    style?: string;
    images: string[];
    alt?: string;
    raw?: Record<string, unknown>;
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

let initPromise: Promise<{ sequelize: SequelizeType; Prenda: typeof Prenda; Reserva: typeof Reserva }> | null = null;

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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

    let rows: Prenda[];
    try {
        // Intentar obtener todas las columnas, si falla por falta de columna imagen, usar attributes
        rows = await Prenda.findAll({ where, order: [["id", "ASC"]] });
    } catch (err: unknown) {
        // Si el error es por columna 'imagen' no encontrada, intentar sin esa columna
        const error = err as { parent?: { code?: string }; sql?: string };
        if (error?.parent?.code === 'ER_BAD_FIELD_ERROR' && error?.sql?.includes('imagen')) {
            console.warn("Columna 'imagen' no existe en la base de datos. Ejecuta el script init/add_imagen_column.sql para agregarla.");
            rows = await Prenda.findAll({ 
                where, 
                order: [["id", "ASC"]],
                attributes: ['id', 'nombre', 'color', 'estilo', 'talle', 'precio']
            });
        } else {
            console.error("Error en listItems:", err);
            rows = [];
        }
    }

    return rows.map((r: Prenda) => {
        const data = typeof r.get === "function" ? r.get({ plain: true }) : r;

        let price = 0;
        if (typeof data.precio === "number") {
            price = data.precio;
        } else if (typeof data.precio === "string") {
            const precioStr = String(data.precio);
            price = parseFloat(precioStr.replace(",", "."));
            if (isNaN(price)) price = 0;
        }

        return {
            id: data.id ?? null,
            name: data.nombre ?? "",
            pricePerDay: price,
            sizes: typeof data.talle === "string"
                ? data.talle.split(",").map((s: string) => s.trim()).filter(Boolean)
                : [],
            color: data.color ?? "",
            style: data.estilo ?? "",
            images: data.imagen ? [data.imagen] : [],
            alt: data.nombre ?? "",
            raw: data as unknown as Record<string, unknown>,
        } as Item;
    });
}

export async function getItem(id: number | string) {
    const { Prenda } = await ensureInit();
    let item;
    try {
        item = await Prenda.findByPk(id);
    } catch (err: unknown) {
        // Si el error es por columna 'imagen' no encontrada, intentar sin esa columna
        const error = err as { parent?: { code?: string }; sql?: string };
        if (error?.parent?.code === 'ER_BAD_FIELD_ERROR' && error?.sql?.includes('imagen')) {
            item = await Prenda.findByPk(id, {
                attributes: ['id', 'nombre', 'color', 'estilo', 'talle', 'precio']
            });
        } else {
            throw err;
        }
    }
    if (!item) return null;

    const data = typeof item.get === "function" ? item.get({ plain: true }) : item;

    // Normalizar igual que en listItems
    let price = 0;
    if (typeof data.precio === "number") {
        price = data.precio;
    } else if (typeof data.precio === "string") {
        const precioStr = String(data.precio);
        price = parseFloat(precioStr.replace(",", "."));
        if (isNaN(price)) price = 0;
    }

    return {
        id: data.id ?? null,
        name: data.nombre ?? "",
        pricePerDay: price,
        sizes: typeof data.talle === "string"
            ? data.talle.split(",").map((s: string) => s.trim()).filter(Boolean)
            : [],
        color: data.color ?? "",
        style: data.estilo ?? "",
        images: data.imagen ? [data.imagen] : [],
        alt: data.nombre ?? "",
        raw: data as unknown as Record<string, unknown>,
    } as Item;
}

export async function getItemRentals(itemId: number | string): Promise<ReservaType[]> {
    const { Reserva } = await ensureInit();
    const rows = await Reserva.findAll({
        where: {
            vestido_id: itemId,
            status: { [Op.ne]: "cancelled" } // Excluir reservas canceladas
        },
        order: [["fecha_ini", "DESC"]],
    });

    return rows.map((r: Reserva) => {
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
            status: "pending",
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

    return await sequelize.transaction(async (tx: Transaction) => {
        // Re-check availability dentro de la transacción
        const overlapping = await Reserva.count({
            where: {
                vestido_id: itemId,
                status: "pending",
                fecha_ini: { [Op.lte]: fecha_out },
                fecha_out: { [Op.gte]: fecha_ini },
            },
            transaction: tx,
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
                status: "pending",
            },
            { transaction: tx }
        );

        return typeof nueva.get === "function" ? nueva.get({ plain: true }) : nueva;
    });
}

export async function listRentals() {
    const { sequelize, Reserva } = await ensureInit();
    try {
        const rows = await Reserva.findAll({ order: [["fecha_ini", "DESC"]] });
        return rows.map((r: Reserva) => (typeof r.get === "function" ? r.get({ plain: true }) : r));
    } catch (err) {
        console.error("listRentals: fallback to raw query due to model/columns mismatch:", err);
        const [rows] = await sequelize.query(`
      SELECT
        id,
        vestido_id,
        fecha_ini,
        fecha_out,
        customer_name,
        customer_email,
        customer_phone,
        status
      FROM reservas
      ORDER BY fecha_ini DESC
    `);
        return Array.isArray(rows) ? rows : [];
    }
}

export async function cancelRental(reservaId: number | string) {
    const { Reserva } = await ensureInit();
    const r = await Reserva.findByPk(reservaId);
    if (!r) throw new Error("Reserva no encontrada.");
    r.status = "cancelled";
    await r.save();
    return typeof r.get === "function" ? r.get({ plain: true }) : r;
}

// Aprobar reserva
export async function approveRental(reservaId: number | string) {
    const { Reserva } = await ensureInit();
    const r = await Reserva.findByPk(reservaId);
    if (!r) throw new Error("Reserva no encontrada.");
    r.status = "approved";
    await r.save();
    return typeof r.get === "function" ? r.get({ plain: true }) : r;
}

// Crear prenda
export async function createItem(payload: {
    nombre: string;
    color?: string;
    estilo?: string;
    talle?: string; // CSV: "XS,S,M"
    precio: number | string;
    imagen?: string | null;
}) {
    const { Prenda } = await ensureInit();
    const precio =
        typeof payload.precio === "number"
            ? payload.precio
            : (() => {
                const p = parseFloat(String(payload.precio).replace(",", "."));
                return isNaN(p) ? 0 : p;
            })();

    let created;
    try {
        created = await Prenda.create({
            nombre: payload.nombre,
            color: payload.color ?? undefined,
            estilo: payload.estilo ?? undefined,
            talle: payload.talle ?? null,
            precio,
            imagen: payload.imagen ?? null,
        });
    } catch (err: unknown) {
        // Si el error es por columna 'imagen' no encontrada, crear sin esa columna
        const error = err as { parent?: { code?: string }; sql?: string };
        if (error?.parent?.code === 'ER_BAD_FIELD_ERROR' && error?.sql?.includes('imagen')) {
            console.warn("Columna 'imagen' no existe en la base de datos. Creando sin imagen. Ejecuta el script init/add_imagen_column.sql para agregarla.");
            created = await Prenda.create({
                nombre: payload.nombre,
                color: payload.color ?? undefined,
                estilo: payload.estilo ?? undefined,
                talle: payload.talle ?? null,
                precio,
            });
        } else {
            throw err;
        }
    }

    return typeof created.get === "function" ? created.get({ plain: true }) : created;
}

// Actualizar prenda
export async function updateItem(
    id: number | string,
    changes: Partial<{ nombre: string; color: string; estilo: string; talle: string; precio: number | string; imagen: string | null }>
) {
    const { Prenda } = await ensureInit();
    const item = await Prenda.findByPk(id);
    if (!item) throw new Error("Prenda no encontrada.");

    if (typeof changes.nombre !== "undefined") item.nombre = changes.nombre;
    if (typeof changes.color !== "undefined") item.color = changes.color;
    if (typeof changes.estilo !== "undefined") item.estilo = changes.estilo;
    if (typeof changes.talle !== "undefined") item.talle = changes.talle;
    if (typeof changes.imagen !== "undefined") {
        try {
            item.imagen = changes.imagen ?? null;
        } catch (err: unknown) {
            // Si la columna imagen no existe, simplemente ignorar el cambio
            const error = err as { code?: string };
            if (error?.code === 'ER_BAD_FIELD_ERROR') {
                console.warn("Columna 'imagen' no existe. Ignorando actualización de imagen.");
            } else {
                throw err;
            }
        }
    }
    if (typeof changes.precio !== "undefined") {
        const precio =
            typeof changes.precio === "number"
                ? changes.precio
                : (() => {
                    const p = parseFloat(String(changes.precio).replace(",", "."));
                    return isNaN(p) ? 0 : p;
                })();
        item.precio = precio;
    }

    try {
        await item.save();
    } catch (err: unknown) {
        // Si el error es por columna 'imagen' no encontrada, intentar guardar sin esa columna
        const error = err as { parent?: { code?: string }; sql?: string };
        if (error?.parent?.code === 'ER_BAD_FIELD_ERROR' && error?.sql?.includes('imagen')) {
            // Remover imagen del objeto antes de guardar
            const itemData = typeof item.get === "function" ? item.get({ plain: true }) : item;
            delete (itemData as unknown as Record<string, unknown>).imagen;
            // Guardar solo los campos que existen
            await Prenda.update(
                {
                    nombre: item.nombre,
                    color: item.color,
                    estilo: item.estilo,
                    talle: item.talle,
                    precio: item.precio,
                },
                { where: { id: item.id } }
            );
        } else {
            throw err;
        }
    }
    return typeof item.get === "function" ? item.get({ plain: true }) : item;
}

// Eliminar prenda
export async function deleteItem(id: number | string) {
    const { Prenda } = await ensureInit();
    await Prenda.destroy({ where: { id } });
    return true;
}

// Actualizar reserva
export async function updateRental(
    reservaId: number | string,
    changes: Partial<{
        fecha_ini: string;
        fecha_out: string;
        status: string;
        customer_name: string;
        customer_email: string;
        customer_phone: string;
    }>
) {
    const { Reserva } = await ensureInit();
    const r = await Reserva.findByPk(reservaId);
    if (!r) throw new Error("Reserva no encontrada.");

    if (typeof changes.fecha_ini !== "undefined") r.fecha_ini = changes.fecha_ini;
    if (typeof changes.fecha_out !== "undefined") r.fecha_out = changes.fecha_out;
    if (typeof changes.status !== "undefined") r.status = changes.status;
    if (typeof changes.customer_name !== "undefined") r.customer_name = changes.customer_name;
    if (typeof changes.customer_email !== "undefined") r.customer_email = changes.customer_email;
    if (typeof changes.customer_phone !== "undefined") r.customer_phone = changes.customer_phone;

    await r.save();
    return typeof r.get === "function" ? r.get({ plain: true }) : r;
}