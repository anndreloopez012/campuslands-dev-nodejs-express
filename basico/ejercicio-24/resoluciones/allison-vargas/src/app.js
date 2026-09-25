import express from 'express';
import ejercicioRoutes from './routes/ejercicio.routes.js';

const app = express();

app.use(express.json());
app.use('/basico/ejercicio-24', ejercicioRoutes);

app.use((error, req, res, next) => {
  console.error('Error inesperado:', error);
  res.status(500).json({ ok: false, message: 'Ocurrio un error interno en el servidor' });
});

export default app;
