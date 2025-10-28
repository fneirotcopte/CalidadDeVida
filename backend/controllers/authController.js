const empleadoModel = require('../models/empleadoModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

// REGISTRAR
/* const registrar = async (req, res) => {
  try {
    const datos = req.body;

    const dniUnico = await empleadoModel.verificarDNIUnico(datos.dni);
    if (!dniUnico) {
      return res.status(400).json({ error: 'El DNI ya está registrado' });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(datos.contraseña, 10);

    await empleadoModel.crearEmpleado(
      datos.nombre,
      datos.apellido,
      datos.dni,
      datos.domicilio,
      datos.telefono,
      datos.area,
      hashedPassword,
      datos.correo_electronico,
      datos.rol
    );

    res.status(201).json({ mensaje: 'Empleado registrado con éxito' });
  } catch (error) {
    if (error.message.includes('DNI')) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: 'Error al registrar empleado' });
    }
  }
}; */
const registrar = async (req, res) => {
  try {
    const { nombre, dni, contrasena, correo_electronico, rol } = req.body;
    
    // Validación básica
    if (!nombre || !dni || !contrasena || !correo_electronico || !rol) {
      return res.status(400).json({ error: 'Faltan campos obligatorios' });
    }

    const hashedPassword = await bcrypt.hash(contrasena, 10);
    
    await empleadoModel.crearEmpleado(
      nombre,
      req.body.apellido || '',
      dni,
      req.body.domicilio || '',
      req.body.telefono || '',
      req.body.area || '',
      hashedPassword,
      correo_electronico,
      rol
    );

    res.status(201).json({ mensaje: 'Empleado registrado' });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ 
      error: error.message || 'Error al registrar empleado',
      detalle: process.env.NODE_ENV === 'development' ? error.stack : null
    });
  }
};

// LOGIN
const login = async (req, res) => {
  try {
    const { correo_electronico, contraseña } = req.body;
    const empleados = await empleadoModel.obtenerEmpleadoPorEmail(correo_electronico);

    if (!empleados.length) return res.status(401).json({ error: 'Correo no registrado' });

    const empleado = empleados[0];
      if (empleado.activo !== 1) {
      return res.status(403).json({ error: 'Usuario inactivo. Contacte al administrador.' });
    }
    const passwordValida = await bcrypt.compare(contraseña, empleado.contraseña);

    if (!passwordValida) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id_empleado: empleado.id_empleado, rol: empleado.rol, nombre: empleado.nombre},
      process.env.JWT_SECRET || 'secreto123',
      { expiresIn: '8h' }
    );

    res.json({ token });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error al iniciar sesión' });
  }
};


// ACTUALIZAR
const actualizar = async (req, res) => {
  try {
    const id = req.params.id_empleado;
    const datos = req.body;

    const datosActualizados = {
      nombre: datos.nombre,
      apellido: datos.apellido,
      dni: datos.dni,
      domicilio: datos.domicilio,
      telefono: datos.telefono,
      area: datos.area,
      correo_electronico: datos.correo_electronico,
      rol: datos.rol,
      activo: true
    };

    // Si se envió una nueva contraseña, encriptarla
    if (datos.contrasena && datos.contrasena.length >= 8) {
      const hashedPassword = await bcrypt.hash(datos.contrasena, 10);
      datosActualizados.contrasena = hashedPassword;
    }

    await empleadoModel.actualizarEmpleado(id, datosActualizados);

    res.json({ mensaje: 'Empleado actualizado con éxito' });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ error: 'Error al actualizar empleado' });
  }
};


// OBTENER POR ID
const obtener = async (req, res) => {
  try {
    const id = req.params.id_empleado;
    const empleado = await empleadoModel.obtenerEmpleadoPorId(id);
    if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });

    res.json(empleado);
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ error: 'Error al obtener empleado' });
  }
};

// ELIMINAR
const eliminar = async (req, res) => {
  try {
    const { correo_electronico } = req.body;
    await empleadoModel.eliminarEmpleadoPorEmail(correo_electronico);

    res.json({ mensaje: 'Empleado eliminado con éxito' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ error: 'Error al eliminar empleado' });
  }
};

// ACTIVAR / DESACTIVAR
const activar = async (req, res) => {
  try {
    const id = req.params.id_empleado;
    await empleadoModel.cambiarEstadoEmpleado(id, true);
    res.json({ mensaje: 'Empleado activado' });
  } catch (error) {
    console.error('Error al activar empleado:', error);
    res.status(500).json({ error: 'Error al activar empleado' });
  }
};

const desactivar = async (req, res) => {
  try {
    const id = req.params.id_empleado;
    await empleadoModel.cambiarEstadoEmpleado(id, false);
    res.json({ mensaje: 'Empleado desactivado' });
  } catch (error) {
    console.error('Error al desactivar empleado:', error);
    res.status(500).json({ error: 'Error al desactivar empleado' });
  }
};

module.exports = {
  registrar,
  login,
  actualizar,
  obtener,
  eliminar,
  activar,
  desactivar
};
