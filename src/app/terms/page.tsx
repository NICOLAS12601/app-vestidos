"use client";

import Link from "next/link";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-slate-50 text-slate-900 dark:from-slate-950 dark:to-slate-900 dark:text-slate-100">
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

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-extrabold mb-8">Terms and Conditions</h1>
        
        <section className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold">1. Acceptance of Terms</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              By accessing and using GlamRent, you agree to be bound by these Terms and Conditions. 
              If you do not agree, you must not use our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">2. Rental Rules</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              All items rented must be returned on time and in the same condition as received. 
              Late returns or damaged items may incur additional fees.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">3. Account Responsibility</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              You are responsible for maintaining the confidentiality of your account information 
              and for all activities that occur under your account.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">4. Limitation of Liability</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              GlamRent is not responsible for any indirect, incidental, or consequential damages 
              resulting from the use of our services.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-semibold">5. Changes to Terms</h2>
            <p className="mt-2 text-slate-700 dark:text-slate-300">
              We may update these Terms from time to time. The updated Terms will be posted on this page, 
              and your continued use of the service constitutes acceptance of the new terms.
            </p>
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <p className="text-sm text-slate-600 dark:text-slate-400">© {new Date().getFullYear()} GlamRent. All rights reserved.</p>
          <div className="flex gap-6 text-sm">
            <Link href="/terms" className="hover:text-fuchsia-600">Terms</Link>
            <Link href="/privacy" className="hover:text-fuchsia-600">Privacy</Link>
            <Link href="/contact" className="hover:text-fuchsia-600">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
