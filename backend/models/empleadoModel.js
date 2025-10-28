const db = require('../db');
/*
const crearEmpleado = async (nombre, apellido, dni, domicilio, telefono, area, contraseña, correo_electronico, rol) => {
  if (!await verificarDNIUnico(dni)) {
    throw new Error('Ya existe un empleado con este DNI');
  }

  const query = `
    INSERT INTO empleado (nombre, apellido, dni, domicilio, telefono, area, contraseña, correo_electronico, rol) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await db.query(query, []);
};
 */
const crearEmpleado = async (nombre, apellido, dni, domicilio, telefono, area, contrasena, correo_electronico, rol) => {
  // Verificar DNI y correo únicos
  if (!await verificarDNIUnico(dni)) {
    throw new Error('DNI ya registrado');
  }
  if (await obtenerEmpleadoPorEmail(correo_electronico).length > 0) {
    throw new Error('Correo ya registrado');
  }

  const query = `
    INSERT INTO empleado 
    (nombre, apellido, dni, domicilio, telefono, area, contraseña, correo_electronico, rol) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  await db.query(query, [
    nombre, apellido, dni, domicilio, telefono, area, contrasena, correo_electronico, rol
  ]);
};


const obtenerEmpleadoPorEmail = async (correo_electronico) => {
  const query = 'SELECT * FROM empleado WHERE correo_electronico = ?';
  const [rows] = await db.query(query, [correo_electronico]);
  return rows;
};

const obtenerEmpleadoPorDNI = async (dni) => {
  const query = 'SELECT * FROM empleado WHERE dni = ?';
  const [rows] = await db.query(query, [dni]);
  return rows;
};

const obtenerEmpleadoPorApellido = async (apellido) => {
  const query = 'SELECT * FROM empleado WHERE apellido = ?';
  const [rows] = await db.query(query, [apellido]);
  return rows;
};

const actualizarEmpleado = async (id_empleado, datos) => {
  const { 
    nombre, 
    apellido, 
    dni, 
    domicilio, 
    telefono, 
    area, 
    correo_electronico, 
    rol,
    activo,
    contrasena // <- puede ser undefined
  } = datos;

  let query = `
    UPDATE empleado 
    SET 
      nombre = ?, 
      apellido = ?, 
      dni = ?, 
      domicilio = ?, 
      telefono = ?, 
      area = ?, 
      correo_electronico = ?, 
      rol = ?,
      activo = ?
  `;

  const valores = [
    nombre, 
    apellido, 
    dni, 
    domicilio, 
    telefono, 
    area, 
    correo_electronico, 
    rol,
    activo
  ];

  if (contrasena) {
    query += `, contraseña = ?`;
    valores.push(contrasena);
  }

  query += ` WHERE id_empleado = ?`;
  valores.push(id_empleado);

  await db.query(query, valores);
};


const obtenerEmpleadoPorId = async (id_empleado) => {
  const query = 'SELECT * FROM empleado WHERE id_empleado = ?';
  const [rows] = await db.query(query, [id_empleado]);
  return rows[0];
};

const cambiarEstadoEmpleado = async (id_empleado, estado) => {
  const query = 'UPDATE empleado SET activo = ? WHERE id_empleado = ?';
  await db.query(query, [estado, id_empleado]);
};

const verificarDNIUnico = async (dni, idExcluido = null) => {
  let query = 'SELECT id_empleado FROM empleado WHERE dni = ?';
  const params = [dni];
  
  if (idExcluido) {
    query += ' AND id_empleado != ?';
    params.push(idExcluido);
  }

  const [rows] = await db.query(query, params);
  return rows.length === 0; // True si no existe otro empleado con el mismo DNI
};


// Actualizar el exports
module.exports = {
  crearEmpleado,
  obtenerEmpleadoPorEmail,
  obtenerEmpleadoPorApellido,
  obtenerEmpleadoPorDNI,
  actualizarEmpleado,
  obtenerEmpleadoPorId,
  cambiarEstadoEmpleado,
  verificarDNIUnico
};



