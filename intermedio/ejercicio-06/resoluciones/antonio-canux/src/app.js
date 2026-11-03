import express from 'express';
import motorcycleRoutes from './routes/motorcycle.routes.js';

const app = express();

app.use(express.json());

// Endpoint base del ejercicio
app.get('/intermedio/ejercicio-06', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "validacion centralizada"
  });
});

app.use('/api/motorcycles', motorcycleRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

export default app;