"use client";

import Link from "next/link";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 min-h-screen">
       <header className="sticky top-0 z-30 backdrop-blur bg-white/70 dark:bg-slate-950/60 border-b border-slate-200/60 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="font-extrabold text-xl tracking-tight">
            GlamRent
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm">
            <Link href="/search" className="hover:text-fuchsia-600">Browse</Link>
            <Link href="/terms" className="hover:text-fuchsia-600">Terms</Link>
            <Link href="/privacy" className="hover:text-fuchsia-600">Privacy</Link>
            <Link href="/contact" className="hover:text-fuchsia-600">Contact</Link>
          </nav>
        </div>
      </header>
      <h1 className="text-3xl font-bold mb-6">Política de Privacidad</h1>

      <section className="space-y-6 text-slate-600 dark:text-slate-400">
        <div>
          <h2 className="font-semibold">1. Información que recopilamos</h2>
          <p>Recopilamos datos personales como nombre, correo electrónico y preferencias cuando realizas un alquiler. También usamos datos técnicos como cookies y dirección IP.</p>
        </div>

        <div>
          <h2 className="font-semibold">2. Uso de la información</h2>
          <p>Utilizamos tus datos para procesar reservas, enviar confirmaciones y mejorar la experiencia de usuario.</p>
        </div>

        <div>
          <h2 className="font-semibold">3. Compartir datos</h2>
          <p>No vendemos tu información. Solo se comparte con proveedores de servicios o cuando la ley lo requiera.</p>
        </div>

        <div>
          <h2 className="font-semibold">4. Derechos del usuario</h2>
          <p>Puedes solicitar acceso, corrección o eliminación de tus datos en cualquier momento escribiendo a nuestro correo de contacto.</p>
        </div>

        <div>
          <h2 className="font-semibold">5. Cambios en la política</h2>
          <p>Actualizaremos esta política ocasionalmente y publicaremos la versión más reciente en esta página.</p>
        </div>

        <div>
          <h2 className="font-semibold">6. Contacto</h2>
          <p>Si tienes dudas, escríbenos a <span className="font-medium">contacto@ejemplo.com</span>.</p>
        </div>
      </section>
       <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} GlamRent. All rights reserved.</p>
          
        </div>
      </footer>
    </div>
  );
}
