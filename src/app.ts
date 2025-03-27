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
import multer from 'multer';
import sendContactUsEmail from './app/helper/sendContactUsEmail';
import getSheet from './getSheet';
import getSpecificSheet from './getSpecificSheet';
import { generatePresignedUrl } from './app/helper/s3';
const upload = multer({ dest: 'uploads/' });
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
      'http://localhost:3008',
    ],
    credentials: true,
  }),
);
app.use('/uploads', express.static('uploads'));
// application routers ----------------
app.use('/', router);
app.post('/contact-us', sendContactUsEmail);

// for s3 bucket--------------
app.post('/generate-presigned-url', async (req: Request, res: Response) => {
  const { fileType, fileCategory }: { fileType: string; fileCategory: string } =
    req.body;
  try {
    const { uploadURL, fileName } = await generatePresignedUrl({
      fileType,
      fileCategory,
    });
    res.json({ uploadURL, fileName });
  } catch (err) {
    res.status(500).send('Error generating presigned URL');
  }
});

// ==================
app.get('/', async (req, res) => {
  res.send({ message: 'nice to meet you' });
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
