const express = require('express');

const app = express();
app.get('/cars/:id', (req, res, next) => {
  if (!Number.isInteger(Number(req.params.id))) {
    const error = new Error('El identificador debe ser numérico');
    error.status = 400;
    return next(error);
  }
  res.json({ id: Number(req.params.id), model: 'Aurora GT' });
});
app.use((error, _req, res, _next) => {
  res.status(error.status || 500).json({ error: error.message });
});

app.listen(3000, () => console.log('API de autos en http://localhost:3000'));
