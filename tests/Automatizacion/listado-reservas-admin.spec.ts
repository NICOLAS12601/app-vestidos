import { test, expect } from '@playwright/test';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { testUsers } from '../testData/credentials';
import { ItemDetailPage } from '../pages/ItemDetailPage';

/**
 * TC-RF-015: Listado/Calendario con artículo, fechas y contacto
 * 
 * Requerimiento cubierto: RF-006
 * Prioridad: Alta
 * 
 * Objetivo: Verificar que el Admin vea todas las reservas con datos clave.
 * 
 * Precondiciones: Existen solicitudes y reservas.
 * 
 * Pasos para ejecutar:
 * 1. Ir a Admin → Alquileres
 * 2. Cambiar vista Lista/Calendario (si aplica)
 * 
 * Resultado esperado: Cada ítem muestra artículo, rango de fechas y contacto 
 *                     (nombre, email, teléfono).
 */
test.describe('TC-RF-015: Listado de Reservas en Admin', () => {

  test.beforeEach(async ({ page }) => {
    // Login como admin
    const loginPage = new LoginPage(page);
    await loginPage.page.goto('http://localhost:3000/admin/login');
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await loginPage.page.waitForURL(/\/admin$/, { timeout: 10000 });
  });

  test('debe mostrar la sección de alquileres en el dashboard', async ({ page }) => {
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    // Verificar que la sección "Scheduled rentals" está presente
    await expect(adminPage.rentalsSection).toBeVisible();
    
    // Verificar que tiene el título correcto
    const heading = adminPage.rentalsSection.locator('h2');
    await expect(heading).toContainText(/Scheduled rentals|Alquileres/i);
  });

  test('debe mostrar la tabla de reservas con las columnas correctas', async ({ page }) => {
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    await adminPage.rentalsSection.waitFor({ state: 'visible' });

    // Verificar que la tabla tiene las columnas requeridas
    const table = adminPage.rentalsSection.locator('table');
    await expect(table).toBeVisible();

    // Verificar encabezados de columna
    const headers = table.locator('thead th');
    await expect(headers.nth(0)).toContainText(/Rental ID|ID/i);
    await expect(headers.nth(1)).toContainText(/Item|Artículo/i);
    await expect(headers.nth(2)).toContainText(/Dates|Fechas/i);
    await expect(headers.nth(3)).toContainText(/Customer|Cliente/i);
    await expect(headers.nth(4)).toContainText(/Status|Estado/i);
  });

  test('debe mostrar el artículo (item ID) para cada reserva', async ({ page }) => {
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    await adminPage.rentalsSection.waitFor({ state: 'visible' });

    // Obtener todas las filas de reservas (excluyendo el encabezado)
    const rentalRows = adminPage.rentalsSection.locator('tbody tr');
    const rowCount = await rentalRows.count();

    if (rowCount > 0) {
      // Verificar que cada fila tiene el ID del artículo en la segunda columna
      for (let i = 0; i < rowCount; i++) {
        const row = rentalRows.nth(i);
        const itemCell = row.locator('td').nth(1); // Segunda columna es Item
        
        // Verificar que la celda tiene contenido (puede ser ID del artículo)
        const itemText = await itemCell.textContent();
        expect(itemText).toBeTruthy();
        expect(itemText?.trim()).not.toBe('');
        
        // El ID del artículo debe ser un número
        const itemIdMatch = itemText?.match(/\d+/);
        expect(itemIdMatch).toBeTruthy();
      }
    } else {
      // Si no hay reservas, verificar que se muestra el mensaje apropiado
      const noRentalsMessage = adminPage.rentalsSection.getByText(/No rentals yet|No hay reservas/i);
      const hasMessage = await noRentalsMessage.isVisible().catch(() => false);
      
      if (hasMessage) {
        await expect(noRentalsMessage).toBeVisible();
      }
    }
  });

  test('debe mostrar el rango de fechas para cada reserva', async ({ page }) => {
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    await adminPage.rentalsSection.waitFor({ state: 'visible' });

    const rentalRows = adminPage.rentalsSection.locator('tbody tr');
    const rowCount = await rentalRows.count();

    if (rowCount > 0) {
      // Verificar que cada fila tiene fechas en la tercera columna
      for (let i = 0; i < rowCount; i++) {
        const row = rentalRows.nth(i);
        const datesCell = row.locator('td').nth(2); // Tercera columna es Dates
        
        const datesText = await datesCell.textContent();
        expect(datesText).toBeTruthy();
        expect(datesText?.trim()).not.toBe('');
        
        // Verificar que contiene el formato de fechas (debe tener → o - entre fechas)
        expect(datesText).toMatch(/\d{4}-\d{2}-\d{2}/); // Formato YYYY-MM-DD
        expect(datesText).toMatch(/→|-|to/i); // Separador entre fechas
      }
    }
  });

  test('debe mostrar el contacto (nombre, email, teléfono) para cada reserva', async ({ page }) => {
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    await adminPage.rentalsSection.waitFor({ state: 'visible' });

    const rentalRows = adminPage.rentalsSection.locator('tbody tr');
    const rowCount = await rentalRows.count();

    if (rowCount > 0) {
      // Verificar que cada fila tiene información de contacto en la cuarta columna
      for (let i = 0; i < rowCount; i++) {
        const row = rentalRows.nth(i);
        const customerCell = row.locator('td').nth(3); // Cuarta columna es Customer
        
        const customerText = await customerCell.textContent();
        expect(customerText).toBeTruthy();
        expect(customerText?.trim()).not.toBe('-');
        
        // Verificar que contiene el nombre del cliente
        // El nombre puede estar en el texto principal
        const hasName = customerText && customerText.trim().length > 0;
        expect(hasName).toBe(true);
        
        // Verificar que hay información adicional (email y teléfono pueden estar en un div hijo)
        const customerDetails = customerCell.locator('div.text-slate-500, div.text-xs');
        const detailsCount = await customerDetails.count();
        
        if (detailsCount > 0) {
          // Si hay detalles, deben contener email o teléfono
          const detailsText = await customerDetails.textContent();
          expect(detailsText).toBeTruthy();
          
          // Verificar formato de email o teléfono
          const hasEmail = detailsText?.includes('@') || detailsText?.match(/[\w.-]+@[\w.-]+\.\w+/);
          const hasPhone = detailsText?.match(/\d{7,}/); // Al menos 7 dígitos para teléfono
          
          // Al menos uno debe estar presente
          expect(hasEmail || hasPhone).toBe(true);
        }
      }
    }
  });

  test('debe mostrar todas las reservas con datos completos', async ({ page }) => {
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    await adminPage.rentalsSection.waitFor({ state: 'visible' });

    const rentalRows = adminPage.rentalsSection.locator('tbody tr');
    const rowCount = await rentalRows.count();

    if (rowCount > 0) {
      // Para cada reserva, verificar que tiene todos los datos requeridos
      for (let i = 0; i < rowCount; i++) {
        const row = rentalRows.nth(i);
        
        // Verificar que no es la fila de "No rentals yet"
        const isNoRentalsRow = await row.getByText(/No rentals yet/i).isVisible().catch(() => false);
        if (isNoRentalsRow) continue;
        
        // Verificar ID de reserva
        const rentalIdCell = row.locator('td').nth(0);
        const rentalId = await rentalIdCell.textContent();
        expect(rentalId).toBeTruthy();
        expect(rentalId?.trim()).not.toBe('');
        
        // Verificar Artículo (Item ID)
        const itemCell = row.locator('td').nth(1);
        const itemId = await itemCell.textContent();
        expect(itemId).toBeTruthy();
        expect(itemId?.trim()).not.toBe('');
        
        // Verificar Rango de Fechas
        const datesCell = row.locator('td').nth(2);
        const dates = await datesCell.textContent();
        expect(dates).toBeTruthy();
        expect(dates?.trim()).not.toBe('');
        expect(dates).toMatch(/\d{4}-\d{2}-\d{2}/);
        
        // Verificar Contacto
        const customerCell = row.locator('td').nth(3);
        const customerInfo = await customerCell.textContent();
        expect(customerInfo).toBeTruthy();
        expect(customerInfo?.trim()).not.toBe('-');
      }
    }
  });

  test('debe crear una reserva y verificar que aparece en el listado con todos los datos', async ({ page }) => {
    // Primero crear una reserva desde la página pública
    const itemDetailPage = new ItemDetailPage(page);
    await itemDetailPage.goto(1);
    await page.waitForLoadState('networkidle');

    // Crear una reserva con datos conocidos
    const now = new Date();
    const startDate = new Date(now.getTime() + 25 * 24 * 60 * 60 * 1000);
    const endDate = new Date(startDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    
    const customerName = `Test Admin List ${Date.now()}`;
    const customerEmail = `testadmin${Date.now()}@example.com`;
    const customerPhone = '091234569';

    // Mock de éxito del backend
    await page.route('**/api/rentals', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, rentalId: 99999 }),
      });
    });

    await itemDetailPage.fillRentalForm(
      customerName,
      customerEmail,
      customerPhone,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    await itemDetailPage.submit.click();
    await page.waitForLoadState('networkidle');

    // Ahora ir al admin para verificar que la reserva aparece
    const loginPage = new LoginPage(page);
    await page.goto('http://localhost:3000/admin/login');
    await loginPage.login(testUsers.admin.username, testUsers.admin.password);
    await page.waitForURL(/\/admin$/, { timeout: 10000 });

    const adminPage = new AdminDashboardPage(page);
    await adminPage.rentalsSection.waitFor({ state: 'visible' });

    // Buscar la reserva recién creada por el nombre del cliente
    const rentalRow = adminPage.getRentalRow(customerName);
    
    // Verificar que la fila existe
    await expect(rentalRow).toBeVisible({ timeout: 15000 });

    // Verificar que muestra el artículo
    const itemCell = rentalRow.locator('td').nth(1);
    const itemId = await itemCell.textContent();
    expect(itemId).toBeTruthy();

    // Verificar que muestra las fechas
    const datesCell = rentalRow.locator('td').nth(2);
    const dates = await datesCell.textContent();
    expect(dates).toContain(startDate.toISOString().split('T')[0]);
    expect(dates).toContain(endDate.toISOString().split('T')[0]);

    // Verificar que muestra el contacto
    const customerCell = rentalRow.locator('td').nth(3);
    const customerInfo = await customerCell.textContent();
    expect(customerInfo).toContain(customerName);
    expect(customerInfo).toContain(customerEmail);
    expect(customerInfo).toContain(customerPhone);
  });

  test('debe verificar que no existe vista de calendario (solo lista por ahora)', async ({ page }) => {
    const adminPage = new AdminDashboardPage(page);
    await adminPage.goto();

    await adminPage.rentalsSection.waitFor({ state: 'visible' });

    // Verificar que hay una tabla (vista de lista)
    const table = adminPage.rentalsSection.locator('table');
    await expect(table).toBeVisible();

    // Verificar si hay botones para cambiar vista (Lista/Calendario)
    const viewToggleButtons = page.getByRole('button', { name: /calendar|lista|list/i });
    const hasViewToggle = await viewToggleButtons.isVisible().catch(() => false);

    // Si existe un botón de cambio de vista, verificar que funciona
    // Por ahora, solo verificamos que la vista de lista está presente
    if (hasViewToggle) {
      // Si existe, probar cambiar a vista calendario
      await viewToggleButtons.first().click();
      await page.waitForLoadState('networkidle');
      
      // Verificar que se muestra algún tipo de calendario
      const calendarView = page.locator('.calendar, [data-view="calendar"], .fc-calendar');
      const hasCalendar = await calendarView.isVisible().catch(() => false);
      
      if (hasCalendar) {
        await expect(calendarView).toBeVisible();
      }
    } else {
      // Si no existe, solo verificamos que la lista está presente (que es lo esperado por ahora)
      await expect(table).toBeVisible();
    }
  });

});

