import express from 'express';
import routes from './routes/index.js';
import { requestId } from './middlewares/requestId.js';
import { requestLogger } from './middlewares/requestLogger.js';
import { contextoRequest } from './middlewares/contextoRequest.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(requestId);
app.use(requestLogger);
app.use(express.json({ limit: '10kb' }));
app.use(contextoRequest);
app.use('/intermedio/ejercicio-08', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
