const winston = require('winston');
const { combine, timestamp, printf } = winston.format;
const DailyRotateFile = require('winston-daily-rotate-file');
const fs = require('fs');
const path = require('path');

// Crear carpeta logs/logger si no existe
const loggerDir = path.join(__dirname, '../logs/logger');
if (!fs.existsSync(loggerDir)) {
  fs.mkdirSync(loggerDir, { recursive: true });
}

// Formato del log
const logFormat = printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level}]: ${message}`;
});

// Configuración del logger
const logger = winston.createLogger({
  level: 'info',
  format: combine(timestamp(), logFormat),
  transports: [
    new winston.transports.Console(),
    new DailyRotateFile({
      filename: path.join(loggerDir, 'auth-%DATE%.log'),
      datePattern: 'YYYY-MM-DD',
      zippedArchive: true,
      maxSize: '20m',
      maxFiles: '30d'
    }),
    new winston.transports.File({
      filename: path.join(loggerDir, 'auth-error.log'),
      level: 'error'
    })
  ]
});

module.exports = logger;
