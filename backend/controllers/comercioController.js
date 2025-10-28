
const pool = require('../db'); // Asumo que tienes un pool de conexión MySQL con promise

exports.registrarComercio = async (req, res) => {
  try {
    const {
      personaFisica, nombre, apellido, dni, razon_social, cuit, domicilio, tipoTitular,
      telefono_prop, email_prop,
      categoria, rubro, nombreComercial, metrosCuadrados, ubicacion, telefono, email,
      inputAnexo
    } = req.body;

    const fotoTitular = req.file; // multer single

    // Validaciones básicas
    if (!nombre || !apellido || !cuit || !domicilio || !telefono_prop || !email_prop ||
        !nombreComercial || !ubicacion || !telefono || !email || !rubro || !categoria) {
      return res.status(400).json({ error: "Todos los campos son obligatorios." });
    }

    // Guardar foto (si existe) path relativo
    const fotoPath = fotoTitular ? fotoTitular.path : null;

    // Insertar en Razon_Social
    const [resultRazon] = await pool.query(
      `INSERT INTO Razon_Social 
       (nombre, apellido, dni, razon_social, cuit, domicilio, telefono, correo_electronico, persona_fisica, tipo_titular, foto_persona) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [nombre, apellido, dni || null, razon_social || null, cuit, domicilio, telefono_prop, email_prop, personaFisica ? 1 : 0, tipoTitular, fotoPath]
    );

    const idRazonSocial = resultRazon.insertId;

    const idEmpleadoRegistro = req.usuario.id_empleado;  //     const idEmpleadoRegistro = req.usuario?.id_empleado || null;


    // // Verificación extra para evitar errores
    // if (!idEmpleadoRegistro) {
    //   return res.status(400).json({ error: "No se pudo determinar el empleado que registra." });
    // }

    // Insertar en Comercio
    const [resultComercio] = await pool.query(
      `INSERT INTO comercio (
        nombre_comercial, direccion, telefono, correo_electronico, rubro,
        categoria, metros_cuadrados, id_razon_social, id_empleado_registro,
        fecha_registro, fecha_habilitacion, fecha_vencimiento, activo
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 1 YEAR), 1)`,
      [
        nombreComercial,
        ubicacion,
        telefono,
        email,
        rubro,
        categoria,
        metrosCuadrados || null,
        idRazonSocial,
        idEmpleadoRegistro
      ]
    );


    const idComercio = resultComercio.insertId;

    // Insertar en Comercio_Anexo (si inputAnexo no vacío)
    if (inputAnexo) {
      const rubros = Array.isArray(inputAnexo) ? inputAnexo : [inputAnexo];

      for (const r of rubros) {
        if (r && r.trim() !== '') {
          await pool.query(
            `INSERT INTO Comercio_Anexo (id_comercio, rubro) VALUES (?, ?)`,
            [idComercio, r.trim()]
          );
        }
      }
    }

    res.status(201).json({ message: "Registro exitoso.", idComercio });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al registrar." });
  }
    try { //agregado
    const { body, files } = req;

    // Verificar archivos subidos
    if (!files.dni_titular || !files.certificado_residencia) {
      return res.status(400).json({ error: 'Faltan documentos requeridos' });
    }

    // Guardar rutas de archivos
    const documentos = {
      dni: files.dni_titular[0].path,
      certificado: files.certificado_residencia[0].path,
      foto: files.foto_titular?.[0]?.path || null
    };

    // Resto de la lógica de registro...
    res.status(201).json({ message: 'Comercio registrado con documentos' });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const multer = require('multer');
const path = require('path');

// Configuración de Multer para almacenar documentos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/documentos'));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const upload = multer({ storage });

exports.registrarComercio = [
  upload.fields([
    { name: 'dni_titular', maxCount: 1 },
    { name: 'certificado_residencia', maxCount: 1 },
    { name: 'plano_local', maxCount: 1 }
  ]),
  async (req, res) => {
    try {
      const { body, files } = req;
      
      // Guardar rutas de archivos en la BD
      const documentos = {
        dni_titular: files.dni_titular?.[0].path,
        certificado_residencia: files.certificado_residencia?.[0].path,
        plano_local: files.plano_local?.[0]?.path || null
      };

      // Insertar en la tabla Documentos
      await db.query(
        `INSERT INTO Documentos 
         (id_comercio, nombre_archivo, ruta) 
         VALUES (?, ?, ?)`,
        [idComercio, 'DNI Titular', documentos.dni_titular]
      );
      
      res.status(201).json({ 
        message: "Registro exitoso",
        documentos
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Error al registrar documentos" });
    }
  }
];