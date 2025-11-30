import { test, expect } from '@playwright/test';
import { appUrls } from '../testData/urls';

test.describe('Home carga < 2 s (primera visita, sin caché)', () => {
  test('Tiempo de navegación es menor a 2000 ms', async ({ page }) => {
    // Desactivar caché del contexto para simular primera visita
    await page.context().route('**/*', route => route.continue());

    await page.goto(appUrls.home, { waitUntil: 'load' });

    const navEntry = await page.evaluate(() => {
      const entries = performance.getEntriesByType('navigation');
      const e = entries && entries[0];
      return e ? e.duration : null;
    });

    expect(typeof navEntry).toBe('number');
    // Umbral de 2000 ms
    expect(navEntry as number).toBeLessThan(2000);
  });
});
