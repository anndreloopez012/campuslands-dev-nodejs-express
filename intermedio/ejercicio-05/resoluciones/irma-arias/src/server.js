import express from 'express';
import { findAllTeams, saveTeam } from './repositories/teamRepository.js';

const app = express();
app.use(express.json());
app.get('/api/teams', (_request, response) => response.json({ data: findAllTeams() }));
app.post('/api/teams', (request, response) => {
  const name = request.body?.name;
  if (typeof name !== 'string' || !name.trim()) return response.status(400).json({ error: 'El nombre es obligatorio.' });
  return response.status(201).json({ data: saveTeam(name.trim()) });
});
app.listen(process.env.PORT || 3000, () => console.log('API de fútbol sala disponible en el puerto 3000'));
