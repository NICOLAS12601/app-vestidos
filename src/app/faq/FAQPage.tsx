export default function FAQPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl sm:text-3xl font-bold">Preguntas Frecuentes</h1>
      <div className="mt-6 space-y-6">
        <div>
          <h2 className="font-semibold">¿Cómo funciona el alquiler?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Elige tu prenda, selecciona las fechas y envía la solicitud. Te confirmaremos por correo la disponibilidad y los siguientes pasos.
          </p>
        </div>
        <div>
          <h2 className="font-semibold">¿Incluye limpieza?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Sí, la limpieza está incluida en todos los alquileres.</p>
        </div>
        <div>
          <h2 className="font-semibold">¿Cuánto tiempo puedo alquilar?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">Entre 2 y 7 días. Si necesitas más tiempo, contáctanos.</p>
        </div>
        <div>
          <h2 className="font-semibold">¿Necesito crear una cuenta?</h2>
          <p className="mt-2 text-slate-600 dark:text-slate-400">No. Solo completa el formulario con tus datos y fechas.</p>
        </div>
      </div>
    </div>
  );
}
