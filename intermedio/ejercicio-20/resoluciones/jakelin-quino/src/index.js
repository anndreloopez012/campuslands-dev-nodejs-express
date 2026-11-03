const express = require('express');

const app = express();
const allowedOrigin = 'http://localhost:5173';
app.use((req, res, next) => {
  const origin = req.get('origin');
  if (origin && origin !== allowedOrigin) return res.status(403).json({ error: 'Origen no permitido' });
  if (origin) res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});
app.get('/drawings', (_req, res) => res.json(['Paisaje digital']));

app.listen(3000, () => console.log('API de dibujo en http://localhost:3000'));
