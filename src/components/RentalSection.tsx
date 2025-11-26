"use client";

import { useRef } from "react";
import ItemCalendar, { ItemCalendarRef } from "../app/calendar/[id]/ItemCalendar";
import RentalForm from "./RentalForm";

interface RentalSectionProps {
  itemId: number;
  csrf: string;
}

export default function RentalSection({ itemId, csrf }: RentalSectionProps) {
  const calendarRef = useRef<ItemCalendarRef>(null);

  const handleRentalCreated = () => {
    // Refrescar el calendario cuando se crea una reserva
    if (calendarRef.current) {
      calendarRef.current.refresh();
    }
  };

  return (
    <>
      <div className="mt-8">
        <h2 className="font-semibold mb-3">Availability</h2>
        <ItemCalendar ref={calendarRef} itemId={itemId} />
      </div>

      <div className="mt-10">
        <h2 className="font-semibold mb-3">Schedule a rental</h2>
        <RentalForm itemId={itemId} csrf={csrf} onRentalCreated={handleRentalCreated} />
      </div>
    </>
  );
}

