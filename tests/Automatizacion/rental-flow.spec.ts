import { test, expect, Page } from '@playwright/test';

const ITEM_URL = 'http://localhost:3000/items/2';

async function completeRentalInThreeSteps(page: Page) {
  // Paso 1: Abrir la página del ítem y confirmar que el botón de solicitar está visible
  await page.goto(ITEM_URL);
  const requestBtn = page.getByRole('button', { name: 'Request rental' });
  await expect(requestBtn).toBeVisible();

  // Paso 2: Completar el formulario
  await page.fill('input[name="name"]', 'Test User');
  await page.fill('input[name="email"]', 'test@example.com');
  await page.fill('input[name="phone"]', '091234567');
  await page.fill('input[name="start"]', '2025-12-10');
  await page.fill('input[name="end"]', '2025-12-12');

  // Paso 3: Enviar y verificar el toast de éxito
  await requestBtn.click();
  await expect(page.getByRole('alert').or(page.getByText(/Reserva creada exitosamente/i))).toBeVisible({ timeout: 15000 });
}

test.describe('Flujo de alquiler en ≤ 3 pasos', () => {
  test('El usuario completa la reserva en máximo 3 pasos', async ({ page }) => {
    await completeRentalInThreeSteps(page);
  });
});
