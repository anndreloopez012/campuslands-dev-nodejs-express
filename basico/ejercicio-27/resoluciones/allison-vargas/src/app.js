import express from 'express';
import ejercicioRoutes from './routes/ejercicio.routes.js';
import { registrarPeticionHTTP } from './middlewares/logger.js';

const app = express();

// Se registra ANTES de las rutas para que TODAS las peticiones queden
// en el log, incluso las que terminan en error o 404.
app.use(registrarPeticionHTTP);

app.use(express.json());
app.use('/basico/ejercicio-27', ejercicioRoutes);

app.use((error, req, res, next) => {
  console.error('Error inesperado:', error);
  res.status(500).json({ ok: false, message: 'Ocurrio un error interno en el servidor' });
});

export default app;
