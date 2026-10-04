import express from 'express';
import gameRoutes from './routes/game.routes.js';

const app = express();

app.use(express.json());

app.use('/api', gameRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada'
  });
});

export default app;