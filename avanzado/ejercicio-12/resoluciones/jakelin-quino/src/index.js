const express = require('express');

const app = express();
const reviews = [
  { movie: 'La noche', rating: 5 },
  { movie: 'El sótano', rating: 4 }
];
app.get('/export/reviews', (_req, res) => {
  res.attachment('reviews.json').json(reviews);
});
app.listen(3000, () => console.log('Películas API en http://localhost:3000'));
