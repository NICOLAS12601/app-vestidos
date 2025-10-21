import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
    readonly page: Page;
    readonly dashboardHeading: Locator;
    readonly signOutButton: Locator;

    constructor(page: Page) {
        this.page = page;
        this.dashboardHeading = page.getByRole('heading', { name: 'Admin dashboard' });
        this.signOutButton = page.getByRole('button', { name: 'Sign out' });
    }

    async expectDashboardVisible() {
        await expect(this.dashboardHeading).toBeVisible();
        await expect(this.signOutButton).toBeVisible();
    }

    async signOut() {
        await this.signOutButton.click();
    }
}
