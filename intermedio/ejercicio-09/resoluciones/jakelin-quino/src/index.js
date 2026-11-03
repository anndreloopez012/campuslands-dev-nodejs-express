const express = require('express');

const app = express();
const fighters = [
  { name: 'Luna', category: 'ligero' },
  { name: 'Sol', category: 'pesado' },
  { name: 'Mar', category: 'ligero' }
];
app.get('/fighters', (req, res) => {
  const page = Math.max(1, Number(req.query.page) || 1);
  const filtered = fighters.filter((fighter) => !req.query.category || fighter.category === req.query.category);
  res.json({ page, results: filtered.slice((page - 1) * 2, page * 2), total: filtered.length });
});

app.listen(3000, () => console.log('API kickboxing en http://localhost:3000'));
