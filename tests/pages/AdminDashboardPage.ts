import { Page, Locator, expect } from '@playwright/test';

export class AdminDashboardPage {
    readonly page: Page;
    readonly signOutButton: Locator;
    readonly addProductButton: Locator;
    readonly inventorySection: Locator;
    readonly rentalsSection: Locator;

    constructor(page: Page) {
        this.page = page;
        this.signOutButton = page.getByRole('button', { name: /sign out/i });
        this.addProductButton = page.getByRole('button', { name: 'Add product' });
        this.inventorySection = page.locator('section:has(h2:text("Inventory"))');
        this.rentalsSection = page.locator('section:has(h2:text("Scheduled rentals"))');
    }

    async goto() {
        await this.page.goto('http://localhost:3000/admin');
        await this.expectDashboardVisible();
    }

    async expectDashboardVisible() {
        await expect(this.page).toHaveURL(/\/_?admin$/, { timeout: 15000 });
        await expect(this.signOutButton).toBeVisible({ timeout: 15000 });
    }

    // --- Gestión de artículos ---
    async fillProductForm(nombre: string, color = 'Rojo', estilo = 'Formal', talle = 'S,M', precio = '99') {
        await this.page.locator('input[name="nombre"]').fill(nombre);
        await this.page.locator('input[name="color"]').fill(color);
        await this.page.locator('input[name="estilo"]').fill(estilo);
        await this.page.locator('input[name="talle"]').fill(talle);
        await this.page.locator('input[name="precio"]').fill(precio);
    }

    async addProduct(nombre: string, color?: string, estilo?: string, talle?: string, precio?: string) {
        await this.fillProductForm(nombre, color, estilo, talle, precio);
        await this.addProductButton.click();
        await this.page.waitForLoadState('networkidle');
    }

    getItemRow(itemName: string) {
        return this.inventorySection.locator('tbody tr', { hasText: itemName });
    }

    async clickUpdateItem(itemName: string) {
        const row = this.getItemRow(itemName);
        await row.getByRole('button', { name: 'Update' }).click();
    }

    async clickDeleteItem(itemName: string) {
        const row = this.getItemRow(itemName);
        await row.getByRole('button', { name: 'Delete' }).click();
    }

    async editItemInModal(fieldName: string, newValue: string) {
        const modal = this.page.locator('.fixed.inset-0');
        const input = modal.locator(`input[name="${fieldName}"]`);
        await input.fill(newValue);
        await modal.getByRole('button', { name: 'Save' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async confirmDeleteInModal() {
        const modal = this.page.locator('.fixed.inset-0');
        await modal.getByRole('button', { name: 'Delete' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    // --- Gestión de reservas ---
    getRentalRow(customerName: string) {
        return this.rentalsSection.locator('tbody tr', { hasText: customerName });
    }

    async approveRental(customerName: string) {
        const row = this.getRentalRow(customerName);
        await row.getByRole('button', { name: 'Approve' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async cancelRental(customerName: string) {
        const row = this.getRentalRow(customerName);
        await row.getByRole('button', { name: 'Cancel' }).click();
        await this.page.waitForLoadState('networkidle');
    }

    async expectItemExists(itemName: string) {
        await expect(this.getItemRow(itemName)).toBeVisible({ timeout: 15000 });
    }

    async expectItemNotExists(itemName: string) {
        await expect(this.getItemRow(itemName)).not.toBeVisible({ timeout: 15000 });
    }

    async expectRentalStatus(customerName: string, status: string) {
        const row = this.getRentalRow(customerName);
        await expect(row.locator('td').nth(4)).toHaveText(new RegExp(status, 'i'), { timeout: 15000 });
    }

    async expectRentalCustomerName(customerName: string) {
        await expect(this.getRentalRow(customerName)).toBeVisible({ timeout: 15000 });
    }

    async signOut() {
        await Promise.all([
            this.page.waitForURL(/\/admin\/login$/, { timeout: 15000 }),
            this.signOutButton.click(),
        ]);
    }
}
