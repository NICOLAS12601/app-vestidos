"use client";

import { useEffect, useState } from "react";

type Props = { itemId: number };

type Range = { start: string; end: string };

function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default function ItemCalendar({ itemId }: Props) {
  const [busy, setBusy] = useState<Range[]>([]);

  useEffect(() => {
    fetch(`/api/items/${itemId}/availability`)
      .then((r) => r.json())
      .then((data) => setBusy(data.rentals ?? []))
      .catch(() => setBusy([]));
  }, [itemId]);

  // Show next 30 days
  const today = new Date();
  const days = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d;
  });

  function isBooked(date: Date) {
    const iso = toISO(date);
    return busy.some((r) => r.start <= iso && iso <= r.end);
  }

  return (
    <div className="grid grid-cols-7 gap-2">
      {days.map((d) => {
        const booked = isBooked(d);
        return (
          <div
            key={d.toISOString()}
            title={toISO(d)}
            className={`text-center text-xs rounded-md px-2 py-3 ${
              booked ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200" : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100"
            }`}
          >
            {d.toLocaleDateString(undefined, { month: "short", day: "numeric" })}
            {booked && <div className="mt-1">Booked</div>}
          </div>
        );
      })}
    </div>
  );
}
