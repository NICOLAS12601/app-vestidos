import { test, expect } from '@playwright/test';

test.describe('Back link GlamRent', () => {
  test('Admin: click en GlamRent regresa a home', async ({ page }) => {
    await page.context().addCookies([{ name: 'gr_admin', value: 'e2e-session', domain: 'localhost', path: '/' }]);
    await page.goto('http://localhost:3000/admin');
    const glamLink = page.getByRole('link', { name: 'GlamRent' });
    await expect(glamLink).toBeVisible();
    await Promise.all([
      page.waitForURL('http://localhost:3000/', { timeout: 15000 }),
      glamLink.click(),
    ]);
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('Browse all → luego GlamRent vuelve a home', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    const browseAll = page.getByRole('link', { name: /Browse all/i });
    await expect(browseAll).toBeVisible();
    await Promise.all([
      page.waitForURL('http://localhost:3000/search', { timeout: 15000 }),
      browseAll.click(),
    ]);
    await expect(page).toHaveURL('http://localhost:3000/search');
    // Click GlamRent brand back to home
    const glamLink = page.getByRole('link', { name: 'GlamRent' });
    await expect(glamLink).toBeVisible();
    await Promise.all([
      page.waitForURL('http://localhost:3000/', { timeout: 15000 }),
      glamLink.click(),
    ]);
    await expect(page).toHaveURL('http://localhost:3000/');
  });

  test('View details → luego GlamRent vuelve a home', async ({ page }) => {
    await page.goto('http://localhost:3000/');
    // Tomar el primer "View details" de destacados
    const viewDetails = page.getByRole('link', { name: /View details/i }).first();
    await expect(viewDetails).toBeVisible();
    await Promise.all([
      page.waitForURL(/http:\/\/localhost:3000\/items\/\d+/, { timeout: 15000 }),
      viewDetails.click(),
    ]);
    await expect(page).toHaveURL(/http:\/\/localhost:3000\/items\/\d+/);
    const glamLink = page.getByRole('link', { name: 'GlamRent' });
    await expect(glamLink).toBeVisible();
    await Promise.all([
      page.waitForURL('http://localhost:3000/', { timeout: 15000 }),
      glamLink.click(),
    ]);
    await expect(page).toHaveURL('http://localhost:3000/');
  });
});
