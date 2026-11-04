import express from 'express';
import routes from './routes/index.js';
import { requestId } from './middlewares/requestId.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(requestId);
app.use(express.json({ limit: '10kb' }));
app.use('/intermedio/ejercicio-07', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
