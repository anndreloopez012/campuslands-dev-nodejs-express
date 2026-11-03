import express from 'express';

const app = express();
app.use(express.json());
const movies = [{ id: 1, title: 'La casa del lago oscuro' }];
const reviews = [{ id: 1, movieId: 1, text: 'Suspenso bien construido.' }];
app.get('/api/movies/:movieId/reviews', (request, response) => {
  const movieId = Number(request.params.movieId);
  if (!movies.some((movie) => movie.id === movieId)) return response.status(404).json({ error: 'Película no encontrada.' });
  return response.json({ data: reviews.filter((review) => review.movieId === movieId) });
});
app.post('/api/movies/:movieId/reviews', (request, response) => {
  const movieId = Number(request.params.movieId);
  const text = request.body?.text;
  if (!movies.some((movie) => movie.id === movieId)) return response.status(404).json({ error: 'Película no encontrada.' });
  if (typeof text !== 'string' || !text.trim()) return response.status(400).json({ error: 'El texto es obligatorio.' });
  const review = { id: reviews.length + 1, movieId, text: text.trim() };
  reviews.push(review);
  return response.status(201).json({ data: review });
});
app.listen(process.env.PORT || 3000, () => console.log('API de películas disponible en el puerto 3000'));
