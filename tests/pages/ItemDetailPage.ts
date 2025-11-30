import { Page, expect } from "@playwright/test";

export class ItemDetailPage {
  constructor(readonly page: Page) {}

  async goto(id: number) {
    await this.page.goto(`http://localhost:3000/items/${id}`);
  }

  get name() { return this.page.locator('input[name="name"]'); }
  get email() { return this.page.locator('input[name="email"]'); }
  get phone() { return this.page.locator('input[name="phone"]'); }
  get start() { return this.page.locator('input[name="start"]'); }
  get end() { return this.page.locator('input[name="end"]'); }
  get submit() {
    return this.page.getByRole('button', { name: "Request rental" });
  }

  get toastSuccess() {
    return this.page.getByText('¡Reserva creada exitosamente!');
  }
  get toastError() {
    return this.page.getByText(/error|válido|inválido|prenda no disponible/i);
  }

  async fillRentalForm(name: string, email: string, phone: string, start: string, end: string) {
    await this.name.fill(name);
    await this.email.fill(email);
    await this.phone.fill(phone);
    await this.start.fill(start);
    await this.end.fill(end);
  }

  async createRental(customerName: string, email = 'test@example.com', phone = '091234567', start?: string, end?: string) {
    // Generar fechas únicas basadas en timestamp para evitar conflictos
    const now = new Date();
    const startDate = start || new Date(now.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const endDate = end || new Date(new Date(startDate).getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    await this.fillRentalForm(customerName, email, phone, startDate, endDate);
    
    // Esperar respuesta del servidor tras submit
    const responsePromise = this.page.waitForResponse(response => 
      response.url().includes('/api/rentals') && response.request().method() === 'POST'
    );
    
    await this.submit.click();
    const response = await responsePromise;
    
    // Verificar que fue exitoso
    const responseData = await response.json();
    if (!responseData.success) {
      throw new Error(`Failed to create rental: ${responseData.error || 'Unknown error'}`);
    }
    
    await this.page.waitForLoadState('networkidle');
  }
}
