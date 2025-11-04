// ...existing code...
let _sequelize: any | null = null;

export function getSequelize() {
  console.log('[db-node] getSequelize called', { cwd: process.cwd(), NODE_ENV: process.env.NODE_ENV, NEXT_RUNTIME: process.env.NEXT_RUNTIME });

  if (_sequelize) return _sequelize;

  try {
    console.log('[db-node] requiring mysql2...');
    const mysql2 = require("mysql2");
    console.log('[db-node] mysql2 required OK');

    const { Sequelize } = require("sequelize");

    _sequelize = new Sequelize(
      process.env.DB_NAME ?? "vestidos",
      process.env.DB_USER ?? "root",
      process.env.DB_PASS ?? "root",
      {
        host: "localhost",
        dialect: "mysql",
        port: 3306,
        logging: false,
        // <-- evitar require dinámico dentro de Sequelize pasando el módulo explícitamente
        dialectModule: mysql2,
      }
    );

    return _sequelize;
  } catch (err) {
    console.error('[db-node] require or Sequelize init failed:', err);
    throw new Error("Please install mysql2 package manually (npm install mysql2)");
  }
}
// ...existing code...