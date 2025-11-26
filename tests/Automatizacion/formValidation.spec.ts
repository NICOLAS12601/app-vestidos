import { test, expect } from "@playwright/test";

const URL = "http://localhost:3000/items/2";

// --- Helpers ---
async function fillBasicValidForm(page) {
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
    await fillBasicValidForm(page);

    await page.getByRole("button", { name: "Request rental" }).click();

    await expect(page.getByText("¡Reserva creada exitosamente!")).toBeVisible();
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
      page.getByText("Por favor ingresa un email válido")
    ).toBeVisible();
  });

  // =====================================
  // TC-RNF-015 — Teléfono válido aceptado
  // =====================================
  test("Teléfono válido es aceptado", async ({ page }) => {
    await fillBasicValidForm(page);

    await page.getByRole("button", { name: "Request rental" }).click();
    await expect(page.getByText("¡Reserva creada exitosamente!")).toBeVisible();
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
      page.getByText("Por favor ingresa un teléfono válido")
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
      page.getByText("Por favor ingresa un nombre válido")
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
      page.getByText("La fecha de fin debe ser posterior")
    ).toBeVisible();
  });

  // =====================================
  // SUBMIT: Backend devuelve error
  // =====================================
  test("Si el servidor devuelve error, muestra toast de error", async ({ page, context }) => {
    // Mocks
    await context.route("/api/rentals", route =>
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: "Error del servidor" })
      })
    );

    await fillBasicValidForm(page);

    await page.getByRole("button", { name: "Request rental" }).click();

    await expect(page.getByText("Error del servidor")).toBeVisible();
  });

});
