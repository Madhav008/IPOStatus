import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { connectDB } from './utils/initDB.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import morgan from 'morgan';
import winston from 'winston';

connectDB();
const parser = new XMLParser();

const app = express();
const port = process.env.PORT || 3001;
app.use(fileUpload());
app.use(cors());

// Enable CORS for all routes (modify as needed)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});
app.use(express.json());

const publicDirectoryPath = path.join('uploads');
app.use(express.static(publicDirectoryPath));

// Setup Winston logger
const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'app.log' }),
  ],
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
});

// Middleware to log requests
app.use(morgan('dev'));

// Middleware to log response time
app.use((req, res, next) => {
  const startTime = new Date();
  res.on('finish', () => {
    const endTime = new Date();
    const responseTime = endTime - startTime;
    logger.info({
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      responseTime: `${responseTime}ms`,
    });
  });
  next();
});

app.use('/api/users', userRoutes);

import siteRoutes from './routes/sitesRoutes.js';
app.use('/api', siteRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
