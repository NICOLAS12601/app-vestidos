import { Page, expect } from '@playwright/test';

/**
 * Navega a una URL y espera a que se cargue completamente
 * @param page - Instancia de Page de Playwright
 * @param url - URL a la que navegar
 * @param timeout - Timeout en milisegundos (default: 15000)
 */
export async function navigateAndWait(
    page: Page,
    url: string,
    timeout: number = 15000
): Promise<void> {
    await page.goto(url);
    await page.waitForLoadState('networkidle');
    await expect(page).toHaveURL(new RegExp(url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')), { timeout });
}

/**
 * Espera a que la navegación se complete después de un click
 * @param page - Instancia de Page de Playwright
 * @param urlPattern - Patrón de URL esperado (puede ser string o RegExp)
 * @param timeout - Timeout en milisegundos (default: 15000)
 */
export async function waitForNavigationAfterClick(
    page: Page,
    urlPattern: string | RegExp,
    timeout: number = 15000
): Promise<void> {
    const pattern = typeof urlPattern === 'string'
        ? new RegExp(urlPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
        : urlPattern;

    await page.waitForURL(pattern, { timeout });
    await page.waitForLoadState('networkidle');
}

