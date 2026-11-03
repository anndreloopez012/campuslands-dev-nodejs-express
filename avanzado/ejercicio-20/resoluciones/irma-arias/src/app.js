const express = require('express');
const app = express();
app.use(express.json());
const results = new Map();
app.post('/drawings', (req, res) => {
  const key = req.get('idempotency-key');
  if (!key) return res.status(400).json({ error: 'Falta idempotency-key' });
  if (!results.has(key)) results.set(key, { id: results.size + 1, title: req.body?.title });
  res.status(201).json(results.get(key));
});
app.listen(process.env.PORT || 3000);
