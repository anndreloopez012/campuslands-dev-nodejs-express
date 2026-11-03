const express = require('express');

const app = express();
const requireUser = (req, res, next) => {
  if (!req.get('x-user')) return res.status(401).json({ error: 'Autenticación requerida' });
  next();
};
app.get('/books', requireUser, (_req, res) => res.json(['El viajero', 'La biblioteca']));

app.listen(3000, () => console.log('API de libros en http://localhost:3000'));
