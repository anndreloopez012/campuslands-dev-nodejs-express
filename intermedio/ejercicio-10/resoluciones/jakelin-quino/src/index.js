const express = require('express');

const app = express();
const players = [{ name: 'Kai', wins: 4 }, { name: 'Mia', wins: 7 }, { name: 'Ian', wins: 2 }];
app.get('/players', (_req, res) => {
  res.json([...players].sort((a, b) => b.wins - a.wins));
});

app.listen(3000, () => console.log('API pingpong en http://localhost:3000'));
