import express from 'express';
import carsRoutes from './routes/cars.routes.js';
import { globalErrorHandler } from './middlewares/errorHandler.middleware.js';
import { NotFoundError } from './errors/app.error.js';

const app = express();

app.use(express.json());

// Montaje de rutas
app.use(carsRoutes);

// Manejador para cualquier ruta no encontrada (404)
app.use((req, res, next) => {
  next(new NotFoundError(`Ruta no encontrada en este servidor: [${req.method}] ${req.originalUrl}`));
});

// Middleware global de errores (siempre al final de todas las rutas)
app.use(globalErrorHandler);

export default app;
