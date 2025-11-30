/**
 * Genera un nombre único para tests usando timestamp
 * @param prefix - Prefijo para el nombre (default: 'Test')
 * @returns Nombre único
 */
export function generateUniqueName(prefix: string = 'Test'): string {
    return `${prefix}_${Date.now()}`;
}

/**
 * Genera un email único para tests
 * @param prefix - Prefijo para el email (default: 'test')
 * @returns Email único
 */
export function generateUniqueEmail(prefix: string = 'test'): string {
    return `${prefix}${Date.now()}@example.com`;
}

/**
 * Genera un nombre de cliente único para tests de reservas
 * @param prefix - Prefijo para el nombre (default: 'Customer')
 * @returns Nombre único de cliente
 */
export function generateUniqueCustomerName(prefix: string = 'Customer'): string {
    return `${prefix}_${Date.now()}`;
}

/**
 * Genera un teléfono único para tests (formato uruguayo)
 * @returns Teléfono en formato 09XXXXXXX
 */
export function generateUniquePhone(): string {
    const random = Math.floor(Math.random() * 1000000);
    return `09${random.toString().padStart(7, '0')}`;
}

