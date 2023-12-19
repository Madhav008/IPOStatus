import winston from 'winston';

// Configure the Winston logger
const logger = winston.createLogger({
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'app.log' }),
    ],
    format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
});

export {
    logger
}

