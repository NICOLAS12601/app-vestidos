import type { Sequelize as SequelizeType } from "sequelize";
import { Sequelize } from "sequelize";
import mysql2 from "mysql2";

let _sequelize: SequelizeType | null = null;

export function getSequelize() {
  console.log('[db-node] getSequelize called', { cwd: process.cwd(), NODE_ENV: process.env.NODE_ENV, NEXT_RUNTIME: process.env.NEXT_RUNTIME });

  if (_sequelize) return _sequelize;

  try {
    console.log('[db-node] requiring mysql2...');
    console.log('[db-node] mysql2 required OK');

    const dbConfig = {
      database: process.env.DB_NAME ?? "vestidos",
      username: process.env.DB_USER ?? "root",
      password: process.env.DB_PASS ?? "root",
      host: process.env.DB_HOST ?? "localhost",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
    };
    
    console.log('[db-node] DB Config:', { ...dbConfig, password: dbConfig.password ? '***' : 'undefined' });

    _sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        dialect: "mysql",
        port: dbConfig.port,
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