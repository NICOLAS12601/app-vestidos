"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Toast from "./Toast";

type RentalFormProps = {
  itemId: number;
  csrf: string;
};

export default function RentalForm({ itemId, csrf }: RentalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const router = useRouter();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch("/api/rentals", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setToastMessage("¡Reserva creada exitosamente!");
          setToastType("success");
          setShowToast(true);
          
          // Limpiar el formulario
          form.reset();
          
          // Refrescar la página después de un breve delay para actualizar el calendario
          setTimeout(() => {
            router.refresh();
          }, 500);
        } else {
          setToastMessage(data.error || "Error al crear la reserva");
          setToastType("error");
          setShowToast(true);
        }
      } else {
        // Manejar errores
        const data = await response.json().catch(() => ({}));
        setToastMessage(data.error || "Error al crear la reserva");
        setToastType("error");
        setShowToast(true);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setToastMessage("Error al procesar la solicitud");
      setToastType("error");
      setShowToast(true);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl border p-4"
      >
        <input type="hidden" name="itemId" value={itemId} />
        <input type="hidden" name="csrf" value={csrf} />
        <div className="sm:col-span-2">
          <label className="sr-only" htmlFor="name">
            Full name
          </label>
          <input
            id="name"
            name="name"
            required
            placeholder="Full name"
            className="w-full rounded-xl border px-4 py-3 text-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Email"
            className="w-full rounded-xl border px-4 py-3 text-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            required
            placeholder="Phone"
            className="w-full rounded-xl border px-4 py-3 text-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="start">
            Start date
          </label>
          <input
            id="start"
            name="start"
            type="date"
            required
            className="w-full rounded-xl border px-4 py-3 text-sm"
            disabled={isSubmitting}
          />
        </div>
        <div>
          <label className="sr-only" htmlFor="end">
            End date
          </label>
          <input
            id="end"
            name="end"
            type="date"
            required
            className="w-full rounded-xl border px-4 py-3 text-sm"
            disabled={isSubmitting}
          />
        </div>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full sm:w-auto rounded-xl bg-fuchsia-600 text-white px-6 py-3 text-sm font-semibold hover:bg-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? "Processing..." : "Request rental"}
          </button>
        </div>
      </form>

      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
}

