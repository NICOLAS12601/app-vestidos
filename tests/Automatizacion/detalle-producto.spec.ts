import { test, expect } from '@playwright/test';
import { appUrls } from '../testData/urls';

/**
 * TC-RF-005: Detalle muestra imágenes HQ, descripción, talles y precio
 * 
 * Requerimiento cubierto: RF-002
 * Prioridad: Alta
 * 
 * Objetivo: Confirmar presencia y visibilidad de todos los campos requeridos.
 * 
 * Precondiciones: Artículo con datos completos.
 * 
 * Pasos para ejecutar:
 * 1. Abrir detalle de un artículo
 * 2. Verificar: imagen principal, galería (si aplica), descripción, talles disponibles y precio de alquiler
 * 
 * Resultado esperado: Todos los elementos se renderizan; precio incluye moneda; imágenes no rotas.
 */
test.describe('TC-RF-005: Detalle de Producto', () => {

    test('debe mostrar imagen principal de alta calidad', async ({ page }) => {
        // Navegar a la página de detalle de un artículo
        await page.goto(appUrls.item(1));
        await page.waitForLoadState('networkidle');

        // Verificar que existe la imagen principal
        // La imagen principal está en un div con aspect-[3/4] y contiene un componente Image de Next.js
        const mainImageContainer = page.locator('div.aspect-\\[3\\/4\\].rounded-2xl').first();
        await expect(mainImageContainer).toBeVisible();

        // Verificar que la imagen está cargada correctamente (no rota)
        const mainImage = mainImageContainer.locator('img').first();
        await expect(mainImage).toBeVisible();

        // Verificar que la imagen tiene un src válido
        const imageSrc = await mainImage.getAttribute('src');
        expect(imageSrc).toBeTruthy();
        expect(imageSrc).not.toBe('');

        // Verificar que la imagen tiene un alt text
        const imageAlt = await mainImage.getAttribute('alt');
        expect(imageAlt).toBeTruthy();
    });

    test('debe mostrar galería de imágenes si hay múltiples imágenes', async ({ page }) => {
        await page.goto(appUrls.item(1));
        await page.waitForLoadState('networkidle');

        // Verificar si hay galería de imágenes adicionales (slice(1) de las imágenes)
        // La galería está en un grid con grid-cols-3
        const galleryContainer = page.locator('div.grid.grid-cols-3.gap-3');

        // Puede haber o no galería, dependiendo de si el item tiene más de una imagen
        const galleryExists = await galleryContainer.count() > 0;

        if (galleryExists) {
            // Si existe la galería, verificar que las imágenes están visibles y no rotas
            const galleryImages = galleryContainer.locator('img');
            const imageCount = await galleryImages.count();

            if (imageCount > 0) {
                for (let i = 0; i < imageCount; i++) {
                    const img = galleryImages.nth(i);
                    await expect(img).toBeVisible();

                    const src = await img.getAttribute('src');
                    expect(src).toBeTruthy();
                    expect(src).not.toBe('');
                }
            }
        }
    });

    test('debe mostrar la descripción del artículo', async ({ page }) => {
        await page.goto(appUrls.item(1));
        await page.waitForLoadState('networkidle');

        // Verificar que existe el nombre/descripción del artículo
        // Está en un h1 con clases text-2xl sm:text-3xl font-bold
        const itemName = page.locator('h1.text-2xl, h1.text-3xl, h1.font-bold').first();
        await expect(itemName).toBeVisible();

        // Verificar que el nombre no está vacío
        const nameText = await itemName.textContent();
        expect(nameText).toBeTruthy();
        expect(nameText?.trim()).not.toBe('');
    });

    test('debe mostrar los talles disponibles', async ({ page }) => {
        await page.goto(appUrls.item(1));
        await page.waitForLoadState('networkidle');

        // Verificar que se muestra la información de talles
        // Está en un párrafo que contiene "Sizes:"
        const sizesText = page.getByText(/Sizes:/i);
        await expect(sizesText).toBeVisible();

        // Verificar que los talles no están vacíos
        const sizesContent = await sizesText.textContent();
        expect(sizesContent).toBeTruthy();
        expect(sizesContent?.trim()).not.toBe('Sizes:');
        expect(sizesContent?.trim().length).toBeGreaterThan(7); // Más que "Sizes: "
    });

    test('debe mostrar el precio de alquiler con moneda', async ({ page }) => {
        await page.goto(appUrls.item(1));
        await page.waitForLoadState('networkidle');

        // Verificar que se muestra el precio
        // Está en un párrafo que contiene "From $" y "/day"
        const priceText = page.getByText(/From.*\/day/i).or(page.getByText(/\$.*\/day/i));
        await expect(priceText).toBeVisible();

        // Verificar que el precio incluye el símbolo de moneda ($)
        const priceContent = await priceText.textContent();
        expect(priceContent).toBeTruthy();
        expect(priceContent).toContain('$');
        expect(priceContent).toContain('/day');

        // Verificar que hay un número en el precio
        const hasNumber = /\d+/.test(priceContent || '');
        expect(hasNumber).toBe(true);
    });

    test('debe mostrar color y estilo del artículo', async ({ page }) => {
        await page.goto(appUrls.item(1));
        await page.waitForLoadState('networkidle');

        // Verificar que se muestra el color
        // Está en un párrafo que contiene "Color:"
        const colorText = page.getByText(/Color:/i);
        await expect(colorText).toBeVisible();

        // Verificar que el color no está vacío
        const colorContent = await colorText.textContent();
        expect(colorContent).toBeTruthy();
        expect(colorContent?.trim()).not.toBe('Color:');
    });

    test('debe renderizar todos los elementos requeridos correctamente', async ({ page }) => {
        await page.goto(appUrls.item(1));
        await page.waitForLoadState('networkidle');

        // Verificar que todos los elementos están presentes y visibles
        const mainImage = page.locator('div.aspect-\\[3\\/4\\].rounded-2xl').first();
        const itemName = page.locator('h1').first();
        const price = page.getByText(/From.*\/day/i).or(page.getByText(/\$.*\/day/i));
        const sizes = page.getByText(/Sizes:/i);
        const color = page.getByText(/Color:/i);

        await expect(mainImage).toBeVisible();
        await expect(itemName).toBeVisible();
        await expect(price).toBeVisible();
        await expect(sizes).toBeVisible();
        await expect(color).toBeVisible();

        // Verificar que las imágenes no están rotas (verificar que tienen src válido)
        const allImages = page.locator('img');
        const imageCount = await allImages.count();

        for (let i = 0; i < imageCount; i++) {
            const img = allImages.nth(i);
            const src = await img.getAttribute('src');
            expect(src).toBeTruthy();
            expect(src).not.toBe('');

            // Verificar que la imagen se carga correctamente
            const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth);
            const naturalHeight = await img.evaluate((el: HTMLImageElement) => el.naturalHeight);

            // Si la imagen está rota, naturalWidth o naturalHeight serán 0
            expect(naturalWidth).toBeGreaterThan(0);
            expect(naturalHeight).toBeGreaterThan(0);
        }
    });

    test('debe verificar elementos en diferentes artículos', async ({ page }) => {
        // Probar con múltiples IDs para asegurar que funciona con diferentes artículos
        const itemIds = [1, 2, 3, 4];

        for (const itemId of itemIds) {
            await page.goto(appUrls.item(itemId));
            await page.waitForLoadState('networkidle');

            // Verificar elementos básicos
            const itemName = page.locator('h1').first();
            const price = page.getByText(/From.*\/day/i).or(page.getByText(/\$.*\/day/i));

            // Si el item no existe, la página puede mostrar 404
            const is404 = await page.getByText(/404|not found/i).isVisible().catch(() => false);

            if (!is404) {
                await expect(itemName).toBeVisible();
                await expect(price).toBeVisible();

                // Verificar que la imagen principal existe
                const mainImage = page.locator('div.aspect-\\[3\\/4\\].rounded-2xl').first();
                await expect(mainImage).toBeVisible();
            }
        }
    });

});

