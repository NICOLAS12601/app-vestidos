/**
 * Script para crear o actualizar un usuario admin en la base de datos
 * Uso: node scripts/create-admin-user.js [username] [password]
 * Ejemplo: node scripts/create-admin-user.js admin admin123
 */

const bcrypt = require('bcrypt');
const { Sequelize } = require('sequelize');

// Configuración de la base de datos (ajusta según tu configuración)
const sequelize = new Sequelize(
  process.env.DB_NAME || 'phpmyadmin',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,
  }
);

async function createAdminUser(username = 'admin', password = 'admin123') {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a la base de datos establecida.');

    // Hashear la contraseña
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);
    console.log(`✅ Contraseña hasheada para usuario: ${username}`);

    // Insertar o actualizar usuario
    const [result] = await sequelize.query(
      `INSERT INTO usuarios_admin (username, password_hash) 
       VALUES (:username, :passwordHash)
       ON DUPLICATE KEY UPDATE password_hash = :passwordHash`,
      {
        replacements: { username, passwordHash: passwordHash },
      }
    );

    console.log(`✅ Usuario admin "${username}" creado/actualizado exitosamente.`);
    console.log(`   Username: ${username}`);
    console.log(`   Password: ${password}`);
    console.log(`   Hash: ${passwordHash.substring(0, 20)}...`);

    await sequelize.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

// Obtener argumentos de la línea de comandos
const args = process.argv.slice(2);
const username = args[0] || 'admin';
const password = args[1] || 'admin123';

console.log('🔐 Creando usuario admin...');
createAdminUser(username, password);

