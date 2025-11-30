import { test, expect, Page } from '@playwright/test';
import { AdminDashboardPage } from '../pages/AdminDashboardPage';
import { ItemDetailPage } from '../pages/ItemDetailPage';

async function setupAdminSession(page: Page) {
  await page.context().addCookies([{ 
    name: 'gr_admin', 
    value: 'e2e-session', 
    domain: 'localhost', 
    path: '/' 
  }]);
}

test.describe('Admin Dashboard – Items', () => {
  let adminDashboard: AdminDashboardPage;

  test.beforeEach(async ({ page }) => {
    await setupAdminSession(page);
    adminDashboard = new AdminDashboardPage(page);
    await adminDashboard.goto();
  });

  test('Crear artículo', async ({ page }) => {
    const nombre = `TestItem_${Date.now()}`;
    await adminDashboard.addProduct(nombre, 'Rojo', 'Formal', 'S,M', '99');
    await adminDashboard.expectItemExists(nombre);
  });

  test('Editar y Eliminar artículo', async ({ page }) => {
    const nombre = `EditDelete_${Date.now()}`;
    await adminDashboard.addProduct(nombre, 'Azul', 'Casual');
    await adminDashboard.expectItemExists(nombre);
    
    // Editar
    await adminDashboard.clickUpdateItem(nombre);
    await adminDashboard.editItemInModal('color', 'Verde');
    
    // Verificar cambio
    const row = adminDashboard.getItemRow(nombre);
    await expect(row.locator('td').nth(2)).toHaveText('Verde', { timeout: 15000 });
    
    // Eliminar
    await adminDashboard.clickDeleteItem(nombre);
    await adminDashboard.confirmDeleteInModal();
    await adminDashboard.expectItemNotExists(nombre);
  });
});

test.describe('Admin Dashboard – Rentals', () => {
  let adminDashboard: AdminDashboardPage;
  let itemDetail: ItemDetailPage;

  test.beforeEach(async ({ page }) => {
    adminDashboard = new AdminDashboardPage(page);
    itemDetail = new ItemDetailPage(page);
  });

  test('Aceptar reserva: pendiente → confirmado', async ({ page }) => {
    const customerName = `PendApprove_${Date.now()}`;
    
    // Crear reserva
    await itemDetail.goto(2);
    await itemDetail.createRental(customerName);
    
    // Ir a admin y aprobar
    await setupAdminSession(page);
    await adminDashboard.goto();
    await adminDashboard.expectRentalCustomerName(customerName);
    await adminDashboard.approveRental(customerName);
    await adminDashboard.expectRentalStatus(customerName, 'approved');
  });

  test('Cancelar reserva: pendiente → cancelado', async ({ page }) => {
    const customerName = `PendCancel_${Date.now()}`;
    
    // Crear reserva
    await itemDetail.goto(2);
    await itemDetail.createRental(customerName);
    
    // Ir a admin y cancelar
    await setupAdminSession(page);
    await adminDashboard.goto();
    await adminDashboard.expectRentalCustomerName(customerName);
    await adminDashboard.cancelRental(customerName);
    await adminDashboard.expectRentalStatus(customerName, 'cancelled');
  });
});
