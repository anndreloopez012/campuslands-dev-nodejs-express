import express from 'express';
import musicasRoutes from './routes/musicas.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'promesas basicas'
  });
});

app.use('/musicas', musicasRoutes);

export default app;