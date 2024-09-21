import winston from 'winston';
import config from '../config.js';

// Definir niveles y colores personalizados
const customLevels = {
    levels: {
        fatal: 0,
        error: 1,
        warn: 2,
        info: 3,
        http: 4,
        debug: 5
    },
    colors: {
        fatal: 'red',
        error: 'red',
        warn: 'yellow',
        info: 'green',
        http: 'magenta',
        debug: 'blue'
    }
};

// Definir formato 
const fileFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `
    ${timestamp} [${level}]
    ${message}
      `;
});

// Crear formato
const consoleFormat = winston.format.combine(
    winston.format.colorize(), // Añadir colorización
    winston.format.simple() // Formato simple para consola
);


const devLogger = winston.createLogger({
    levels: customLevels.levels,
    format: consoleFormat, // Formato para consola en desarrollo
    transports: [
        new winston.transports.Console({ level: 'debug' })
    ]
});


const prodLogger = winston.createLogger({
    levels: customLevels.levels,
    format: winston.format.combine(
        winston.format.timestamp(), 
        fileFormat 
    ),
    transports: [
        new winston.transports.File({ level: 'error', filename: `${config.DIRNAME}/logs/errors.log` }), // Registrar error y superiores en archivo
        new winston.transports.Console({ level: 'error', format: consoleFormat }) // Mostrar error y superiores en consola con color
    ]
});

// Añadir colores a los niveles de winston
winston.addColors(customLevels.colors);

// Middleware para añadir el logger a la solicitud
const addLogger = (req, res, next) => {
    req.logger = config.MODE === 'dev' ? devLogger : prodLogger;
    next();
}
// Middleware para registrar peticiones HTTP con Winston
const logHttpRequests = (req, res, next) => {
    const start = process.hrtime();

    res.on('finish', () => {
        const diff = process.hrtime(start);
        const responseTime = (diff[0] * 1e3 + diff[1] * 1e-6).toFixed(2);

        const logMessage = `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime} ms - ${res.get('Content-Length') || 0}`;
        req.logger.http(logMessage);
    });
    
    next();
}

export { addLogger, logHttpRequests };
