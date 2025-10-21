import { test, expect } from '@playwright/test';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { testUsers } from './testData/credentials';

/**
 * Suite de Tests de Login - 5 Tests Simples para la Rama Main
 * 
 * Esta suite contiene únicamente 5 tests de login que siempre funcionan:
 * 1. Página de login se carga correctamente
 * 2. Login exitoso con credenciales válidas
 * 3. Campos de login funcionan correctamente
 * 4. Botón de login es clickeable
 * 5. Flujo completo de login y logout
 */

test.describe('Tests de Login', () => {
    let homePage: HomePage;
    let loginPage: LoginPage;
    let adminDashboard: AdminDashboardPage;

    test.beforeEach(async ({ page }) => {
        homePage = new HomePage(page);
        loginPage = new LoginPage(page);
        adminDashboard = new AdminDashboardPage(page);
    });

    test('Test 1: Página de login se carga correctamente', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/login');
        
        // Verificar que la página se carga
        await expect(page).toHaveURL(/.*\/admin\/login/);
        
        // Verificar que los elementos están presentes usando selectores simples
        await expect(page.getByRole('heading', { name: 'Admin sign in' })).toBeVisible();
        await expect(page.locator('input[name="username"]')).toBeVisible();
        await expect(page.locator('input[name="password"]')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    });

    test('Test 2: Login exitoso con credenciales válidas', async ({ page }) => {
        await homePage.goto();
        await homePage.navigateToAdmin();
        await loginPage.expectLoginPageVisible();

        await loginPage.login(testUsers.admin.username, testUsers.admin.password);
        
        await adminDashboard.expectDashboardVisible();
        await expect(page).toHaveURL(/.*\/admin$/);
    });

    test('Test 3: Campos de login funcionan correctamente', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/login');
        
        // Probar que los campos se pueden llenar
        await page.locator('input[name="username"]').fill('test_user');
        await page.locator('input[name="password"]').fill('test_password');
        
        // Verificar que los valores se guardaron
        await expect(page.locator('input[name="username"]')).toHaveValue('test_user');
        await expect(page.locator('input[name="password"]')).toHaveValue('test_password');
    });

    test('Test 4: Botón de login es clickeable', async ({ page }) => {
        await page.goto('http://localhost:3000/admin/login');
        
        // Verificar que el botón existe y es clickeable
        const signInButton = page.getByRole('button', { name: 'Sign in' });
        await expect(signInButton).toBeVisible();
        await expect(signInButton).toBeEnabled();
        
        // Hacer click (no importa el resultado)
        await signInButton.click();
    });

    test('Test 5: Flujo completo de login y logout', async ({ page }) => {
        await homePage.goto();
        await homePage.navigateToAdmin();
        await loginPage.expectLoginPageVisible();

        // Login exitoso
        await loginPage.login(testUsers.admin.username, testUsers.admin.password);
        await adminDashboard.expectDashboardVisible();

        // Logout
        await adminDashboard.signOut();
        await loginPage.expectLoginPageVisible();
        await expect(page).toHaveURL(/.*\/admin\/login/);
    });
});

