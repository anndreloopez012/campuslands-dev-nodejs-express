import express from 'express';
import routes from './routes/index.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use('/intermedio/ejercicio-06', routes);
app.use(notFound);
app.use(errorHandler);

export default app;
