import express from 'express';
import paracaidistasRoutes from './routes/paracaidistas.routes.js';

const app = express();

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'Ejercicio ejecutado correctamente',
    topic: 'rutas POST'
  });
});

app.use('/paracaidistas', paracaidistasRoutes);

export default app;