import { test, expect } from '@playwright/test';
import { appUrls } from '../testData/urls';

/**
 * TC-RF-001: Vestidos/Chaquetas: muestra filtros Talla, Color y Estilo
 * 
 * Requerimiento cubierto: RF-001
 * Prioridad: Alta
 * 
 * Objetivo: Verificar que se muestren exactamente los filtros Talla, Color y Estilo.
 * 
 * Precondiciones: Catálogo con productos de Vestidos y Chaquetas.
 * 
 * Pasos para ejecutar:
 * 1. Abrir /search (página de catálogo)
 * 2. Observar filtros disponibles
 * 
 * Resultado esperado: Aparecen y funcionan los filtros Talla, Color y Estilo.
 */
test.describe('TC-RF-001: Filtros del Catálogo', () => {

    test.beforeEach(async ({ page }) => {
        await page.goto(appUrls.search);
        // Esperar a que la página cargue completamente
        await page.waitForLoadState('networkidle');
    });

    test('debe mostrar el filtro de Estilo', async ({ page }) => {
        // Verificar que existe el select de estilo
        const estiloFilter = page.locator('select[name="estilo"]');
        await expect(estiloFilter).toBeVisible();

        // Verificar que tiene opciones
        const estiloOptions = estiloFilter.locator('option');
        await expect(estiloOptions).toHaveCount(4); // "Todos los estilos" + 3 opciones

        // Verificar que contiene las opciones esperadas
        await expect(estiloFilter.locator('option[value="evening"]')).toHaveText('Noche');
        await expect(estiloFilter.locator('option[value="black-tie"]')).toHaveText('Black Tie');
        await expect(estiloFilter.locator('option[value="daytime"]')).toHaveText('Día');
    });

    test('debe mostrar el filtro de Color', async ({ page }) => {
        // Verificar que existe el input de color
        const colorFilter = page.locator('input[name="color"]');
        await expect(colorFilter).toBeVisible();

        // Verificar que tiene el placeholder correcto
        await expect(colorFilter).toHaveAttribute('placeholder', 'Color');
    });

    test('debe mostrar el filtro de Talla', async ({ page }) => {
        // Verificar que existe el input de talle
        const talleFilter = page.locator('input[name="talle"]');
        await expect(talleFilter).toBeVisible();

        // Verificar que tiene el placeholder correcto
        await expect(talleFilter).toHaveAttribute('placeholder', 'Talle');
    });

    test('debe mostrar todos los filtros requeridos (Talla, Color y Estilo)', async ({ page }) => {
        // Verificar que los tres filtros están presentes
        await expect(page.locator('select[name="estilo"]')).toBeVisible();
        await expect(page.locator('input[name="color"]')).toBeVisible();
        await expect(page.locator('input[name="talle"]')).toBeVisible();

        // Verificar que están dentro del formulario de búsqueda
        const searchForm = page.locator('form[method="GET"]');
        await expect(searchForm.locator('select[name="estilo"]')).toBeVisible();
        await expect(searchForm.locator('input[name="color"]')).toBeVisible();
        await expect(searchForm.locator('input[name="talle"]')).toBeVisible();
    });

    test('los filtros deben estar funcionales', async ({ page }) => {
        // Verificar que el filtro de Estilo funciona
        const estiloFilter = page.locator('select[name="estilo"]');
        await estiloFilter.selectOption({ value: 'evening' });
        await expect(estiloFilter).toHaveValue('evening');

        // Verificar que el filtro de Color funciona
        const colorFilter = page.locator('input[name="color"]');
        await colorFilter.fill('rojo');
        await expect(colorFilter).toHaveValue('rojo');

        // Verificar que el filtro de Talla funciona
        const talleFilter = page.locator('input[name="talle"]');
        await talleFilter.fill('M');
        await expect(talleFilter).toHaveValue('M');
    });

});
