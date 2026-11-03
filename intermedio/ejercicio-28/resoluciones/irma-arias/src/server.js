import express from 'express';

const app = express();
app.use(express.json());
const squads = [{ id: 1, name: 'Cometas' }];
app.get('/api/squads', (_request, response) => response.json({ data: squads }));
app.post('/api/squads', (request, response) => {
  const name = request.body?.name;
  if (typeof name !== 'string' || !name.trim()) return response.status(400).json({ error: 'El nombre es obligatorio.' });
  const squad = { id: squads.length + 1, name: name.trim() };
  squads.push(squad);
  return response.status(201).json({ data: squad });
});
app.listen(process.env.PORT || 3000, () => console.log('API battle royale disponible en el puerto 3000'));
