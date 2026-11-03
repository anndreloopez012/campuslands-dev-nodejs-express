import express from 'express';

const app = express();
app.use(express.json());
const teams = [{ id: 1, name: 'Oráculos' }];
app.get('/api/teams', (_request, response) => response.json({ data: teams }));
app.get('/api/teams/:id', (request, response) => {
  const team = teams.find((item) => item.id === Number(request.params.id));
  if (!team) return response.status(404).json({ error: 'Equipo no encontrado.' });
  return response.json({ data: team });
});
app.post('/api/teams', (request, response) => {
  const name = request.body?.name;
  if (typeof name !== 'string' || !name.trim()) return response.status(400).json({ error: 'El nombre es obligatorio.' });
  const team = { id: teams.length + 1, name: name.trim() };
  teams.push(team);
  return response.status(201).json({ data: team });
});
app.listen(process.env.PORT || 3000, () => console.log('API MOBA disponible en el puerto 3000'));
