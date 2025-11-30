import { Page } from '@playwright/test';
import { generateRentalDates } from './dates';
import { generateUniqueName, generateUniqueEmail, generateUniquePhone } from './test-data';

/**
 * Rellena el formulario de reserva con datos válidos
 * @param page - Instancia de Page de Playwright
 * @param options - Opciones para personalizar los datos del formulario
 */
export async function fillRentalForm(
    page: Page,
    options?: {
        name?: string;
        email?: string;
        phone?: string;
        startDate?: string;
        endDate?: string;
    }
): Promise<void> {
    const { startDate, endDate } = options?.startDate && options?.endDate
        ? { startDate: options.startDate, endDate: options.endDate }
        : generateRentalDates(20, 2);

    await page.fill('input[name="name"]', options?.name || generateUniqueName('Juan'));
    await page.fill('input[name="email"]', options?.email || generateUniqueEmail('juan'));
    await page.fill('input[name="phone"]', options?.phone || generateUniquePhone());
    await page.fill('input[name="start"]', startDate);
    await page.fill('input[name="end"]', endDate);
}

