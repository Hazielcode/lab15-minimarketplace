const express = require('express');
const cors = require('cors');
const productRoutes = require('./routes/products');
const authRoutes = require('./routes/auth');
const categoryRoutes = require('./routes/categories');

const app = express();

// Configuración dinámica de CORS
const allowedOrigins = [
  'http://localhost:3000', // Servidor de desarrollo Next.js
  process.env.FRONTEND_URL  // URL del frontend en Vercel
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origin (como Postman, Curl, o peticiones del mismo servidor)
    if (!origin) return callback(null, true);
    
    const isAllowed = allowedOrigins.indexOf(origin) !== -1 || origin.includes('vercel.app');
    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error('Bloqueado por CORS: Origen no autorizado'));
    }
  },
  credentials: true
}));

app.use(express.json()); // Permite recibir y procesar JSON en el cuerpo de las peticiones

// Rutas de la API
app.use('/api/products', productRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);

// Ruta base/saludo de la API
app.get('/', (req, res) => {
  res.json({
    message: 'Bienvenido a la API del Marketplace',
    status: 'Online',
    endpoints: {
      auth: {
        register: 'POST /api/auth/register',
        login: 'POST /api/auth/login'
      },
      categories: {
        getAll: 'GET /api/categories',
        create: 'POST /api/categories (Admin)'
      },
      products: {
        getAllProducts: 'GET /api/products',
        getProductById: 'GET /api/products/:id',
        createProduct: 'POST /api/products (Admin)',
        updateProduct: 'PUT /api/products/:id (Admin)',
        deleteProduct: 'DELETE /api/products/:id (Admin)'
      }
    }
  });
});

module.exports = app;
