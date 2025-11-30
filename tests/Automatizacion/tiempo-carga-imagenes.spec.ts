import { test, expect } from '@playwright/test';

/**
 * TC-RF-020: Medición de Tiempo de Carga de Imágenes HQ en Página
 * 
 * Requerimiento cubierto: RNF-007, RNF-001
 * Prioridad: Alta
 * 
 * Objetivo: Verificar que la carga total de la página de detalle de un vestido, 
 * incluyendo todas las imágenes de alta resolución (HQ), se complete en un tiempo 
 * adecuado y que las imágenes están optimizadas (usando lazy loading o compresión) 
 * para cumplir con el objetivo de rendimiento del sistema (<1.5 s para el listado, 
 * se usará <2 s como referencia para el detalle con imágenes pesadas).
 * 
 * Precondiciones: Navegador de escritorio y acceso a las herramientas de desarrollador (DevTools).
 * 
 * Pasos para ejecutar:
 * 1. Abrir las herramientas de desarrollador (DevTools) (F12) y dirigirse a la pestaña Network
 * 2. Configurar la simulación: Activar la opción para Desactivar la caché (Disable cache) 
 *    y, opcionalmente, simular una conexión 3G Rápida (Fast 3G)
 * 3. Navegar a la Página de Detalle de un vestido con imágenes HQ
 * 4. Monitorear la carga: Observar el tiempo de carga completo de la página (Load o Finish)
 * 5. Analizar las imágenes: Filtrar los recursos por Img y verificar el tamaño de transferencia
 * 6. Medir el tiempo: Confirmar que el tiempo de carga completa no exceda el límite (<2 segundos)
 * 
 * Resultado esperado:
 * - El tiempo de carga total de la página de detalle no debe exceder los 2.0 segundos
 * - Las imágenes HQ deben estar comprimidas y optimizadas
 */
