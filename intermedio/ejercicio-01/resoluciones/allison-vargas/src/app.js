import express from 'express';
import ejercicioRoutes from './routes/ejercicio.routes.js';
import { notFound, errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use('/intermedio/ejercicio-01', ejercicioRoutes);
app.use(notFound);
app.use(errorHandler);

export default app;
