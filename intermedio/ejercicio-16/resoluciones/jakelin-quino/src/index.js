const express = require('express');

const app = express();
const protect = (req, res, next) => {
  if (req.get('authorization') !== 'Bearer sneakers-demo') {
    return res.status(401).json({ error: 'Token requerido' });
  }
  next();
};
app.get('/catalog', protect, (_req, res) => res.json(['Classic Low', 'Runner Pro']));

app.listen(3000, () => console.log('API sneakers en http://localhost:3000'));
