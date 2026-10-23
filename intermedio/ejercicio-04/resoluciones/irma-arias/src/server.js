import express from 'express';
import { createMatchSummary } from './services/matchService.js';

const app = express();
app.get('/api/match/summary', (request, response) => {
  const players = Number(request.query.players);
  const zone = Number(request.query.zone);
  if (!Number.isInteger(players) || players < 1 || !Number.isInteger(zone) || zone < 0) {
    return response.status(400).json({ error: 'players debe ser positivo y zone no negativo.' });
  }
  return response.json({ data: createMatchSummary(players, zone) });
});
app.listen(process.env.PORT || 3000, () => console.log('API battle royale disponible en el puerto 3000'));
