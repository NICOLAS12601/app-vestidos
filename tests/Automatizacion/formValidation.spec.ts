import { test, expect, Page } from "@playwright/test";

const URL = "http://localhost:3000/items/2";

// --- Helpers ---
async function fillBasicValidForm(page: Page) {
  await page.fill('input[name="name"]', "Juan Perez");
  await page.fill('input[name="email"]', "juan@example.com");
  await page.fill('input[name="phone"]', "091234567");
  await page.fill('input[name="start"]', "2025-12-10");
  await page.fill('input[name="end"]', "2025-12-12");
}

test.describe("Rental Form – Validaciones y Flujo Completo", () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(URL);

    // Garantiza que estamos en página de item
    await expect(
      page.getByRole("button", { name: "Request rental" })
    ).toBeVisible();
  });

  // =====================================
  // TC-RNF-013 — Email válido aceptado
  // =====================================
  test("Email válido es aceptado", async ({ page }) => {
    // Mock de éxito del backend para hacerlo determinista
    await page.route("**/api/rentals", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, rentalId: 1001 }),
      });
    });

    await fillBasicValidForm(page);
    await page.getByRole("button", { name: "Request rental" }).click();
    await expect(page.getByText(/Reserva creada exitosamente/i)).toBeVisible({ timeout: 10000 });
  });

  // =====================================
  // TC-RNF-014 — Email inválido rechazado
  // =====================================
  test("Email inválido es rechazado", async ({ page }) => {
    await page.fill('input[name="name"]', "Juan Perez");
    await page.fill('input[name="email"]', "email-malo");
    await page.fill('input[name="phone"]', "091234567");
    await page.fill('input[name="start"]', "2025-12-10");
    await page.fill('input[name="end"]', "2025-12-12");

    await page.getByRole("button", { name: "Request rental" }).click();

    await expect(
      page.getByText(/Por favor ingresa un email válido/i)
    ).toBeVisible();
  });

  // =====================================
  // TC-RNF-015 — Teléfono válido aceptado
  // =====================================
  test("Teléfono válido es aceptado", async ({ page }) => {
    // Mock de éxito del backend para hacerlo determinista
    await page.route("**/api/rentals", async (route) => {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ success: true, rentalId: 1002 }),
      });
    });

    await fillBasicValidForm(page);
    await page.getByRole("button", { name: "Request rental" }).click();
    await expect(page.getByText(/Reserva creada exitosamente/i)).toBeVisible({ timeout: 10000 });
  });

  // =====================================
  // TC-RNF-016 — Teléfono inválido rechazado
  // =====================================
  test("Teléfono inválido es rechazado", async ({ page }) => {
    await page.fill('input[name="name"]', "Juan Perez");
    await page.fill('input[name="email"]', "juan@example.com");

    // Teléfono incorrecto
    await page.fill('input[name="phone"]', "12345");

    await page.fill('input[name="start"]', "2025-12-10");
    await page.fill('input[name="end"]', "2025-12-12");

    await page.getByRole("button", { name: "Request rental" }).click();

    await expect(
      page.getByText(/Por favor ingresa un teléfono válido/i)
    ).toBeVisible();
  });

  // =====================================
  // TC-RNF-017 — Espacios/caracteres invisibles
  // =====================================
  test("Valida espacios/caracteres invisibles", async ({ page }) => {
    await page.fill('input[name="name"]', "   "); // inválido
    await page.fill('input[name="email"]', "   ");
    await page.fill('input[name="phone"]', "        ");
    await page.fill('input[name="start"]', "");
    await page.fill('input[name="end"]', "");

    await page.getByRole("button", { name: "Request rental" }).click();

    await expect(
      page.getByText("Por favor ingresa un nombre válido")
    ).toBeVisible();
    await expect(
      page.getByText("El email es requerido")
    ).toBeVisible();
    await expect(
      page.getByText("El teléfono es requerido")
    ).toBeVisible();
  });

  // =====================================
  // VALIDACIÓN: Nombre inválido
  // =====================================
  test("Nombre muy corto es rechazado", async ({ page }) => {
    await page.fill('input[name="name"]', "A");
    await page.fill('input[name="email"]', "juan@example.com");
    await page.fill('input[name="phone"]', "091234567");
    await page.fill('input[name="start"]', "2025-12-10");
    await page.fill('input[name="end"]', "2025-12-12");

    await page.getByRole("button", { name: "Request rental" }).click();

    await expect(
      page.getByText(/Por favor ingresa un nombre válido/i)
    ).toBeVisible();
  });

  // =====================================
  // VALIDACIÓN: Fecha fin < inicio
  // =====================================
  test("Fecha de fin anterior a inicio es rechazada", async ({ page }) => {
    await page.fill('input[name="name"]', "Juan Perez");
    await page.fill('input[name="email"]', "juan@example.com");
    await page.fill('input[name="phone"]', "091234567");
    await page.fill('input[name="start"]', "2025-12-10");
    await page.fill('input[name="end"]', "2025-12-01");

    await page.getByRole("button", { name: "Request rental" }).click();

    await expect(
      page.getByText(/La fecha de fin debe ser posterior/i)
    ).toBeVisible();
  });

  // =====================================
  // SUBMIT: Backend devuelve error
  // =====================================
  test("Si el servidor devuelve error, muestra toast de error", async ({ page }) => {
    // Mock de error del backend
    await page.route("**/api/rentals", async (route) => {
      await route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "Error del servidor" })
      });
    });

    await fillBasicValidForm(page);

    await page.getByRole("button", { name: "Request rental" }).click();

    await expect(page.getByText(/Error del servidor/i)).toBeVisible();
  });

});
