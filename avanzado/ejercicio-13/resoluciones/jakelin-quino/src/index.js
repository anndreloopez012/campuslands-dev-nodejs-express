const express = require('express');

const app = express();
app.use((req, res, next) => {
  const started = Date.now();
  res.on('finish', () => {
    console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - started}ms`);
  });
  next();
});
app.get('/ships', (_req, res) => res.json([{ name: 'Orion', destination: 'Europa' }]));
app.listen(3000, () => console.log('Ciencia ficción API en http://localhost:3000'));
