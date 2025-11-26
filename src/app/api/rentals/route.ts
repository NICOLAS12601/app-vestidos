import { NextResponse } from "next/server";
import { verifyCsrfToken } from "../../../../lib/CsrfSessionManagement";
import { initDb } from "@/src/models";
import { Op } from "sequelize";

function normalizeDate(s: string | null) {
  if (!s) return null;
  const m = s.match(/^\d{4}-\d{2}-\d{2}$/);
  return m ? s : null;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  // Solo números, sin espacios ni otros caracteres
  // Debe tener exactamente 9 dígitos y empezar por "09"
  const digitsOnly = phone.replace(/\D/g, "");
  return digitsOnly.length === 9 && digitsOnly.startsWith("09");
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const csrf = form.get("csrf")?.toString() ?? null;
    if (!verifyCsrfToken(csrf)) {
      return NextResponse.json({ error: "Invalid CSRF token" }, { status: 400 });
    }

    const itemId = Number(form.get("itemId") || NaN);
    const name = (form.get("name") || "").toString().trim();
    const email = (form.get("email") || "").toString().trim();
    const phone = (form.get("phone") || "").toString().trim();
    const start = normalizeDate((form.get("start") || "").toString());
    const end = normalizeDate((form.get("end") || "").toString());

    if (!itemId || !name || !email || !phone || !start || !end) {
      return NextResponse.json({ error: "Missing or invalid fields" }, { status: 400 });
    }

    // Validar formato de email
    if (!validateEmail(email)) {
      return NextResponse.json({ error: "Por favor ingresa un email válido (ejemplo: usuario@dominio.com)" }, { status: 400 });
    }

    // Validar formato de teléfono
    if (!validatePhone(phone)) {
      return NextResponse.json({ error: "Por favor ingresa un teléfono válido (9 dígitos, sin espacios, empezando por 09)" }, { status: 400 });
    }

    // Inicializar DB y obtener modelos
    const { Prenda, Reserva } = await initDb({ sync: false });

    // Verificar que la prenda existe
    const prenda = await Prenda.findByPk(itemId);
    if (!prenda) {
      return NextResponse.json({ error: "Prenda no encontrada" }, { status: 404 });
    }

    // Verificar que las fechas son válidas
    if (end < start) {
      return NextResponse.json({ error: "La fecha final debe ser posterior a la inicial" }, { status: 400 });
    }

    // Verificar disponibilidad (excluyendo reservas canceladas)
    const existingReserva = await Reserva.findOne({
      where: {
        vestido_id: itemId,
        status: { [Op.ne]: "cancelled" },
        [Op.or]: [
          {
            fecha_ini: { [Op.between]: [start, end] }
          },
          {
            fecha_out: { [Op.between]: [start, end] }
          }
        ]
      }
    });

    if (existingReserva) {
      return NextResponse.json({ error: "Prenda no disponible para las fechas seleccionadas" }, { status: 409 });
    }

    // Crear la reserva
    const reserva = await Reserva.create({
      vestido_id: itemId,
      fecha_ini: start,
      fecha_out: end,
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      status: "pending",
    });

    // Devolver JSON en lugar de redirigir para que el cliente maneje el toast
    return NextResponse.json({ 
      success: true, 
      message: "Reserva creada exitosamente",
      reservaId: reserva.id 
    }, { status: 200 });

  } catch (err) {
    console.error("Error creating rental:", err);
    return NextResponse.json(
      { error: "Error al crear la reserva" },
      { status: 500 }
    );
  }
}