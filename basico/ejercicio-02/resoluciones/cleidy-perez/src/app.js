import express from 'express';
import matchRoutes from './routes/match.routes.js';

const app = express();

app.use(express.json());

// Rutas
app.use('/api/v1', matchRoutes);

// Manejo de ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    ok: false,
    message: 'Ruta no encontrada'
  });
});

export default app;