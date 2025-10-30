import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { router } from './router/index.js';
import { ErrorMiddleware } from './middlewares/error-middleware.js';

const app = express();

app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/api', router);

app.use(ErrorMiddleware);

const PORT = process.env.PORT ?? 5000;

const start = async () => {
  try {
    app.listen(PORT, () => {
      console.log(`Server is started on port ${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
};
start();
