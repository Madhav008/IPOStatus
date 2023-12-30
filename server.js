import express from 'express';
import fileUpload from 'express-fileupload';
import path from 'path';
import { XMLParser } from 'fast-xml-parser';
import { connectDB } from './utils/initDB.js';
import userRoutes from './routes/userRoutes.js';
import cors from 'cors';
import morgan from 'morgan';
import { logger } from "./logger.js"
import ngrok from '@ngrok/ngrok'

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

// Middleware to log requests
// app.use(morgan('dev'));


// Middleware to log response time
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const responseTime = Date.now() - start;

    logger.info({ message: `${req.method} ${req.originalUrl} ${res.statusCode} ${responseTime}ms`, });
  });
  next();
});

app.use('/api/users', userRoutes);

import siteRoutes from './routes/sitesRoutes.js';
app.use('/api', siteRoutes);

import excelRoutes from './routes/excelRoutes.js';
app.use('/getExcel', excelRoutes)


import cronRoutes from './routes/cronRoutes.js';
app.use('/cron', cronRoutes)

import ipoRoutes from './routes/ipoRoutes.js';
app.use('/ipo', ipoRoutes)


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
  logger.info({ message: `Server is running on port ${port}` });

});

// ngrok.connect({ addr: port, authtoken_from_env: true })
//   .then(listener => console.log(`Ingress established at: ${listener.url()}`));