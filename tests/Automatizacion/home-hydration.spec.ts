import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';


test.describe('SSR/Client Hydration - Home Page', () => {

  test('should render without hydration mismatch errors', async ({ page }) => {
    const home = new HomePage(page);
    const errors: string[] = [];

    // Capture React hydration warnings/errors
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' ||
        msg.text().includes('Hydration') ||
        msg.text().includes('did not match') ||
        msg.text().includes('Text content does not match')
      ) {
        errors.push(msg.text());
      }
    });

    await home.goto();

    // Give React some time to hydrate
    await page.waitForLoadState('networkidle');

    expect(errors, `Hydration errors detected:\n${errors.join('\n')}`).toHaveLength(0);
  });

});
