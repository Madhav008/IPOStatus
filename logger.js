// logger.js
import { createLogger, format, transports } from 'winston';
const { combine, timestamp, label, printf } = format;

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level}]: ${message}`;
});

const logger = createLogger({
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss', timezone: 'Asia/Kolkata' }), // Use 'Asia/Kolkata' for IST
        myFormat,
    ),
    transports: [
        new transports.Console(),
        new transports.File({ filename: 'app.log' }),
    ]
});

export { logger }
