const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { authenticateToken, authorize } = require('../middlewares/auth');

router.get('/', categoryController.getCategories);
router.post('/', authenticateToken, authorize('ADMIN'), categoryController.createCategory);

module.exports = router;
