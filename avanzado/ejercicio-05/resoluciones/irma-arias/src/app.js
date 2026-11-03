const express = require('express');
const app = express();
app.use(express.json());
const score = { local: 0, visitante: 0 };
app.post('/matches/score', (req, res) => {
  const { local, visitante } = req.body || {};
  if (![local, visitante].every(value => Number.isInteger(value) && value >= 0)) return res.status(400).json({ error: 'Marcador no valido' });
  Object.assign(score, { local, visitante });
  res.json({ ...score });
});
app.get('/matches/score', (req, res) => res.json({ ...score }));
app.listen(process.env.PORT || 3000);
