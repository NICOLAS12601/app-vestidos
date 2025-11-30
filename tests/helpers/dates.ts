/**
 * Genera una fecha única en el futuro para evitar conflictos en tests paralelos
 * @param daysOffset - Días base desde hoy (default: 200)
 * @param range - Rango de variación en días (default: 400)
 * @returns Fecha en formato YYYY-MM-DD
 */
export function generateUniqueFutureDate(daysOffset: number = 200, range: number = 400): string {
    const now = new Date();
    const randomOffset = Math.floor(Math.random() * 100); // 0-100 días adicionales de aleatoriedad
    const uniqueOffset = daysOffset + (Date.now() % range) + randomOffset;
    const futureDate = new Date(now.getTime() + uniqueOffset * 24 * 60 * 60 * 1000);
    return futureDate.toISOString().split('T')[0];
}

/**
 * Genera una fecha de inicio y fin para una reserva
 * @param daysOffset - Días base desde hoy para la fecha de inicio
 * @param durationDays - Duración de la reserva en días (default: 2)
 * @returns Objeto con startDate y endDate en formato YYYY-MM-DD
 */
export function generateRentalDates(
    daysOffset: number = 200,
    durationDays: number = 2
): { startDate: string; endDate: string } {
    const startDate = generateUniqueFutureDate(daysOffset);
    const start = new Date(startDate);
    const endDate = new Date(start.getTime() + durationDays * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0];

    return { startDate, endDate };
}

/**
 * Avanza una fecha un número específico de días
 * @param dateStr - Fecha en formato YYYY-MM-DD
 * @param days - Número de días a avanzar
 * @returns Nueva fecha en formato YYYY-MM-DD
 */
export function addDaysToDate(dateStr: string, days: number): string {
    const date = new Date(dateStr);
    const newDate = new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
    return newDate.toISOString().split('T')[0];
}

