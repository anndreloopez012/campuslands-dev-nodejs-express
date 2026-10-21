import express from 'express';
import teamRoutes from './routes/team.routes.js';

const app = express();

app.use(express.json());

// Endpoint base del ejercicio
app.get('/intermedio/ejercicio-05', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "repositorios en memoria"
  });
});

app.use('/api/teams', teamRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

export default app;