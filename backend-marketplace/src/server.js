const app = require('./app');
const { sequelize, Role, User, Category, Product } = require('./models');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function seedDatabase() {
  try {
    // 1. Sembrar Roles
    const [adminRole] = await Role.findOrCreate({ where: { nombre: 'ADMIN' } });
    const [customerRole] = await Role.findOrCreate({ where: { nombre: 'CUSTOMER' } });
    console.log('🌱 Roles verificados/creados.');

    // 2. Sembrar Usuarios
    const adminEmail = 'admin@marketplace.com';
    const adminExist = await User.findOne({ where: { email: adminEmail } });
    if (!adminExist) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        nombre: 'Administrador',
        email: adminEmail,
        password: hashedPassword,
        roleId: adminRole.id
      });
      console.log('🌱 Usuario ADMIN creado (admin@marketplace.com / admin123).');
    }

    const customerEmail = 'customer@marketplace.com';
    const customerExist = await User.findOne({ where: { email: customerEmail } });
    if (!customerExist) {
      const hashedPassword = await bcrypt.hash('customer123', 10);
      await User.create({
        nombre: 'Cliente Prueba',
        email: customerEmail,
        password: hashedPassword,
        roleId: customerRole.id
      });
      console.log('🌱 Usuario CUSTOMER creado (customer@marketplace.com / customer123).');
    }

    // 3. Sembrar Categorías
    const [techCat] = await Category.findOrCreate({ 
      where: { nombre: 'Tecnología' }, 
      defaults: { descripcion: 'Dispositivos electrónicos y gadgets' } 
    });
    const [homeCat] = await Category.findOrCreate({ 
      where: { nombre: 'Hogar' }, 
      defaults: { descripcion: 'Muebles, decoración y electrodomésticos' } 
    });
    const [fashionCat] = await Category.findOrCreate({ 
      where: { nombre: 'Moda' }, 
      defaults: { descripcion: 'Ropa, calzado y accesorios' } 
    });
    console.log('🌱 Categorías verificadas/creadas.');

    // 4. Sembrar algunos productos si la tabla está vacía
    const productCount = await Product.count();
    if (productCount === 0) {
      await Product.create({
        nombre: 'Smartwatch Xiaomi Mi Band 9',
        descripcion: 'Pulsera inteligente con monitoreo de salud',
        precio: 199.90,
        stock: 50,
        imageUrl: 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=500',
        categoryId: techCat.id
      });
      await Product.create({
        nombre: 'Laptop HP Victus 16',
        descripcion: 'Laptop gamer con procesador potente y tarjeta gráfica RTX',
        precio: 3499.00,
        stock: 15,
        imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=500',
        categoryId: techCat.id
      });
      console.log('🌱 Productos iniciales creados.');
    }
  } catch (error) {
    console.error('❌ Error al sembrar la base de datos:', error.message);
  }
}

async function startServer() {
  try {
    // Probar la conexión con la base de datos
    await sequelize.authenticate();
    console.log('------------------------------------------------------------');
    console.log('✅ Conexión establecida con la base de datos de Railway / MySQL.');
    
    // Sincronizar modelos con la base de datos
    // alter: true actualiza las tablas si se añaden campos, sin borrar los registros existentes
    await sequelize.sync({ alter: true });
    console.log('✅ Modelos de base de datos sincronizados con éxito.');
    
    // Sembrar base de datos
    await seedDatabase();
    
    // Iniciar servidor Express
    app.listen(PORT, () => {
      console.log(`🚀 Servidor ejecutándose en: http://localhost:${PORT}`);
      console.log(`📂 Endpoints disponibles bajo: http://localhost:${PORT}/api/products`);
      console.log('------------------------------------------------------------');
    });
  } catch (error) {
    console.error('❌ Error de conexión con la base de datos:', error.message);
    console.error('💡 Consejo: Asegúrate de haber completado las variables de entorno en el archivo .env con tus credenciales de Railway.');
    console.log('------------------------------------------------------------');
    process.exit(1);
  }
}

startServer();
