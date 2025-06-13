/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { Application, Request, Response, application } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './app/routes';
import notFound from './app/middlewares/notFound';
const app: Application = express();
import sendContactUsEmail from './app/helper/sendContactUsEmail';
import getSheet from './getSheet';
import getSpecificSheet from './getSpecificSheet';
import {
  generateMultiplePresignedUrls,
  generatePresignedUrl,
} from './app/helper/presignedUrlGenerator';
import AppError from './app/error/appError';
import httpStatus from 'http-status';

// parser
app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      'http://localhost:3003',
      'http://localhost:3004',
      'http://localhost:3005',
      'http://localhost:3006',
      'http://localhost:3007',
      'http://10.0.60.137:4173',
      'http://localhost:3008',
      'http://10.0.60.24:4173',
      'http://localhost:4174',
      'https://celebrated-cactus-973e22.netlify.app',
      'http://13.49.200.198',
      'http://52.45.173.22',
      'https://admin.candor-construction.com',
      'http://admin.candor-construction.com',
    ],
    credentials: true,
  }),
);
app.use('/uploads', express.static('uploads'));
// application routers ----------------
app.use('/', router);
app.post('/contact-us', sendContactUsEmail);

// for s3 bucket--------------
app.post('/generate-presigned-url', async (req, res) => {
  const { fileType, fileCategory } = req.body;
  if (!fileType || !fileCategory) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      'File type and file category is required',
    );
  }

  try {
    const result = await generatePresignedUrl({ fileType, fileCategory });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error generating pre-signed URL' });
  }
});

app.post('/generate-multiple-presigned-urls', async (req, res) => {
  const { files } = req.body;

  try {
    const result = await generateMultiplePresignedUrls(files);
    res.json(result);
  } catch (error) {
    res
      .status(500)
      .json({ message: 'Error generating multiple pre-signed URLs' });
  }
});

// ===========================================
app.get('/', async (req, res) => {
  res.send({ message: 'Welcome to Candor App' });
});

app.get('/get-sheet', async (req, res) => {
  const result = await getSheet();
  res.send({ result: result });
});
app.get('/get-single-sheet', async (req, res) => {
  const result = await getSpecificSheet('7721029157736324');
  res.send({ result: result });
});

// global error handler
app.use(globalErrorHandler);
// not found
app.use(notFound);

export default app;
