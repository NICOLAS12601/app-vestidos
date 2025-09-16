"use client";

import { useState } from "react";

export default function ContactPage() {
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const target = e.target as typeof e.target & {
      name: { value: string };
      email: { value: string };
      message: { value: string };
    };

    const data = {
      name: target.name.value,
      email: target.email.value,
      message: target.message.value,
    };

    await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    setSuccess(true);
    target.name.value = "";
    target.email.value = "";
    target.message.value = "";
  }

  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
      <h1 className="text-3xl font-bold mb-6">Contacto</h1>

      {success && <p className="mb-6 text-green-600">Mensaje enviado correctamente.</p>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name" className="block text-sm font-medium">Nombre</label>
          <input id="name" name="name" type="text" required
            className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium">Correo electrónico</label>
          <input id="email" name="email" type="email" required
            className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium">Mensaje</label>
          <textarea id="message" name="message" rows={4} required
            className="mt-1 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-fuchsia-500" />
        </div>

        <button type="submit"
          className="inline-flex items-center rounded-xl bg-fuchsia-600 px-6 py-3 text-sm font-semibold text-white hover:bg-fuchsia-500">
          Enviar
        </button>
      </form>
    </div>
  );
}

/* 
✅ Cómo funciona ahora

El usuario completa el formulario y hace submit.

Los datos se envían al endpoint /api/contact.

El endpoint imprime los datos en la consola del servidor y devuelve { success: true }.

La página muestra un mensaje de confirmación sin recargar.

No se almacena el mensaje.*/