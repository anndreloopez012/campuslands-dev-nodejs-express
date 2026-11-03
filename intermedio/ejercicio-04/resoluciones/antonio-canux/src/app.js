import express from 'express';
import playerRoutes from './routes/player.routes.js';
import matchRoutes from './routes/match.routes.js';

const app = express();

app.use(express.json());

// Endpoint base del ejercicio
app.get('/intermedio/ejercicio-04', (req, res) => {
  res.status(200).json({
    ok: true,
    message: "Ejercicio ejecutado correctamente",
    topic: "servicios reutilizables"
  });
});

app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: "Ruta no encontrada"
  });
});

export default app;