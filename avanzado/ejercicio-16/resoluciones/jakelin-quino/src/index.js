const express = require('express');

const app = express();
app.use(express.json());
app.post('/products', (req, res) => {
  if (typeof req.body?.name !== 'string') return res.status(400).json({ error: 'El nombre es obligatorio' });
  const name = req.body.name.replace(/<[^>]*>/g, '').trim();
  if (!name) return res.status(400).json({ error: 'El nombre no puede quedar vacío' });
  res.status(201).json({ name });
});
app.listen(3000, () => console.log('Sneakers API en http://localhost:3000'));
