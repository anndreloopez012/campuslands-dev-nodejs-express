import express from 'express';
import exerciseRoutes from './routes/exercise.routes.js';

const app = express();

app.use(express.json());

app.use('/api/v1', exerciseRoutes);

app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada'
  });
});

export default app;