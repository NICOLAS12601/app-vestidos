import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
    readonly page: Page;
    readonly signOutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.signOutButton = page.getByRole('button', { name: /sign out/i });
    }

    async expectDashboardVisible() {
        await expect(this.page).toHaveURL(/\/_?admin$/, { timeout: 15000 });
        await expect(this.signOutButton).toBeVisible({ timeout: 15000 });
    }

    async signOut() {
        await Promise.all([
            this.page.waitForURL(/\/admin\/login$/, { timeout: 15000 }),
            this.signOutButton.click(),
        ]);
    }
}
