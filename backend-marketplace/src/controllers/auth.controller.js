const { User, Role } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'secreto_super_seguro_123';

const register = async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'El correo electrónico ya está registrado' });
    }

    // Cifrar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buscar rol CUSTOMER por defecto
    const customerRole = await Role.findOne({ where: { nombre: 'CUSTOMER' } });
    if (!customerRole) {
      return res.status(500).json({ message: 'Rol por defecto no encontrado en la base de datos' });
    }

    // Crear usuario
    const newUser = await User.create({
      nombre,
      email,
      password: hashedPassword,
      roleId: customerRole.id
    });

    res.status(201).json({
      message: 'Usuario registrado con éxito',
      user: {
        id: newUser.id,
        nombre: newUser.nombre,
        email: newUser.email,
        role: 'CUSTOMER'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el registro de usuario', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email y contraseña son requeridos' });
    }

    // Buscar usuario incluyendo su rol
    const user = await User.findOne({
      where: { email },
      include: [{ model: Role, as: 'role' }]
    });

    if (!user) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Validar contraseña
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Credenciales inválidas' });
    }

    // Generar token JWT
    const token = jwt.sign(
      {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role ? user.role.nombre : 'CUSTOMER'
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      message: 'Inicio de sesión exitoso',
      token,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        role: user.role ? user.role.nombre : 'CUSTOMER'
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Error en el inicio de sesión', error: error.message });
  }
};

module.exports = {
  register,
  login
};
