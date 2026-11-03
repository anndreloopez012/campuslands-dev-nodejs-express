const express = require('express');

const app = express();
const visits = new Map();
app.use((req, res, next) => {
  const now = Date.now();
  const entry = visits.get(req.ip) || { count: 0, expires: now + 10_000 };
  if (now > entry.expires) {
    entry.count = 0;
    entry.expires = now + 10_000;
  }
  entry.count += 1;
  visits.set(req.ip, entry);
  if (entry.count > 3) return res.status(429).json({ error: 'Intenta de nuevo en unos segundos' });
  next();
});
app.get('/models', (_req, res) => res.json(['Atlas', 'Nova']));

app.listen(3000, () => console.log('API de modelos en http://localhost:3000'));
