import express from 'express';
import horrorRoutes from './routes/horror.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(horrorRoutes);

app.listen(PORT, () => {
  console.log(`[HORROR MOVIES SUBRESOURCES] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-12`);
  console.log(`[SUBRECURSO] GET/POST http://localhost:${PORT}/api/movies/1/reviews`);
});
