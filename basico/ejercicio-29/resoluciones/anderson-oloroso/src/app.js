import express from 'express';
import leagueRoutes from './routes/league.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(leagueRoutes);

app.listen(PORT, () => {
  console.log(`[FOOTBALL LEAGUE SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/basico/ejercicio-29`);
  console.log(`[STANDINGS] http://localhost:${PORT}/api/football/standings`);
});
