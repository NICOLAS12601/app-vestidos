import { Page, Locator } from '@playwright/test';
import { appUrls } from '../testData/urls';

export class HomePage {
    readonly page: Page;
    readonly adminLink: Locator;

    constructor(page: Page) {
        this.page = page;
        this.adminLink = page.getByRole('link', { name: 'Admin' });
    }

    async goto() : Promise<void> {
        await this.page.goto(appUrls.home)
    }

    async navigateToAdmin() : Promise<void> {
        await this.adminLink.click();
    }
}
