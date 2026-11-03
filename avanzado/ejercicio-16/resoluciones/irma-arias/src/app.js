const express = require('express');
const app = express();
app.use(express.json());
app.post('/items', (req, res) => {
  const name = String(req.body?.name || '').replace(/<[^>]*>/g, '').trim();
  if (!name) return res.status(400).json({ error: 'Nombre requerido' });
  res.status(201).json({ name });
});
app.listen(process.env.PORT || 3000);
