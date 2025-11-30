"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import type { Prenda } from "@/src/types";

// Agregar esto para forzar renderizado dinámico
export const dynamic = 'force-dynamic';

function ProductImage({ src, alt, id }: { src: string | null | undefined; alt: string; id: number }) {
  const [imgSrc, setImgSrc] = useState(src || `/images/dresses/dress-${id}.jpg`);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src || `/images/dresses/dress-${id}.jpg`);
    setHasError(false);
  }, [src, id]);

  if (hasError || !imgSrc) {
    return (
      <div className="w-full h-full flex items-center justify-center text-slate-400">
        <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img 
      src={imgSrc} 
      alt={alt} 
      className="w-full h-full object-cover"
      onError={() => {
        if (imgSrc !== `/images/dresses/dress-${id}.jpg`) {
          // Intentar con el fallback
          setImgSrc(`/images/dresses/dress-${id}.jpg`);
        } else {
          // Si el fallback también falla, mostrar placeholder
          setHasError(true);
        }
      }}
    />
  );
}

function SearchContent() {
  const searchParams = useSearchParams();
  const [prendas, setPrendas] = useState<Prenda[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = searchParams.get("q") ?? "";
    const estilo = searchParams.get("estilo") ?? "";
    const color = searchParams.get("color") ?? "";
    const talle = searchParams.get("talle") ?? "";

    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (estilo) params.set("estilo", estilo);
    if (color) params.set("color", color);
    if (talle) params.set("talle", talle);

    setLoading(true);
    fetch(`/api/items?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setPrendas(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.error("Error cargando prendas:", err);
        setPrendas([]);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/" className="font-extrabold text-xl tracking-tight mb-5 block">
        GlamRent
      </Link>
      <h1 className="text-2xl sm:text-3xl font-bold">Catálogo de Vestidos</h1>

      <form method="GET" className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        <input 
          name="q" 
          defaultValue={searchParams.get("q") ?? ""} 
          placeholder="Buscar..." 
          className="rounded-xl border px-3 py-2 text-sm"
        />
        <select 
          name="estilo" 
          defaultValue={searchParams.get("estilo") ?? ""} 
          className="rounded-xl border px-3 py-2 text-sm"
        >
          <option value="">Todos los estilos</option>
          <option value="evening">Noche</option>
          <option value="black-tie">Black Tie</option>
          <option value="daytime">Día</option>
        </select>
        <input 
          name="color" 
          defaultValue={searchParams.get("color") ?? ""} 
          placeholder="Color" 
          className="rounded-xl border px-3 py-2 text-sm" 
        />
        <input 
          name="talle" 
          defaultValue={searchParams.get("talle") ?? ""} 
          placeholder="Talle" 
          className="rounded-xl border px-3 py-2 text-sm" 
        />
        <button className="rounded-xl bg-fuchsia-600 text-white px-4 py-2 text-sm">
          Buscar
        </button>
      </form>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && (
          <div className="col-span-full text-center py-12">Cargando...</div>
        )}
        
        {!loading && prendas.length === 0 && (
          <div className="col-span-full text-center py-12 text-gray-500">
            No se encontraron vestidos con los filtros seleccionados.
          </div>
        )}

        {!loading && prendas.map((prenda) => {
          return (
          <div key={prenda.id} className="rounded-2xl border bg-white dark:bg-slate-900 overflow-hidden">
            <div className="relative aspect-[3/4] bg-slate-100 dark:bg-slate-800">
              <ProductImage 
                src={prenda.imagen} 
                alt={prenda.nombre} 
                id={prenda.id}
              />
              <div className="absolute inset-0 flex items-end p-3">
                <span className="rounded-full bg-white/85 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-medium">
                  ${prenda.precio}/día
                </span>
              </div>
            </div>
            <div className="p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                {prenda.estilo}
              </p>
              <p className="font-medium">{prenda.nombre}</p>
              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Talles: {prenda.talle}
              </p>
              <div className="mt-3">
                <Link 
                  href={`/items/${prenda.id}`}
                  className="text-sm rounded-lg border px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800"
                >
                  Ver detalles
                </Link>
              </div>
            </div>
          </div>
          );
        })}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-10">Cargando búsqueda...</div>}>
      <SearchContent />
    </Suspense>
  );
}
