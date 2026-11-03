const express = require('express');

const app = express();
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'");
  next();
});
app.get('/menu', (_req, res) => res.json(['Arepa', 'Hamburguesa']));
app.listen(3000, () => console.log('Comida API en http://localhost:3000'));
