#!/usr/bin/env node

/**
 * Script para agregar la columna 'imagen' a la tabla 'prendas'
 * Uso: node scripts/add-imagen-column.js
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

async function addImagenColumn() {
  let connection;
  
  try {
    const config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || 'root',
      database: process.env.DB_NAME || 'vestidos',
    };

    console.log('Conectando a la base de datos...');
    connection = await mysql.createConnection(config);
    console.log('✓ Conectado a la base de datos');

    // Verificar si la columna ya existe
    const [columns] = await connection.execute(
      `SELECT COLUMN_NAME 
       FROM INFORMATION_SCHEMA.COLUMNS 
       WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'prendas' AND COLUMN_NAME = 'imagen'`,
      [config.database]
    );

    if (columns.length > 0) {
      console.log('✓ La columna "imagen" ya existe en la tabla "prendas"');
      return;
    }

    // Agregar la columna
    console.log('Agregando columna "imagen" a la tabla "prendas"...');
    await connection.execute(
      `ALTER TABLE \`prendas\` 
       ADD COLUMN \`imagen\` VARCHAR(255) NULL DEFAULT NULL 
       AFTER \`precio\``
    );
    console.log('✓ Columna "imagen" agregada exitosamente');

  } catch (error) {
    console.error('✗ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Conexión cerrada');
    }
  }
}

addImagenColumn();

