import { Page } from "@playwright/test";

export class ItemDetailPage {
  constructor(readonly page: Page) {}

  async goto(id: number) {
    await this.page.goto(`/items/${id}`);
  }

  get name() { return this.page.locator('#name'); }
  get email() { return this.page.locator('#email'); }
  get phone() { return this.page.locator('#phone'); }
  get start() { return this.page.locator('#start'); }
  get end() { return this.page.locator('#end'); }
  get submit() {
    return this.page.getByRole('button', { name: "Request rental" });
  }

  get toastSuccess() {
    return this.page.getByText(/reserva creada exitosamente/i);
  }
  get toastError() {
    return this.page.getByText(/error|válido|inválido|prenda no disponible/i);
  }
}
