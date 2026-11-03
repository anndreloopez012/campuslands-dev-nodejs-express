import express from 'express';
import peliculasRoutes from './routes/peliculas.routes.js';

const app = express();

app.use('/peliculas', peliculasRoutes);

app.use((err, req, res, next) => {
  res.status(500).json({
    ok: false,
    message: err.message
  });
});

export default app;