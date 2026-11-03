const express = require('express');

const app = express();
app.use(express.json());
app.post('/uploads', (req, res) => {
  const { name, size } = req.body || {};
  if (typeof name !== 'string' || !name || !Number.isFinite(size) || size <= 0) {
    return res.status(400).json({ error: 'Envía un nombre y tamaño válido' });
  }
  res.status(201).json({ message: 'Archivo simulado', file: { name, size } });
});

app.listen(3000, () => console.log('API de arquitectura 3D en http://localhost:3000'));
