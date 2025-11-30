import { Page } from "@playwright/test";
import { generateRentalDates, addDaysToDate } from '../helpers/dates';
import { appUrls } from '../testData/urls';

export class ItemDetailPage {
    constructor(readonly page: Page) { }

    async goto(id: number) {
        await this.page.goto(appUrls.item(id));
    }

    get name() { return this.page.locator('input[name="name"]'); }
    get email() { return this.page.locator('input[name="email"]'); }
    get phone() { return this.page.locator('input[name="phone"]'); }
    get start() { return this.page.locator('input[name="start"]'); }
    get end() { return this.page.locator('input[name="end"]'); }
    get submit() {
        return this.page.getByRole('button', { name: "Request rental" });
    }

    get toastSuccess() {
        return this.page.getByText('¡Reserva creada exitosamente!');
    }
    get toastError() {
        return this.page.getByText(/error|válido|inválido|prenda no disponible/i);
    }

    async fillRentalForm(name: string, email: string, phone: string, start: string, end: string) {
        await this.name.fill(name);
        await this.email.fill(email);
        await this.phone.fill(phone);
        await this.start.fill(start);
        await this.end.fill(end);
    }

    async createRental(customerName: string, email = 'test@example.com', phone = '091234567', start?: string, end?: string) {
        // Generar fechas únicas basadas en timestamp para evitar conflictos entre tests paralelos
        let { startDate, endDate } = start && end
            ? { startDate: start, endDate: end }
            : generateRentalDates(200, 2);

        // Intentar crear la reserva, si hay conflicto intentar con fechas más adelante
        const maxAttempts = 5; // Más intentos

        for (let attempts = 0; attempts < maxAttempts; attempts++) {
            await this.fillRentalForm(customerName, email, phone, startDate, endDate);

            // Esperar respuesta del servidor tras submit
            const responsePromise = this.page.waitForResponse(response =>
                response.url().includes('/api/rentals') && response.request().method() === 'POST'
            );

            await this.submit.click();
            const response = await responsePromise;
            const status = response.status();

            // Verificar que fue exitoso
            const responseData = await response.json();

            if (responseData.success) {
                await this.page.waitForLoadState('networkidle');
                return; // Éxito, salir
            }

            // Si hay conflicto (409) y aún tenemos intentos, probar con fechas más adelante
            if (status === 409 && attempts < maxAttempts - 1) {
                // Avanzar 60 días más para el próximo intento (más separación)
                startDate = addDaysToDate(startDate, 60);
                endDate = addDaysToDate(startDate, 2);
                await this.page.waitForTimeout(500); // Pequeña pausa antes de reintentar
                continue;
            }

            // Si no fue exitoso y no es un conflicto recuperable, lanzar error
            if (status !== 409) {
                throw new Error(`Failed to create rental: ${responseData.error || 'Unknown error'}`);
            }
        }

        throw new Error(`Failed to create rental after ${maxAttempts} attempts: dates may be fully booked`);
    }
}
