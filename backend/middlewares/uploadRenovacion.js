const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ==============================
// 🧩 Configuración de almacenamiento temporal para renovaciones
// ==============================
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const rutaDestino = path.join(__dirname, '../uploads/renovaciones');
    fs.mkdirSync(rutaDestino, { recursive: true }); // Crea la carpeta si no existe
    cb(null, rutaDestino);
  },
  filename: (req, file, cb) => {
    // Guardamos temporalmente con el nombre original
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    cb(null, `${base}${ext}`);
  }
});

// ==============================
// ✅ Exportación (CommonJS)
// ==============================
const uploadRenovacion = multer({ storage });
module.exports = uploadRenovacion;
