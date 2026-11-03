import express from 'express';
import ejercicioRoutes from './routes/ejercicio.routes.js';
import { AppError } from './utils/AppError.js';

const app = express();

app.use(express.json());
app.use('/basico/ejercicio-13', ejercicioRoutes);

// 404: cualquier ruta que no haya hecho match con nada de arriba.
app.use((req, res, next) => {
  next(new AppError(`Ruta no encontrada: ${req.method} ${req.originalUrl}`, 404));
});

// Middleware de errores central: la firma de 4 parametros (error, req,
// res, next) es justo lo que hace que Express lo reconozca como
// manejador de errores, en vez de un middleware normal.
app.use((error, req, res, next) => {
  const statusCode = error.statusCode || 500;
  const esErrorEsperado = error.isOperational === true;

  if (!esErrorEsperado) {
    // Un error que no lanzamos nosotros a proposito: se registra
    // completo en el servidor, pero al cliente no se le muestran
    // los detalles internos.
    console.error('Error inesperado:', error);
  }

  return res.status(statusCode).json({
    ok: false,
    message: esErrorEsperado
      ? error.message
      : 'Ocurrio un error interno en el servidor',
  });
});

export default app;
