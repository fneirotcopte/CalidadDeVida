// middlewares/multerProcedimientos.js
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Crear directorio para procedimientos si no existe
const uploadDir = path.join(__dirname, '../uploads/procedimientos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
} else {
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    // Crear nombre único y descriptivo
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const originalName = path.parse(file.originalname).name; // nombre sin extensión
    const newFilename = `proc-${uniqueSuffix}-${originalName}${path.extname(file.originalname)}`;
    cb(null, newFilename);
  }
});

const fileFilter = (req, file, cb) => {
  console.log('🔍 Multer Procedimientos - Verificando archivo:', {
    originalname: file.originalname,
    mimetype: file.mimetype
  });
  
  // PERMITIR MÁS TIPOS DE ARCHIVO para procedimientos
  const allowedMimes = [
    'image/jpeg',      // jpg, jpeg
    'image/png',       // png
    'image/gif',       // gif
    'application/pdf', // pdf
    'application/msword', // doc
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
    'application/vnd.ms-excel', // xls
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
    'text/plain'       // txt
  ];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    console.log('❌ Tipo de archivo no permitido:', file.mimetype);
    cb(new Error(`Tipo de archivo no permitido: ${file.mimetype}. Formatos permitidos: JPG, PNG, GIF, PDF, DOC, DOCX, XLS, XLSX, TXT`), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (más grande para documentos)
    files: 5 // máximo 5 archivos
  }
});

module.exports = upload;