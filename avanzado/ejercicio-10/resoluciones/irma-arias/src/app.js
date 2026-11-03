const express = require('express');
const app = express();
const csv = 'name,points\nAna,11\nLuis,8';
app.get('/players', (req, res) => {
  const [header, ...rows] = csv.split('\n');
  const keys = header.split(',');
  res.json(rows.map(row => Object.fromEntries(row.split(',').map((value, i) => [keys[i], i ? Number(value) : value]))));
});
app.listen(process.env.PORT || 3000);
