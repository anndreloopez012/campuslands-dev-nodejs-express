const express = require('express');
const app = express();
app.use((req, res, next) => {
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  next();
});
app.get('/menu', (req, res) => res.json(['Arepa urbana']));
app.listen(process.env.PORT || 3000);
