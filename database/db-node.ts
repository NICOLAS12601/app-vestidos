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
      password: process.env.DB_PASSWORD ?? process.env.DB_PASS ?? "root",
      host: process.env.DB_HOST ?? "localhost",
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : 3306,
      dialect: process.env.DB_DIALECT ?? "mysql",
    };
    
    console.log('[db-node] DB Config:', { 
      ...dbConfig, 
      password: dbConfig.password ? '***' : 'undefined',
      dialect: dbConfig.dialect 
    });

    _sequelize = new Sequelize(
      dbConfig.database,
      dbConfig.username,
      dbConfig.password,
      {
        host: dbConfig.host,
        dialect: dbConfig.dialect as any,
        port: dbConfig.port,
        logging: console.log,
        dialectModule: mysql2,
        pool: {
          max: 5,
          min: 0,
          acquire: 30000,
          idle: 10000
        }
      }
    );

    return _sequelize;
  } catch (err) {
    console.error('[db-node] require or Sequelize init failed:', err);
    throw new Error("Please install mysql2 package manually (npm install mysql2)");
  }
}