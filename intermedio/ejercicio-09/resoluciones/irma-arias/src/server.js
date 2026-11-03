import express from 'express';

const app = express();
const fighters = [
  { id: 1, name: 'Lina', category: 'ligero' },
  { id: 2, name: 'Marco', category: 'medio' },
  { id: 3, name: 'Sara', category: 'ligero' },
  { id: 4, name: 'Tomás', category: 'pesado' }
];
app.get('/api/fighters', (request, response) => {
  const page = Number(request.query.page ?? 1);
  const limit = Number(request.query.limit ?? 10);
  if (!Number.isInteger(page) || page < 1 || !Number.isInteger(limit) || limit < 1) {
    return response.status(400).json({ error: 'page y limit deben ser enteros positivos.' });
  }
  const filtered = request.query.category
    ? fighters.filter((fighter) => fighter.category === request.query.category)
    : fighters;
  const start = (page - 1) * limit;
  return response.json({ page, limit, total: filtered.length, data: filtered.slice(start, start + limit) });
});
app.listen(process.env.PORT || 3000, () => console.log('API de kickboxing disponible en el puerto 3000'));
