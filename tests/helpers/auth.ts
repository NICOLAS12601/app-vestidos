import { Page } from '@playwright/test';

/**
 * Configura una sesión de admin agregando la cookie de autenticación
 * @param page - Instancia de Page de Playwright
 */
export async function setupAdminSession(page: Page): Promise<void> {
    await page.context().addCookies([{
        name: 'gr_admin',
        value: 'e2e-session',
        domain: 'localhost',
        path: '/',
    }]);
}

/**
 * Mockea una respuesta exitosa de login
 * @param page - Instancia de Page de Playwright
 */
export async function mockAdminLogin(page: Page): Promise<void> {
    await page.route('**/api/admin/login', async (route) => {
        await route.fulfill({
            status: 302,
            headers: {
                Location: '/admin',
                'Set-Cookie': 'gr_admin=e2e-session; Path=/; SameSite=Lax',
            },
            body: '',
        });
    });
}

/**
 * Mockea una respuesta exitosa de logout
 * @param page - Instancia de Page de Playwright
 */
export async function mockAdminLogout(page: Page): Promise<void> {
    await page.route('**/api/admin/logout', async (route) => {
        await route.fulfill({
            status: 302,
            headers: {
                Location: '/admin/login',
                'Set-Cookie': 'gr_admin=; Path=/; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax',
            },
            body: '',
        });
    });
}

