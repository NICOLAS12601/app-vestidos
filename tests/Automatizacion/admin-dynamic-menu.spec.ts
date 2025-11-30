import { test, expect } from '@playwright/test';

test.describe('Admin: el menú no es estático, se cargan las reservas y los productos', () => {
  test('Secciones Inventory y Scheduled rentals aparecen y muestran contenido dinámico/estado', async ({ page }) => {
    // Simular sesión admin para pasar el middleware
    await page.context().addCookies([{ name: 'gr_admin', value: 'e2e-session', domain: 'localhost', path: '/' }]);

    await page.goto('http://localhost:3000/admin');

    // Verificar que las secciones existen
    await expect(page.getByRole('heading', { name: 'Inventory' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('heading', { name: 'Scheduled rentals' })).toBeVisible({ timeout: 15000 });

    // Tabla de productos (InventoryTable)
    const inventoryTable = page.locator('section:has(> h2:text("Inventory")) table');
    await expect(inventoryTable).toBeVisible();

    // Tabla de reservas
    const rentalsTable = page.locator('section:has(> h2:text("Scheduled rentals")) table');
    await expect(rentalsTable).toBeVisible();

    // Contenido: al menos renderiza filas o un estado de vacío
    const rentalRows = rentalsTable.locator('tbody tr');
    const rentalsCount = await rentalRows.count();
    if (rentalsCount === 0) {
      await expect(page.getByText('No rentals yet.')).toBeVisible();
    } else {
      // Si hay filas, verificar que las celdas clave existan (Actions/Status)
      await expect(rentalRows.nth(0).locator('td').nth(4)).toBeVisible(); // Status
      await expect(rentalRows.nth(0).locator('td').nth(5)).toBeVisible(); // Actions
    }
  });
});
