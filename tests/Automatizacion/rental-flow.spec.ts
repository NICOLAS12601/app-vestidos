import { test, expect } from '@playwright/test';
import { ItemDetailPage } from '../pages/ItemDetailPage';
import { generateUniqueCustomerName } from '../helpers';

test.describe('Flujo de alquiler en ≤ 3 pasos', () => {
    test('El usuario completa la reserva en máximo 3 pasos', async ({ page }) => {
        const itemDetail = new ItemDetailPage(page);
        const customerName = generateUniqueCustomerName('RentalFlow');

        // Paso 1: Abrir la página del ítem
        await itemDetail.goto(2);
        await expect(itemDetail.submit).toBeVisible();

        // Paso 2 y 3: Completar formulario y enviar (usando fechas dinámicas)
        await itemDetail.createRental(customerName);

        // Verificar toast de éxito
        await expect(itemDetail.toastSuccess).toBeVisible({ timeout: 15000 });
    });
});
