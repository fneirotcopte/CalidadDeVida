const db = require('./db');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    const [results] = await db.query('SELECT * FROM empleado');

    for (const empleado of results) {
      if (!empleado.contraseña) {
        console.log(`⚠️ El usuario ${empleado.correo_electronico} no tiene contraseña. Se omite.`);
        continue;
      }

      if (empleado.contraseña.startsWith('$2a$')) {
        console.log(`✅ El usuario ${empleado.correo_electronico} ya tiene la contraseña encriptada.`);
        continue;
      }

      const hash = await bcrypt.hash(empleado.contraseña, 10);

      await db.query('UPDATE empleado SET contraseña = ? WHERE id_empleado = ?', [hash, empleado.id_empleado]);
      console.log(`🔐 Contraseña encriptada para ${empleado.correo_electronico}`);
    }
  } catch (err) {
    console.error('Error al encriptar usuarios:', err.message);
  }
})();
