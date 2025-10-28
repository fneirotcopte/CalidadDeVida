const pool = require('../db');
const path = require('path');
const fs = require('fs');
const QRCode = require('qrcode');


exports.getTitulares = async (req, res) => {
    try {
        const [titulares] = await pool.query(`
            SELECT id_razon_social as id, 
            CONCAT(nombre, ' ', apellido) as nombre, 
            cuit 
            FROM razon_social
        `);
        res.json(titulares);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener titulares ambulantes desde la tabla titular_ambulante
exports.getTitularesAmbulantes = async (req, res) => {
    try {
        // Si llega ?tipo=... lo usamos, sino por defecto 'ambulante'
        const tipo = req.query.tipo || 'ambulante';

        const [ambulantes] = await pool.query(`
      SELECT 
        id AS id_ambulante,
        CONCAT(nombre, ' ', apellido) AS nombre,
        dni
      FROM titular_ambulante
      WHERE tipo = ?
    `, [tipo]);

        res.json(ambulantes);
    } catch (error) {
        console.error("Error en getTitularesAmbulantes:", error);
        res.status(500).json({ error: error.message });
    }
};


exports.registrarComercioCompleto = async (req, res) => {
    try {
        const {
            categoria, rubro, titular, nombreComercial, direccion,
            ubicacion, telefono, correoElectronico, metrosCuadrados,
            estadoPago, monto_sellado_inspeccion, sucursal, anexos
        } = req.body;

        // ✅ Determinar titular según categoría
        const esAmbulante = (categoria || '').toLowerCase() === 'vendedor ambulante';

        let idRazonSocialDB = null;
        let idTitularAmbulanteDB = null;

        if (esAmbulante) {
            idTitularAmbulanteDB = Number.parseInt(titular, 10) || null;
            if (!idTitularAmbulanteDB) {
                return res.status(400).json({ error: 'Titular inválido para vendedor ambulante.' });
            }
        } else {
            idRazonSocialDB = Number.parseInt(titular, 10) || null;
            if (!idRazonSocialDB) {
                return res.status(400).json({ error: 'Titular inválido para comercio/bares/food truck.' });
            }
        }


        // Establecer fechas iniciales
        let fechaHabilitacion = null; // Por defecto es null
        let fechaVencimiento = null;  // Por defecto es null

        // Determinar categoría y si requiere inspección
        const categoriaLower = (categoria || '').toLowerCase();
        const esVendedorAmbulante = categoriaLower === 'vendedor ambulante';
        const esFoodTruck = categoriaLower === 'food truck';
        const categoriasQueRequierenInspeccion = [
            'comercio en general', 
            'bares nocturnos, confiterias y restaurantes'
        ];
        const requiereInspeccion = categoriasQueRequierenInspeccion.includes(categoriaLower);

        // Solo vendedores ambulantes y food trucks se habilitan inmediatamente
        if (esVendedorAmbulante || esFoodTruck) {
            const hoy = new Date();
            fechaHabilitacion = hoy.toISOString().split('T')[0]; // Formato YYYY-MM-DD
            
            // Calcular fecha de vencimiento
            if (esVendedorAmbulante) {
                const vencimiento = new Date(hoy);
                vencimiento.setMonth(vencimiento.getMonth() + 1);
                fechaVencimiento = vencimiento.toISOString().split('T')[0];
            } else { // food truck
                const vencimiento = new Date(hoy);
                vencimiento.setFullYear(vencimiento.getFullYear() + 1);
                fechaVencimiento = vencimiento.toISOString().split('T')[0];
            }
        }
        // Para otros comercios, tanto fecha_habilitacion como fecha_vencimiento quedan en NULL
        // Se establecerán cuando se apruebe la inspección ocular

        // El comercio siempre inicia activo
        let activo = 1;
        let pendienteInspeccion = 0;

        // Si requiere inspección, marcamos como pendiente pero sigue activo
        if (requiereInspeccion) {
            pendienteInspeccion = 1;
            // fechaHabilitacion y fechaVencimiento ya están en null por defecto
        }
        
        // ✅ Validación de consistencia: anexos
        if (anexos && !Array.isArray(anexos)) {
            return res.status(400).json({
                error: "Formato de anexos inválido. Debe ser un array."
            });
        }
        if (anexos && anexos.some(a => !a || a.trim() === "")) {
            return res.status(400).json({
                error: "Hay anexos vacíos o inválidos, corrija antes de enviar."
            });
        }

        // 👉 Nombre comercial: si no hay, guardar "sin nombre"
        let nombreFinal = nombreComercial && nombreComercial.trim() !== ''
            ? nombreComercial.trim()
            : 'sin nombre';

        // 👉 Sucursal: siempre se numera (tanto comunes como ambulantes)
        const sucursalNum = (sucursal !== undefined && sucursal !== null && sucursal !== '')
            ? Number.parseInt(sucursal, 10)
            : 1; // por defecto 1


        // Normalizar metros_cuadrados: si viene vacío o no numérico → NULL
        const m2Parsed = Number.parseFloat(metrosCuadrados);
        const metrosDB = Number.isFinite(m2Parsed) ? m2Parsed : null;

        // Normalizar monto total: si viene vacío o no numérico → 0
        const montoParsed = Number.parseFloat(monto_sellado_inspeccion);
        const montoDB = Number.isFinite(montoParsed) ? montoParsed : 0;

          // 🚨 Validar geolocalización obligatoria (aplica a todos: comunes y ambulantes)
        if (!ubicacion || ubicacion.trim() === '') {
            return res.status(400).json({ error: 'La geolocalización es obligatoria.' });
        }

        // 1. Registrar comercio principal
        const [resultComercio] = await pool.query(`
        INSERT INTO comercio (
        nombre_comercial, sucursal, direccion, telefono, correo_electronico,
        rubro, id_razon_social, id_titular_ambulante, categoria, metros_cuadrados,
        geolocalizacion, estado_pago_final, monto_sellado_inspeccion,
        id_empleado_registro, fecha_registro, fecha_habilitacion, 
        fecha_vencimiento, activo, pendiente_inspeccion
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?, ?, ?)
`, [
            nombreFinal,
            sucursalNum,
            direccion,
            telefono,
            correoElectronico,
            rubro,
            idRazonSocialDB,
            idTitularAmbulanteDB,
            categoria,
            metrosDB,
            ubicacion,
            estadoPago === 'Abonado' ? 1 : 0,
            montoDB,
            req.usuario.id_empleado,
            fechaHabilitacion, // null si requiere inspección, fecha actual si es vendedor ambulante o food truck
            fechaVencimiento, // puede ser null o una fecha en formato YYYY-MM-DD
            activo,
            pendienteInspeccion
        ]);


        const idComercio = resultComercio.insertId;

        // 2. Registrar anexos si existen
        let anexosArray = [];
        if (Array.isArray(anexos)) {
            anexosArray = anexos;
        } else if (anexos) {
            // si solo viene un anexo (no array), lo envolvemos
            anexosArray = [anexos];
        }

        if (anexosArray.length > 0) {
            await pool.query(`
        INSERT INTO comercio_anexo 
        (id_comercio, anexo1, anexo2, anexo3, anexo4, anexo5)
        VALUES (?, ?, ?, ?, ?, ?)
    `, [
                idComercio,
                anexosArray[0] || null,
                anexosArray[1] || null,
                anexosArray[2] || null,
                anexosArray[3] || null,
                anexosArray[4] || null
            ]);
        }

        // 3. Registrar documentos si existen (renombrar archivos con id_comercio)
        if (req.files) {
            const uploadDir = path.join(process.cwd(), 'uploads', 'documentos_comercio');
            if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

            const documentos = [
                // 🧾 Comercio en general
                ...(categoria === 'comercio en general' ? [
                    { tipo: 'declaracion_rentas', file: req.files['doc_declaracion_rentas']?.[0] },
                    { tipo: 'sellado_bromatologico', file: req.files['sellado_bromatologico']?.[0] },
                    { tipo: 'plano', file: req.files['doc_plano']?.[0] },
                    { tipo: 'contrato_alquiler', file: req.files['doc_alquiler']?.[0] }
                ] : []),

                // 🌙 Bares nocturnos, confiterías y restaurantes
                ...(categoria === 'bares nocturnos, confiterias y restaurantes' ? [
                    { tipo: 'declaracion_rentas', file: req.files['doc_declaracion_rentas']?.[0] },
                    { tipo: 'sellado_bromatologico', file: req.files['sellado_bromatologico']?.[0] },
                    { tipo: 'plano', file: req.files['doc_plano']?.[0] },
                    { tipo: 'contrato_alquiler', file: req.files['doc_alquiler']?.[0] },
                    { tipo: 'seguridad', file: req.files['doc_seguridad']?.[0] },
                    { tipo: 'bomberos', file: req.files['doc_bomberos']?.[0] }
                ] : []),

                // 🚚 Food Truck
                ...(categoria === 'food truck' ? [
                    { tipo: 'declaracion_rentas', file: req.files['doc_declaracion_rentas']?.[0] },
                    { tipo: 'sellado_bromatologico', file: req.files['sellado_bromatologico']?.[0] },
                    { tipo: 'manipulacion_alimentos', file: req.files['doc_manipulacion']?.[0] },
                    { tipo: 'seguro', file: req.files['doc_seguro']?.[0] },
                    { tipo: 'permiso', file: req.files['doc_permiso']?.[0] }
                ] : []),

                // 🧍 Vendedor ambulante
                ...(categoria === 'vendedor ambulante' ? [
                    { tipo: 'sellado_bromatologico', file: req.files['sellado_bromatologico']?.[0] },
                    { tipo: 'frentista', file: req.files['doc_frentista']?.[0] }
                ] : [])
            ];

                for (const doc of documentos.filter(d => d.file)) {
                const ext = path.extname(doc.file.originalname).toLowerCase();
                const newName = `${doc.tipo}_${idComercio}${ext}`;
                const newPath = path.join(uploadDir, newName);

                // Renombrar el archivo físico
                fs.renameSync(doc.file.path, newPath);

                // Guardar ruta formateada en la BD
                const rutaArchivo = newPath.replace(/\\/g, '/');
                await pool.query(`
      INSERT INTO documentacion_comercio (id_comercio, tipo_documento, ruta_archivo)
      VALUES (?, ?, ?)
    `, [idComercio, doc.tipo, rutaArchivo]);

                console.log(`📄 Guardado: ${newName}`);
            }
        }

        res.status(201).json({
            success: true,
            idComercio,
            message: "Comercio registrado exitosamente"
        });

    } catch (error) {
        console.error("Error en registrarComercioCompleto:", error);

        // Detectar error de clave duplicada en MySQL (código 1062)
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({
                error: "Ya existe un comercio con ese nombre y dirección"
            });
        }

        res.status(500).json({
            error: "Error al registrar comercio",
            details: process.env.NODE_ENV === 'development' ? error.message : null
        });
    }

};

// Sugerir próximo número de sucursal para un nombre + titular
exports.getSiguienteNumeroSucursal = async (req, res) => {
    try {
        const { nombreComercial, titular } = req.query; // titular = id_razon_social

        if (!nombreComercial || !titular) {
            return res.status(400).json({ error: "Faltan parámetros: nombreComercial y titular" });
        }

        const [rows] = await pool.query(
            `SELECT COUNT(*) AS total
             FROM comercio
             WHERE nombre_comercial = ? AND id_razon_social = ?`,
            [nombreComercial, titular]
        );

        const total = Number(rows[0]?.total ?? 0);
        const proximaSucursal = total + 1; // si ya existe 1 registro (principal), sugerirá 2

        return res.json({ proximaSucursal });
    } catch (error) {
        console.error("Error en getSiguienteNumeroSucursal:", error);
        return res.status(500).json({ error: "Error al calcular próxima sucursal" });
    }
};

// === Generar QR a demanda y guardar ruta en la BD (versión fija) ===
exports.generarQR = async (req, res) => {
    try {
        const id = Number.parseInt(req.params.id, 10);
        if (!Number.isFinite(id)) {
            return res.status(400).json({ ok: false, error: 'ID inválido' });
        }

        // 1) Verificar que exista el comercio
        const [[com]] = await pool.query(
            'SELECT id_comercio FROM comercio WHERE id_comercio = ?',
            [id]
        );
        if (!com) {
            return res.status(404).json({ ok: false, error: 'Comercio no encontrado' });
        }

        // 2) URL que codificará el QR (ajustala cuando tengas tu endpoint público)
        const baseUrl = `${req.protocol}://${req.get('host')}`;
        const targetUrl = `${baseUrl}/api/alta-comercio/estado/${id}`;

        // 3) Carpeta física para PNG (usa la raíz del proyecto)
        const qrDir = path.join(process.cwd(), 'uploads', 'qr');
        if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

        // 4) Generar archivo (idempotente)
        const qrFilename = `comercio_${id}.png`; // 🟢 cambio: prefijo comercio_
        const qrFilePath = path.join(qrDir, qrFilename);
        if (!fs.existsSync(qrFilePath)) {
            await QRCode.toFile(qrFilePath, targetUrl, { width: 600, margin: 1 });
        }

        // 5) Ruta pública que guardamos en la BD
        const qrPublicPath = `/uploads/qr/${qrFilename}`; // 🟢 cambio: usa qrFilename

        // 6) Guardar ruta en la tabla comercio
        await pool.query('UPDATE comercio SET ruta_qr = ? WHERE id_comercio = ?', [
            qrPublicPath,
            id,
        ]);

        return res.json({ ok: true, id, url: targetUrl, qr_path: qrPublicPath });
    } catch (err) {
        console.error('Error al generar QR:', err);
        return res.status(500).json({ ok: false, error: 'Error al generar QR' });
    }
};


