const express = require('express');

const app = express();
app.use(express.json());
app.get('/docs', (_req, res) => {
  res.json([
    { method: 'GET', path: '/teams', description: 'Lista equipos MOBA' },
    { method: 'POST', path: '/teams', description: 'Registra un equipo' }
  ]);
});
const teams = [{ name: 'Dragons' }];
app.get('/teams', (_req, res) => res.json(teams));
app.post('/teams', (req, res) => {
  if (!req.body?.name) return res.status(400).json({ error: 'Falta el nombre' });
  const team = { name: req.body.name };
  teams.push(team);
  res.status(201).json(team);
});

app.listen(3000, () => console.log('API MOBA en http://localhost:3000'));
