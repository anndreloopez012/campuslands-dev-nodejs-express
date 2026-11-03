const express = require('express');

const app = express();
const reviews = { 1: ['Da mucho miedo', 'Buen suspenso'], 2: ['Final inesperado'] };
app.get('/movies/:id/reviews', (req, res) => {
  if (!Object.hasOwn(reviews, req.params.id)) {
    return res.status(404).json({ error: 'Película no encontrada' });
  }
  const movieReviews = reviews[req.params.id];
  res.json(movieReviews);
});

app.listen(3000, () => console.log('API de películas en http://localhost:3000'));
