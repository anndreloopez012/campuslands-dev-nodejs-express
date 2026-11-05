import express from 'express';
import matchmakingRoutes from './routes/matchmaking.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(matchmakingRoutes);

if (process.argv[1] && process.argv[1].endsWith('app.js')) {
  app.listen(PORT, () => {
    console.log(`[SHOOTERS MATCHMAKING SERVER] http://localhost:${PORT}`);
    console.log(`[HEALTH] GET http://localhost:${PORT}/intermedio/ejercicio-26`);
  });
}

export default app;
