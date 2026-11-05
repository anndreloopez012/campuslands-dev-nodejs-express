import express from 'express';
import lobbyRoutes from './routes/lobby.routes.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(lobbyRoutes);

app.listen(PORT, () => {
  console.log(`[SHOOTERS LOBBY SERVER] Servidor en http://localhost:${PORT}`);
  console.log(`[HEALTH] GET http://localhost:${PORT}/basico/ejercicio-26`);
  console.log(`[LOBBIES] http://localhost:${PORT}/api/shooters/lobbies`);
});
