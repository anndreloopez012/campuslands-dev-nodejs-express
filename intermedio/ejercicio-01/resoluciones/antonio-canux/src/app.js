import express from 'express';
import characterRoutes from './routes/character.routes.js';

const app = express();

app.use(express.json());

app.get('/intermedio/ejercicio-01', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "arquitectura por capas"
  });
});

app.use('/api/characters', characterRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

export default app;