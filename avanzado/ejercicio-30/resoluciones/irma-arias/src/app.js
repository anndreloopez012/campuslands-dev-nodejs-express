const express = require('express');
const app = express();
app.use(express.json());
const repairs = [];
app.get('/repairs', (req, res) => res.json(repairs));
app.post('/repairs', (req, res) => {
  const { motorcycle, problem } = req.body || {};
  if (!motorcycle || !problem) return res.status(400).json({ error: 'Moto y problema son obligatorios' });
  const repair = { id: repairs.length + 1, motorcycle, problem, status: 'pendiente' };
  repairs.push(repair);
  res.status(201).json(repair);
});
app.listen(process.env.PORT || 3000);