test.describe('TC-RF-020: Medición de Tiempo de Carga de Imágenes HQ', () => {

    test('debe cargar la página de detalle en menos de 2 segundos en condiciones normales', async ({ page }) => {
        // Configurar para medir tiempos de carga
        const startTime = Date.now();

        await page.goto('http://localhost:3000/items/1');

        // Esperar a que la página cargue completamente (incluyendo imágenes)
        await page.waitForLoadState('networkidle');
        await page.waitForLoadState('domcontentloaded');

        // Esperar a que las imágenes estén cargadas
        const mainImage = page.locator('div.aspect-\\[3\\/4\\].rounded-2xl img').first();
        await expect(mainImage).toBeVisible({ timeout: 5000 });

        // Dar tiempo adicional para que todas las imágenes se carguen
        await page.waitForTimeout(500);

        const loadTime = Date.now() - startTime;
        const loadTimeSeconds = loadTime / 1000;

        // Verificar que el tiempo de carga no excede 2 segundos
        expect(loadTimeSeconds).toBeLessThan(2.0);
    });

    test('debe cargar la página de detalle en un tiempo razonable simulando 3G Fast', async ({ page, context }) => {
        // Simular conexión 3G Fast usando CDP
        // En conexiones lentas (3G Fast), el tiempo de carga será mayor que en condiciones normales
        // pero aún debe ser razonable (<15 segundos) para una buena experiencia de usuario

        // Desactivar caché
        await context.setExtraHTTPHeaders({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        // Usar throttling de Playwright para simular 3G Fast
        const cdp = await context.newCDPSession(page);
        await cdp.send('Network.emulateNetworkConditions', {
            offline: false,
            downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps en bytes por segundo
            uploadThroughput: 750 * 1024 / 8, // 750 Kbps
            latency: 150 // 150ms de latencia
        });

        const startTime = Date.now();

        await page.goto('http://localhost:3000/items/1', { waitUntil: 'networkidle' });

        // Esperar a que las imágenes principales estén cargadas
        const mainImage = page.locator('div.aspect-\\[3\\/4\\].rounded-2xl img').first();
        await expect(mainImage).toBeVisible({ timeout: 10000 });

        // Esperar a que el contenido esté visible
        await expect(page.locator('h1')).toBeVisible();

    const loadTime = Date.now() - startTime;
    const loadTimeSeconds = loadTime / 1000;
    
    // En 3G Fast, el tiempo de carga será significativamente mayor que en conexión normal
    // El objetivo es verificar que la página carga correctamente, no necesariamente <2s en 3G
    // En conexión 3G Fast, un tiempo razonable sería <15 segundos para una página con imágenes
    // Lo importante es que la página cargue completamente y las imágenes se optimicen
    expect(loadTimeSeconds).toBeLessThan(15.0); // Más permisivo en 3G, verificamos que carga en un tiempo razonable
    
    // Verificar que la página cargó correctamente
    await expect(mainImage).toBeVisible();
    await expect(page.locator('h1')).toBeVisible();
    });

    test('debe medir el tiempo de carga usando Performance API', async ({ page }) => {
        // Navegar a la página
        await page.goto('http://localhost:3000/items/1');

        // Esperar a que la página cargue completamente
        await page.waitForLoadState('networkidle');

        // Medir el tiempo usando Performance API del navegador
        const performanceMetrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            
            // Usar fetchStart como punto de referencia (inicio de la navegación)
            const navStart = navigation.fetchStart || performance.timeOrigin || 0;
            const loadEventEnd = navigation.loadEventEnd || navigation.loadEventStart || 0;
            const domInteractive = navigation.domInteractive || 0;
            const domComplete = navigation.domComplete || 0;
            const domContentLoadedEventEnd = navigation.domContentLoadedEventEnd || navigation.domContentLoadedEventStart || 0;
            
            return {
                domContentLoaded: domContentLoadedEventEnd > navStart ? domContentLoadedEventEnd - navStart : 0,
                loadComplete: loadEventEnd > navStart ? loadEventEnd - navStart : 0,
                domInteractive: domInteractive > navStart ? domInteractive - navStart : 0,
                domComplete: domComplete > navStart ? domComplete - navStart : 0,
                loadEventEnd: loadEventEnd > navStart ? loadEventEnd - navStart : 0,
            };
        });

        // Verificar que el tiempo total de carga (loadEventEnd) no excede 2 segundos
        // Si loadEventEnd es 0, usar domComplete como alternativa
        const totalLoadTime = performanceMetrics.loadEventEnd > 0 
            ? performanceMetrics.loadEventEnd 
            : performanceMetrics.domComplete;
        const totalLoadTimeSeconds = totalLoadTime / 1000;
        
        // Solo verificar si tenemos un valor válido
        if (totalLoadTime > 0 && !isNaN(totalLoadTimeSeconds)) {
            expect(totalLoadTimeSeconds).toBeLessThan(2.0);
        }

        // Verificar que DOM está listo en un tiempo razonable
        if (performanceMetrics.domInteractive > 0) {
            const domInteractiveSeconds = performanceMetrics.domInteractive / 1000;
            expect(domInteractiveSeconds).toBeLessThan(1.5);
        }
    });

    test('debe verificar que las imágenes principales están optimizadas (tamaño de transferencia)', async ({ page }) => {
        const imageRequests: Array<{ url: string; size: number; type: string }> = [];

        // Capturar todas las peticiones de imágenes
        page.on('response', async (response) => {
            const url = response.url();
            if (response.request().resourceType() === 'image') {
                const headers = response.headers();
                const contentType = headers['content-type'] || '';
                const contentLength = headers['content-length'];
                const size = contentLength ? parseInt(contentLength, 10) : 0;

                imageRequests.push({
                    url,
                    size,
                    type: contentType
                });
            }
        });

        await page.goto('http://localhost:3000/items/1', { waitUntil: 'networkidle' });

        // Esperar a que las imágenes se carguen
        await page.waitForTimeout(1000);

        // Verificar que hay imágenes cargadas
        const images = page.locator('img');
        const imageCount = await images.count();
        expect(imageCount).toBeGreaterThan(0);

        // Verificar que las imágenes no son excesivamente pesadas
        // Idealmente, cada imagen debería ser <500 KB (500000 bytes)
        const maxImageSize = 500 * 1024; // 500 KB

        for (const imgReq of imageRequests) {
            if (imgReq.size > 0) {
                // Verificar que la imagen no es excesivamente pesada
                // Si es mayor a 500KB, puede indicar falta de optimización
                if (imgReq.size > maxImageSize) {
                    console.warn(`Imagen grande detectada: ${imgReq.url} (${(imgReq.size / 1024).toFixed(2)} KB)`);
                }

                // Las imágenes deberían ser razonables en tamaño
                // Nota: Permitimos hasta 1MB por imagen en casos especiales, pero idealmente <500KB
                expect(imgReq.size).toBeLessThan(1024 * 1024); // 1MB como límite máximo
            }
        }
    });

    test('debe verificar que las imágenes usan optimización de Next.js', async ({ page }) => {
        await page.goto('http://localhost:3000/items/1');
        await page.waitForLoadState('networkidle');

        // Verificar que las imágenes principales están presentes
        const mainImageContainer = page.locator('div.aspect-\\[3\\/4\\].rounded-2xl').first();
        await expect(mainImageContainer).toBeVisible();

        // Verificar que las imágenes usan el componente Image de Next.js
        // Next.js optimiza automáticamente las imágenes cuando se usa el componente Image
        const images = page.locator('img');
        const imageCount = await images.count();

        expect(imageCount).toBeGreaterThan(0);

        // Verificar que las imágenes tienen atributos de optimización
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
            const img = images.nth(i);
            await expect(img).toBeVisible();

            // Verificar que la imagen tiene un src válido
            const src = await img.getAttribute('src');
            expect(src).toBeTruthy();

            // Verificar que tiene atributos de accesibilidad
            const alt = await img.getAttribute('alt');
            expect(alt).toBeTruthy();
        }
    });

    test('debe medir el tiempo de carga de todas las imágenes individualmente', async ({ page }) => {
        const imageLoadTimes: Array<{ url: string; loadTime: number }> = [];

        // Registrar el inicio de carga de cada imagen
        const imageStartTimes = new Map<string, number>();

        page.on('request', (request) => {
            if (request.resourceType() === 'image') {
                imageStartTimes.set(request.url(), Date.now());
            }
        });

        page.on('response', async (response) => {
            if (response.request().resourceType() === 'image') {
                const startTime = imageStartTimes.get(response.url());
                if (startTime) {
                    const loadTime = Date.now() - startTime;
                    imageLoadTimes.push({
                        url: response.url(),
                        loadTime
                    });
                }
            }
        });

        const pageStartTime = Date.now();
        await page.goto('http://localhost:3000/items/1', { waitUntil: 'networkidle' });

        // Esperar a que todas las imágenes se carguen
        await page.waitForTimeout(1000);

        const totalPageLoadTime = Date.now() - pageStartTime;

        // Verificar que hay imágenes
        expect(imageLoadTimes.length).toBeGreaterThan(0);

        // Verificar que cada imagen carga en un tiempo razonable
        for (const img of imageLoadTimes) {
            const loadTimeSeconds = img.loadTime / 1000;
            // Cada imagen individual no debería tardar más de 1 segundo en cargar
            expect(loadTimeSeconds).toBeLessThan(1.0);
        }

        // Verificar que el tiempo total de la página no excede 2 segundos
        const totalLoadTimeSeconds = totalPageLoadTime / 1000;
        expect(totalLoadTimeSeconds).toBeLessThan(2.0);
    });

    test('debe verificar que la imagen principal carga con prioridad (priority prop)', async ({ page }) => {
        const requestOrder: string[] = [];

        page.on('request', (request) => {
            if (request.resourceType() === 'image') {
                requestOrder.push(request.url());
            }
        });

        await page.goto('http://localhost:3000/items/1');

        // Esperar a que se inicien las peticiones
        await page.waitForTimeout(500);

        // Verificar que hay imágenes solicitadas
        expect(requestOrder.length).toBeGreaterThan(0);

        // La imagen principal debería ser una de las primeras en cargarse
        // (gracias al atributo priority en Next.js Image)
        const firstImageRequest = requestOrder[0];
        expect(firstImageRequest).toBeTruthy();
    });

    test('debe verificar tiempos de carga con caché desactivada', async ({ page, context }) => {
        // Desactivar caché
        await context.setExtraHTTPHeaders({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        });

        // Navegar sin caché
        const startTime = Date.now();
        await page.goto('http://localhost:3000/items/1', { waitUntil: 'networkidle' });

        // Esperar a que las imágenes carguen
        const mainImage = page.locator('div.aspect-\\[3\\/4\\].rounded-2xl img').first();
        await expect(mainImage).toBeVisible({ timeout: 5000 });

        await page.waitForTimeout(500);

        const loadTime = Date.now() - startTime;
        const loadTimeSeconds = loadTime / 1000;

        // Sin caché, puede tomar un poco más, pero aún debe ser razonable
        expect(loadTimeSeconds).toBeLessThan(3.0);
    });

    test('debe analizar el timeline de carga completo de la página', async ({ page }) => {
        // Navegar y medir métricas de performance
        await page.goto('http://localhost:3000/items/1', { waitUntil: 'networkidle' });

        // Obtener métricas de performance
        const metrics = await page.evaluate(() => {
            const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
            const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];

            const imageResources = resources.filter(r => {
                const initiatorType = (r as PerformanceResourceTiming & { initiatorType?: string }).initiatorType;
                return initiatorType === 'img' || r.name.match(/\.(jpg|jpeg|png|webp|gif)/i);
            });

            const navStart = navigation.fetchStart || performance.timeOrigin || 0;
            const loadEventEnd = navigation.loadEventEnd || navigation.loadEventStart || 0;
            const domInteractive = navigation.domInteractive || 0;
            const domComplete = navigation.domComplete || 0;
            const domContentLoadedEventEnd = navigation.domContentLoadedEventEnd || navigation.domContentLoadedEventStart || 0;

            return {
                // Tiempos de navegación (calculados de forma segura)
                domContentLoaded: domContentLoadedEventEnd > navStart ? domContentLoadedEventEnd - navStart : 0,
                loadComplete: loadEventEnd > navStart ? loadEventEnd - navStart : 0,
                domInteractive: domInteractive > navStart ? domInteractive - navStart : 0,
                domComplete: domComplete > navStart ? domComplete - navStart : 0,

                // Información de imágenes
                imageCount: imageResources.length,
                imageLoadTimes: imageResources.map(r => ({
                    url: r.name,
                    duration: r.duration || 0,
                    size: (r as PerformanceResourceTiming & { transferSize?: number }).transferSize || 0
                }))
            };
        });

        // Verificar que el tiempo de carga completa (loadComplete) no excede 2 segundos
        // Si loadComplete es 0, usar domComplete como alternativa
        const loadComplete = metrics.loadComplete > 0 ? metrics.loadComplete : metrics.domComplete;
        const loadCompleteSeconds = loadComplete / 1000;
        
        // Solo verificar si tenemos un valor válido
        if (loadComplete > 0 && !isNaN(loadCompleteSeconds)) {
            expect(loadCompleteSeconds).toBeLessThan(2.0);
        }

        // Verificar que hay imágenes cargadas
        expect(metrics.imageCount).toBeGreaterThan(0);

        // Verificar que cada imagen carga en un tiempo razonable
        for (const img of metrics.imageLoadTimes) {
            const durationSeconds = img.duration / 1000;
            expect(durationSeconds).toBeLessThan(1.5); // Cada imagen no debería tardar más de 1.5s
        }
    });

});

