const express = require('express');

const app = express();
let cachedCars;
let expiresAt = 0;
app.get('/cars', (_req, res) => {
  if (Date.now() < expiresAt) return res.json({ source: 'cache', cars: cachedCars });
  cachedCars = [{ name: 'Aurora GT', year: 2025 }];
  expiresAt = Date.now() + 60_000;
  res.json({ source: 'catalog', cars: cachedCars });
});
app.listen(3000, () => console.log('Autos API en http://localhost:3000'));
