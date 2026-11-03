const express = require('express');

const app = express();
const results = new Map();
const artworks = [];
app.use(express.json());
app.post('/artworks', (req, res) => {
  const key = req.get('Idempotency-Key');
  if (!key) return res.status(400).json({ error: 'Falta Idempotency-Key' });
  if (results.has(key)) return res.json(results.get(key));
  if (typeof req.body?.title !== 'string' || !req.body.title.trim()) {
    return res.status(400).json({ error: 'El título es obligatorio' });
  }
  const artwork = { id: artworks.length + 1, title: req.body.title.trim() };
  artworks.push(artwork);
  results.set(key, artwork);
  res.status(201).json(artwork);
});
app.listen(3000, () => console.log('Dibujo API en http://localhost:3000'));
