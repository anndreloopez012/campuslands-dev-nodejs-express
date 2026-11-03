const express = require('express');

const app = express();
let bookRequests = 0;
app.get('/books', (_req, res) => {
  bookRequests += 1;
  res.json(['El viajero', 'La biblioteca']);
});
app.get('/metrics', (_req, res) => res.json({ bookRequests }));
app.listen(3000, () => console.log('Libros API en http://localhost:3000'));
