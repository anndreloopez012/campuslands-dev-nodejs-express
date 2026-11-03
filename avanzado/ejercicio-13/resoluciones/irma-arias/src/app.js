const express = require('express');
const app = express();
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => console.log(`${req.method} ${req.path} ${res.statusCode} ${Date.now() - start}ms`));
  next();
});
app.get('/movies', (req, res) => res.json({ genre: 'ciencia ficcion', titles: ['Orbita'] }));
app.listen(process.env.PORT || 3000);
