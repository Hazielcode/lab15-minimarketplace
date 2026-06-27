const { Sequelize } = require('sequelize');
require('dotenv').config();

// Obtenemos la URL de conexión o las variables separadas
const dbUrl = process.env.DATABASE_URL;

let sequelize;

if (dbUrl && dbUrl !== 'mysql://root:tu_contraseña_aqui@tu_host_aqui:tu_puerto_aqui/tu_db_aqui') {
  console.log('Intentando conectar usando la URL de conexión...');
  sequelize = new Sequelize(dbUrl, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      // Opcional: configurar si tu proveedor requiere SSL (algunas configuraciones de Railway lo prefieren)
      // ssl: {
      //   rejectUnauthorized: false
      // }
    }
  });
} else {
  console.log('Intentando conectar usando credenciales individuales...');
  sequelize = new Sequelize(
    process.env.DB_NAME || 'marketplace',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
    }
  );
}

module.exports = sequelize;
