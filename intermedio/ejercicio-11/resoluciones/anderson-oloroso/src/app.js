import express from 'express';
import musicRoutes from './routes/music.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(musicRoutes);

app.listen(PORT, () => {
  console.log(`[MUSIC SEARCH SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-11`);
  console.log(`[SEARCH] GET http://localhost:${PORT}/api/music/tracks?q=queen`);
});
