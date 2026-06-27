const { Category } = require('../models');

const getCategories = async (req, res) => {
  try {
    const categories = await Category.findAll();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener categorías', error: error.message });
  }
};

const createCategory = async (req, res) => {
  try {
    const { nombre, descripcion } = req.body;

    if (!nombre) {
      return res.status(400).json({ message: 'El nombre es obligatorio' });
    }

    const [category, created] = await Category.findOrCreate({
      where: { nombre },
      defaults: { descripcion }
    });

    if (!created) {
      return res.status(400).json({ message: 'La categoría ya existe' });
    }

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: 'Error al crear la categoría', error: error.message });
  }
};

module.exports = {
  getCategories,
  createCategory
};
