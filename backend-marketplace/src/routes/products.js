const express = require('express');
const router = express.Router();
const productController = require('../controllers/product.controller');
const { authenticateToken, authorize } = require('../middlewares/auth');

// Definir rutas para CRUD de productos (Lectura pública)
router.get('/', productController.getProducts);
router.get('/:id', productController.getProductById);

// Rutas protegidas para administración (Solo ADMIN)
router.post('/', authenticateToken, authorize('ADMIN'), productController.createProduct);
router.put('/:id', authenticateToken, authorize('ADMIN'), productController.updateProduct);
router.delete('/:id', authenticateToken, authorize('ADMIN'), productController.deleteProduct);

module.exports = router;
