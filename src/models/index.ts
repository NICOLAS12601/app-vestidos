// ...existing code...
import { getSequelize } from '../../database/db-node';
import ReservaDefault, { initModel as initReservaModel } from './Reserva';
import PrendaDefault, { initModel as initPrendaModel } from './Prenda'; // asume que Prenda también exporta initModel
import UsuarioAdminDefault, { initModel as initUsuarioAdminModel } from './UsuarioAdmin';

export async function initDb(options: { sync?: boolean } = { sync: false }) {
  const sequelize = getSequelize();

  // Inicializar modelos (si exportan initModel)
  try {
    if (typeof initReservaModel === 'function') {
      initReservaModel(sequelize);
    } else if ((ReservaDefault as any).init) {
      // si ya está init dentro del archivo (compatibilidad)
      // no hacer nada
    }

    if (typeof initPrendaModel === 'function') {
      initPrendaModel(sequelize);
    } else if ((PrendaDefault as any).init) {
      // idem
    }

    if (typeof initUsuarioAdminModel === 'function') {
      initUsuarioAdminModel(sequelize);
    } else if ((UsuarioAdminDefault as any).init) {
      // idem
    }
  } catch (err) {
    // propaga el error para facilitar debugging
    throw err;
  }

  if (options.sync) {
    await sequelize.sync({ alter: true });
  }

  // Exporta las referencias de clases de modelo (no instancias)
  return { sequelize, Reserva: ReservaDefault, Prenda: PrendaDefault, UsuarioAdmin: UsuarioAdminDefault };
}

export { getSequelize as getSequelize };
// ...existing code...