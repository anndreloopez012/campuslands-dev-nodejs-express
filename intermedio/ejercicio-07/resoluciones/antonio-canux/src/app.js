import express from 'express';
import carRoutes from './routes/car.routes.js';
import { notFoundHandler, errorHandler } from './middlewares/error.middleware.js';

const app = express();

app.use(express.json());

// Endpoint base del ejercicio
app.get('/intermedio/ejercicio-07', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "middleware de errores"
  });
});

app.use('/api/cars', carRoutes);

// Los middlewares de errores siempre van al final
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
