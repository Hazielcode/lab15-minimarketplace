const { Product, Category } = require('../models');

// Obtener todos los productos
const getProducts = async (req, res) => {
  try {
    const { categoryId } = req.query;
    const filter = {};
    if (categoryId) {
      filter.categoryId = categoryId;
    }

    const products = await Product.findAll({
      where: filter,
      include: [{ model: Category, as: 'category', attributes: ['id', 'nombre'] }]
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos', error: error.message });
  }
};

// Obtener un producto por ID
const getProductById = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'nombre'] }]
    });
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el producto', error: error.message });
  }
};

// Crear un nuevo producto
const createProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoryId, imageUrl } = req.body;
    
    // Validación simple
    if (!nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({ message: 'Nombre, precio y stock son campos requeridos' });
    }

    const newProduct = await Product.create({ 
      nombre, 
      descripcion, 
      precio, 
      stock,
      categoryId: categoryId || null,
      imageUrl: imageUrl || ''
    });

    // Cargar relaciones para devolver el objeto completo
    const fullProduct = await Product.findByPk(newProduct.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'nombre'] }]
    });

    res.status(201).json(fullProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el producto', error: error.message });
  }
};

// Actualizar un producto existente
const updateProduct = async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, categoryId, imageUrl } = req.body;
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await product.update({ 
      nombre, 
      descripcion, 
      precio, 
      stock,
      categoryId: categoryId !== undefined ? categoryId : product.categoryId,
      imageUrl: imageUrl !== undefined ? imageUrl : product.imageUrl
    });

    const fullProduct = await Product.findByPk(product.id, {
      include: [{ model: Category, as: 'category', attributes: ['id', 'nombre'] }]
    });

    res.json(fullProduct);
  } catch (error) {
    res.status(500).json({ message: 'Error al actualizar el producto', error: error.message });
  }
};

// Eliminar un producto
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }
    
    await product.destroy();
    res.json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: 'Error al eliminar el producto', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct
};
