"use client";

import { useState, FormEvent } from "react";
import Toast from "./Toast";

type RentalFormProps = {
  itemId: number;
  csrf: string;
  onRentalCreated?: (startDate: string, endDate: string) => void;
};

export default function RentalForm({ itemId, csrf, onRentalCreated }: RentalFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState<"success" | "error">("success");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [startDateError, setStartDateError] = useState("");
  const [endDateError, setEndDateError] = useState("");

  // Validar nombre (no vacío, al menos 2 caracteres)
  const validateName = (name: string): boolean => {
    return name.trim().length >= 2;
  };

  // Validar formato de email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validar formato de teléfono (acepta números, espacios, guiones, paréntesis, +)
  // Debe tener al menos 8 dígitos
  const validatePhone = (phone: string): boolean => {
    // Remover caracteres permitidos para contar solo dígitos
    const digitsOnly = phone.replace(/[\s\-\(\)\+]/g, "");
    return digitsOnly.length >= 8 && /^[\d\s\-\(\)\+]+$/.test(phone);
  };

  // Validar fecha (formato YYYY-MM-DD)
  const validateDate = (date: string): boolean => {
    if (!date) return false;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    const dateObj = new Date(date);
    return dateObj instanceof Date && !isNaN(dateObj.getTime());
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    const name = formData.get("name")?.toString() || "";
    const email = formData.get("email")?.toString() || "";
    const phone = formData.get("phone")?.toString() || "";
    const start = formData.get("start")?.toString() || "";
    const end = formData.get("end")?.toString() || "";
    
    // Limpiar errores previos
    setNameError("");
    setEmailError("");
    setPhoneError("");
    setStartDateError("");
    setEndDateError("");
    
    // Validar todos los campos
    let isValid = true;
    
    // Validar nombre
    if (!validateName(name)) {
      setNameError("Por favor ingresa un nombre válido (mínimo 2 caracteres)");
      isValid = false;
    }
    
    // Validar email
    if (!email.trim()) {
      setEmailError("El email es requerido");
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError("Por favor ingresa un email válido (ejemplo: usuario@dominio.com)");
      isValid = false;
    }
    
    // Validar teléfono
    if (!phone.trim()) {
      setPhoneError("El teléfono es requerido");
      isValid = false;
    } else if (!validatePhone(phone)) {
      setPhoneError("Por favor ingresa un teléfono válido (mínimo 8 dígitos)");
      isValid = false;
    }
    
    // Validar fecha de inicio
    if (!start) {
      setStartDateError("La fecha de inicio es requerida");
      isValid = false;
    } else if (!validateDate(start)) {
      setStartDateError("Por favor ingresa una fecha válida");
      isValid = false;
    }
    
    // Validar fecha de fin
    if (!end) {
      setEndDateError("La fecha de fin es requerida");
      isValid = false;
    } else if (!validateDate(end)) {
      setEndDateError("Por favor ingresa una fecha válida");
      isValid = false;
    } else if (start && validateDate(start) && end < start) {
      setEndDateError("La fecha de fin debe ser posterior a la fecha de inicio");
      isValid = false;
    }
    
    if (!isValid) {
      return;
    }
    
    setIsSubmitting(true);

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
          
          // Obtener las fechas del formulario para notificar al calendario
          const startDate = formData.get("start")?.toString() || "";
          const endDate = formData.get("end")?.toString() || "";
          
          // Limpiar el formulario y errores
          form.reset();
          setNameError("");
          setEmailError("");
          setPhoneError("");
          setStartDateError("");
          setEndDateError("");
          
          // Notificar al calendario para que se actualice
          if (onRentalCreated && startDate && endDate) {
            onRentalCreated(startDate, endDate);
          }
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
            placeholder="Full name"
            className={`w-full rounded-xl border px-4 py-3 text-sm ${
              nameError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
            disabled={isSubmitting}
          />
          {nameError && (
            <p className="mt-1 text-xs text-red-500">{nameError}</p>
          )}
        </div>
        <div>
          <label className="sr-only" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="text"
            placeholder="Email"
            className={`w-full rounded-xl border px-4 py-3 text-sm ${
              emailError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
            disabled={isSubmitting}
          />
          {emailError && (
            <p className="mt-1 text-xs text-red-500">{emailError}</p>
          )}
        </div>
        <div>
          <label className="sr-only" htmlFor="phone">
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="text"
            placeholder="Phone"
            className={`w-full rounded-xl border px-4 py-3 text-sm ${
              phoneError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
            disabled={isSubmitting}
          />
          {phoneError && (
            <p className="mt-1 text-xs text-red-500">{phoneError}</p>
          )}
        </div>
        <div>
          <label className="sr-only" htmlFor="start">
            Start date
          </label>
          <input
            id="start"
            name="start"
            type="date"
            className={`w-full rounded-xl border px-4 py-3 text-sm ${
              startDateError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
            disabled={isSubmitting}
          />
          {startDateError && (
            <p className="mt-1 text-xs text-red-500">{startDateError}</p>
          )}
        </div>
        <div>
          <label className="sr-only" htmlFor="end">
            End date
          </label>
          <input
            id="end"
            name="end"
            type="date"
            className={`w-full rounded-xl border px-4 py-3 text-sm ${
              endDateError ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
            }`}
            disabled={isSubmitting}
          />
          {endDateError && (
            <p className="mt-1 text-xs text-red-500">{endDateError}</p>
          )}
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

